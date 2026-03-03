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
      <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToRecent(query)}
              placeholder="Rechercher une équipe, une ligue ou un match..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-lg"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-white/60 hover:text-white font-medium transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>

      {/* Search Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            {!query ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-white/40 mb-4 px-2">
                      <History className="w-4 h-4" />
                      <span className="text-sm font-medium uppercase tracking-wider">Recherches récentes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleRecentClick(s)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 transition-all flex items-center gap-2"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-white/40 mb-4 px-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">Tendances</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['Real Madrid', 'Lakers', 'Premier League', 'NBA', 'Champions League'].map((t, i) => (
                      <button
                        key={i}
                        onClick={() => handleRecentClick(t)}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl group transition-all"
                      >
                        <span className="text-white/80 group-hover:text-white transition-colors">{t}</span>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-emerald-500 transition-colors" />
                      </button>
                    ))}
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
