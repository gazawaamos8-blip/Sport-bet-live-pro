
import React, { useState, useEffect } from 'react';
import { PlacedBet } from '../types';
import { CheckCircle, XCircle, Clock, ChevronRight, Tag } from 'lucide-react';
import BetDetailModal from './BetDetailModal';
import { db } from '../services/database'; // Using centralized DB
import { t } from '../services/localization';

const BetHistory: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'won' | 'lost' | 'pending'>('all');
  const [selectedBet, setSelectedBet] = useState<PlacedBet | null>(null);
  const [bets, setBets] = useState<PlacedBet[]>([]);

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

  const filteredHistory = bets.filter(
    item => filter === 'all' || item.status === filter
  );

  const getStatusColor = (status: PlacedBet['status']) => {
    switch(status) {
      case 'won': return 'text-brand-accent';
      case 'lost': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24 animate-fade-in">
      {/* Filters */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white">{t('history')}</h2>
        <div className="flex bg-brand-800 rounded-lg p-1 overflow-x-auto no-scrollbar">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${filter === 'all' ? 'bg-brand-700 text-white' : 'text-slate-400'}`}>Tous</button>
          <button onClick={() => setFilter('won')} className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${filter === 'won' ? 'bg-brand-700 text-white' : 'text-slate-400'}`}>{t('won')}</button>
          <button onClick={() => setFilter('pending')} className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${filter === 'pending' ? 'bg-brand-700 text-white' : 'text-slate-400'}`}>{t('pending')}</button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-10 text-slate-500 border border-dashed border-brand-700 rounded-xl">
           Pas de paris trouvés.
        </div>
      ) : (
        filteredHistory.map((bet) => (
          <div 
            key={bet.id} 
            onClick={() => setSelectedBet(bet)}
            className="bg-brand-800 rounded-xl border border-brand-700 overflow-hidden relative group cursor-pointer hover:border-brand-600 transition-colors"
          >
            {/* Promo Tag */}
            {bet.promoCode && (
                <div className="absolute top-0 left-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg z-10 flex items-center gap-1">
                    <Tag size={10} /> {bet.promoCode}
                </div>
            )}

            <div className="p-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-brand-900 border ${bet.status === 'won' ? 'border-brand-accent text-brand-accent' : bet.status === 'lost' ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'}`}>
                        {bet.status === 'won' ? <CheckCircle size={20} /> : bet.status === 'lost' ? <XCircle size={20} /> : <Clock size={20} />}
                   </div>
                   <div>
                       <div className="text-sm font-bold text-white">{bet.items.length > 1 ? 'Combiné' : 'Simple'}</div>
                       <div className="text-xs text-slate-500">{bet.date}</div>
                   </div>
               </div>
               
               <div className="text-right">
                   <div className="font-mono font-bold text-white">{bet.stake.toLocaleString()} F</div>
                   <div className={`text-xs font-bold ${getStatusColor(bet.status)}`}>
                       {bet.status === 'won' ? `+${bet.potentialWin.toLocaleString()} F` : bet.status === 'pending' ? t('pending') : t('lost')}
                   </div>
               </div>

               <div className="ml-2 text-slate-600 group-hover:text-white transition-colors">
                   <ChevronRight size={20} />
               </div>
            </div>
          </div>
        ))
      )}

      {/* Detail Modal */}
      {selectedBet && (
          <BetDetailModal bet={selectedBet} onClose={() => setSelectedBet(null)} />
      )}
    </div>
  );
};

export default BetHistory;
