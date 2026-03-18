
import React, { useState } from 'react';
import { X, Smartphone, ArrowDown, ArrowUp, ShieldCheck, AlertCircle, Ban, CreditCard, Wallet, Bitcoin, Globe, QrCode, Copy, Check, ChevronDown, Lock } from 'lucide-react';
import { initiatePayment } from '../services/flutterwaveService';
import { initiateCinetPayPayment } from '../services/cinetpayService';
import { db } from '../services/database'; // Use centralized DB
import { t } from '../services/localization';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransaction: (amount: number, type: 'deposit' | 'withdraw', provider: string, status?: 'success' | 'failed') => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onTransaction }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'paypal' | 'crypto' | 'cinetpay'>('momo');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'error' | 'success' | 'info', text: string} | null>(null);

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
        const payerEmail = email || `user${payerPhone}@sportbet.pro`; // Fake email if not provided, required by FW
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
        initiateCinetPayPayment({
            amount: Number(amount),
            onSuccess: (data) => {
                finalizeTransaction(Number(amount), 'deposit', 'CinetPay');
            },
            onError: (err) => {
                setLoading(false);
                setStatusMsg({ type: 'error', text: "Erreur CinetPay: " + (typeof err === 'string' ? err : "Échec du paiement") });
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
        });
      }
      setLoading(false);
      setAmount('');
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-brand-800 w-full md:max-w-lg md:rounded-2xl rounded-t-3xl border-t md:border border-brand-600 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-5 flex justify-between items-center bg-brand-900 border-b border-brand-700">
          <div>
            <h3 className="font-black text-xl text-white flex items-center gap-2">
              <ShieldCheck className="text-brand-accent" />
              Caisse Pro
            </h3>
            <p className="text-xs text-slate-400 mt-1">Transactions sécurisées & cryptées SSL</p>
          </div>
          <button onClick={handleCancel} type="button" className="p-2 bg-brand-800 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors">
            <X size={20} className="text-white hover:text-red-500" />
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`p-3 text-center text-xs font-bold flex items-center justify-center gap-2 animate-pulse ${
              statusMsg.type === 'error' ? 'bg-red-500/20 text-red-500' : 
              'bg-green-500/20 text-green-500'
            }`}>
            {statusMsg.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
            {statusMsg.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex p-4 gap-4 bg-brand-800 border-b border-brand-700">
          <button
            onClick={() => { setActiveTab('deposit'); setStatusMsg(null); }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border-2 ${
              activeTab === 'deposit' 
                ? 'bg-brand-accent border-brand-accent text-brand-900' 
                : 'bg-transparent border-brand-700 text-slate-400'
            }`}
          >
            <ArrowDown size={18} /> {t('deposit')}
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setStatusMsg(null); }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border-2 ${
              activeTab === 'withdraw' 
                ? 'bg-white border-white text-brand-900' 
                : 'bg-transparent border-brand-700 text-slate-400'
            }`}
          >
            <ArrowUp size={18} /> {t('withdraw')}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Payment Method Selector */}
          <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('paymentMethod')}</label>
              <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setPaymentMethod('momo')}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'momo' ? 'bg-brand-700 border-brand-accent shadow-lg' : 'bg-brand-900 border-brand-700 hover:border-slate-500'}`}
                  >
                      <div className="bg-orange-500 text-white p-2 rounded-lg"><Smartphone size={20} /></div>
                      <div>
                          <div className="font-bold text-white text-sm">Mobile Money</div>
                          <div className="text-[10px] text-slate-400">Orange / MTN</div>
                      </div>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'card' ? 'bg-brand-700 border-brand-accent shadow-lg' : 'bg-brand-900 border-brand-700 hover:border-slate-500'}`}
                  >
                      <div className="bg-blue-600 text-white p-2 rounded-lg"><CreditCard size={20} /></div>
                      <div>
                          <div className="font-bold text-white text-sm">Carte Bancaire</div>
                          <div className="text-[10px] text-slate-400">Visa / MC</div>
                      </div>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('cinetpay')}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'cinetpay' ? 'bg-brand-700 border-brand-accent shadow-lg' : 'bg-brand-900 border-brand-700 hover:border-slate-500'}`}
                  >
                      <div className="bg-emerald-600 text-white p-2 rounded-lg"><Globe size={20} /></div>
                      <div>
                          <div className="font-bold text-white text-sm">CinetPay</div>
                          <div className="text-[10px] text-slate-400">MoMo / Card</div>
                      </div>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'bg-brand-700 border-brand-accent shadow-lg' : 'bg-brand-900 border-brand-700 hover:border-slate-500'}`}
                  >
                      <div className="bg-[#003087] text-white p-2 rounded-lg"><Wallet size={20} /></div>
                      <div>
                          <div className="font-bold text-white text-sm">PayPal</div>
                          <div className="text-[10px] text-slate-400">Instant</div>
                      </div>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('crypto')}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'crypto' ? 'bg-brand-700 border-brand-accent shadow-lg' : 'bg-brand-900 border-brand-700 hover:border-slate-500'}`}
                  >
                      <div className="bg-yellow-500 text-white p-2 rounded-lg"><Bitcoin size={20} /></div>
                      <div>
                          <div className="font-bold text-white text-sm">Crypto</div>
                          <div className="text-[10px] text-slate-400">BTC / USDT</div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="h-px bg-brand-700/50"></div>

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
                     <div className="bg-white p-4 rounded-xl flex items-center gap-4">
                         <div className="bg-black p-1 rounded">
                             <QrCode size={60} className="text-white"/>
                         </div>
                         <div className="flex-1 overflow-hidden">
                             <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Adresse de dépôt {cryptoNetwork}</p>
                             <p className="text-xs font-mono font-bold text-slate-800 break-all bg-slate-100 p-2 rounded mb-2">
                                 {DEPOSIT_ADDRESSES[cryptoNetwork]}
                             </p>
                             <button type="button" onClick={handleCopy} className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-700">
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
          <div className="space-y-2 pt-2 border-t border-brand-700/50">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {activeTab === 'deposit' ? 'Montant à Déposer' : 'Montant à Retirer'} (XAF)
                </label>
                <div className="relative">
                <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-brand-900 border-2 border-brand-700 rounded-xl py-4 px-4 text-white font-mono text-2xl font-bold text-center focus:border-brand-accent focus:outline-none transition-colors"
                    placeholder="1000"
                    min="100"
                />
                </div>
                <div className="flex justify-between gap-2">
                {[1000, 5000, 10000, 50000].map(val => (
                    <button key={val} type="button" onClick={() => setAmount(val.toString())} className="flex-1 py-2 bg-brand-700 rounded-lg text-[10px] md:text-xs font-bold text-brand-accent hover:bg-brand-600 transition-colors">
                    +{val.toLocaleString()}
                    </button>
                ))}
                </div>
          </div>
          
          <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-xl font-black text-lg uppercase tracking-wide shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-3 ${
                  activeTab === 'deposit' 
                    ? 'bg-brand-accent hover:bg-emerald-400 text-brand-900' 
                    : 'bg-white hover:bg-slate-200 text-brand-900'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                 {loading ? <div className="animate-spin h-6 w-6 border-4 border-current border-t-transparent rounded-full" /> : (activeTab === 'deposit' ? 'VALIDER LE PAIEMENT' : 'CONFIRMER LE RETRAIT')}
              </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default WalletModal;
