import React from 'react';
import { HelpCircle, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { t } from '../services/localization';

const AssistantView: React.FC = () => {
  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
      <div className="bg-brand-800 rounded-2xl p-6 border border-brand-700 shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10">
          <HelpCircle size={120} className="text-pink-500" />
        </div>
        
        <h2 className="text-2xl font-black text-white italic uppercase mb-2 flex items-center gap-2">
          <HelpCircle className="text-pink-500" /> Assistant Cashback
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          Système de Call Back pour récupérer votre argent si vous avez perdu.
        </p>

        <div className="space-y-4">
          <div className="bg-brand-900 p-4 rounded-xl border border-brand-700">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-brand-accent" size={20} />
              <h3 className="font-bold text-white">ID Assistant</h3>
            </div>
            <p className="text-2xl font-mono font-black text-brand-accent tracking-widest">ID-15959</p>
          </div>

          <div className="bg-brand-900 p-4 rounded-xl border border-brand-700">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="text-blue-400" size={20} />
              <h3 className="font-bold text-white">Numéro de Contact</h3>
            </div>
            <p className="text-2xl font-mono font-black text-blue-400 tracking-widest">694841595</p>
          </div>
        </div>

        <div className="mt-6 bg-pink-500/10 border border-pink-500/30 p-4 rounded-xl">
          <p className="text-sm text-pink-200 leading-relaxed">
            <strong>Comment ça marche ?</strong><br/>
            Si vous perdez votre match, l'argent sera envoyé sur ce numéro. Veuillez contacter l'assistant avec votre ID de pari et l'ID-15959 pour réclamer votre remboursement.
          </p>
        </div>

        <button 
          onClick={() => window.location.href = 'tel:694841595'}
          className="mt-6 w-full bg-pink-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors shadow-lg"
        >
          <Phone size={20} /> Appeler l'Assistant <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default AssistantView;
