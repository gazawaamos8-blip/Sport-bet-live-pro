import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/database';
import { Trophy, Disc, Smartphone, Lock, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle, Fingerprint } from 'lucide-react';
import { t } from '../services/localization';

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
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && !isAgeVerified) {
        setError(t('ageError'));
        return;
    }
    
    // Simple validation
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
            balance: 500, // Welcome bonus
            isBiometricEnabled: true
        };
        db.saveUser(newUser);
        onLogin(newUser);
    } else {
        const user = db.getUser();
        if (user && user.phone === phone) {
            // Password check skipped for demo
            onLogin(user);
        } else {
            setError("Utilisateur non trouvé ou identifiants incorrects");
        }
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-brand-accent/20 rounded-full blur-[80px] animate-pulse-slow"></div>
         <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-purple-600/20 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
         <Trophy size={60} className="absolute top-20 left-10 text-brand-accent/10 animate-bounce" style={{ animationDuration: '4s' }} />
         <Disc size={40} className="absolute bottom-40 right-10 text-white/5 animate-spin" style={{ animationDuration: '10s' }} />
      </div>

      <div className="w-full max-w-sm bg-brand-800/80 backdrop-blur-xl p-8 rounded-3xl border border-brand-700 shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black italic text-white tracking-tighter mb-1 drop-shadow-lg">
            SPORT<span className="text-brand-accent">BET</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            {isSignUp ? "Créer un compte Pro" : "Connexion Sécurisée"}
          </p>
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
                        className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm focus:border-brand-accent focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {isSignUp && (
                <div className="animate-fade-in">
                    <div className="relative">
                        <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nom d'utilisateur"
                            className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm focus:border-brand-accent focus:outline-none transition-colors"
                        />
                    </div>
                </div>
            )}

            <div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3.5 pl-12 pr-12 text-white text-sm focus:border-brand-accent focus:outline-none transition-colors"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            {isSignUp && (
                 <div className="animate-fade-in">
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmer mot de passe"
                            className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm focus:border-brand-accent focus:outline-none transition-colors"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4 px-2 cursor-pointer" onClick={() => setIsAgeVerified(!isAgeVerified)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAgeVerified ? 'bg-brand-accent border-brand-accent' : 'border-slate-600'}`}>
                            {isAgeVerified && <CheckCircle size={14} className="text-brand-900" />}
                        </div>
                        <span className="text-xs text-slate-400 select-none">{t('ageWarning')}</span>
                    </div>
                 </div>
            )}

            <button 
                type="submit"
                className="w-full bg-brand-accent text-brand-900 font-black py-4 rounded-xl text-lg uppercase shadow-lg hover:bg-emerald-400 transform active:scale-95 transition-all mt-2"
            >
                {isSignUp ? "S'inscrire" : "Se Connecter"}
            </button>
        </form>

        {!isSignUp && (
            <div className="mt-6 flex flex-col items-center">
                <div className="flex items-center gap-4 w-full mb-4">
                    <div className="h-px bg-brand-700 flex-1"></div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Ou connexion rapide</span>
                    <div className="h-px bg-brand-700 flex-1"></div>
                </div>
                
                <button 
                    onClick={handleBiometricLogin}
                    className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${
                        biometricStatus === 'scanning' ? 'border-brand-accent bg-brand-accent/10 animate-pulse' :
                        biometricStatus === 'success' ? 'border-green-500 bg-green-500/20' :
                        biometricStatus === 'failed' ? 'border-red-500 bg-red-500/20' :
                        'border-brand-700 bg-brand-900 hover:border-brand-500'
                    }`}
                >
                    <Fingerprint size={32} className={
                        biometricStatus === 'success' ? 'text-green-500' :
                        biometricStatus === 'failed' ? 'text-red-500' :
                        'text-brand-accent'
                    } />
                </button>
                <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase">
                    {biometricStatus === 'scanning' ? 'Scan en cours...' : 'Touch ID / Face ID'}
                </p>
            </div>
        )}

        <div className="mt-8 text-center">
            <button 
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-slate-400 text-sm font-medium hover:text-white transition-colors"
            >
                {isSignUp ? "Déjà un compte ? " : "Pas encore de compte ? "}
                <span className="text-brand-accent font-bold underline decoration-2 underline-offset-4">
                    {isSignUp ? "Se connecter" : "S'inscrire"}
                </span>
            </button>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-center">
         <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Secured by SportBet Corp © 2025</p>
      </div>
    </div>
  );
};

export default AuthScreen;