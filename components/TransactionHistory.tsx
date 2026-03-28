import React, { useState, useEffect } from 'react';
import { db, Transaction } from '../services/database';
import { ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle, Clock, Filter, FileText, ShoppingBag } from 'lucide-react';
import { AppSection } from '../types';

interface TransactionHistoryProps {
    onNavigate?: (section: AppSection) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onNavigate }) => {
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
        <div className="bg-brand-800 p-4 border-b border-brand-700 sticky top-16 z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-2">
                    <FileText className="text-brand-accent" /> Finance <span className="text-brand-accent">PRO</span>
                </h2>
                <div className="flex items-center gap-2">
                    {onNavigate && (
                        <button 
                            onClick={() => onNavigate(AppSection.PROMOTIONS)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-brand-accent/10 text-brand-accent rounded-full border border-brand-accent/20 hover:bg-brand-accent/20 transition-all"
                        >
                            <ShoppingBag size={14} />
                            <span className="text-[8px] font-black uppercase">Boutique</span>
                        </button>
                    )}
                    <div className="flex items-center gap-2 bg-brand-900 px-3 py-1 rounded-full border border-brand-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Sync</span>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
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

        <div className="p-4 space-y-4">
            {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-brand-700 rounded-xl">
                    Aucune transaction trouvée.
                </div>
            ) : (
                filtered.map((tx) => (
                    <div key={tx.id} className="space-y-2 mb-4">
                        <div className="bg-brand-800 rounded-xl p-4 border border-brand-700 flex items-center justify-between">
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
                        
                        {/* Detailed Info Section */}
                        <div className="p-3 bg-brand-900/50 rounded-lg border border-brand-700/50 text-[10px] space-y-2 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 uppercase tracking-tighter">Référence Transaction</span>
                                <span className="text-slate-300 font-mono">{tx.id.toUpperCase()}</span>
                            </div>
                            
                            {tx.type === 'deposit' && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 uppercase tracking-tighter">Méthode de paiement</span>
                                        <span className="text-brand-accent font-bold">{tx.provider || 'Mobile Money'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 uppercase tracking-tighter">Frais de réseau</span>
                                        <span className="text-green-500 font-bold">0 F (PRO)</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 uppercase tracking-tighter">Statut du dépôt</span>
                                        <span className="text-white font-bold">Confirmé sur la Blockchain/Réseau</span>
                                    </div>
                                </>
                            )}

                            {tx.type === 'withdraw' && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 uppercase tracking-tighter">Destination</span>
                                        <span className="text-white font-bold">{tx.provider || 'Compte Bancaire'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 uppercase tracking-tighter">Délai estimé</span>
                                        <span className="text-brand-accent font-bold">15 - 30 Minutes</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 uppercase tracking-tighter">Vérification KYC</span>
                                        <span className="text-green-500 font-bold">Approuvée</span>
                                    </div>
                                </>
                            )}

                            {(tx.type === 'bet_stake' || tx.type === 'bet_win') && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 uppercase tracking-tighter">Jeu / Événement</span>
                                        <span className="text-white font-bold">{tx.provider || 'Paris Sportifs'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 uppercase tracking-tighter">Type d'opération</span>
                                        <span className="text-brand-accent font-bold uppercase">{tx.type === 'bet_stake' ? 'Mise' : 'Gain'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 uppercase tracking-tighter">ID Ticket</span>
                                        <span className="text-slate-400 font-mono">#TK-{tx.id.slice(-6).toUpperCase()}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};


export default TransactionHistory;
