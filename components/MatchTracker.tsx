import React from 'react';
import { Match } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchTrackerProps {
  match: Match;
}

const MatchTracker: React.FC<MatchTrackerProps> = ({ match }) => {
  const isFootball = match.sport === 'football';
  const action = match.liveAction;

  if (!isFootball) {
      return (
          <div className="bg-brand-800 rounded-2xl p-8 text-center border border-brand-700">
              <p className="text-slate-400 text-sm">Visualisation non disponible pour ce sport.</p>
          </div>
      );
  }

  return (
    <div className="relative w-full aspect-[1.6/1] bg-emerald-900 rounded-2xl border-4 border-brand-700 overflow-hidden shadow-2xl">
      {/* Pitch Markings */}
      <div className="absolute inset-0 border-2 border-white/20 m-2"></div>
      <div className="absolute inset-y-0 left-1/2 w-px bg-white/20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/40 rounded-full"></div>
      
      {/* Penalty Areas */}
      <div className="absolute inset-y-1/4 left-2 w-16 border-2 border-white/20 border-l-0"></div>
      <div className="absolute inset-y-1/4 right-2 w-16 border-2 border-white/20 border-r-0"></div>
      
      {/* Goal Areas */}
      <div className="absolute top-1/3 bottom-1/3 left-2 w-6 border-2 border-white/20 border-l-0"></div>
      <div className="absolute top-1/3 bottom-1/3 right-2 w-6 border-2 border-white/20 border-r-0"></div>

      {/* Live Action Visualization */}
      <AnimatePresence mode="wait">
        {action && (
          <motion.div 
            key={`${action.x}-${action.y}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute z-10"
            style={{ left: `${action.x}%`, top: `${action.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* Ball / Action Indicator */}
            <div className={`relative w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                action.type === 'danger' ? 'bg-red-500 animate-ping' : 
                action.type === 'attack' ? 'bg-brand-accent' : 'bg-white'
            }`}>
                <div className={`w-3 h-3 rounded-full ${action.type === 'danger' ? 'bg-white' : 'bg-brand-900'}`}></div>
            </div>

            {/* Action Label */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-brand-900/90 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-[10px] font-black text-white uppercase tracking-tighter"
            >
              {action.message}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Labels */}
      <div className="absolute top-4 left-6 flex items-center gap-2 bg-brand-900/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
          <img src={match.homeLogo} className="w-4 h-4 rounded-full" alt="" referrerPolicy="no-referrer" />
          <span className="text-[10px] font-bold text-white uppercase">{match.homeTeam}</span>
      </div>
      <div className="absolute top-4 right-6 flex items-center gap-2 bg-brand-900/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
          <span className="text-[10px] font-bold text-white uppercase">{match.awayTeam}</span>
          <img src={match.awayLogo} className="w-4 h-4 rounded-full" alt="" referrerPolicy="no-referrer" />
      </div>

      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-brand-900/80 backdrop-blur-md p-2 border-t border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Tracker</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">
              {match.league} • {match.time}
          </div>
      </div>
    </div>
  );
};

export default MatchTracker;
