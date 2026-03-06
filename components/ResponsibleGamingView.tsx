import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Clock, Wallet, Ban, HeartHandshake, Info, CheckCircle2, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResponsibleGamingView: React.FC = () => {
  const [limits, setLimits] = useState({
    daily: 5000,
    weekly: 25000,
    monthly: 100000
  });
  const [showLimitModal, setShowLimitModal] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState<number>(0);
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

  return (
    <div className="p-4 animate-fade-in space-y-6 pb-24">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-emerald-500/20 p-2 rounded-lg">
          <ShieldCheck className="text-emerald-500" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-white italic uppercase">Jeu Responsable</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Votre Sécurité Avant Tout</p>
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
            <span className="text-[9px] font-black text-slate-500 uppercase">Délai de 24h pour augmenter</span>
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
          <div className="p-4 border-b border-brand-700 bg-brand-900/50 flex items-center gap-2">
            <Ban size={18} className="text-red-500" />
            <h3 className="text-sm font-black text-white uppercase">Auto-Exclusion</h3>
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
          <div className="p-4 border-b border-brand-700 bg-brand-900/50 flex items-center gap-2">
            <Timer size={18} className="text-blue-400" />
            <h3 className="text-sm font-black text-white uppercase">Rappel de Temps (Reality Check)</h3>
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

      {/* Support Links */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Aide & Conseils</h3>
        <div className="space-y-2">
          <div className="bg-brand-800 p-5 rounded-2xl border border-brand-700 flex items-center gap-4 hover:border-blue-500/30 transition-colors cursor-pointer group">
            <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400 group-hover:scale-110 transition-transform"><HeartHandshake size={24} /></div>
            <div>
              <p className="text-sm font-black text-white uppercase italic">Conseils de Jeu</p>
              <p className="text-[10px] text-slate-500 font-bold">Apprenez à gérer votre budget de jeu efficacement.</p>
            </div>
          </div>
          <div className="bg-brand-800 p-5 rounded-2xl border border-brand-700 flex items-center gap-4 hover:border-purple-500/30 transition-colors cursor-pointer group">
            <div className="bg-purple-500/20 p-3 rounded-xl text-purple-400 group-hover:scale-110 transition-transform"><Info size={24} /></div>
            <div>
              <p className="text-sm font-black text-white uppercase italic">Test d'Auto-Évaluation</p>
              <p className="text-[10px] text-slate-500 font-bold">Évaluez votre comportement de jeu en 5 minutes.</p>
            </div>
          </div>
        </div>
      </div>

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
