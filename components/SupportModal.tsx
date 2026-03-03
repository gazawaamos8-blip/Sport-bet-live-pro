
import React, { useState } from 'react';
import { X, MessageCircle, ShieldCheck, MapPin, Info, ChevronDown, ChevronUp, FileText, PlayCircle, HelpCircle } from 'lucide-react';
import { t } from '../services/localization';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'terms' | 'howto'>('faq');

  if (!isOpen) return null;

  const faqs = [
    { q: "Comment recharger mon compte ?", a: "Cliquez sur l'icône '+' ou allez dans 'Caisse'. Nous acceptons Orange Money, MTN Money et les cartes VISA." },
    { q: "Combien de temps prend un retrait ?", a: "Les retraits Mobile Money sont instantanés. Pour les gros montants (>500.000 F), cela peut prendre jusqu'à 24h." },
    { q: "Mon pari a été annulé, pourquoi ?", a: "Si un match est reporté de plus de 48h, le pari est annulé et la mise remboursée." }
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm overflow-y-auto">
       <div className="min-h-screen flex items-center justify-center p-0 md:p-4">
          <div className="bg-brand-900 w-full max-w-2xl md:rounded-2xl min-h-screen md:min-h-0 md:border border-brand-700 shadow-2xl animate-fade-in flex flex-col">
             
             {/* Header */}
             <div className="p-4 bg-brand-800 border-b border-brand-700 flex justify-between items-center sticky top-0 z-20">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                   <Info className="text-brand-accent" /> {t('support')}
                </h3>
                <button onClick={onClose} className="p-2 bg-brand-900 rounded-full hover:bg-brand-700 text-slate-400 hover:text-white">
                   <X size={20} />
                </button>
             </div>

             {/* Tab Navigation */}
             <div className="flex bg-brand-800 border-b border-brand-700 px-4 gap-4">
                <button 
                    onClick={() => setActiveTab('faq')}
                    className={`py-4 text-sm font-bold uppercase border-b-2 transition-all flex items-center gap-2 ${activeTab === 'faq' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                    <HelpCircle size={16} /> FAQ
                </button>
                <button 
                    onClick={() => setActiveTab('howto')}
                    className={`py-4 text-sm font-bold uppercase border-b-2 transition-all flex items-center gap-2 ${activeTab === 'howto' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                    <PlayCircle size={16} /> {t('howToPlay')}
                </button>
                <button 
                    onClick={() => setActiveTab('terms')}
                    className={`py-4 text-sm font-bold uppercase border-b-2 transition-all flex items-center gap-2 ${activeTab === 'terms' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                    <FileText size={16} /> {t('terms')}
                </button>
             </div>

             <div className="p-6 space-y-8 pb-10 flex-1 overflow-y-auto max-h-[70vh]">
                
                {/* --- FAQ SECTION --- */}
                {activeTab === 'faq' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* WhatsApp Support */}
                        <div className="bg-green-600 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 opacity-20"><MessageCircle size={150} /></div>
                            <div className="relative z-10">
                                <h4 className="text-xl font-black text-white italic">BESOIN D'AIDE URGENTE ?</h4>
                                <p className="text-green-100 text-sm font-medium">Notre équipe est disponible 24/7 sur WhatsApp.</p>
                                <p className="text-white font-mono font-bold mt-1 text-lg">+237 694 84 15 95</p>
                            </div>
                            <a 
                                href="https://wa.me/237694841595" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="relative z-10 bg-white text-green-700 px-6 py-3 rounded-full font-black uppercase shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <MessageCircle size={20} /> Discuter
                            </a>
                        </div>

                        {/* Location */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><MapPin size={16} /> Localisation</h4>
                            <div className="bg-brand-800 rounded-xl border border-brand-700 overflow-hidden">
                                <div className="p-5">
                                    <h5 className="text-white font-bold mb-1">Siège Social</h5>
                                    <p className="text-slate-400 text-sm">Bao-tassai, Soulede-Roua, Cameroun</p>
                                </div>
                            </div>
                        </div>

                        {/* FAQ List */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Info size={16} /> Questions Fréquentes</h4>
                            <div className="space-y-2">
                                {faqs.map((faq, idx) => (
                                    <div key={idx} className="bg-brand-800 rounded-lg border border-brand-700 overflow-hidden">
                                        <button 
                                            onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                            className="w-full flex justify-between items-center p-4 text-left hover:bg-brand-700/50 transition-colors"
                                        >
                                            <span className="text-sm font-bold text-white">{faq.q}</span>
                                            {activeFaq === idx ? <ChevronUp size={16} className="text-brand-accent" /> : <ChevronDown size={16} className="text-slate-500" />}
                                        </button>
                                        {activeFaq === idx && (
                                            <div className="p-4 pt-0 text-sm text-slate-400 bg-brand-900/50 border-t border-brand-700/50">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- HOW TO PLAY SECTION --- */}
                {activeTab === 'howto' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-white">Guide du Parieur Débutant</h3>
                        
                        {[
                            { step: 1, title: "Inscription & Dépôt", text: "Créez votre compte en 1 clic. Cliquez sur le bouton '+' pour déposer via Mobile Money ou PayPal." },
                            { step: 2, title: "Sélectionnez un Match", text: "Naviguez dans 'En Direct' ou 'À Venir'. Choisissez votre sport favori." },
                            { step: 3, title: "Placez votre Pari", text: "Cliquez sur une cote (1, X, 2). Elle s'ajoute à votre coupon. Entrez votre mise et validez." },
                            { step: 4, title: "Encaissement", text: "Si votre pari est gagnant, vos gains sont crédités instantanément. Retirez via Mobile Money." }
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-brand-accent text-brand-900 font-black text-lg flex items-center justify-center flex-shrink-0 border-4 border-brand-900 shadow-lg">
                                    {item.step}
                                </div>
                                <div>
                                    <h5 className="text-white font-bold">{item.title}</h5>
                                    <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- TERMS SECTION --- */}
                {activeTab === 'terms' && (
                    <div className="space-y-4 animate-fade-in text-slate-300 text-sm leading-relaxed">
                        <div className="bg-brand-800 p-4 rounded-xl border border-brand-700">
                            <h4 className="text-white font-bold mb-2">1. Acceptation des Conditions</h4>
                            <p className="mb-2">En utilisant SportBot Pro, vous acceptez d'être lié par ces termes. Vous devez avoir au moins 21 ans pour parier.</p>
                            
                            <h4 className="text-white font-bold mb-2 mt-4">2. Jeu Responsable</h4>
                            <p className="mb-2">Le pari sportif comporte des risques. Ne pariez jamais plus que ce que vous pouvez vous permettre de perdre. Nous proposons des outils d'auto-exclusion.</p>
                            
                            <h4 className="text-white font-bold mb-2 mt-4">3. Dépôts et Retraits</h4>
                            <p className="mb-2">Toutes les transactions sont sécurisées par nos partenaires (Flutterwave, PayPal). Les retraits doivent être effectués vers un compte au même nom que l'utilisateur.</p>
                            
                            <h4 className="text-white font-bold mb-2 mt-4">4. Annulation de Paris</h4>
                            <p>SportBot Pro se réserve le droit d'annuler tout pari en cas d'erreur de cote manifeste ou de suspicion de fraude.</p>
                        </div>
                    </div>
                )}

                {/* --- PARTNERS FOOTER --- */}
                <div className="pt-8 border-t border-brand-700 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{t('partners')}</p>
                    <div className="flex flex-wrap justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                        {/* Logos simulés via texte/icones ou URLs */}
                        <div className="flex items-center gap-2">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg" className="h-6" alt="MongoDB" />
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="font-black text-white italic text-lg"><span className="text-orange-500">Flutter</span>wave</div>
                        </div>
                        <div className="flex items-center gap-2">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-6" alt="PayPal" />
                        </div>
                        <div className="flex items-center gap-2">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-6 bg-white rounded px-1" alt="Visa" />
                        </div>
                    </div>
                </div>

             </div>
          </div>
       </div>
    </div>
  );
};

export default SupportModal;
