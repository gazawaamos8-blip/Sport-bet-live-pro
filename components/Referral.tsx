import React, { useState } from 'react';
import { Share2, Users, Copy, Check, TrendingUp, DollarSign, ChevronRight, PieChart, List, CreditCard, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

const Referral: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'payouts'>('dashboard');
  const [copied, setCopied] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const referralCode = "PRO2026VIP";
  const commissionBalance = 154500;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestPayout = () => {
    setShowWithdrawModal(true);
  };

  const confirmPayout = () => {
    alert("Demande de retrait de commission envoyée avec succès !");
    setShowWithdrawModal(false);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in relative">
      
      {/* Header Style 1xBet Partners */}
      <div className="bg-brand-800 p-6 border-b border-brand-700 shadow-xl">
         <div className="flex justify-between items-start">
            <div>
               <h2 className="text-2xl font-black text-white italic uppercase mb-1">Affiliation <span className="text-brand-accent">VIP</span></h2>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Programme Partenaire 2026</p>
            </div>
            <div className="bg-brand-accent text-brand-900 text-xs font-black px-3 py-1 rounded-full animate-pulse shadow-[0_0_10px_#00d062]">
               Niveau: GOLD
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-2 border-b border-brand-700 pb-1">
        {[
            { id: 'dashboard', label: 'Aperçu', icon: PieChart },
            { id: 'members', label: 'Mes Filleuls', icon: List },
            { id: 'payouts', label: 'Paiements', icon: CreditCard },
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase rounded-t-xl transition-colors ${activeTab === tab.id ? 'bg-brand-800 text-brand-accent border-t border-x border-brand-700' : 'text-slate-500 hover:text-white'}`}
            >
                <tab.icon size={14} /> {tab.label}
            </button>
        ))}
      </div>

      {/* Content based on Tab */}
      <div className="px-4">
        
        {activeTab === 'dashboard' && (
            <div className="space-y-4 animate-fade-in">
                 {/* Balance Card */}
                 <div className="bg-gradient-to-br from-brand-800 to-brand-900 p-6 rounded-2xl border border-brand-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign size={100} /></div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Solde Disponible</p>
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-3xl font-mono font-black text-white">{commissionBalance.toLocaleString()}</span>
                        <span className="text-sm font-bold text-brand-accent mb-1">XAF</span>
                    </div>
                    <button onClick={handleRequestPayout} className="w-full bg-brand-accent text-brand-900 font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg">
                        DEMANDER UN RETRAIT
                    </button>
                 </div>

                 {/* Promo Code */}
                 <div className="bg-brand-800 rounded-xl p-5 border border-brand-600">
                    <p className="text-center text-xs text-slate-400 uppercase font-bold mb-3">Votre lien de parrainage unique</p>
                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 bg-black/30 border border-brand-700 rounded-lg flex items-center justify-center font-mono font-bold text-lg text-brand-accent tracking-widest select-all">
                            {referralCode}
                        </div>
                        <button onClick={handleCopy} className="bg-brand-700 text-white p-3 rounded-lg font-bold hover:bg-brand-600 transition-colors border border-brand-600">
                            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="bg-[#25D366] hover:bg-[#20ba5a] text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 text-xs uppercase shadow-lg transition-colors">
                            <Share2 size={16} /> WhatsApp
                        </button>
                        <button className="bg-[#1877F2] hover:bg-[#166fe5] text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 text-xs uppercase shadow-lg transition-colors">
                            <Share2 size={16} /> Facebook
                        </button>
                    </div>
                 </div>

                 {/* Stats */}
                 <div className="grid grid-cols-2 gap-3">
                     <div className="bg-brand-800 p-4 rounded-xl border border-brand-700">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2"><Users size={14} /> Total Clics</div>
                        <div className="text-xl font-black text-white">1,240</div>
                     </div>
                     <div className="bg-brand-800 p-4 rounded-xl border border-brand-700">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2"><TrendingUp size={14} /> Taux Conv.</div>
                        <div className="text-xl font-black text-green-400">12.5%</div>
                     </div>
                 </div>
            </div>
        )}

        {activeTab === 'members' && (
            <div className="animate-fade-in bg-brand-800 rounded-xl border border-brand-700 overflow-hidden">
                <div className="grid grid-cols-3 bg-brand-900 p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                   <div>Utilisateur</div>
                   <div>Date</div>
                   <div>Profit</div>
                </div>
                {[
                   { user: "User_9382", date: "Hier", profit: "+1,200" },
                   { user: "Moussa_K", date: "24/10", profit: "+5,400" },
                   { user: "BetWinner2", date: "22/10", profit: "+250" },
                   { user: "Lion_237", date: "21/10", profit: "+8,000" },
                   { user: "Pro_Gamer", date: "20/10", profit: "+1,200" },
                ].map((row, i) => (
                   <div key={i} className="grid grid-cols-3 p-4 border-t border-brand-700 text-center items-center hover:bg-brand-700/50 transition-colors">
                      <div className="font-bold text-white text-xs">{row.user}</div>
                      <div className="text-slate-400 text-xs">{row.date}</div>
                      <div className="text-brand-accent font-bold font-mono text-xs">{row.profit} F</div>
                   </div>
                ))}
            </div>
        )}

        {activeTab === 'payouts' && (
            <div className="animate-fade-in space-y-3">
                <div className="bg-brand-900 border-l-4 border-blue-500 p-4 rounded-r-xl">
                    <p className="text-xs text-slate-300">Les paiements sont traités automatiquement tous les mardis pour les soldes &gt; 10,000 F.</p>
                </div>
                <div className="bg-brand-800 rounded-xl border border-brand-700 overflow-hidden">
                    <div className="p-4 border-b border-brand-700 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">15 Oct 2026</span>
                        <span className="bg-green-500/20 text-green-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Payé</span>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-white font-bold text-sm">Virement Mobile Money</span>
                        <span className="font-mono text-white">45,000 XAF</span>
                    </div>
                </div>
                <div className="bg-brand-800 rounded-xl border border-brand-700 overflow-hidden">
                    <div className="p-4 border-b border-brand-700 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">01 Oct 2026</span>
                        <span className="bg-green-500/20 text-green-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Payé</span>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-white font-bold text-sm">Virement Mobile Money</span>
                        <span className="font-mono text-white">22,500 XAF</span>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* Withdraw Modal Overlay */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-brand-800 w-full max-w-sm rounded-2xl border border-brand-600 shadow-2xl p-6 animate-fade-in">
                <h3 className="text-xl font-black text-white mb-4">Retrait Commission</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase">Montant à retirer</label>
                        <input type="text" value={commissionBalance.toLocaleString()} disabled className="w-full bg-brand-900 border border-brand-700 rounded-lg p-3 text-white font-mono mt-1 opacity-70" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase">Numéro de réception</label>
                        <input type="text" placeholder="6XXXXXXXX" className="w-full bg-brand-900 border border-brand-700 rounded-lg p-3 text-white font-mono mt-1 focus:border-brand-accent focus:outline-none" />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowWithdrawModal(false)} className="flex-1 bg-brand-700 text-white font-bold py-3 rounded-xl hover:bg-brand-600">Annuler</button>
                        <button onClick={confirmPayout} className="flex-1 bg-brand-accent text-brand-900 font-bold py-3 rounded-xl hover:bg-emerald-400">Confirmer</button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Referral;