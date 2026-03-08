import React, { useState, useEffect } from 'react';
import { MOCK_CASINO_GAMES } from '../constants';
import { CasinoGame } from '../types';
import { Play, Flame, Search, X, Sparkles } from 'lucide-react';
import { db } from '../services/database';
import RouletteGame from './RouletteGame';
import CrashGame from './CrashGame';
import CasinoCarousel from './CasinoCarousel';

interface CasinoHubProps {
  searchQuery?: string;
}

const CasinoHub: React.FC<CasinoHubProps> = ({ searchQuery = '' }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'slots' | 'crash' | 'live' | 'table'>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [activeGame, setActiveGame] = useState<CasinoGame | null>(null);
  const [balance, setBalance] = useState(0);
  
  // Default API Key for Games Hub
  const GAME_HUB_API_KEY = "SB-GAME-HUB-PRO-2026-V1";

  useEffect(() => {
      const unsub = db.subscribeToBalance(setBalance);
      return () => unsub();
  }, []);

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'crash', label: '🚀 Crash' },
    { id: 'slots', label: '🎰 Machines' },
    { id: 'live', label: '🔴 Live' },
    { id: 'table', label: '🃏 Table' },
  ];

  const effectiveSearch = searchQuery || localSearch;

  const filteredGames = MOCK_CASINO_GAMES.filter(g => 
    (activeCategory === 'all' || g.category === activeCategory) &&
    g.title.toLowerCase().includes(effectiveSearch.toLowerCase())
  );

  return (
    <div className="pb-24 animate-fade-in relative">
      
      {/* Game Modal */}
      {activeGame && (
         <>
             {activeGame.id === 'cosmic-roulette' ? (
                 <RouletteGame onClose={() => setActiveGame(null)} />
             ) : activeGame.id === 'aviator-crash' ? (
                 <CrashGame onClose={() => setActiveGame(null)} />
             ) : (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col">
                    <div className="h-14 bg-brand-900 flex justify-between items-center px-4 border-b border-brand-700">
                        <button onClick={() => setActiveGame(null)} className="bg-brand-800 p-2 rounded-full hover:bg-brand-700"><X size={20} className="text-white"/></button>
                        <div>
                            <h3 className="text-white font-bold text-sm">{activeGame.title}</h3>
                            <p className="text-[10px] text-brand-accent font-bold uppercase">Solde: {balance.toLocaleString()} F</p>
                        </div>
                        <div className="w-8"></div>
                    </div>
                    <div className="flex-1 bg-brand-800 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-white uppercase mb-2">Simulation</h2>
                            <p className="text-slate-400 text-sm">Le jeu se lancerait ici via iframe.</p>
                        </div>
                    </div>
                </div>
             )}
         </>
      )}

      {/* Header */}
      <div className="bg-brand-800 p-4 sticky top-16 z-10 border-b border-brand-700 shadow-xl">
         <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-2">
                 <Sparkles className="text-brand-accent" /> Casino
             </h2>
             <div className="bg-brand-900 px-3 py-1 rounded-full border border-brand-700">
                 <span className="text-xs font-bold text-white uppercase">Solde: {balance.toLocaleString()} F</span>
             </div>
         </div>

         <CasinoCarousel />

         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
             {categories.map(cat => (
                 <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border ${
                        activeCategory === cat.id 
                        ? 'bg-brand-accent text-brand-900 border-brand-accent' 
                        : 'bg-brand-900 text-slate-400 border-brand-700'
                    }`}
                 >
                     {cat.label}
                 </button>
             ))}
         </div>

         <div className="relative mt-2">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input 
                type="text" 
                placeholder="Rechercher un jeu..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-brand-900 border border-brand-700 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-brand-accent focus:outline-none"
             />
         </div>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredGames.map(game => (
              <div 
                key={game.id} 
                onClick={() => setActiveGame(game)}
                className="bg-brand-800 rounded-xl overflow-hidden border border-brand-700 relative group cursor-pointer hover:border-brand-accent transition-all shadow-lg"
              >
                  <div className="aspect-[4/3] relative">
                      <img src={game.image} alt={game.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {game.isHot && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1">
                              <Flame size={10} fill="currentColor" /> HOT
                          </div>
                      )}
                  </div>
                  <div className="p-3">
                      <h4 className="text-white font-bold text-sm truncate">{game.title}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{game.provider}</p>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default CasinoHub;