
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlacedBet } from '../types';
import { CheckCircle, XCircle, Clock, ChevronRight, Tag, Ticket, Search, Filter } from 'lucide-react';
import BetDetailModal from './BetDetailModal';
import { db } from '../services/database'; // Using centralized DB
import { t } from '../services/localization';
import { getFlag } from '../services/sportApiService';

const BetHistory: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'won' | 'lost' | 'pending'>('all');
  const [selectedBet, setSelectedBet] = useState<PlacedBet | null>(null);
  const [bets, setBets] = useState<PlacedBet[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    // Load from DB
    const loadBets = () => {
        const history = db.getBets();
        setBets(history);
    };
    loadBets();
    
    // Auto-refresh periodically to show status updates from AI logic
    const interval = setInterval(loadBets, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredHistory = bets.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = searchQuery === '' || 
      item.items.some(betItem => 
        betItem.matchInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        betItem.league?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: PlacedBet['status']) => {
    switch(status) {
      case 'won': return 'text-brand-accent';
      case 'cashed_out': return 'text-blue-400';
      case 'lost': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
      {/* Filters - Modern Segmented Control */}
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
            <Ticket className="text-brand-accent" size={32} />
            Mes Paris
          </h2>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {isSearchVisible && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 150, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-brand-800 border border-brand-700 rounded-full px-4 py-1.5 text-xs text-white focus:outline-none focus:border-brand-accent"
                />
              )}
            </AnimatePresence>
            <button 
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className={`p-2 rounded-full border transition-colors ${isSearchVisible ? 'bg-brand-accent text-brand-900 border-brand-accent' : 'bg-brand-800/50 text-slate-500 border-brand-700'}`}
            >
              <Search size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex bg-brand-900/80 backdrop-blur-xl rounded-2xl p-1.5 border border-brand-700/50 shadow-2xl overflow-x-auto no-scrollbar">
          {(['all', 'won', 'pending', 'lost'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)} 
              className={`flex-1 min-w-[80px] px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${filter === f ? 'bg-brand-accent text-brand-900 shadow-[0_0_20px_rgba(0,230,118,0.3)] scale-105' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              {f === 'all' ? 'Tous' : f === 'won' ? 'Gagnés' : f === 'pending' ? 'En cours' : 'Perdus'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredHistory.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20 text-slate-600 bg-brand-800/20 border-2 border-dashed border-brand-700/50 rounded-[2.5rem]"
          >
             <div className="w-24 h-24 rounded-full bg-brand-800 flex items-center justify-center mb-6 shadow-inner border border-brand-700">
                <Ticket size={48} className="opacity-20 text-brand-accent" />
             </div>
             <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-500">Aucun pari trouvé</p>
             <p className="text-[9px] text-slate-700 uppercase font-bold mt-2">Placez votre premier pari maintenant</p>
          </motion.div>
        ) : (
          <div className="grid gap-5">
            {filteredHistory.map((bet, idx) => (
              <motion.div 
                key={bet.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, translateY: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedBet(bet)}
                className="bg-brand-800/80 backdrop-blur-md rounded-[2rem] border border-brand-700/50 overflow-hidden relative group cursor-pointer hover:border-brand-accent/50 transition-all shadow-2xl"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                  bet.status === 'won' ? 'bg-brand-accent shadow-[4px_0_20px_rgba(0,230,118,0.4)]' : 
                  bet.status === 'lost' ? 'bg-red-500 shadow-[4px_0_20px_rgba(239,68,68,0.4)]' : 
                  'bg-yellow-500 shadow-[4px_0_20px_rgba(234,179,8,0.4)]'
                }`}></div>

                {/* Promo Tag */}
                {bet.promoCode && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-blue-700 text-white text-[8px] font-black px-4 py-1.5 rounded-bl-2xl z-10 flex items-center gap-1.5 uppercase tracking-tighter shadow-lg">
                        <Tag size={10} className="animate-pulse" /> {bet.promoCode}
                    </div>
                )}

                <div className="p-6 flex justify-between items-center">
                   <div className="flex items-center gap-5 flex-1 min-w-0">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-brand-900 border-2 flex-shrink-0 transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 ${
                         bet.status === 'won' ? 'border-brand-accent/30 text-brand-accent shadow-[0_0_20px_rgba(0,230,118,0.1)]' : 
                         bet.status === 'lost' ? 'border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 
                         'border-yellow-500/30 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]'
                       }`}>
                            {bet.status === 'won' ? <CheckCircle size={28} /> : bet.status === 'lost' ? <XCircle size={28} /> : <Clock size={28} />}
                       </div>
                       <div className="min-w-0">
                           <div className="text-base font-black text-white uppercase tracking-tighter truncate group-hover:text-brand-accent transition-colors">
                               {bet.items.length > 1 ? `Combiné • ${bet.items.length} Sélections` : bet.items[0]?.matchInfo}
                           </div>
                           <div className="flex items-center gap-4 mt-2">
                               <div className="flex -space-x-2.5">
                                   {bet.items.slice(0, 3).map((item, i) => (
                                       <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-800 bg-white/5 p-1 shadow-xl overflow-hidden ring-1 ring-white/10 flex items-center justify-center backdrop-blur-sm">
                                           {item.homeLogo ? (
                                               <img src={item.homeLogo} className="w-5 h-5 object-contain" alt="logo" referrerPolicy="no-referrer" />
                                           ) : item.homeCountryCode && (
                                               getFlag(item.homeCountryCode).startsWith('http') 
                                                 ? <img src={getFlag(item.homeCountryCode)} className="w-5 h-5 object-contain" alt="flag" referrerPolicy="no-referrer" />
                                                 : <span className="text-[8px] font-black flex items-center justify-center h-full">{getFlag(item.homeCountryCode)}</span>
                                           )}
                                       </div>
                                   ))}
                               </div>
                               {bet.items.length > 3 && <span className="text-[10px] text-slate-500 font-black bg-brand-900 px-2 py-0.5 rounded-full border border-brand-700">+{bet.items.length - 3}</span>}
                               <div className="h-4 w-px bg-brand-700/50 mx-1"></div>
                               <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{bet.date}</span>
                           </div>
                       </div>
                   </div>
                   
                   <div className="text-right ml-4 flex flex-col items-end">
                       <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1 opacity-50">Mise Totale</div>
                       <div className="font-black text-white text-xl leading-none tracking-tighter italic">{bet.stake.toLocaleString()} F</div>
                       <div className={`text-[10px] font-black mt-3 px-3 py-1 rounded-xl border transition-all duration-500 group-hover:px-4 ${
                         bet.status === 'won' ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' : 
                         bet.status === 'lost' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                         'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                       }`}>
                           {bet.status === 'won' ? `+${bet.potentialWin.toLocaleString()} F` : 
                            bet.status === 'cashed_out' ? `Vendu: ${bet.potentialWin.toLocaleString()} F` : 
                            bet.status === 'pending' ? 'EN ATTENTE' : 'PERDU'}
                       </div>
                   </div>

                   <div className="ml-6 text-slate-700 group-hover:text-brand-accent transition-all duration-300 transform group-hover:translate-x-2">
                       <ChevronRight size={24} />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      {selectedBet && (
          <BetDetailModal bet={selectedBet} onClose={() => setSelectedBet(null)} />
      )}
    </div>
  );
};

export default BetHistory;
