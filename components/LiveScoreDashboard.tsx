import React, { useEffect, useState } from 'react';
import { Match } from '../types';
import { fetchMatches, subscribeToMatchUpdates } from '../services/sportApiService';
import { Activity, Trophy, Clock, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveScoreDashboard: React.FC = () => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const all = await fetchMatches();
      setLiveMatches(all.filter(m => m.status === 'live'));
      setLoading(false);
    };
    init();

    const unsubscribe = subscribeToMatchUpdates((updated) => {
      setLiveMatches(updated.filter(m => m.status === 'live'));
    });

    return () => unsubscribe();
  }, []);

  if (loading && liveMatches.length === 0) return null;
  if (liveMatches.length === 0) return null;

  return (
    <div className="mx-3 mt-4 space-y-3">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2">
          <Activity size={16} className="text-red-500 animate-pulse" />
          Scores en Direct
        </h3>
        <span className="text-[10px] font-bold text-slate-500 uppercase">{liveMatches.length} Matchs</span>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2">
        <AnimatePresence mode="popLayout">
          {liveMatches.map((match) => (
            <motion.div
              layout
              key={match.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-shrink-0 w-[240px] bg-brand-800 rounded-2xl border border-brand-700 p-3 shadow-lg relative overflow-hidden group"
            >
              {/* Background Pulse for Goal */}
              <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-bold text-slate-500 truncate max-w-[120px] uppercase">{match.league}</span>
                <span className="text-[9px] font-black text-red-500 animate-pulse">{match.time}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <img src={match.homeLogo} className="w-5 h-5 rounded-full" alt="" referrerPolicy="no-referrer" />
                    <span className="text-xs font-bold text-white truncate max-w-[100px]">{match.homeTeam}</span>
                  </div>
                  <span className="text-sm font-black text-white">{match.homeScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <img src={match.awayLogo} className="w-5 h-5 rounded-full" alt="" referrerPolicy="no-referrer" />
                    <span className="text-xs font-bold text-white truncate max-w-[100px]">{match.awayTeam}</span>
                  </div>
                  <span className="text-sm font-black text-white">{match.awayScore}</span>
                </div>
              </div>

              {/* Live Action Ticker */}
              {match.liveAction && (
                <div className="mt-2 pt-2 border-t border-brand-700 flex items-center gap-2">
                  <Zap size={10} className="text-yellow-500" />
                  <span className="text-[9px] text-slate-400 italic truncate">{match.liveAction.message}</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveScoreDashboard;
