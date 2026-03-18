import React, { useState } from 'react';
import { Match, BetSlipItem } from '../types';
import { Activity, CalendarClock, Star, BrainCircuit, Lock, ChevronDown, Zap } from 'lucide-react';
import { getFlag, toggleMatchFavorite } from '../services/sportApiService';
import { analyzeMatch } from '../services/geminiService';

interface MatchCardProps {
  match: Match;
  onAddToSlip?: (item: BetSlipItem) => void;
  onOpenDetails?: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onAddToSlip, onOpenDetails }) => {
  const [isFavorite, setIsFavorite] = useState(match.isFavorite);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);
  const [expandedDoubleChance, setExpandedDoubleChance] = useState(false);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMatchFavorite(match.id);
    setIsFavorite(!isFavorite);
  };

  const handleAiPredict = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAiPrediction("Gemini 3 Flash analyse le match...");
    const text = await analyzeMatch(match);
    setAiPrediction(text);
    setTimeout(() => setAiPrediction(null), 8000);
  };

  const isMatchLocked = () => {
    if (match.status === 'finished') return true;
    if (match.status === 'upcoming') return false;

    const matchMinute = parseInt(match.time.replace("'", ""));
    const isNearEnd = !isNaN(matchMinute) && matchMinute >= 85;

    // 0-0 near end -> Lock match
    if (isNearEnd && match.homeScore === 0 && match.awayScore === 0) return true;

    // 1-0 or 0-1 near end -> Lock match (Dominating lead near end)
    if (isNearEnd && ((match.homeScore === 1 && match.awayScore === 0) || (match.homeScore === 0 && match.awayScore === 1))) return true;

    const scoreDiff = Math.abs(match.homeScore - match.awayScore);
    const hasBigLead = scoreDiff >= 2;

    return hasBigLead;
  };

  const isSelectionLocked = (selection: string) => {
    if (isMatchLocked()) return true;

    const matchMinute = parseInt(match.time.replace("'", ""));
    const isNearEnd = !isNaN(matchMinute) && matchMinute >= 85;

    if (isNearEnd) {
        // 1-0 or 1-2 (one goal lead) near end -> Lock leading team
        if (match.homeScore === 1 && match.awayScore === 0 && selection === 'home') return true;
        if (match.homeScore === 0 && match.awayScore === 1 && selection === 'away') return true;
        if (match.homeScore === 1 && match.awayScore === 2 && selection === 'away') return true;
        if (match.homeScore === 2 && match.awayScore === 1 && selection === 'home') return true;
        
        // Double chance locking
        if (match.homeScore === 1 && match.awayScore === 0 && (selection === 'homeDraw' || selection === 'homeAway')) return true;
        if (match.homeScore === 0 && match.awayScore === 1 && (selection === 'drawAway' || selection === 'homeAway')) return true;
    }

    return false;
  };

  return (
    <div className="bg-brand-800 rounded-2xl p-0 border border-brand-700 shadow-xl overflow-hidden relative group animate-fade-in hover:border-brand-600 transition-all">
      {/* AI Prediction Overlay */}
      {aiPrediction && (
        <div className="absolute inset-0 z-30 bg-brand-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-purple-500/20 p-3 rounded-full mb-3 animate-pulse">
            <BrainCircuit size={32} className="text-purple-400" />
          </div>
          <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-black uppercase mb-3 text-lg">Analyse Gemini</h4>
          <p className="text-white text-sm font-medium leading-relaxed max-w-xs">{aiPrediction}</p>
          <button onClick={(e) => { e.stopPropagation(); setAiPrediction(null); }} className="mt-6 text-xs text-slate-400 hover:text-white border border-slate-700 px-4 py-2 rounded-full transition-colors">Fermer</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-brand-900/50 p-3 flex justify-between items-center border-b border-brand-700/50">
        <div className="flex items-center gap-2">
          {match.status === 'live' ? (
            <div className="flex items-center gap-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse">
              <Activity size={10} /> LIVE
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><CalendarClock size={10} /> {match.time}</span>
          )}
          <div className="h-3 w-px bg-brand-700"></div>
          <span className="text-xs font-bold text-slate-300 uppercase truncate max-w-[150px] flex items-center gap-1">
            {match.countryCode && (
              getFlag(match.countryCode).startsWith('http') 
              ? <img src={getFlag(match.countryCode)} className="w-4 h-3 object-cover rounded-sm" alt="flag" referrerPolicy="no-referrer" />
              : <span>{getFlag(match.countryCode)}</span>
            )}
            {match.league}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleToggleFavorite}>
            <Star size={18} fill={isFavorite ? "#fbbf24" : "none"} className={isFavorite ? "text-yellow-400" : "text-slate-600 hover:text-white transition-colors"} />
          </button>
        </div>
      </div>

      {/* Match Content */}
      <div className="p-4 cursor-pointer hover:bg-brand-700/20 transition-colors" onClick={() => onOpenDetails?.(match)}>
        <div className="flex justify-between items-center mb-6">
          {/* Home */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative group/team">
              <div className="w-14 h-14 rounded-full bg-brand-700 p-1 border border-brand-600 flex items-center justify-center shadow-lg group-hover/team:scale-105 transition-transform">
                <img src={match.homeLogo} alt={match.homeTeam} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              {match.homeCountryCode && !match.homeLogo?.includes('flagcdn.com') && (
                <div className="absolute -bottom-1 -right-1 shadow-md">
                  {getFlag(match.homeCountryCode).startsWith('http') 
                    ? <img src={getFlag(match.homeCountryCode)} className="w-5 h-3.5 object-cover rounded-sm border border-brand-900" alt="flag" referrerPolicy="no-referrer" />
                    : <span className="bg-brand-900 rounded-full px-1 text-[8px]">{getFlag(match.homeCountryCode)}</span>
                  }
                </div>
              )}
            </div>
            <span className="text-sm font-bold text-white text-center line-clamp-2 h-10 flex items-center mt-2">{match.homeTeam}</span>
          </div>

          {/* Score/VS */}
          <div className="flex flex-col items-center mx-2 min-w-[70px]">
            <div className="text-2xl font-black font-mono text-white bg-brand-900 px-4 py-1.5 rounded-lg border border-brand-700 shadow-inner whitespace-nowrap tracking-widest">
              {match.status === 'upcoming' ? 'VS' : `${match.homeScore}-${match.awayScore}`}
            </div>
            {match.status === 'live' && <span className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">{match.time}</span>}
          </div>

          {/* Away */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative group/team">
              <div className="w-14 h-14 rounded-full bg-brand-700 p-1 border border-brand-600 flex items-center justify-center shadow-lg group-hover/team:scale-105 transition-transform">
                <img src={match.awayLogo} alt={match.awayTeam} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              {match.awayCountryCode && !match.awayLogo?.includes('flagcdn.com') && (
                <div className="absolute -bottom-1 -right-1 shadow-md">
                  {getFlag(match.awayCountryCode).startsWith('http') 
                    ? <img src={getFlag(match.awayCountryCode)} className="w-5 h-3.5 object-cover rounded-sm border border-brand-900" alt="flag" referrerPolicy="no-referrer" />
                    : <span className="bg-brand-900 rounded-full px-1 text-[8px]">{getFlag(match.awayCountryCode)}</span>
                  }
                </div>
              )}
            </div>
            <span className="text-sm font-bold text-white text-center line-clamp-2 h-10 flex items-center mt-2">{match.awayTeam}</span>
          </div>
        </div>

        {/* Odds & Actions */}
        <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
          {isMatchLocked() && (
            <div className="absolute inset-0 z-10 bg-brand-800/80 backdrop-blur-[2px] rounded-xl flex items-center justify-center border border-brand-700">
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <Lock size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Paris Verrouillés</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: '1', v: match.odds.home, s: 'home' },
              { l: 'X', v: match.odds.draw, s: 'draw' },
              { l: '2', v: match.odds.away, s: 'away' }
            ].map((opt, idx) => (
              <button 
                key={idx}
                onClick={() => !isSelectionLocked(opt.s) && onAddToSlip?.({ 
                  matchId: match.id, 
                  selection: opt.s as any, 
                  odds: opt.v, 
                  matchInfo: `${match.homeTeam} vs ${match.awayTeam}`, 
                  league: match.league,
                  sport: match.sport,
                  countryCode: match.countryCode,
                  homeCountryCode: match.homeCountryCode,
                  awayCountryCode: match.awayCountryCode
                })}
                className={`flex flex-col items-center bg-brand-900 hover:bg-brand-700 py-2 rounded-xl border border-brand-700 transition-all hover:border-brand-accent active:scale-95 group/btn ${opt.v === 0 || isSelectionLocked(opt.s) ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-500 font-bold group-hover/btn:text-brand-accent transition-colors">{opt.l}</span>
                    {isSelectionLocked(opt.s) && !isMatchLocked() && <Lock size={8} className="text-slate-500" />}
                </div>
                <span className="text-sm font-black text-white">{opt.v > 0 ? opt.v.toFixed(2) : '-'}</span>
              </button>
            ))}

            <button 
              onClick={handleAiPredict}
              className="flex-1 rounded-xl flex flex-col items-center justify-center transition-all border border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/30 group/ai"
            >
              <BrainCircuit size={18} className="text-purple-500 mb-0.5 group-hover/ai:scale-110 transition-transform" />
              <span className="text-[8px] font-bold text-purple-400 uppercase">Gemini</span>
            </button>
          </div>

          {/* Over/Under 2.5 Market */}
          <div className="grid grid-cols-2 gap-2 mt-2">
              <button 
                onClick={() => !isSelectionLocked('over2.5') && onAddToSlip?.({ 
                  matchId: match.id, 
                  selection: 'over2.5', 
                  odds: 1.85, 
                  matchInfo: `${match.homeTeam} vs ${match.awayTeam}`, 
                  league: match.league,
                  sport: match.sport,
                  countryCode: match.countryCode,
                  homeCountryCode: match.homeCountryCode,
                  awayCountryCode: match.awayCountryCode
                })}
                className={`flex justify-between items-center bg-brand-900 hover:bg-brand-700 px-4 py-2.5 rounded-xl border border-brand-700 transition-all hover:border-brand-accent active:scale-95 group/btn ${isSelectionLocked('over2.5') ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <span className="text-[10px] text-slate-500 font-bold uppercase group-hover/btn:text-brand-accent transition-colors">Plus (2.5)</span>
                <span className="text-sm font-black text-white">1.85</span>
              </button>
              <button 
                onClick={() => !isSelectionLocked('under2.5') && onAddToSlip?.({ 
                  matchId: match.id, 
                  selection: 'under2.5', 
                  odds: 1.95, 
                  matchInfo: `${match.homeTeam} vs ${match.awayTeam}`, 
                  league: match.league,
                  sport: match.sport,
                  countryCode: match.countryCode,
                  homeCountryCode: match.homeCountryCode,
                  awayCountryCode: match.awayCountryCode
                })}
                className={`flex justify-between items-center bg-brand-900 hover:bg-brand-700 px-4 py-2.5 rounded-xl border border-brand-700 transition-all hover:border-brand-accent active:scale-95 group/btn ${isSelectionLocked('under2.5') ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <span className="text-[10px] text-slate-500 font-bold uppercase group-hover/btn:text-brand-accent transition-colors">Moins (2.5)</span>
                <span className="text-sm font-black text-white">1.95</span>
              </button>
          </div>

          {match.doubleChance && (
            <div className="flex justify-center mt-1">
              <button 
                onClick={() => setExpandedDoubleChance(!expandedDoubleChance)}
                className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 hover:text-brand-accent transition-colors"
              >
                {expandedDoubleChance ? 'Masquer Double Chance' : 'Afficher Double Chance'}
                <ChevronDown size={12} className={`transition-transform ${expandedDoubleChance ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

          {match.doubleChance && expandedDoubleChance && (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-3 gap-2">
              {[
                  { l: '1X', v: match.doubleChance.homeDraw, s: 'homeDraw' },
                  { l: '12', v: match.doubleChance.homeAway, s: 'homeAway' },
                  { l: 'X2', v: match.doubleChance.drawAway, s: 'drawAway' }
                ].map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => !isSelectionLocked(opt.s) && onAddToSlip?.({ 
                      matchId: match.id, 
                      selection: opt.s as any, 
                      odds: opt.v, 
                      matchInfo: `${match.homeTeam} vs ${match.awayTeam}`, 
                      league: match.league,
                      sport: match.sport,
                      countryCode: match.countryCode,
                      homeCountryCode: match.homeCountryCode,
                      awayCountryCode: match.awayCountryCode
                    })}
                    className={`flex flex-col items-center bg-brand-900 hover:bg-brand-700 py-1.5 rounded-xl border border-brand-700 transition-all hover:border-brand-accent active:scale-95 group/btn ${opt.v === 0 || isSelectionLocked(opt.s) ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500 font-bold group-hover/btn:text-brand-accent transition-colors">{opt.l}</span>
                      {isSelectionLocked(opt.s) && !isMatchLocked() && <Lock size={8} className="text-slate-500" />}
                    </div>
                    <span className="text-sm font-black text-white">{opt.v > 0 ? opt.v.toFixed(2) : '-'}</span>
                  </button>
                ))}
              </div>

              {/* STATS SECTION (Injuries, Cards) - Only shown when Double Chance is expanded */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-700/50">
                <div className="bg-red-500/10 p-2 rounded-lg flex items-center gap-2 border border-red-500/20">
                  <Activity size={14} className="text-red-500" />
                  <div>
                    <p className="text-[8px] text-red-400 font-black uppercase">Blessés</p>
                    <p className="text-[10px] text-white font-bold">3 Joueurs</p>
                  </div>
                </div>
                <div className="bg-yellow-500/10 p-2 rounded-lg flex items-center gap-2 border border-yellow-500/20">
                  <Zap size={14} className="text-yellow-500" />
                  <div>
                    <p className="text-[8px] text-yellow-400 font-black uppercase">Cartons</p>
                    <p className="text-[10px] text-white font-bold">1 Total</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
