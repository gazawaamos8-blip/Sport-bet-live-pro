import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Clock, Wallet, Ban, HeartHandshake, Info } from 'lucide-react';

const ResponsibleGamingView: React.FC = () => {
  const [limits, setLimits] = useState({
    daily: 5000,
    weekly: 25000,
    monthly: 100000
  });

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

      {/* Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex gap-3 items-start">
        <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
        <p className="text-xs text-amber-200 leading-relaxed">
          Le jeu doit rester un plaisir. Si vous sentez que vous perdez le contrôle, n'hésitez pas à utiliser nos outils de limitation ou à contacter notre support.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Deposit Limits */}
        <div className="bg-brand-800 rounded-2xl border border-brand-700 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-brand-700 bg-brand-900/50 flex items-center gap-2">
            <Wallet size={18} className="text-brand-accent" />
            <h3 className="text-sm font-black text-white uppercase">Limites de Dépôt</h3>
          </div>
          <div className="p-4 space-y-4">
            {[
              { label: 'Limite Quotidienne', value: limits.daily, key: 'daily' },
              { label: 'Limite Hebdomadaire', value: limits.weekly, key: 'weekly' },
              { label: 'Limite Mensuelle', value: limits.monthly, key: 'monthly' },
            ].map((limit) => (
              <div key={limit.key} className="flex justify-between items-center bg-brand-900/50 p-3 rounded-xl border border-brand-700/50">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{limit.label}</p>
                  <p className="text-sm font-black text-white">{limit.value.toLocaleString()} F</p>
                </div>
                <button className="text-[10px] font-black text-brand-accent uppercase border border-brand-accent/30 px-3 py-1 rounded-lg hover:bg-brand-accent/10 transition-colors">
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
          <div className="p-4 space-y-3">
            <p className="text-xs text-slate-400">Faites une pause temporaire ou définitive. Une fois activée, cette action est irréversible pendant la période choisie.</p>
            <div className="grid grid-cols-3 gap-2">
              {['24h', '7j', '30j'].map(time => (
                <button key={time} className="bg-brand-900 border border-brand-700 py-2 rounded-xl text-xs font-bold text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all">
                  {time}
                </button>
              ))}
            </div>
            <button className="w-full bg-red-600/20 border border-red-600/50 text-red-500 py-3 rounded-xl text-xs font-black uppercase mt-2">
              Exclusion Définitive
            </button>
          </div>
        </div>

        {/* Time Out */}
        <div className="bg-brand-800 rounded-2xl border border-brand-700 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-brand-700 bg-brand-900/50 flex items-center gap-2">
            <Clock size={18} className="text-blue-400" />
            <h3 className="text-sm font-black text-white uppercase">Rappel de Temps</h3>
          </div>
          <div className="p-4 flex justify-between items-center">
            <p className="text-xs text-slate-400">Recevoir une notification toutes les :</p>
            <select className="bg-brand-900 border border-brand-700 text-white text-xs font-bold rounded-lg p-2 focus:outline-none focus:border-brand-accent">
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
          <div className="bg-brand-800 p-4 rounded-xl border border-brand-700 flex items-center gap-4">
            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><HeartHandshake size={20} /></div>
            <div>
              <p className="text-sm font-bold text-white">Conseils de Jeu</p>
              <p className="text-[10px] text-slate-500">Apprenez à gérer votre budget de jeu.</p>
            </div>
          </div>
          <div className="bg-brand-800 p-4 rounded-xl border border-brand-700 flex items-center gap-4">
            <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><Info size={20} /></div>
            <div>
              <p className="text-sm font-bold text-white">Test d'Auto-Évaluation</p>
              <p className="text-[10px] text-slate-500">Évaluez votre comportement de jeu en 5 min.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsibleGamingView;
