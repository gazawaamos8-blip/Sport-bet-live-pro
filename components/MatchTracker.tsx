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
    <div className="relative w-full aspect-[1.6/1] bg-[#1a472a] rounded-3xl border-8 border-brand-700/50 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
      {/* Modern Grass Texture - Solid Green with Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ 
          background: `
            radial-gradient(circle at center, #1a472a 0%, #163d24 100%)
          `,
          backgroundSize: '100% 100%'
      }}>
        {/* Fine Grass Detail Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Pitch Markings with High Contrast and Glow */}
      <div className="absolute inset-0 border-[3px] border-white/40 m-4 shadow-[inset_0_0_50px_rgba(255,255,255,0.1)]"></div>
      <div className="absolute inset-y-0 left-1/2 w-[3px] bg-white/40"></div>
      
      {/* Center Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 border-[3px] border-white/40 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/60 rounded-full shadow-[0_0_15px_white]"></div>
      
      {/* Goal Posts - 3D Effect */}
      <div className="absolute top-[38%] bottom-[38%] left-0 w-5 bg-white/20 border-r-[3px] border-white/50 rounded-r-xl shadow-[5px_0_15px_rgba(255,255,255,0.2)]"></div>
      <div className="absolute top-[38%] bottom-[38%] right-0 w-5 bg-white/20 border-l-[3px] border-white/50 rounded-l-xl shadow-[-5px_0_15px_rgba(255,255,255,0.2)]"></div>

      {/* Penalty Areas - Modern Rounded Style */}
      <div className="absolute inset-y-[18%] left-4 w-28 border-[3px] border-white/40 border-l-0 rounded-r-2xl bg-white/5"></div>
      <div className="absolute inset-y-[18%] right-4 w-28 border-[3px] border-white/40 border-r-0 rounded-l-2xl bg-white/5"></div>
      
      {/* Goal Areas */}
      <div className="absolute top-[32%] bottom-[32%] left-4 w-12 border-[3px] border-white/40 border-l-0 rounded-r-xl"></div>
      <div className="absolute top-[32%] bottom-[32%] right-4 w-12 border-[3px] border-white/40 border-r-0 rounded-l-xl"></div>

      {/* Penalty Spots */}
      <div className="absolute top-1/2 left-[18%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/60 rounded-full"></div>
      <div className="absolute top-1/2 right-[18%] translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/60 rounded-full"></div>

      {/* Penalty Arcs */}
      <div className="absolute top-1/2 left-[28%] -translate-y-1/2 w-16 h-24 border-[3px] border-white/40 border-l-0 rounded-r-full"></div>
      <div className="absolute top-1/2 right-[28%] -translate-y-1/2 w-16 h-24 border-[3px] border-white/40 border-r-0 rounded-l-full"></div>

      {/* Corners */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-[3px] border-t-[3px] border-white/40 rounded-tl-full"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-[3px] border-t-[3px] border-white/40 rounded-tr-full"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-[3px] border-b-[3px] border-white/40 rounded-bl-full"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-[3px] border-b-[3px] border-white/40 rounded-br-full"></div>

      {/* Live Action Visualization */}
      <AnimatePresence mode="wait">
        {action && (
          <motion.div 
            key={`${action.x}-${action.y}`}
            initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
            className="absolute z-20"
            style={{ left: `${action.x}%`, top: `${action.y}%` }}
          >
            {/* Ball / Action Indicator with Pulse and Glow */}
            <div className={`relative w-6 h-6 rounded-full flex items-center justify-center ${
                action.type === 'danger' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]' : 
                action.type === 'attack' ? 'bg-brand-accent shadow-[0_0_20px_rgba(0,230,118,1)]' : 
                action.type === 'goal' ? 'bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,1)]' :
                'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
            }`}>
                <motion.div 
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className={`absolute inset-0 rounded-full ${
                    action.type === 'danger' ? 'bg-red-400' : 
                    action.type === 'attack' ? 'bg-emerald-400' : 
                    'bg-white'
                  }`}
                />
                <div className={`relative w-2.5 h-2.5 rounded-full z-10 flex items-center justify-center ${action.type === 'danger' ? 'bg-white' : 'bg-brand-900'}`}>
                    <div className="w-1 h-1 rounded-full bg-brand-accent animate-ping" />
                </div>
            </div>

            {/* Action Label - Professional Floating Tag */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-brand-900 px-2 py-0.5 rounded-full shadow-2xl border border-brand-accent font-black text-[6px] uppercase tracking-widest whitespace-nowrap"
            >
              <div className="flex items-center gap-1">
                <div className={`w-1 h-1 rounded-full ${action.type === 'danger' ? 'bg-red-500 animate-pulse' : 'bg-brand-accent'}`}></div>
                {action.message}
              </div>
              {/* Triangle pointer */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-brand-accent rotate-45"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Action Pill - Dynamic Status */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-2xl border border-brand-accent/30">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-brand-900 uppercase tracking-widest">
                  {action?.message || "Jeu au milieu de terrain"}
              </span>
          </div>
      </div>

      {/* Team Labels - Floating Glassmorphism Scoreboard Header */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 flex items-center bg-brand-900/90 backdrop-blur-xl px-6 py-4 rounded-[2rem] border border-white/10 shadow-2xl z-30 min-w-[300px] justify-between">
          <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-brand-800 rounded-full border border-white/10 shadow-inner overflow-hidden">
                <img src={match.homeLogo} className="w-8 h-8 object-contain" alt="" referrerPolicy="no-referrer" />
              </div>
          </div>
          
          <div className="flex flex-col items-center px-4">
              <div className="text-3xl font-black text-white italic tabular-nums tracking-tighter leading-none mb-2">
                  {match.homeScore} <span className="text-white/20 mx-1">-</span> {match.awayScore}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
                <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">DIRECT</span>
              </div>
          </div>
          
          <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-brand-800 rounded-full border border-white/10 shadow-inner overflow-hidden">
                <img src={match.awayLogo} className="w-8 h-8 object-contain" alt="" referrerPolicy="no-referrer" />
              </div>
          </div>
      </div>

      {/* Bottom Status Bar - Sleek Design */}
      <div className="absolute bottom-6 inset-x-8 flex justify-between items-center z-30">
          <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,1)]"></div>
              <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] drop-shadow-lg">Live Tracker Pro</span>
          </div>
          
          <div className="bg-brand-900/80 px-5 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                  TEMPS: <span className="text-brand-accent ml-1">{match.time}</span>
              </span>
          </div>
      </div>
    </div>
  );
};

export default MatchTracker;
