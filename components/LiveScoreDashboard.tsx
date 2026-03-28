import React, { useEffect, useState } from 'react';
import { Match } from '../types';
import { fetchMatches, subscribeToMatchUpdates } from '../services/sportApiService';
import { Activity, Trophy, Clock, Zap, ChevronRight, Sparkles, Circle, Loader, TrendingUp, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveScoreDashboardProps {
  onSelectMatch?: (match: Match) => void;
}

const LiveScoreDashboard: React.FC<LiveScoreDashboardProps> = ({ onSelectMatch }) => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const init = async () => {
    setIsRefreshing(true);
    const all = await fetchMatches();
    setLiveMatches(all.filter(m => m.status === 'live'));
    setLoading(false);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    init();

    const unsubscribe = subscribeToMatchUpdates((updated) => {
      setLiveMatches(updated.filter(m => m.status === 'live'));
    });

    return () => unsubscribe();
  }, []);

  if (loading && liveMatches.length === 0) {
    return (
      <div className="mx-3 mt-4 flex flex-col items-center justify-center py-12 bg-brand-800/80 rounded-3xl border-2 border-brand-700/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Gemini Background behind loader */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-accent/20 to-purple-600/20 animate-pulse-slow"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></div>
            <Activity size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-accent animate-pulse" />
          </div>
          
          <div className="text-center px-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <div className="absolute -inset-1 bg-red-500/30 rounded-full animate-ping"></div>
              </div>
              <h4 className="text-white font-black italic uppercase tracking-tighter text-xl leading-none">LIVE</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (liveMatches.length === 0) return null;

  return (
    <div className="mx-3 mt-6 space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3 tracking-tighter">
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute -inset-1 bg-red-500/30 rounded-full animate-ping"></div>
          </div>
          LIVE
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={init}
            disabled={isRefreshing}
            className={`p-2 bg-brand-800/50 border border-brand-700 rounded-full text-slate-400 hover:text-brand-accent transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={14} />
          </button>
          <div className="bg-brand-accent/20 px-5 py-2 rounded-full border-2 border-brand-accent/40 flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,255,157,0.2)]">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse shadow-[0_0_12px_#00ff9d]"></div>
            <span className="text-[13px] font-black text-brand-accent uppercase tracking-[0.2em]">{liveMatches.length} Matchs en Direct</span>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 px-1">
        <AnimatePresence mode="popLayout">
          {liveMatches.map((match) => (
            <motion.div
              layout
              key={match.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => onSelectMatch?.(match)}
            className="flex-shrink-0 w-[280px] bg-gradient-to-br from-brand-800 to-brand-900 rounded-[2rem] border-2 border-brand-700 p-4 shadow-md relative overflow-hidden group transition-all hover:border-brand-accent/50 cursor-pointer active:scale-95"
          >
            {/* Background Glow for Live Action */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-brand-accent/5 rounded-full blur-[20px] group-hover:bg-brand-accent/10 transition-all"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-purple-500/5 rounded-full blur-[20px] group-hover:bg-purple-500/10 transition-all"></div>
              
              <div className="flex justify-between items-center mb-5 relative z-10">
                <div className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded-lg border border-white/10">
                  <Trophy size={10} className="text-brand-accent" />
                  <span className="text-[9px] font-black text-white/90 truncate max-w-[150px] uppercase tracking-tighter">{match.league}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                  <Clock size={10} className="text-red-500" />
                  <span className="text-[10px] font-black text-red-500 animate-pulse tabular-nums">{match.time}</span>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <div className="relative w-11 h-11 flex items-center justify-center bg-white/5 rounded-full border border-white/10 shadow-inner">
                      <img src={match.homeLogo} className="w-8 h-8 object-contain relative z-10" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter text-center line-clamp-1 w-full">{match.homeTeam}</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="text-2xl font-black text-white italic tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      {match.homeScore} <span className="text-white/20 mx-0.5">-</span> {match.awayScore}
                    </div>
                    <div className="px-2 py-0.5 bg-brand-accent/10 border border-brand-accent/20 rounded text-[7px] font-black text-brand-accent uppercase tracking-widest">
                      Direct
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <div className="relative w-11 h-11 flex items-center justify-center bg-white/5 rounded-full border border-white/10 shadow-inner">
                      <img src={match.awayLogo} className="w-8 h-8 object-contain relative z-10" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter text-center line-clamp-1 w-full">{match.awayTeam}</span>
                  </div>
                </div>
              </div>

              {/* Live Action Ticker - Professional Floating Tag */}
              {match.liveAction && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-0.5 pt-0.5 border-t border-brand-700/50 flex items-center gap-1 relative z-10"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-accent/10 flex items-center justify-center">
                    <Zap size={5} className="text-brand-accent animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[4px] text-brand-accent font-black uppercase tracking-widest mb-0 leading-none">Dernière Action</p>
                    <p className="text-[5px] text-slate-300 font-bold italic truncate leading-none">{match.liveAction.message}</p>
                  </div>
                  <ChevronRight size={6} className="text-slate-600 group-hover:text-brand-accent transition-colors" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveScoreDashboard;
