import React, { useState } from 'react';
import { Share2, Users, Copy, Check, TrendingUp, DollarSign, ChevronRight, PieChart, List, CreditCard, AlertCircle, Calculator, Award, Zap, Smartphone } from 'lucide-react';
import { storageService } from '../services/storageService';

const Referral: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'payouts' | 'tiers'>('dashboard');
  const [copied, setCopied] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [calcAmount, setCalcAmount] = useState<number>(50000);
  const referralCode = "PRO2026VIP";
  const commissionBalance = 154500;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Rejoins-moi sur SportBet Pro !',
                text: `Utilise mon code promo ${referralCode} pour recevoir 200% de bonus sur ton premier dépôt !`,
                url: window.location.href,
            });
        } catch (err) {
            console.log('Share failed', err);
        }
    } else {
        handleCopy();
    }
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
      <div className="flex px-4 gap-2 border-b border-brand-700 pb-1 overflow-x-auto no-scrollbar">
        {[
            { id: 'dashboard', label: 'Aperçu', icon: PieChart },
            { id: 'members', label: 'Filleuls', icon: List },
            { id: 'tiers', label: 'Niveaux', icon: Award },
            { id: 'payouts', label: 'Paiements', icon: CreditCard },
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase rounded-t-xl transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-800 text-brand-accent border-t border-x border-brand-700' : 'text-slate-500 hover:text-white'}`}
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
                 <div className="bg-gradient-to-br from-brand-800 to-brand-900 p-6 rounded-2xl border border-brand-700 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign size={100} /></div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Solde Commission</p>
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-3xl font-mono font-black text-white">{commissionBalance.toLocaleString()}</span>
                        <span className="text-sm font-bold text-brand-accent mb-1">XAF</span>
                    </div>
                    <button onClick={handleRequestPayout} className="w-full bg-brand-accent text-brand-900 font-black py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-lg active:scale-95 uppercase text-xs tracking-widest">
                        DEMANDER UN RETRAIT
                    </button>
                 </div>

                 {/* Promo Code */}
                 <div className="bg-brand-800 rounded-2xl p-5 border border-brand-600 shadow-xl">
                    <p className="text-center text-[10px] text-slate-400 uppercase font-black mb-3 tracking-widest">Votre code promo unique</p>
                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 bg-black/30 border border-brand-700 rounded-xl flex items-center justify-center font-mono font-black text-xl text-brand-accent tracking-[0.2em] select-all shadow-inner">
                            {referralCode}
                        </div>
                        <button onClick={handleCopy} className="bg-brand-700 text-white p-4 rounded-xl font-bold hover:bg-brand-600 transition-all border border-brand-600 active:scale-90">
                            {copied ? <Check size={24} className="text-green-500" /> : <Copy size={24} />}
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={handleShare} className="bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 text-[10px] uppercase shadow-lg transition-all active:scale-95">
                            <Share2 size={16} /> Partager
                        </button>
                        <button 
                            onClick={() => window.open(`https://wa.me/?text=Rejoins-moi sur SportBet Pro ! Utilise mon code promo ${referralCode} pour recevoir 200% de bonus !`, '_blank')}
                            className="bg-[#128C7E] hover:bg-[#075E54] text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 text-[10px] uppercase shadow-lg transition-all active:scale-95"
                        >
                            <Smartphone size={16} /> WhatsApp
                        </button>
                        <button className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent py-3 rounded-xl font-black flex items-center justify-center gap-2 text-[10px] uppercase shadow-lg transition-all active:scale-95">
                            <Zap size={16} /> Boosters
                        </button>
                    </div>
                 </div>

                 {/* Calculator */}
                 <div className="bg-brand-800 rounded-2xl p-5 border border-brand-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Calculator size={18} className="text-brand-accent" />
                        <h4 className="text-white font-black uppercase text-xs italic">Simulateur de Gains</h4>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-2">
                                <span>Volume de paris mensuel</span>
                                <span className="text-white">{calcAmount.toLocaleString()} F</span>
                            </div>
                            <input 
                                type="range" 
                                min="10000" 
                                max="1000000" 
                                step="10000"
                                value={calcAmount}
                                onChange={(e) => setCalcAmount(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-brand-900 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                            />
                        </div>
                        <div className="bg-brand-900/50 p-4 rounded-xl border border-brand-700/50 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Votre Commission (25%)</span>
                            <span className="text-xl font-black text-brand-accent font-mono">{(calcAmount * 0.25).toLocaleString()} F</span>
                        </div>
                    </div>
                 </div>

                 {/* Stats */}
                 <div className="grid grid-cols-2 gap-3">
                     <div className="bg-brand-800 p-4 rounded-2xl border border-brand-700 shadow-lg">
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest"><Users size={14} /> Filleuls</div>
                        <div className="text-2xl font-black text-white">1,240</div>
                        <div className="text-[9px] text-green-500 font-bold mt-1">+12 ce mois</div>
                     </div>
                     <div className="bg-brand-800 p-4 rounded-2xl border border-brand-700 shadow-lg">
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest"><TrendingUp size={14} /> Taux Conv.</div>
                        <div className="text-2xl font-black text-green-400">12.5%</div>
                        <div className="text-[9px] text-slate-500 font-bold mt-1">Moyenne: 8%</div>
                     </div>
                 </div>
            </div>
        )}

        {activeTab === 'members' && (
            <div className="animate-fade-in space-y-4">
                <div className="bg-brand-800 rounded-2xl border border-brand-700 overflow-hidden shadow-xl">
                    <div className="grid grid-cols-3 bg-brand-900 p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-brand-700">
                       <div>Utilisateur</div>
                       <div>Date</div>
                       <div>Profit</div>
                    </div>
                    <div className="divide-y divide-brand-700/50">
                        {[
                           { user: "User_9382", date: "Hier", profit: "+1,200" },
                           { user: "Moussa_K", date: "24/10", profit: "+5,400" },
                           { user: "BetWinner2", date: "22/10", profit: "+250" },
                           { user: "Lion_237", date: "21/10", profit: "+8,000" },
                           { user: "Pro_Gamer", date: "20/10", profit: "+1,200" },
                        ].map((row, i) => (
                           <div key={i} className="grid grid-cols-3 p-4 text-center items-center hover:bg-brand-700/30 transition-colors group">
                              <div className="font-black text-white text-xs group-hover:text-brand-accent transition-colors">{row.user}</div>
                              <div className="text-slate-500 text-[10px] font-bold uppercase">{row.date}</div>
                              <div className="text-brand-accent font-black font-mono text-xs">{row.profit} F</div>
                           </div>
                        ))}
                    </div>
                </div>
                <button className="w-full py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Voir tout l'historique</button>
            </div>
        )}

        {activeTab === 'tiers' && (
            <div className="animate-fade-in space-y-4">
                {[
                    { name: 'Bronze', comm: '15%', req: '0 - 10 Filleuls', color: 'text-orange-700', bg: 'bg-orange-700/10', active: false },
                    { name: 'Silver', comm: '20%', req: '11 - 50 Filleuls', color: 'text-slate-400', bg: 'bg-slate-400/10', active: false },
                    { name: 'Gold', comm: '25%', req: '51 - 200 Filleuls', color: 'text-yellow-500', bg: 'bg-yellow-500/10', active: true },
                    { name: 'Diamond', comm: '35%', req: '200+ Filleuls', color: 'text-blue-400', bg: 'bg-blue-400/10', active: false },
                ].map((tier, i) => (
                    <div key={i} className={`p-5 rounded-2xl border transition-all ${tier.active ? 'bg-brand-800 border-brand-accent shadow-lg shadow-brand-accent/10' : 'bg-brand-800/50 border-brand-700 opacity-60'}`}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${tier.bg} ${tier.color}`}>
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h4 className={`font-black uppercase italic ${tier.color}`}>{tier.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{tier.req}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-white">{tier.comm}</p>
                                <p className="text-[9px] text-slate-500 font-black uppercase">Commission</p>
                            </div>
                        </div>
                        {tier.active && (
                            <div className="mt-4 pt-4 border-t border-brand-700 flex justify-between items-center">
                                <span className="text-[10px] font-black text-brand-accent uppercase">Niveau Actuel</span>
                                <span className="text-[10px] font-bold text-slate-400">Prochain: Diamond (149 restants)</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'payouts' && (
            <div className="animate-fade-in space-y-3">
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-2xl">
                    <div className="flex gap-3">
                        <AlertCircle className="text-blue-500 flex-shrink-0" size={18} />
                        <p className="text-[10px] text-blue-200 font-medium leading-relaxed">Les paiements sont traités automatiquement tous les mardis pour les soldes supérieurs à 10,000 F.</p>
                    </div>
                </div>
                <div className="bg-brand-800 rounded-2xl border border-brand-700 overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-brand-700 flex justify-between items-center bg-brand-900/30">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">15 Oct 2026</span>
                        <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[9px] font-black uppercase">Payé</span>
                    </div>
                    <div className="p-5 flex justify-between items-center">
                        <div>
                            <span className="text-white font-black text-sm block uppercase italic">Mobile Money</span>
                            <span className="text-[10px] text-slate-500 font-bold">ID: #TRX-9382-MM</span>
                        </div>
                        <span className="font-mono text-white font-black text-lg">45,000 F</span>
                    </div>
                </div>
                <div className="bg-brand-800 rounded-2xl border border-brand-700 overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-brand-700 flex justify-between items-center bg-brand-900/30">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">01 Oct 2026</span>
                        <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[9px] font-black uppercase">Payé</span>
                    </div>
                    <div className="p-5 flex justify-between items-center">
                        <div>
                            <span className="text-white font-black text-sm block uppercase italic">Mobile Money</span>
                            <span className="text-[10px] text-slate-500 font-bold">ID: #TRX-8271-MM</span>
                        </div>
                        <span className="font-mono text-white font-black text-lg">22,500 F</span>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* Withdraw Modal Overlay */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-brand-800 w-full max-w-sm rounded-3xl border border-brand-600 shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <div className="bg-brand-accent/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="text-brand-accent" size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase italic">Retrait Commission</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase mt-1">Transférez vos gains vers votre compte</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">Montant Disponible</label>
                        <div className="bg-brand-900 border border-brand-700 rounded-xl p-4 text-white font-mono font-black text-xl flex justify-between items-center">
                            <span>{commissionBalance.toLocaleString()}</span>
                            <span className="text-brand-accent text-xs">XAF</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">Numéro de réception (Mobile Money)</label>
                        <input 
                            type="text" 
                            placeholder="6XXXXXXXX" 
                            className="w-full bg-brand-900 border border-brand-700 rounded-xl p-4 text-white font-mono text-lg focus:border-brand-accent focus:outline-none transition-colors shadow-inner" 
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button onClick={() => setShowWithdrawModal(false)} className="flex-1 bg-brand-700 text-white font-black py-4 rounded-2xl hover:bg-brand-600 uppercase text-xs tracking-widest transition-all">Annuler</button>
                        <button onClick={confirmPayout} className="flex-1 bg-brand-accent text-brand-900 font-black py-4 rounded-2xl hover:bg-emerald-400 uppercase text-xs tracking-widest shadow-lg shadow-brand-accent/20 transition-all">Confirmer</button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Referral;