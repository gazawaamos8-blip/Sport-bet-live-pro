
import React, { useState, useEffect } from 'react';
import { X, Smartphone, ArrowDown, ArrowUp, ShieldCheck, AlertCircle, Ban, CreditCard, Wallet, Bitcoin, Globe, QrCode, Copy, Check, ChevronDown, Lock, History, ExternalLink, RefreshCw, Info, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initiatePayment } from '../services/flutterwaveService';
import { initiateCinetPayPayment, checkCinetPayStatus } from '../services/cinetpayService';
import { db, Transaction } from '../services/database'; // Use centralized DB
import { t } from '../services/localization';
import { AppSection } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransaction: (amount: number, type: 'deposit' | 'withdraw', provider: string, status?: 'success' | 'failed') => void;
  onNavigate?: (section: AppSection) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onTransaction, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'paypal' | 'crypto' | 'cinetpay'>('momo');
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'error' | 'success' | 'info', text: string} | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRecentTransactions(db.getTransactions().slice(0, 5));
      
      // Auto-fill phone number from user profile
      const user = db.getUser();
      if (user && user.phone) {
        setPhone(user.phone);
      }
    }
  }, [isOpen]);

  // --- Specific Input States ---
  // Mobile Money
  const [phone, setPhone] = useState('');
  
  // Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // PayPal
  const [email, setEmail] = useState('');
  
  // Crypto
  const [cryptoNetwork, setCryptoNetwork] = useState('USDT_TRC20'); // BTC, USDT_TRC20, ETH
  const [walletAddress, setWalletAddress] = useState(''); // For withdrawal
  const [copiedAddress, setCopiedAddress] = useState(false);

  if (!isOpen) return null;

  // Fake Deposit Addresses for UI
  const DEPOSIT_ADDRESSES: Record<string, string> = {
      'BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      'USDT_TRC20': 'T9yD14Nj9j7xAB4dbGeiX9h8bN89acd',
      'ETH': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(DEPOSIT_ADDRESSES[cryptoNetwork]);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCancel = (e?: React.MouseEvent) => {
      if(e) e.preventDefault();
      setAmount('');
      setPhone('');
      setCardNumber('');
      setCardCvv('');
      setCardExpiry('');
      setEmail('');
      setWalletAddress('');
      setStatusMsg(null);
      setLoading(false);
      onClose();
  };

  // Simulation for Deposit
  const handleDepositSimulation = (method: string) => {
      setLoading(true);
      setStatusMsg({ type: 'info', text: `Redirection vers ${method}...` });
      
      setTimeout(() => {
          if (method === 'PayPal') {
              window.open('https://www.paypal.com/checkout', '_blank');
          }
          
          setTimeout(() => {
              finalizeTransaction(Number(amount), 'deposit', method);
              setStatusMsg({ type: 'success', text: `Dépôt via ${method} réussi !` });
          }, 2000);
      }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!amount && activeTab !== 'deposit' && paymentMethod !== 'crypto') {
         setStatusMsg({ type: 'error', text: "Veuillez entrer un montant." });
         return;
    } else if (Number(amount) < 100 && activeTab === 'withdraw') {
         setStatusMsg({ type: 'error', text: t('minWithdraw') + " 100 XAF." });
         return;
    }

    setLoading(true);
    setStatusMsg(null);

    // FLUTTERWAVE INTEGRATION FOR MOBILE MONEY / CARD
    if (activeTab === 'deposit' && (paymentMethod === 'momo' || paymentMethod === 'card')) {
        const user = db.getUser();
        
        // Use provided phone or fallback to user phone
        const payerPhone = phone || user?.phone || '600000000';
        const payerEmail = email || `user${payerPhone}@sportbot.app`; // Fake email if not provided, required by FW
        const payerName = user?.name || "Parieur SportBot";

        initiatePayment({
            amount: Number(amount),
            phone: payerPhone,
            email: payerEmail,
            name: payerName,
            onSuccess: (data) => {
                // Payment Successful
                finalizeTransaction(Number(amount), 'deposit', `Flutterwave (${paymentMethod})`);
            },
            onClose: () => {
                setLoading(false);
                // Optional: setStatusMsg({ type: 'info', text: "Paiement annulé." });
            }
        });
        return; // Stop execution here, let FW handle the rest
    }

    // PayPal Deposit Simulation
    if (activeTab === 'deposit' && paymentMethod === 'paypal') {
        handleDepositSimulation('PayPal');
        return;
    }

    // Crypto Deposit Simulation
    if (activeTab === 'deposit' && paymentMethod === 'crypto') {
        handleDepositSimulation(`Crypto (${cryptoNetwork})`);
        return;
    }

    // CINETPAY INTEGRATION
    if (activeTab === 'deposit' && paymentMethod === 'cinetpay') {
        const depositAmount = Number(amount);
        if (depositAmount < 100) {
            setStatusMsg({ type: 'error', text: "Le montant minimum pour CinetPay est de 100 F." });
            setLoading(false);
            return;
        }

        const user = db.getUser();
        const txId = `SB${Date.now()}${Math.floor(Math.random() * 1000)}`;
        setPendingTransactionId(txId);

        initiateCinetPayPayment({
            transactionId: txId,
            amount: depositAmount,
            customerName: user?.name || "Client",
            customerSurname: "SportBot",
            customerEmail: user?.email || "client@sportbot.app",
            customerPhone: phone || user?.phone || "690000000",
            onSuccess: (data) => {
                finalizeTransaction(depositAmount, 'deposit', 'CinetPay');
            },
            onError: (err) => {
                setLoading(false);
                const errorMsg = typeof err === 'string' ? err : "Échec du paiement";
                const isDomainError = errorMsg.includes('UNKNOWN_ERROR') || errorMsg.includes('domaine');
                
                setStatusMsg({ 
                    type: 'error', 
                    text: `Erreur CinetPay: ${errorMsg}` 
                });
                
                if (isDomainError) {
                    console.warn("CinetPay Domain Error detected. Please whitelist:", window.location.origin);
                }
            },
            onClose: () => {
                setLoading(false);
                setStatusMsg({ type: 'info', text: "Paiement CinetPay annulé. Si vous avez déjà payé, cliquez sur 'Vérifier le statut'." });
            }
        });
        return;
    }

    // SIMULATION FOR WITHDRAWALS
    setTimeout(() => {
        let providerLabel = 'System';
        if (paymentMethod === 'paypal') providerLabel = 'PayPal';
        if (paymentMethod === 'crypto') providerLabel = `Crypto (${cryptoNetwork})`;
        if (paymentMethod === 'momo') providerLabel = 'Mobile Money';
        if (paymentMethod === 'card') providerLabel = 'Carte Bancaire';

        // Withdraw logic
        const currentBalance = db.getBalance();
        if (currentBalance >= Number(amount)) {
            finalizeTransaction(Number(amount), 'withdraw', providerLabel);
            setStatusMsg({ type: 'success', text: `Retrait via ${providerLabel} initié avec succès !` });
        } else {
            setStatusMsg({ type: 'error', text: "Solde insuffisant." });
            setLoading(false);
        }
    }, 2500);
  };

    const handleCheckStatus = async () => {
        if (!pendingTransactionId) return;
        setLoading(true);
        try {
            const data = await checkCinetPayStatus(pendingTransactionId);
            if (data.code === '00' || data.message === 'SUCCES') {
                finalizeTransaction(Number(amount), 'deposit', 'CinetPay');
                setPendingTransactionId(null);
                setStatusMsg({ type: 'success', text: "Paiement confirmé avec succès !" });
            } else {
                setStatusMsg({ type: 'info', text: `Statut: ${data.message || 'En attente'}. Si vous avez payé, réessayez dans un instant.` });
            }
        } catch (error) {
            setStatusMsg({ type: 'error', text: "Erreur lors de la vérification du statut." });
        } finally {
            setLoading(false);
        }
    };

    const finalizeTransaction = (amt: number, type: 'deposit' | 'withdraw', provider: string) => {
      if (amt > 0) {
        // This updates DB and localStorage
        db.addTransaction({
            amount: amt,
            type: type,
            status: 'success',
            provider: provider
        }).then(() => {
            // Callback to update Parent App State
            onTransaction(amt, type, provider, 'success');
            setIsSuccess(true);
            setLoading(false);
            
            // Show success for 3 seconds then close or reset
            setTimeout(() => {
                setIsSuccess(false);
                setAmount('');
                onClose();
            }, 3000);
        });
      } else {
        setLoading(false);
        setAmount('');
        onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-brand-800 w-full md:max-w-lg md:rounded-2xl rounded-t-3xl border-t md:border border-brand-600 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
      >
        
        {/* Header */}
        <div className="p-5 flex justify-between items-center bg-brand-900 border-b border-brand-700">
          <div className="flex items-center gap-3">
            <div className="bg-brand-accent/10 p-2 rounded-xl">
              <ShieldCheck className="text-brand-accent" size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl text-white">
                Caisse Pro
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Transactions Sécurisées</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNavigate && (
              <button 
                onClick={() => { onNavigate(AppSection.PROMOTIONS); onClose(); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-accent/10 text-brand-accent rounded-full border border-brand-accent/20 hover:bg-brand-accent/20 transition-all"
              >
                <ShoppingBag size={14} />
                <span className="text-[10px] font-black uppercase">Voir ma boutique</span>
              </button>
            )}
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-full transition-all ${showHistory ? 'bg-brand-accent text-brand-900' : 'bg-brand-800 text-slate-400 hover:text-white'}`}
              title="Historique"
            >
              <History size={20} />
            </button>
            <button onClick={handleCancel} type="button" className="p-2 bg-brand-800 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors">
              <X size={20} className="text-white hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* Success State Overlay */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-brand-900 flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20"
              >
                <Check size={48} className="text-white" strokeWidth={4} />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-2">Transaction Réussie !</h2>
              <p className="text-slate-400 mb-8 max-w-xs">Votre {activeTab === 'deposit' ? 'dépôt' : 'retrait'} de <span className="text-brand-accent font-bold">{Number(amount).toLocaleString()} XAF</span> a été traité avec succès.</p>
              <div className="w-full h-1 bg-brand-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3 }}
                  className="h-full bg-brand-accent"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History View */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute inset-0 z-40 bg-brand-800 flex flex-col"
            >
              <div className="p-5 flex justify-between items-center bg-brand-900 border-b border-brand-700">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <History size={18} className="text-brand-accent" />
                  Historique Récent
                </h3>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-brand-700 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="bg-brand-900/50 border border-brand-700 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {tx.type === 'deposit' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{tx.provider || 'Système'}</div>
                          <div className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className={`font-mono font-bold ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} F
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                    <History size={48} className="mb-2" />
                    <p className="text-sm font-bold">Aucune transaction récente</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-brand-700">
                <button 
                  onClick={() => setShowHistory(false)}
                  className="w-full py-3 bg-brand-700 text-white rounded-xl font-bold text-sm hover:bg-brand-600 transition-colors"
                >
                  Retour à la caisse
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Message */}
        {statusMsg && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className={`p-3 text-center text-xs font-bold flex flex-col items-center justify-center gap-2 ${
              statusMsg.type === 'error' ? 'bg-red-500/20 text-red-500' : 
              statusMsg.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
              'bg-green-500/20 text-green-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === 'error' ? <AlertCircle size={16} /> : statusMsg.type === 'info' ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
              {statusMsg.text}
              {statusMsg.type === 'error' && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(statusMsg.text);
                    alert("Message d'erreur copié !");
                  }}
                  className="ml-2 p-1 hover:bg-red-500/20 rounded"
                >
                  <Copy size={12} />
                </button>
              )}
            </div>
            
            {statusMsg.type === 'error' && statusMsg.text.includes('CinetPay') && (statusMsg.text.includes('UNKNOWN_ERROR') || statusMsg.text.includes('domaine')) && (
              <div className="mt-2 p-3 bg-brand-900/80 border border-red-500/30 rounded-xl w-full max-w-xs animate-pulse">
                <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-widest">URL à autoriser dans CinetPay :</p>
                <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-white/5 overflow-hidden">
                  <code className="text-[9px] text-brand-accent truncate flex-1">{window.location.origin}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      alert("URL copiée ! Ajoutez-la à votre dashboard CinetPay.");
                    }}
                    className="p-1.5 bg-brand-accent/20 rounded hover:bg-brand-accent/40 transition-colors"
                  >
                    <Copy size={10} className="text-brand-accent" />
                  </button>
                </div>
                <p className="text-[8px] text-slate-500 mt-2 italic">Connectez-vous à votre dashboard CinetPay &gt; Configuration &gt; Domaines autorisés</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex p-4 gap-4 bg-brand-800 border-b border-brand-700">
          <button
            onClick={() => { setActiveTab('deposit'); setStatusMsg(null); }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
              activeTab === 'deposit' 
                ? 'bg-brand-accent text-brand-900 shadow-lg shadow-brand-accent/20' 
                : 'bg-brand-900 text-slate-400 border border-brand-700'
            }`}
          >
            <ArrowDown size={18} /> {t('deposit')}
            {activeTab === 'deposit' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-900/20" />}
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setStatusMsg(null); }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
              activeTab === 'withdraw' 
                ? 'bg-brand-accent text-brand-900 shadow-lg shadow-brand-accent/20' 
                : 'bg-brand-900 text-slate-400 border border-brand-700'
            }`}
          >
            <ArrowUp size={18} /> {t('withdraw')}
            {activeTab === 'withdraw' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-900/20" />}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Pending Transaction Banner */}
          {pendingTransactionId && paymentMethod === 'cinetpay' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-brand-accent/10 border border-brand-accent/30 rounded-2xl flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="bg-brand-accent/20 p-2 rounded-lg animate-pulse">
                  <RefreshCw className="text-brand-accent" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-white uppercase tracking-wider">Transaction en attente</p>
                  <p className="text-[10px] text-slate-400 font-bold">ID: {pendingTransactionId}</p>
                </div>
                <button 
                  onClick={() => setPendingTransactionId(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={loading}
                className="w-full py-2.5 bg-brand-accent text-brand-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                Vérifier le statut maintenant
              </button>
            </motion.div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('paymentMethod')}</label>
                <span className="text-[10px] text-brand-accent font-bold flex items-center gap-1">
                  <Lock size={10} /> 256-bit SSL
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'momo', label: 'Mobile Money', sub: 'Orange / MTN', icon: <Smartphone size={20} />, color: 'bg-orange-500' },
                    { id: 'card', label: 'Carte Bancaire', sub: 'Visa / MC', icon: <CreditCard size={20} />, color: 'bg-blue-600' },
                    { id: 'cinetpay', label: 'CinetPay', sub: 'MoMo / Card', icon: <Globe size={20} />, color: 'bg-emerald-600' },
                    { id: 'paypal', label: 'PayPal', sub: 'Instant', icon: <Wallet size={20} />, color: 'bg-[#003087]' },
                    { id: 'crypto', label: 'Crypto', sub: 'BTC / USDT', icon: <Bitcoin size={20} />, color: 'bg-yellow-500' }
                  ].map((method) => (
                    <motion.div 
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all relative group ${
                        paymentMethod === method.id 
                          ? 'bg-brand-700 border-brand-accent shadow-xl shadow-brand-accent/5' 
                          : 'bg-brand-900 border-brand-700 hover:border-brand-600'
                      }`}
                    >
                        <div className={`${method.color} text-white p-2.5 rounded-xl shadow-lg`}>
                          {method.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-black text-white text-xs truncate">{method.label}</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">{method.sub}</div>
                        </div>
                        {paymentMethod === method.id && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
                          </div>
                        )}
                    </motion.div>
                  ))}
              </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-brand-700 to-transparent"></div>

          {/* DYNAMIC FIELDS based on Method */}
          
          {/* 1. MOBILE MONEY / CINETPAY */}
          {(paymentMethod === 'momo' || paymentMethod === 'cinetpay') && (
              <div className="space-y-2 animate-fade-in">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {activeTab === 'deposit' ? 'Numéro (Mobile Money / USSD)' : 'Numéro de réception'}
                  </label>
                  <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">+237</div>
                      <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-accent opacity-50" size={20} />
                      <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-brand-900 border-2 border-brand-700 rounded-xl py-4 pl-16 pr-12 text-white font-mono text-lg focus:border-brand-accent focus:outline-none transition-colors"
                          placeholder="6..."
                      />
                  </div>
                  {activeTab === 'deposit' && (
                      <p className="text-[10px] text-brand-accent mt-1 flex items-center gap-1">
                          <Check size={10} /> {paymentMethod === 'momo' ? 'Redirection sécurisée Flutterwave' : 'Redirection sécurisée CinetPay'}
                      </p>
                  )}
              </div>
          )}

          {/* 2. CARD */}
          {paymentMethod === 'card' && (
             <div className="space-y-4 animate-fade-in">
                 {activeTab === 'deposit' ? (
                     <div className="bg-brand-700/30 p-4 rounded-xl border border-brand-600 text-center">
                         <CreditCard size={32} className="mx-auto text-brand-accent mb-2" />
                         <p className="text-xs text-white">Vous serez redirigé vers le portail sécurisé pour saisir les informations de votre carte.</p>
                     </div>
                 ) : (
                     <>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Numéro de Carte</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    className="w-full bg-brand-900 border-2 border-brand-700 rounded-xl py-3 pl-12 pr-4 text-white font-mono focus:border-brand-accent focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Exp (MM/YY)</label>
                                <input 
                                    type="text" 
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                    className="w-full bg-brand-900 border-2 border-brand-700 rounded-xl py-3 px-4 text-white font-mono focus:border-brand-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">CVV</label>
                                <input 
                                    type="password" 
                                    placeholder="123"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value)}
                                    className="w-full bg-brand-900 border-2 border-brand-700 rounded-xl py-3 px-4 text-white font-mono focus:border-brand-accent focus:outline-none"
                                />
                            </div>
                        </div>
                     </>
                 )}
             </div>
          )}

          {/* 3. PAYPAL */}
          {paymentMethod === 'paypal' && (
             <div className="space-y-2 animate-fade-in">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email PayPal</label>
                 <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="email" 
                        placeholder="vous@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-brand-900 border-2 border-brand-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-brand-accent focus:outline-none"
                    />
                 </div>
                 <p className="text-[10px] text-blue-400 flex items-center gap-1">
                     <Check size={10} /> Redirection sécurisée vers PayPal.com
                 </p>
             </div>
          )}

          {/* 4. CRYPTO */}
          {paymentMethod === 'crypto' && (
             <div className="space-y-4 animate-fade-in">
                 <div className="grid grid-cols-3 gap-2">
                     {['USDT_TRC20', 'BTC', 'ETH'].map(net => (
                         <button 
                            key={net}
                            type="button"
                            onClick={() => setCryptoNetwork(net)}
                            className={`py-2 text-[10px] font-bold rounded-lg border ${cryptoNetwork === net ? 'bg-brand-accent text-brand-900 border-brand-accent' : 'bg-brand-900 text-slate-400 border-brand-700'}`}
                         >
                             {net}
                         </button>
                     ))}
                 </div>

                 {activeTab === 'deposit' ? (
                     <div className="bg-brand-700 p-4 rounded-xl flex items-center gap-4 border border-brand-600">
                         <div className="bg-white p-1 rounded">
                             <QrCode size={60} className="text-brand-900"/>
                         </div>
                         <div className="flex-1 overflow-hidden">
                             <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Adresse de dépôt {cryptoNetwork}</p>
                             <p className="text-xs font-mono font-bold text-white break-all bg-brand-900 p-2 rounded mb-2 border border-brand-800">
                                 {DEPOSIT_ADDRESSES[cryptoNetwork]}
                             </p>
                             <button type="button" onClick={handleCopy} className="text-[10px] bg-brand-accent text-brand-900 px-2 py-1 rounded flex items-center gap-1 hover:bg-emerald-400 font-bold">
                                 {copiedAddress ? <Check size={10} /> : <Copy size={10} />} {copiedAddress ? 'Copié' : 'Copier'}
                             </button>
                         </div>
                     </div>
                 ) : (
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Votre Adresse {cryptoNetwork}</label>
                        <input 
                            type="text" 
                            placeholder={`Adresse ${cryptoNetwork}`}
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            className="w-full bg-brand-900 border-2 border-brand-700 rounded-xl py-3 px-4 text-white font-mono text-xs focus:border-brand-accent focus:outline-none"
                        />
                     </div>
                 )}
             </div>
          )}

          {/* Amount Field (Common) */}
          <div className="space-y-4 pt-2 border-t border-brand-700/50">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {activeTab === 'deposit' ? 'Montant à Déposer' : 'Montant à Retirer'}
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold">MIN: 100 XAF</span>
                </div>
                <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-accent font-black text-2xl">F</div>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-brand-900 border-2 border-brand-700 rounded-2xl py-6 pl-12 pr-6 text-white font-mono text-4xl font-black text-right focus:border-brand-accent focus:outline-none transition-all shadow-inner group-hover:border-brand-600"
                        placeholder="1000"
                        min="100"
                    />
                </div>
                <div className="grid grid-cols-4 gap-2">
                {[1000, 5000, 10000, 50000].map(val => (
                    <button 
                        key={val} 
                        type="button" 
                        onClick={() => setAmount(val.toString())} 
                        className="py-3 bg-brand-900 border border-brand-700 rounded-xl text-[10px] font-black text-brand-accent hover:bg-brand-accent hover:text-brand-900 transition-all active:scale-95"
                    >
                        +{val >= 1000 ? (val/1000) + 'K' : val}
                    </button>
                ))}
                </div>
          </div>
          
          <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3 p-4 bg-brand-900/50 border border-brand-700 rounded-2xl">
                  <Info className="text-brand-accent flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                      En cliquant sur le bouton ci-dessous, vous acceptez nos <span className="text-white font-bold underline cursor-pointer">Conditions d'Utilisation</span>. Les fonds seront crédités instantanément après confirmation.
                  </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl transform active:scale-95 transition-all flex items-center justify-center gap-3 ${
                  activeTab === 'deposit' 
                    ? 'bg-brand-accent hover:bg-emerald-400 text-brand-900 shadow-brand-accent/20' 
                    : 'bg-brand-accent hover:bg-emerald-400 text-brand-900 shadow-brand-accent/20'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                 {loading ? (
                   <div className="flex items-center gap-3">
                     <div className="animate-spin h-6 w-6 border-4 border-current border-t-transparent rounded-full" />
                     <span>Traitement...</span>
                   </div>
                 ) : (
                   <>
                     {activeTab === 'deposit' ? <ArrowDown size={20} /> : <ArrowUp size={20} />}
                     {activeTab === 'deposit' ? 'Valider le Paiement' : 'Confirmer le Retrait'}
                   </>
                 )}
              </button>
              
              <p className="text-center text-[10px] text-slate-500 font-bold flex items-center justify-center gap-2">
                <Lock size={10} /> Paiement 100% Sécurisé par SportBot Pro
              </p>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default WalletModal;
