import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Wallet, Lock, CheckCircle2, AlertCircle, ArrowRight, CreditCard, Bitcoin } from 'lucide-react';
import { db } from '../services/database';

interface PaymentVerificationGateProps {
  children: React.ReactNode;
}

const PaymentVerificationGate: React.FC<PaymentVerificationGateProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [method, setMethod] = useState<'crypto' | 'paypal' | null>(null);
  const [account, setAccount] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const user = db.getUser();
    if (user && (user as any).isPaymentVerified) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  }, []);

  const handleVerify = () => {
    if (!account.trim()) return;
    setIsVerifying(true);
    
    // Simulate verification
    setTimeout(() => {
      const user = db.getUser();
      if (user) {
        const updatedUser = { ...user, isPaymentVerified: true, paymentMethod: method, paymentAccount: account };
        db.saveUser(updatedUser as any);
        setIsVerified(true);
      }
      setIsVerifying(false);
    }, 2000);
  };

  if (isVerified === null) return null;

  if (isVerified) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[200] bg-[#0A0A0B] flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        <div className="bg-emerald-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <ShieldCheck size={48} className="text-emerald-500" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Accès Sécurisé</h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Pour garantir la sécurité de vos transactions, vous devez lier un compte <span className="text-white font-bold">Crypto</span> ou <span className="text-white font-bold">PayPal</span> avant d'accéder à la plateforme.
          </p>
        </div>

        {!showVerification ? (
          <div className="grid grid-cols-1 gap-4 pt-4">
            <button 
              onClick={() => { setMethod('crypto'); setShowVerification(true); }}
              className="group bg-brand-800 hover:bg-brand-700 border border-brand-700 p-6 rounded-3xl flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/20 p-3 rounded-2xl text-orange-500 group-hover:scale-110 transition-transform">
                  <Bitcoin size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-black uppercase text-xs tracking-widest">Crypto-monnaie</p>
                  <p className="text-[10px] text-slate-500 font-bold">BTC, ETH, USDT (TRC20)</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
            </button>

            <button 
              onClick={() => { setMethod('paypal'); setShowVerification(true); }}
              className="group bg-brand-800 hover:bg-brand-700 border border-brand-700 p-6 rounded-3xl flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                  <CreditCard size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-black uppercase text-xs tracking-widest">PayPal</p>
                  <p className="text-[10px] text-slate-500 font-bold">Compte vérifié requis</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-brand-800 border border-brand-700 p-8 rounded-3xl space-y-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setShowVerification(false)} className="text-slate-500 hover:text-white transition-colors">
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <h3 className="text-white font-black uppercase text-xs tracking-widest">Vérification {method === 'crypto' ? 'Crypto' : 'PayPal'}</h3>
            </div>

            <div className="space-y-4">
              <div className="text-left">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">
                  {method === 'crypto' ? 'Adresse de Portefeuille (Wallet)' : 'Email PayPal'}
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder={method === 'crypto' ? '0x... ou Adresse USDT' : 'votre@email.com'}
                    className="w-full bg-brand-900 border border-brand-700 rounded-2xl p-4 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none transition-all shadow-inner"
                  />
                  {method === 'crypto' ? <Bitcoin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={18} /> : <Wallet className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={18} />}
                </div>
              </div>

              <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex gap-3 text-left">
                <AlertCircle className="text-emerald-500 flex-shrink-0" size={16} />
                <p className="text-[10px] text-emerald-200/60 font-medium leading-relaxed">
                  Cette information sera utilisée pour vos futurs dépôts et retraits. Assurez-vous qu'elle est correcte.
                </p>
              </div>

              <button 
                onClick={handleVerify}
                disabled={isVerifying || !account.trim()}
                className="w-full bg-emerald-500 text-brand-900 font-black py-4 rounded-2xl uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brand-900/20 border-t-brand-900 rounded-full animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Confirmer & Activer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        <div className="pt-8 flex items-center justify-center gap-6 opacity-30">
          <Bitcoin size={20} className="text-white" />
          <CreditCard size={20} className="text-white" />
          <ShieldCheck size={20} className="text-white" />
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentVerificationGate;
