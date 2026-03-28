import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Clock, Wallet, Ban, HeartHandshake, Info, CheckCircle2, Timer, Award, Target, TrendingUp, ChevronRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResponsibleGamingView: React.FC = () => {
  const [limits, setLimits] = useState({
    daily: 5000,
    weekly: 25000,
    monthly: 100000
  });
  const [showLimitModal, setShowLimitModal] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState<number>(0);
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);
  const [realityCheck, setRealityCheck] = useState('1 heure');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveLimit = () => {
    if (showLimitModal) {
        setLimits(prev => ({ ...prev, [showLimitModal]: tempLimit }));
        setShowLimitModal(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const getDetailsContent = (type: string) => {
    switch(type) {
      case 'limits':
        return {
          title: "Gestion des Limites",
          icon: <Wallet className="text-brand-accent" size={32} />,
          text: "Les limites de dépôt vous permettent de contrôler vos dépenses. Une fois une limite atteinte, vous ne pourrez plus déposer d'argent jusqu'à la fin de la période définie. Notez que toute demande d'augmentation de limite prend 24 heures pour être effective, tandis que les diminutions sont immédiates."
        };
      case 'exclusion':
        return {
          title: "Auto-Exclusion PRO",
          icon: <Ban className="text-red-500" size={32} />,
          text: "L'auto-exclusion est l'outil le plus radical pour protéger votre bankroll. Vous pouvez choisir une pause de 24h à 30 jours, ou une exclusion définitive. Pendant cette période, l'accès à votre compte sera totalement bloqué et aucune promotion ne vous sera envoyée."
        };
      case 'reality':
        return {
          title: "Reality Check",
          icon: <Timer className="text-blue-400" size={32} />,
          text: "Le Reality Check est une notification automatique qui s'affiche pendant vos sessions de jeu pour vous rappeler le temps passé et le montant total misé. C'est un excellent moyen de garder les pieds sur terre lors de sessions intenses."
        };
      default:
        return { title: "", icon: null, text: "" };
    }
  };

  return (
    <div className="p-4 animate-fade-in space-y-6 pb-24">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-emerald-500/20 p-2 rounded-lg">
          <ShieldCheck className="text-emerald-500" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-white italic uppercase">Jeu Responsable <span className="text-brand-accent">PRO</span></h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Protection & Performance</p>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="bg-brand-accent text-brand-900 p-3 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase shadow-lg shadow-brand-accent/20"
            >
                <CheckCircle2 size={16} /> Paramètres mis à jour avec succès
            </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex gap-3 items-start shadow-lg">
        <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
        <p className="text-xs text-amber-200 leading-relaxed font-medium">
          Le jeu doit rester un plaisir. Si vous sentez que vous perdez le contrôle, n'hésitez pas à utiliser nos outils de limitation ou à contacter notre support disponible 24/7.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Deposit Limits */}
        <div className="bg-brand-800 rounded-2xl border border-brand-700 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-brand-700 bg-brand-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Wallet size={18} className="text-brand-accent" />
                <h3 className="text-sm font-black text-white uppercase">Limites de Dépôt</h3>
            </div>
            <button 
                onClick={() => setShowDetailsModal('limits')}
                className="text-[8px] font-black text-brand-accent uppercase border border-brand-accent/30 px-2 py-1 rounded hover:bg-brand-accent hover:text-brand-900 transition-all"
            >
                Voir Détails
            </button>
          </div>
          <div className="p-4 space-y-4">
            {[
              { label: 'Limite Quotidienne', value: limits.daily, key: 'daily' },
              { label: 'Limite Hebdomadaire', value: limits.weekly, key: 'weekly' },
              { label: 'Limite Mensuelle', value: limits.monthly, key: 'monthly' },
            ].map((limit) => (
              <div key={limit.key} className="flex justify-between items-center bg-brand-900/50 p-4 rounded-xl border border-brand-700/50 group hover:border-brand-accent/30 transition-colors">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{limit.label}</p>
                  <p className="text-base font-black text-white">{limit.value.toLocaleString()} F</p>
                </div>
                <button 
                    onClick={() => { setShowLimitModal(limit.key); setTempLimit(limit.value); }}
                    className="text-[10px] font-black text-brand-accent uppercase border border-brand-accent/30 px-4 py-2 rounded-lg hover:bg-brand-accent text-brand-900 transition-all active:scale-95"
                >
                  Modifier
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Self-Exclusion */}
        <div className="bg-brand-800 rounded-2xl border border-brand-700 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-brand-700 bg-brand-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Ban size={18} className="text-red-500" />
                <h3 className="text-sm font-black text-white uppercase">Auto-Exclusion</h3>
            </div>
            <button 
                onClick={() => setShowDetailsModal('exclusion')}
                className="text-[8px] font-black text-red-500 uppercase border border-red-500/30 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-all"
            >
                Voir Détails
            </button>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">Faites une pause temporaire ou définitive. Une fois activée, cette action est <span className="text-red-500 font-bold">irréversible</span> pendant la période choisie.</p>
            <div className="grid grid-cols-3 gap-2">
              {['24h', '7j', '30j'].map(time => (
                <button 
                    key={time} 
                    onClick={() => alert(`Demande d'auto-exclusion de ${time} reçue. Confirmez-vous ?`)}
                    className="bg-brand-900 border border-brand-700 py-3 rounded-xl text-xs font-black text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all active:scale-95"
                >
                  {time}
                </button>
              ))}
            </div>
            <button className="w-full bg-red-600/20 border border-red-600/50 text-red-500 py-4 rounded-xl text-xs font-black uppercase mt-2 hover:bg-red-600 hover:text-white transition-all">
              Exclusion Définitive
            </button>
          </div>
        </div>

        {/* Reality Check */}
        <div className="bg-brand-800 rounded-2xl border border-brand-700 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-brand-700 bg-brand-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Timer size={18} className="text-blue-400" />
                <h3 className="text-sm font-black text-white uppercase">Rappel de Temps</h3>
            </div>
            <button 
                onClick={() => setShowDetailsModal('reality')}
                className="text-[8px] font-black text-blue-400 uppercase border border-blue-400/30 px-2 py-1 rounded hover:bg-blue-400 hover:text-white transition-all"
            >
                Voir Détails
            </button>
          </div>
          <div className="p-4 flex justify-between items-center">
            <p className="text-xs text-slate-400">Recevoir une notification toutes les :</p>
            <select 
                value={realityCheck}
                onChange={(e) => { setRealityCheck(e.target.value); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000); }}
                className="bg-brand-900 border border-brand-700 text-white text-xs font-black rounded-xl p-3 focus:outline-none focus:border-brand-accent shadow-inner"
            >
              <option>30 min</option>
              <option>1 heure</option>
              <option>2 heures</option>
              <option>Désactivé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pro Features Section */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-2xl border border-brand-500/50 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy size={80} className="text-brand-accent" />
        </div>
        <div className="p-5 border-b border-brand-600 bg-brand-900/40 flex items-center gap-2">
          <Award size={20} className="text-brand-accent" />
          <h3 className="text-sm font-black text-white uppercase italic">Outils de Protection Pro</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 bg-brand-900/60 p-4 rounded-xl border border-brand-600/50">
            <div className="bg-brand-accent/20 p-2 rounded-lg text-brand-accent">
              <TrendingUp size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Analyse de Comportement IA</p>
              <p className="text-xs text-white font-bold mt-1">Notre IA surveille vos habitudes pour détecter tout signe de risque en temps réel.</p>
            </div>
            <div className="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded text-[8px] font-black uppercase">Actif</div>
          </div>

          <div className="flex items-center gap-4 bg-brand-900/60 p-4 rounded-xl border border-brand-600/50">
            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
              <Target size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Budget de Session Pro</p>
              <p className="text-xs text-white font-bold mt-1">Définissez un montant maximum par session de jeu. L'app se bloque une fois atteint.</p>
            </div>
            <button className="bg-brand-accent text-brand-900 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg">Configurer</button>
          </div>
        </div>
      </div>

      {/* Detailed Tips & Resources */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Ressources & Accompagnement Pro</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-brand-800 p-5 rounded-2xl border border-brand-700 flex items-center gap-4 hover:border-brand-accent/30 transition-all cursor-pointer group">
            <div className="bg-brand-accent/10 p-3 rounded-xl text-brand-accent group-hover:scale-110 transition-transform"><HeartHandshake size={24} /></div>
            <div className="flex-1">
              <p className="text-sm font-black text-white uppercase italic">Guide du Parieur Pro</p>
              <p className="text-[10px] text-slate-500 font-bold">Maîtrisez la gestion de bankroll et évitez le tilt émotionnel.</p>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </div>

          <div className="bg-brand-800 p-5 rounded-2xl border border-brand-700 flex items-center gap-4 hover:border-blue-500/30 transition-all cursor-pointer group">
            <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400 group-hover:scale-110 transition-transform"><Info size={24} /></div>
            <div className="flex-1">
              <p className="text-sm font-black text-white uppercase italic">Auto-Évaluation Avancée</p>
              <p className="text-[10px] text-slate-500 font-bold">Un test complet validé par des experts en psychologie du jeu.</p>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </div>

          <div className="bg-brand-800 p-5 rounded-2xl border border-brand-700 flex items-center gap-4 hover:border-red-500/30 transition-all cursor-pointer group">
            <div className="bg-red-500/10 p-3 rounded-xl text-red-400 group-hover:scale-110 transition-transform"><AlertTriangle size={24} /></div>
            <div className="flex-1">
              <p className="text-sm font-black text-white uppercase italic">Aide Immédiate</p>
              <p className="text-[10px] text-slate-500 font-bold">Besoin de parler ? Nos conseillers sont là pour vous aider 24/7.</p>
            </div>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase">Appeler</button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-brand-800 w-full max-w-sm rounded-3xl border border-brand-600 p-8 space-y-6 shadow-2xl"
                >
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-brand-900 rounded-2xl border border-brand-700">
                            {getDetailsContent(showDetailsModal).icon}
                        </div>
                        <h3 className="text-xl font-black text-white uppercase italic">{getDetailsContent(showDetailsModal).title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">{getDetailsContent(showDetailsModal).text}</p>
                    </div>
                    
                    <button 
                        onClick={() => setShowDetailsModal(null)} 
                        className="w-full bg-brand-accent text-brand-900 font-black py-4 rounded-2xl uppercase text-xs shadow-lg shadow-brand-accent/20 active:scale-95 transition-all"
                    >
                        Compris
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-brand-800 w-full max-w-sm rounded-3xl border border-brand-600 p-8 space-y-6"
                >
                    <div className="text-center">
                        <h3 className="text-xl font-black text-white uppercase italic">Modifier la Limite</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{showLimitModal === 'daily' ? 'Quotidienne' : showLimitModal === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-brand-900 border border-brand-700 rounded-2xl p-6 text-center">
                            <input 
                                type="number" 
                                value={tempLimit}
                                onChange={(e) => setTempLimit(parseInt(e.target.value))}
                                className="bg-transparent text-3xl font-black text-white text-center w-full outline-none"
                            />
                            <p className="text-brand-accent font-black text-xs mt-2">XAF</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setShowLimitModal(null)} className="flex-1 bg-brand-700 text-white font-black py-4 rounded-2xl uppercase text-xs">Annuler</button>
                            <button onClick={handleSaveLimit} className="flex-1 bg-brand-accent text-brand-900 font-black py-4 rounded-2xl uppercase text-xs shadow-lg shadow-brand-accent/20">Enregistrer</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResponsibleGamingView;
