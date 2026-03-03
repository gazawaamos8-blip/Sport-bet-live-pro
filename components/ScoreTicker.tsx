import React, { useEffect, useState } from 'react';
import { Match } from '../types';
import { sportApiService } from '../services/sportApiService';
import { motion } from 'framer-motion';

interface ScoreTickerProps {
  matches?: Match[];
}

const ScoreTicker: React.FC<ScoreTickerProps> = ({ matches: propMatches }) => {
  const [internalMatches, setInternalMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (propMatches) return; // Use props if provided

    const fetchAndSetMatches = async () => {
      const allMatches = await sportApiService.getMatches();
      const relevantMatches = allMatches.filter(m => m.status === 'live' || m.status === 'upcoming');
      setInternalMatches(relevantMatches.slice(0, 20));
    };

    fetchAndSetMatches();
    const unsubscribe = sportApiService.subscribeToUpdates((updatedMatches) => {
      const relevant = updatedMatches.filter(m => m.status === 'live' || m.status === 'upcoming');
      setInternalMatches(relevant.slice(0, 20));
    });

    return () => unsubscribe();
  }, [propMatches]);

  const displayMatches = propMatches || internalMatches;
  const filteredMatches = displayMatches.filter(m => m.status === 'live' || m.status === 'upcoming');

  if (filteredMatches.length === 0) return null;

  return (
    <div className="bg-brand-950/80 backdrop-blur-sm border-b border-brand-800/50 h-8 flex items-center overflow-hidden whitespace-nowrap select-none">
      <div className="flex items-center gap-2 px-4 bg-brand-accent/10 h-full border-r border-brand-800/50">
        <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
        <span className="text-[10px] font-black text-brand-accent uppercase tracking-tighter">Live Scores</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <motion.div 
          className="flex items-center gap-8 px-8 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 60, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {/* Duplicate matches for seamless loop */}
          {[...filteredMatches, ...filteredMatches].map((match, idx) => (
            <div key={`${match.id}-${idx}`} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{match.league}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-white">{match.homeTeam}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${match.status === 'live' ? 'bg-red-500 text-white' : 'bg-brand-800 text-slate-400'}`}>
                  {match.status === 'live' ? `${match.homeScore} - ${match.awayScore}` : match.time}
                </span>
                <span className="text-[11px] font-black text-white">{match.awayTeam}</span>
              </div>
              <span className="text-slate-700">|</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ScoreTicker;
