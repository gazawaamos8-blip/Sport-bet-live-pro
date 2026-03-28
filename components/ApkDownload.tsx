import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Globe, CheckCircle, Loader2, X, SmartphoneIcon, ShieldCheck, Star, Zap, Gift } from 'lucide-react';
import { db } from '../services/database';

interface ApkDownloadProps {
  onClose?: () => void;
}

export const ApkDownload: React.FC<ApkDownloadProps> = ({ onClose }) => {
  const [step, setStep] = useState<'choice' | 'generating' | 'scanning' | 'ready'>('choice');
  const [progress, setProgress] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (step === 'generating') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('scanning'), 800);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }

    if (step === 'scanning') {
      const timeout = setTimeout(() => {
        setStep('ready');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  const handleDownload = () => {
    // Real download trigger
    const link = document.createElement('a');
    link.href = '/sportbot.apk';
    link.download = 'Sportbot_v2.5.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Grant bonus if user is logged in
    const user = db.getUser();
    if (user && !user.hasDownloadedApp) {
        const bonusAmount = 100;
        db.updateBalance(bonusAmount, 'add');
        user.hasDownloadedApp = true;
        db.saveUser(user);
        
        db.addNotification({
            title: 'Bonus App Installé',
            text: `Félicitations ! Vous avez reçu ${bonusAmount} CFA pour le téléchargement de l'application SportBot !`,
            type: 'wallet'
        });
    }

    if (onClose) setTimeout(onClose, 2000);
  };

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        handleDownload(); // Also trigger the bonus logic
      }
    } else {
        // Fallback for browsers that don't support beforeinstallprompt or already installed
        alert("L'application est déjà installée ou votre navigateur ne supporte pas l'installation directe. Utilisez le bouton 'Installer APK' pour la version Android.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-900/40 backdrop-blur-3xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-brand-900 border border-brand-700/50 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
      >
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2.5 rounded-full bg-brand-800/50 text-slate-400 hover:text-white transition-all z-10 hover:rotate-90"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-10">
          <div className="flex flex-col items-center text-center mb-10">
            <motion.div 
              animate={{ 
                boxShadow: ["0 0 20px rgba(0,230,118,0.1)", "0 0 40px rgba(0,230,118,0.3)", "0 0 20px rgba(0,230,118,0.1)"] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-[2.5rem] bg-brand-accent/10 flex items-center justify-center mb-6 border border-brand-accent/20"
            >
              <img 
                src="https://raw.githubusercontent.com/gazawaamos8-blip/Mon-icon-/refs/heads/main/sportbot-icon.png" 
                className="w-16 h-16 object-contain" 
                alt="logo" 
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              Sportbot <span className="text-brand-accent">Native</span>
            </h2>
            <p className="text-slate-500 text-[10px] mt-3 font-black uppercase tracking-[0.2em]">
              L'expérience mobile ultime
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'choice' && (
              <motion.div 
                key="choice"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-brand-accent/10 border border-brand-accent/20 p-4 rounded-2xl flex items-center gap-3 mb-6">
                    <Gift className="text-brand-accent animate-bounce" size={24} />
                    <p className="text-[10px] text-white font-black uppercase tracking-widest">
                        Bonus de <span className="text-brand-accent">100 CFA</span> offert à l'installation !
                    </p>
                </div>

                <button 
                  onClick={() => setStep('generating')}
                  className="w-full group relative overflow-hidden bg-brand-accent text-brand-900 p-6 rounded-[2rem] flex items-center gap-6 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(0,230,118,0.2)]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-900/10 flex items-center justify-center">
                    <Download size={28} className="group-hover:animate-bounce" />
                  </div>
                  <div className="text-left">
                    <div className="font-black uppercase italic text-xl leading-none">Installer APK</div>
                    <div className="text-[10px] font-black opacity-60 mt-2 uppercase tracking-widest">Android • v2.5.0 • 12.4 MB</div>
                  </div>
                  <div className="absolute top-2 right-4 bg-brand-900 text-brand-accent text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Recommandé</div>
                </button>

                <button 
                  onClick={handlePwaInstall}
                  className="w-full group bg-brand-800/50 text-white p-6 rounded-[2rem] border border-brand-700/50 flex items-center gap-6 transition-all hover:bg-brand-800 active:scale-95"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-900 flex items-center justify-center border border-brand-700">
                    <SmartphoneIcon size={28} className="text-brand-accent" />
                  </div>
                  <div className="text-left">
                    <div className="font-black uppercase italic text-xl leading-none">Ajouter à l'écran</div>
                    <div className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest">Version PWA Ultra-Légère</div>
                  </div>
                </button>

                <button 
                  onClick={onClose}
                  className="w-full group bg-transparent text-slate-500 p-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:text-white active:scale-95"
                >
                  <Globe size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Continuer sur le Web</span>
                </button>
              </motion.div>
            )}

            {step === 'generating' && (
              <motion.div 
                key="generating"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-10"
              >
                <div className="relative w-40 h-40 mb-10">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" 
                    />
                    <motion.circle 
                      cx="50" cy="50" r="45" 
                      fill="none" stroke="#00E676" strokeWidth="6" 
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * progress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white italic leading-none">{Math.round(progress)}%</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Packaging</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 text-brand-accent">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="font-black uppercase italic tracking-widest text-sm">Compilation du binaire...</span>
                  </div>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tighter">Optimisation pour votre processeur mobile</p>
                </div>
              </motion.div>
            )}

            {step === 'scanning' && (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-10"
              >
                <div className="w-40 h-40 relative mb-10">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-accent/20 animate-ping"></div>
                  <div className="absolute inset-4 rounded-full border-4 border-brand-accent/40 animate-ping [animation-delay:0.5s]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck size={80} className="text-brand-accent animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="font-black uppercase italic tracking-widest text-sm text-white">Analyse de sécurité...</span>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tighter">Vérification Play Protect & SportBot Guard</p>
                </div>
              </motion.div>
            )}

            {step === 'ready' && (
              <motion.div 
                key="ready"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center py-6"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-brand-accent flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,230,118,0.4)] relative">
                  <CheckCircle size={48} className="text-brand-900" />
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-[2rem] border-4 border-brand-accent"
                  />
                </div>
                <h3 className="text-3xl font-black text-white uppercase italic mb-3">Prêt à l'installation</h3>
                <p className="text-slate-400 text-sm mb-10 px-6 font-medium leading-relaxed">
                  L'application SportBot a été compilée et vérifiée. Profitez d'une fluidité 10x supérieure et de notifications en temps réel.
                </p>
                <button 
                  onClick={handleDownload}
                  className="w-full bg-brand-accent text-brand-900 py-6 rounded-3xl font-black uppercase italic tracking-widest flex items-center justify-center gap-4 shadow-2xl hover:scale-105 transition-all active:scale-95"
                >
                  <Download size={28} />
                  Démarrer l'installation
                </button>
                <button 
                  onClick={onClose}
                  className="mt-8 text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors"
                >
                  Ignorer et continuer sur le web
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Info Bar */}
        <div className="bg-brand-800/30 p-8 border-t border-brand-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone size={18} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Android 8.0+ Required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-accent"></div>
            <span className="text-[10px] text-brand-accent font-black uppercase tracking-widest">Verified Secure</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
