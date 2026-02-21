import React from 'react';
import { Match } from '../types';
import { Activity, Calendar } from 'lucide-react';
import { getFlag } from '../services/sportApiService';

interface ScoreTickerProps {
  matches: Match[];
}

const ScoreTicker: React.FC<ScoreTickerProps> = ({ matches }) => {
  // Prioritize Live matches, then Upcoming
  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming').slice(0, 5);
  const displayMatches = liveMatches.length > 0 ? [...liveMatches, ...upcomingMatches] : matches.slice(0, 10);

  if (displayMatches.length === 0) return null;

  // Duplicate the list multiple times to ensure smooth scrolling on wider screens without gaps
  const tickerItems = [...displayMatches, ...displayMatches, ...displayMatches]; 

  return (
    <div className="bg-brand-900 border-b border-brand-800 h-9 overflow-hidden flex items-center relative z-40 select-none">
      {/* Gradients for smooth fade in/out on sides */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-brand-900 to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-brand-900 to-transparent z-10"></div>
      
      <div className="flex animate-marquee whitespace-nowrap items-center min-w-full">
        {tickerItems.map((match, idx) => (
          <div key={`${match.id}-${idx}`} className="flex items-center gap-3 px-6 border-r border-brand-800/50 h-full flex-shrink-0">
             <div className="flex items-center gap-1.5">
                {match.status === 'live' ? (
                   <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                   </div>
                ) : (
                   <Calendar size={10} className="text-slate-500" />
                )}
                {match.countryCode && (
                   getFlag(match.countryCode).startsWith('http') 
                   ? <img src={getFlag(match.countryCode)} className="w-3 h-2 object-cover rounded-sm" alt="flag" />
                   : <span className="text-[10px]">{getFlag(match.countryCode)}</span>
                )}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{match.league}</span>
             </div>
             
             <div className="flex items-center gap-2 text-xs font-bold text-white">
                <div className="flex items-center gap-1">
                   {match.homeCountryCode && (
                       <img src={getFlag(match.homeCountryCode)} className="w-3 h-2 object-cover rounded-sm" alt="flag" />
                   )}
                   <span className="text-slate-200">{match.homeTeam}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${match.status === 'live' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-brand-800 text-brand-accent'}`}>
                   {match.status === 'upcoming' ? 'VS' : `${match.homeScore} - ${match.awayScore}`}
                </span>
                <div className="flex items-center gap-1">
                   <span className="text-slate-200">{match.awayTeam}</span>
                   {match.awayCountryCode && (
                       <img src={getFlag(match.awayCountryCode)} className="w-3 h-2 object-cover rounded-sm" alt="flag" />
                   )}
                </div>
             </div>
             
             {match.status === 'live' && (
                <span className="text-[9px] font-mono text-slate-500">{match.time}</span>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreTicker;