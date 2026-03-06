import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Trophy, Calendar, Clock, ChevronRight, TrendingUp, History, Star } from 'lucide-react';
import { sportApiService } from '../services/sportApiService';
import { Match } from '../types';
import MatchCard from './MatchCard';

interface SearchPageProps {
  onClose: () => void;
  initialQuery?: string;
}

const SearchPage: React.FC<SearchPageProps> = ({ onClose, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Match[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const filtered = await sportApiService.searchMatches(query);
        setResults(filtered);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleRecentClick = (q: string) => {
    setQuery(q);
  };

  const addToRecent = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0A0A0B] flex flex-col"
    >
      {/* Search Header */}
      <div className="p-4 md:p-8 border-b border-white/10 bg-[#0A0A0B]/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500/60 group-focus-within:text-emerald-500 transition-colors" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToRecent(query)}
              placeholder="Équipe, Ligue, Joueur..."
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all text-xl font-medium shadow-2xl"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black uppercase text-xs tracking-widest transition-all active:scale-95"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Search Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-emerald-900/5">
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          <AnimatePresence mode="wait">
            {!query ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-10"
              >
                <div className="lg:col-span-2 space-y-10">
                  {recentSearches.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-3 text-emerald-500">
                          <History className="w-5 h-5" />
                          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Récents</h3>
                        </div>
                        <button 
                          onClick={() => { setRecentSearches([]); localStorage.removeItem('recentSearches'); }}
                          className="text-[10px] font-black text-white/20 hover:text-red-500 uppercase tracking-widest transition-colors"
                        >
                          Effacer tout
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {recentSearches.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleRecentClick(s)}
                            className="px-5 py-3 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-2xl text-white/80 hover:text-emerald-400 transition-all flex items-center gap-3 group"
                          >
                            <span className="font-medium">{s}</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <div className="flex items-center gap-3 text-emerald-500 mb-6 px-2">
                      <TrendingUp className="w-5 h-5" />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em]">Tendances Actuelles</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: 'Real Madrid', category: 'Football' },
                        { name: 'NBA Playoffs', category: 'Basketball' },
                        { name: 'Champions League', category: 'Europe' },
                        { name: 'Ligue 1 Uber Eats', category: 'France' },
                        { name: 'Roland Garros', category: 'Tennis' },
                        { name: 'Formula 1', category: 'Racing' }
                      ].map((t, i) => (
                        <button
                          key={i}
                          onClick={() => handleRecentClick(t.name)}
                          className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl group transition-all hover:scale-[1.02] active:scale-95"
                        >
                          <div className="text-left">
                            <p className="text-[10px] font-black text-emerald-500 uppercase mb-1 tracking-widest">{t.category}</p>
                            <p className="text-white font-bold text-lg">{t.name}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-brand-900 transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-emerald-500/10 to-purple-500/10 rounded-3xl p-8 border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                      <Star size={80} className="text-emerald-500" />
                    </div>
                    <h4 className="text-xl font-black text-white uppercase italic mb-3">Favoris Pro</h4>
                    <p className="text-sm text-white/60 leading-relaxed mb-6">Enregistrez vos équipes pour recevoir des notifications en temps réel.</p>
                    <button className="w-full bg-emerald-500 text-brand-900 font-black py-4 rounded-2xl uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all">
                      Gérer mes favoris
                    </button>
                  </div>

                  <div className="bg-brand-800 rounded-3xl p-8 border border-brand-700">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Aide à la recherche</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-xs text-white/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Tapez le nom d'un joueur
                      </li>
                      <li className="flex items-center gap-3 text-xs text-white/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Recherchez par pays (ex: "Cameroun")
                      </li>
                      <li className="flex items-center gap-3 text-xs text-white/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Utilisez des dates (ex: "Demain")
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            ) : isSearching ? (
              <motion.div
                key="searching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-white/40 font-medium">Recherche en cours...</p>
              </motion.div>
            ) : results.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-white/60 font-medium">
                    {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {results.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Aucun résultat trouvé</h3>
                <p className="text-white/40 max-w-xs">
                  Nous n'avons trouvé aucun match correspondant à "{query}". Essayez d'autres mots-clés.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchPage;
