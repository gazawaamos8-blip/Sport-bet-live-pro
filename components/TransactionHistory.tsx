import React, { useState, useEffect } from 'react';
import { db, Transaction } from '../services/database';
import { ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle, Clock, Filter, FileText } from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw' | 'game'>('all');

  useEffect(() => {
    const txs = db.getTransactions();
    setTransactions(txs);
  }, []);

  const filtered = transactions.filter(t => {
      if (filter === 'all') return true;
      if (filter === 'game') return t.type === 'bet_stake' || t.type === 'bet_win';
      return t.type === filter;
  });

  const getIcon = (type: string) => {
      switch(type) {
          case 'deposit': return <ArrowDownLeft className="text-green-500" />;
          case 'bet_win': return <ArrowDownLeft className="text-brand-accent" />;
          case 'withdraw': return <ArrowUpRight className="text-white" />;
          case 'bet_stake': return <ArrowUpRight className="text-slate-400" />;
          default: return <FileText className="text-slate-500" />;
      }
  };

  const getLabel = (type: string) => {
      switch(type) {
          case 'deposit': return 'Dépôt';
          case 'withdraw': return 'Retrait';
          case 'bet_stake': return 'Mise Pari/Jeu';
          case 'bet_win': return 'Gain Pari/Jeu';
          default: return 'Opération';
      }
  };

  const getColor = (type: string) => {
      if (type === 'deposit' || type === 'bet_win') return 'text-brand-accent';
      return 'text-white';
  };

  return (
    <div className="pb-24 animate-fade-in">
        {/* Header */}
        <div className="bg-brand-800 p-4 border-b border-brand-700 sticky top-16 z-10">
            <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-2">
                <FileText className="text-slate-300" /> Historique <span className="text-brand-accent">Finance</span>
            </h2>
            
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'all', label: 'Tout' },
                    { id: 'deposit', label: 'Dépôts' },
                    { id: 'withdraw', label: 'Retraits' },
                    { id: 'game', label: 'Jeux & Paris' },
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setFilter(opt.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${filter === opt.id ? 'bg-brand-accent text-brand-900 border-brand-accent' : 'bg-brand-900 text-slate-400 border-brand-700'}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="p-4 space-y-3">
            {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-brand-700 rounded-xl">
                    Aucune transaction trouvée.
                </div>
            ) : (
                filtered.map((tx) => (
                    <div key={tx.id} className="bg-brand-800 rounded-xl p-4 border border-brand-700 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-brand-900 p-3 rounded-full border border-brand-700">
                                {getIcon(tx.type)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{getLabel(tx.type)}</p>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    {tx.provider && <span>• {tx.provider}</span>}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-mono font-bold ${getColor(tx.type)}`}>
                                {(tx.type === 'deposit' || tx.type === 'bet_win') ? '+' : '-'}{tx.amount.toLocaleString()} F
                            </p>
                            <p className="text-[10px] uppercase font-bold flex items-center justify-end gap-1">
                                {tx.status === 'success' ? <span className="text-green-500">Succès</span> : <span className="text-yellow-500">En attente</span>}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default TransactionHistory;
