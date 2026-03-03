import React, { useState, useEffect } from 'react';
import { Match, BetSlipItem, SportType } from '../types';
import { Play, Sparkles, TrendingUp, RefreshCw, Tv, Activity, CalendarClock, ChevronRight, Eye, Globe, ChevronDown, Star, X, Filter, BrainCircuit, Search, MapPin, Lock } from 'lucide-react';
import { analyzeMatch } from '../services/geminiService';
import { fetchMatches, subscribeToMatchUpdates, getFlag } from '../services/sportApiService';
import MatchCard from './MatchCard';

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
      // toggleMatchFavorite is now handled in MatchCard, but we still need to update local state if we want immediate feedback in the list
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, isFavorite: !m.isFavorite } : m));
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
            <MatchCard 
                key={match.id} 
                match={match} 
                onAddToSlip={onAddToSlip} 
                onOpenDetails={onOpenDetails} 
            />
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