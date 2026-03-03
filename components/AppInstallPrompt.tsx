import React, { useState, useEffect } from 'react';
import { Download, X, Star, ShieldCheck, Smartphone } from 'lucide-react';
import { db } from '../services/database';

const AppInstallPrompt: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show after 1.5 seconds if not already dismissed
        const dismissed = localStorage.getItem('app_install_dismissed');
        if (!dismissed) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('app_install_dismissed', 'true');
    };

    const handleDownload = () => {
        const user = db.getUser();
        if (user && !user.hasDownloadedApp) {
            const bonusAmount = 100;
            db.updateBalance(bonusAmount, 'add');
            user.hasDownloadedApp = true;
            db.saveUser(user);
            alert(`Félicitations ! Vous avez reçu ${bonusAmount} CFA pour le téléchargement de l'application SportBot !`);
        }
        window.open('https://ais-dev-fuuqsfldi6ecrfv657ceum-48676101579.europe-west2.run.app/sportbet.apk', '_blank');
        handleDismiss();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-brand-900 border border-brand-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
                <button 
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-black/40 rounded-full text-slate-400 hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="h-32 bg-gradient-to-br from-brand-800 to-brand-900 relative">
                    <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/sportbet/400/200')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 bg-brand-800 rounded-2xl border-4 border-brand-900 shadow-xl flex items-center justify-center p-2 overflow-hidden">
                            <img src="https://raw.githubusercontent.com/gazawaamos8-blip/Icon-sport-bet-pro/refs/heads/main/sportbet-icon%20(1).png" alt="SportBot Pro" className="w-full h-full object-contain" />
                        </div>
                    </div>
                </div>

                <div className="pt-14 pb-6 px-6 text-center">
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-1">SportBot Pro Live</h2>
                    <p className="text-brand-accent font-bold text-sm mb-4">L'application officielle</p>

                    <div className="flex justify-center gap-6 mb-6">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm mb-0.5">
                                4.8 <Star size={12} fill="currentColor" />
                            </div>
                            <span className="text-[10px] text-slate-500 uppercase">24K Avis</span>
                        </div>
                        <div className="w-px bg-brand-700"></div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-white font-bold text-sm mb-0.5">
                                24.5 <span className="text-[10px]">MB</span>
                            </div>
                            <span className="text-[10px] text-slate-500 uppercase">Taille</span>
                        </div>
                        <div className="w-px bg-brand-700"></div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm mb-0.5">
                                <ShieldCheck size={14} /> Sûr
                            </div>
                            <span className="text-[10px] text-slate-500 uppercase">Vérifié</span>
                        </div>
                    </div>

                    <div className="bg-brand-800/50 rounded-xl p-3 mb-6 border border-brand-700">
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            Téléchargez l'application Android officielle pour une expérience plus rapide et recevez <span className="text-brand-accent font-bold">+100 CFA</span> de bonus immédiat !
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={handleDownload}
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-brand-900 font-black uppercase py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            Télécharger l'APK
                        </button>
                        <button 
                            onClick={handleDismiss}
                            className="w-full bg-brand-800 hover:bg-brand-700 text-white font-bold uppercase py-3.5 rounded-xl border border-brand-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Smartphone size={18} className="text-slate-400" />
                            Continuer sur le Web
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppInstallPrompt;
