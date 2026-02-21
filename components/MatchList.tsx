import React, { useState, useEffect } from 'react';
import { Match, BetSlipItem, SportType } from '../types';
import { Play, Sparkles, TrendingUp, RefreshCw, Tv, Activity, CalendarClock, ChevronRight, Eye, Globe, ChevronDown, Star, X, Filter, BrainCircuit, Search, MapPin } from 'lucide-react';
import { analyzeMatch } from '../services/geminiService';
import { fetchMatches, subscribeToMatchUpdates, toggleMatchFavorite, getFlag } from '../services/sportApiService';

interface MatchListProps {
  onAddToSlip: (item: BetSlipItem) => void;
  onWatch?: (match: Match) => void;
  onOpenDetails: (match: Match) => void;
  showFavoritesOnly?: boolean;
  searchQuery?: string; // Global search query passed from parent
}

const MatchList: React.FC<MatchListProps> = ({ onAddToSlip, onWatch, onOpenDetails, showFavoritesOnly = false, searchQuery = '' }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dual Filter State
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  
  const [aiPrediction, setAiPrediction] = useState<{id: string, text: string} | null>(null);
  
  // Pagination
  const BATCH_SIZE = 20; 
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        const data = await fetchMatches();
        setMatches(data);
        setLoading(false);
    };
    init();
    const unsubscribe = subscribeToMatchUpdates((updatedMatches) => {
        setMatches(updatedMatches);
    });
    return () => unsubscribe();
  }, []);

  // Filter Logic
  const filteredMatches = matches.filter(m => {
    // LOCK: HIDE FINISHED MATCHES to focus on LIVE and UPCOMING
    if (m.status === 'finished') return false; 
    
    if (showFavoritesOnly && !m.isFavorite) return false;
    
    // 1. Global Search Filter (Overrides everything if present)
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return m.homeTeam.toLowerCase().includes(q) || 
               m.awayTeam.toLowerCase().includes(q) || 
               m.league.toLowerCase().includes(q);
    }

    // 2. Sport Filter
    if (selectedSport !== 'all' && m.sport !== selectedSport) return false;

    // 3. Region/Continent Filter
    if (selectedRegion !== 'all' && m.category !== selectedRegion) return false;

    return true;
  });

  const visibleMatches = filteredMatches.slice(0, visibleCount);

  const handleLoadMore = () => {
      setVisibleCount(prev => prev + 20);
  };

  const handleToggleFavorite = (e: React.MouseEvent, matchId: string) => {
      e.stopPropagation();
      toggleMatchFavorite(matchId);
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, isFavorite: !m.isFavorite } : m));
  };

  const handleAiPredict = async (e: React.MouseEvent, match: Match) => {
      e.stopPropagation();
      setAiPrediction({ id: match.id, text: "Gemini 3 Flash analyse le match..." });
      const text = await analyzeMatch(match);
      setAiPrediction({ id: match.id, text });
      
      setTimeout(() => setAiPrediction(null), 8000);
  };

  const sports = [
      { id: 'all', label: 'Tous', icon: TrendingUp },
      { id: 'football', label: 'Football', icon: Activity },
      { id: 'basketball', label: 'Basket', icon: Activity },
      { id: 'tennis', label: 'Tennis', icon: Activity },
      { id: 'rugby', label: 'Rugby', icon: Activity },
  ];

  const regions = [
      { id: 'all', label: '🌐 Partout' },
      { id: 'africa', label: '🦁 Afrique' },
      { id: 'europe', label: '🇪🇺 Europe' },
      { id: 'world', label: '🌍 Monde' },
      { id: 'local', label: '📍 Local' },
  ];

  if (loading && matches.length === 0) return <div className="text-center p-10 text-brand-accent animate-pulse font-bold">Chargement des données...</div>;

  return (
    <div className="space-y-4">
      
      {!showFavoritesOnly && !searchQuery && (
          <div className="space-y-3 px-2">
              {/* Level 1: Sports Filter */}
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                  {sports.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => { setSelectedSport(s.id as any); setVisibleCount(BATCH_SIZE); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                        selectedSport === s.id
                            ? 'bg-white text-brand-900 shadow-white/20'
                            : 'bg-brand-800 text-slate-400 border border-brand-700'
                        }`}
                    >
                        {s.label}
                    </button>
                  ))}
              </div>

              {/* Level 2: Region Filter */}
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase mr-1"><Filter size={10} /> Zone:</span>
                  {regions.map((r) => (
                    <button
                        key={r.id}
                        onClick={() => { setSelectedRegion(r.id); setVisibleCount(BATCH_SIZE); }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap border ${
                        selectedRegion === r.id
                            ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                            : 'bg-transparent border-brand-700 text-slate-500'
                        }`}
                    >
                        {r.label}
                    </button>
                  ))}
              </div>
          </div>
      )}

      {/* Results Header */}
      {!showFavoritesOnly && (
          <div className="px-3 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">{filteredMatches.length} Matchs Direct/À Venir</span>
              {searchQuery && <span className="text-brand-accent flex items-center gap-1"><Search size={10} /> Résultats pour "{searchQuery}"</span>}
          </div>
      )}

      {visibleMatches.length === 0 ? (
        <div className="text-center py-16 bg-brand-800/50 rounded-xl border border-dashed border-brand-700 mx-3">
           <div className="flex justify-center mb-3 text-slate-600"><Search size={32} /></div>
           <p className="text-slate-400 font-bold text-sm">Aucun match en cours ou à venir.</p>
           <p className="text-slate-500 text-xs">Revenez plus tard pour les prochains matchs.</p>
        </div>
      ) : (
        <div className="space-y-3">
        {visibleMatches.map((match) => (
            <div key={match.id} className="bg-brand-800 rounded-2xl p-0 border border-brand-700 shadow-xl overflow-hidden mx-2 relative group animate-fade-in hover:border-brand-600 transition-all">
              
              {/* Highlight Morocco vs Senegal */}
              {match.homeTeam === 'Maroc' && match.awayTeam === 'Sénégal' && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 z-10"></div>
              )}

              {/* AI Prediction Overlay */}
              {aiPrediction && aiPrediction.id === match.id && (
                  <div className="absolute inset-0 z-30 bg-brand-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                      <div className="bg-purple-500/20 p-3 rounded-full mb-3 animate-pulse">
                        <BrainCircuit size={32} className="text-purple-400" />
                      </div>
                      <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-black uppercase mb-3 text-lg">Analyse Gemini</h4>
                      <p className="text-white text-sm font-medium leading-relaxed max-w-xs">{aiPrediction.text}</p>
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
                           ? <img src={getFlag(match.countryCode)} className="w-4 h-3 object-cover rounded-sm" alt="flag" />
                           : <span>{getFlag(match.countryCode)}</span>
                       )}
                       {match.league}
                   </span>
                 </div>
                 <div className="flex items-center gap-3">
                    <button onClick={(e) => handleToggleFavorite(e, match.id)}>
                        <Star size={18} fill={match.isFavorite ? "#fbbf24" : "none"} className={match.isFavorite ? "text-yellow-400" : "text-slate-600 hover:text-white transition-colors"} />
                    </button>
                 </div>
              </div>

              {/* Match Content */}
              <div className="p-4 cursor-pointer hover:bg-brand-700/20 transition-colors" onClick={() => onOpenDetails(match)}>
                <div className="flex justify-between items-center mb-6">
                  {/* Home */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative group/team">
                        <div className="w-14 h-14 rounded-full bg-brand-700 p-1 border border-brand-600 flex items-center justify-center shadow-lg group-hover/team:scale-105 transition-transform">
                             <img src={match.homeLogo} alt={match.homeTeam} className="w-full h-full rounded-full object-cover" />
                        </div>
                        {match.homeCountryCode && !match.homeLogo?.includes('flagcdn.com') && (
                            <div className="absolute -bottom-1 -right-1 shadow-md">
                                {getFlag(match.homeCountryCode).startsWith('http') 
                                    ? <img src={getFlag(match.homeCountryCode)} className="w-5 h-3.5 object-cover rounded-sm border border-brand-900" alt="flag" />
                                    : <span className="bg-brand-900 rounded-full px-1 text-[8px]">{getFlag(match.homeCountryCode)}</span>
                                }
                            </div>
                        )}
                        {match.aiProbabilities && match.aiProbabilities.home > 55 && (
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm border border-brand-900">
                                {match.aiProbabilities.home}%
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
                             <img src={match.awayLogo} alt={match.awayTeam} className="w-full h-full rounded-full object-cover" />
                        </div>
                        {match.awayCountryCode && !match.awayLogo?.includes('flagcdn.com') && (
                            <div className="absolute -bottom-1 -right-1 shadow-md">
                                {getFlag(match.awayCountryCode).startsWith('http') 
                                    ? <img src={getFlag(match.awayCountryCode)} className="w-5 h-3.5 object-cover rounded-sm border border-brand-900" alt="flag" />
                                    : <span className="bg-brand-900 rounded-full px-1 text-[8px]">{getFlag(match.awayCountryCode)}</span>
                                }
                            </div>
                        )}
                        {match.aiProbabilities && match.aiProbabilities.away > 55 && (
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm border border-brand-900">
                                {match.aiProbabilities.away}%
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-bold text-white text-center line-clamp-2 h-10 flex items-center mt-2">{match.awayTeam}</span>
                  </div>
                </div>

                {/* Odds & Actions */}
                <div className="grid grid-cols-4 gap-2" onClick={(e) => e.stopPropagation()}>
                  {/* Odds */}
                  {[
                    { l: '1', v: match.odds.home, s: 'home' },
                    { l: 'X', v: match.odds.draw, s: 'draw' },
                    { l: '2', v: match.odds.away, s: 'away' }
                  ].map((opt, idx) => (
                    <button 
                      key={idx}
                      onClick={() => onAddToSlip({ 
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
                      className={`flex flex-col items-center bg-brand-900 hover:bg-brand-700 py-2 rounded-xl border border-brand-700 transition-all hover:border-brand-accent active:scale-95 group/btn ${opt.v === 0 ? 'opacity-30 pointer-events-none' : ''}`}
                    >
                      <span className="text-[9px] text-slate-500 font-bold group-hover/btn:text-brand-accent transition-colors">{opt.l}</span>
                      <span className="text-sm font-black text-white">{opt.v > 0 ? opt.v.toFixed(2) : '-'}</span>
                    </button>
                  ))}

                  {/* AI Button */}
                  <button 
                         onClick={(e) => handleAiPredict(e, match)}
                         className="flex-1 rounded-xl flex flex-col items-center justify-center transition-all border border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/30 group/ai"
                         title="Prédiction IA"
                  >
                      <BrainCircuit size={18} className="text-purple-500 mb-0.5 group-hover/ai:scale-110 transition-transform" />
                      <span className="text-[8px] font-bold text-purple-400 uppercase">Gemini</span>
                  </button>
                </div>
              </div>
            </div>
        ))}
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filteredMatches.length && (
          <div className="flex justify-center pt-4 pb-8">
              <button 
                 onClick={handleLoadMore}
                 className="bg-brand-800 text-white px-8 py-3 rounded-full font-bold border border-brand-700 hover:bg-brand-700 hover:scale-105 transition-all shadow-lg flex items-center gap-2 text-sm"
              >
                  <RefreshCw size={14} /> Afficher plus de matchs ({filteredMatches.length - visibleCount})
              </button>
          </div>
      )}
    </div>
  );
};

export default MatchList;