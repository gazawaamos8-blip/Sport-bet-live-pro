import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/database';
import { Trophy, Disc, Smartphone, Lock, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle, Fingerprint, Sparkles, Download } from 'lucide-react';
import { t } from '../services/localization';
import { generateImage } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { ApkDownload } from './ApkDownload';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [error, setError] = useState('');
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [generatedBg, setGeneratedBg] = useState<string | null>(null);
  const [showApkDownload, setShowApkDownload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const fetchBg = async () => {
      const prompts = [
        "A professional cinematic shot of a football stadium at night with vibrant neon lights, high-tech interface overlays, 4k, hyper-realistic",
        "Abstract sports energy with glowing lines and particles, football theme, dark blue and gold aesthetic, cinematic lighting",
        "A futuristic sports betting dashboard visualization with glowing data points and stadium silhouettes"
      ];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      const img = await generateImage(randomPrompt);
      if (img) setGeneratedBg(img);
    };
    fetchBg();

    // Simulate loading based on "internet fluidity"
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        // Random increment to simulate network fluctuations
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const handleBiometricLogin = () => {
    setBiometricStatus('scanning');
    setTimeout(() => {
        const user = db.getUser();
        if (user && user.isBiometricEnabled) {
            setBiometricStatus('success');
            setTimeout(() => onLogin(user), 1000);
        } else {
            setBiometricStatus('failed');
            setError(t('biometricFail'));
            setTimeout(() => setBiometricStatus('idle'), 2000);
        }
    }, 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && !isAgeVerified) {
        setError(t('ageError'));
        return;
    }
    
    if (phone.length < 9) {
        setError("Numéro invalide");
        return;
    }

    if (isSignUp) {
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }
        if (!name) {
            setError("Nom requis");
            return;
        }
        
        const newUser: User = {
            phone,
            name,
            balance: 500,
            isBiometricEnabled: true
        };
        db.saveUser(newUser);
        onLogin(newUser);
    } else {
        const user = db.getUser();
        if (user && user.phone === phone) {
            onLogin(user);
        } else {
            setError("Utilisateur non trouvé ou identifiants incorrects");
        }
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image with Overlay */}
      {generatedBg && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className="absolute inset-0 z-0"
        >
          <img src={generatedBg} className="w-full h-full object-cover" alt="bg" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-900/80 via-brand-900/40 to-brand-900"></div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] bg-brand-900 flex flex-col items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-brand-accent/10 flex items-center justify-center mb-6 border border-brand-accent/20 shadow-[0_0_50px_rgba(0,230,118,0.2)]">
                <img 
                  src="https://raw.githubusercontent.com/gazawaamos8-blip/Mon-icon-/refs/heads/main/sportbot-icon.png" 
                  className="w-16 h-16 object-contain" 
                  alt="logo" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="text-5xl font-black italic text-white tracking-tighter mb-8">
                sport<span className="text-brand-accent">bot</span>
              </h1>
              
              <div className="w-64 h-1.5 bg-brand-800 rounded-full overflow-hidden border border-brand-700">
                <motion.div 
                  className="h-full bg-brand-accent shadow-[0_0_15px_rgba(0,230,118,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">
                Initialisation sécurisée...
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="auth-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm bg-brand-800/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-brand-700 shadow-2xl relative z-10"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4 border border-brand-accent/20">
                <img 
                  src="https://raw.githubusercontent.com/gazawaamos8-blip/Mon-icon-/refs/heads/main/sportbot-icon.png" 
                  className="w-10 h-10 object-contain" 
                  alt="logo" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="text-4xl font-black italic text-white tracking-tighter mb-1 drop-shadow-lg">
                sport<span className="text-brand-accent">bot</span>
              </h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">L'excellence du pari sportif</p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-200 text-xs font-bold animate-pulse">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Numéro de téléphone"
                            className="w-full bg-brand-900 border border-brand-700 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-brand-accent focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {isSignUp && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <div className="relative">
                            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nom d'utilisateur"
                                className="w-full bg-brand-900 border border-brand-700 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-brand-accent focus:outline-none transition-all"
                            />
                        </div>
                    </motion.div>
                )}

                <div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            className="w-full bg-brand-900 border border-brand-700 rounded-2xl py-4 pl-12 pr-12 text-white text-sm focus:border-brand-accent focus:outline-none transition-all"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {isSignUp && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirmer mot de passe"
                                className="w-full bg-brand-900 border border-brand-700 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-brand-accent focus:outline-none transition-all"
                            />
                        </div>
                        
                        <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => setIsAgeVerified(!isAgeVerified)}>
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${isAgeVerified ? 'bg-brand-accent border-brand-accent' : 'border-slate-600'}`}>
                                {isAgeVerified && <CheckCircle size={14} className="text-brand-900" />}
                            </div>
                            <span className="text-[10px] text-slate-400 select-none uppercase font-bold tracking-tight">{t('ageWarning')}</span>
                        </div>
                     </motion.div>
                )}

                <button 
                    type="submit"
                    className="w-full bg-brand-accent text-brand-900 font-black py-5 rounded-2xl text-lg uppercase italic tracking-widest shadow-[0_10px_30px_rgba(0,230,118,0.3)] hover:bg-emerald-400 transform active:scale-95 transition-all mt-4"
                >
                    {isSignUp ? "S'inscrire" : "Se Connecter"}
                </button>
            </form>

            <div className="mt-8 text-center">
                <button 
                    onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                    className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                    {isSignUp ? "Déjà un compte ? " : "Pas encore de compte ? "}
                    <span className="text-brand-accent font-black underline decoration-2 underline-offset-4">
                        {isSignUp ? "Se connecter" : "S'inscrire"}
                    </span>
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-6 text-center flex flex-col items-center gap-4"
        >
           <button 
             onClick={() => setShowApkDownload(true)}
             className="flex items-center gap-2 bg-brand-800/50 hover:bg-brand-800 px-6 py-3 rounded-full border border-brand-700 text-slate-400 hover:text-brand-accent transition-all group"
           >
             <Download size={16} className="group-hover:animate-bounce" />
             <span className="text-[10px] font-black uppercase italic tracking-widest">Télécharger l'APK</span>
           </button>
           <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">Secured by SportBot Corp © 2026</p>
        </motion.div>
      )}

      <AnimatePresence>
        {showApkDownload && (
          <ApkDownload onClose={() => setShowApkDownload(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthScreen;