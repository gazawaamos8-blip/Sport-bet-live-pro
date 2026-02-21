import React, { useEffect, useState } from 'react';
import { BetSlipItem, Match } from '../types';
import { Flame, Lock, Unlock, CreditCard, Smartphone, X, AlertTriangle, Loader, Image as ImageIcon } from 'lucide-react';

interface HotBetsProps {
  matches: Match[]; // Kept for compatibility, though not used for random generation
  onAddTicket: (items: BetSlipItem[]) => void;
}

interface PremiumCode {
    id: string;
    codeName: string;
    odds: number;
    price: number;
    imageUrl: string;
    isLocked: boolean;
    winningChance: number;
    items?: BetSlipItem[]; // Optional items for specific codes
}

// Placeholder for Unsplash Key - In a real app, use process.env.UNSPLASH_API_KEY
const UNSPLASH_KEY = 'YOUR_ACCESS_KEY'; 

const HotBets: React.FC<HotBetsProps> = ({ matches, onAddTicket }) => {
  const [codes, setCodes] = useState<PremiumCode[]>([]);
  const [selectedCode, setSelectedCode] = useState<PremiumCode | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'error'>('method');

  // Generate Random Premium Codes
  useEffect(() => {
      const generateCodes = async () => {
          const newCodes: PremiumCode[] = [];
          
          // --- SPECIAL CODE 65 10 11 (Requested) ---
          newCodes.push({
              id: 'special-65-10-11',
              codeName: 'CODE 65 10 11',
              odds: 600.00,
              price: 5000,
              imageUrl: "https://images.unsplash.com/photo-1508614999368-9260051292e5?auto=format&fit=crop&w=500&q=80", // Dramatic darker image
              isLocked: true,
              winningChance: 80, // As per "80" in the number sequence
              items: [
                  { matchId: 'sp1', selection: 'away', odds: 15.0, matchInfo: 'Man City vs Luton', sport: 'football' },
                  { matchId: 'sp2', selection: 'home', odds: 8.0, matchInfo: 'Almeria vs Real Madrid', sport: 'football' },
                  { matchId: 'sp3', selection: 'draw', odds: 5.0, matchInfo: 'Maroc vs Sénégal', sport: 'football' }
              ]
          });
          // ------------------------------------------

          const count = 4; // Generate 4 more random codes

          for (let i = 0; i < count; i++) {
              let imgUrl = `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=400&q=80`; 
              try {
                  const seeds = [
                      "1579952363873-27f3bde9be2e", // soccer
                      "1518091043069-41d485e8eccf", // crowd
                      "1562077535-071c20b39917", // trophy
                      "1554672408-730436b60dde", // gaming
                      "1614632537202-3eeacedc387c" // money
                  ];
                  imgUrl = `https://images.unsplash.com/photo-${seeds[i % seeds.length]}?auto=format&fit=crop&w=500&q=80`;
              } catch (e) {
                  console.error("Unsplash error", e);
              }

              newCodes.push({
                  id: `premium-${i}`,
                  codeName: `CODE 10-${Math.floor(Math.random() * 899) + 100}`,
                  odds: Math.floor(Math.random() * 150) + 50,
                  price: 1000 + (i * 500),
                  imageUrl: imgUrl,
                  isLocked: true,
                  winningChance: Math.floor(Math.random() * 20) + 80
              });
          }
          setCodes(newCodes);
      };

      generateCodes();
  }, []);

  const handleUnlockClick = (code: PremiumCode) => {
      setSelectedCode(code);
      setPaymentStep('method');
      setShowPayment(true);
  };

  const handlePaymentAttempt = () => {
      setPaymentStep('processing');
      setTimeout(() => {
          // If it's the special code, show success for demo (or error based on requirements)
          // Defaulting to error simulation as per previous logic, but maybe user wants it accessible?
          // Let's keep error simulation for realism, user can use the Manual Code input to bypass.
          setPaymentStep('error');
      }, 2000);
  };

  const handleClosePayment = () => {
      setShowPayment(false);
      setSelectedCode(null);
  };

  const generateFakeItems = (totalOdds: number): BetSlipItem[] => {
      return [
          { matchId: 'mx1', selection: 'home', odds: 10.5, matchInfo: 'Milan vs Inter', sport: 'football' },
          { matchId: 'mx2', selection: 'draw', odds: 4.2, matchInfo: 'PSG vs Marseille', sport: 'football' },
          { matchId: 'mx3', selection: 'away', odds: totalOdds / (10.5 * 4.2), matchInfo: 'Bayern vs Leipzig', sport: 'football' },
      ];
  };

  const handleReveal = () => {
      if (!selectedCode) return;
      const items = selectedCode.items || generateFakeItems(selectedCode.odds);
      onAddTicket(items);
      handleClosePayment();
  };

  if (codes.length === 0) return null;

  return (
    <div className="py-4 space-y-3">
        <div className="px-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-white italic uppercase flex items-center gap-2">
                <Flame className="text-red-500 animate-pulse" /> Codes VIP Générés
            </h2>
            <span className="text-xs text-brand-accent font-bold uppercase animate-pulse">Offre Limitée</span>
        </div>
        
        {/* Horizontal Scroll List */}
        <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-4">
            {codes.map(code => (
                <div key={code.id} className="min-w-[260px] h-[320px] rounded-3xl overflow-hidden relative group shadow-2xl border border-brand-700">
                    {/* Background Image */}
                    <img 
                        src={code.imageUrl} 
                        alt="Cover" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/80 to-transparent"></div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                             <div className={`bg-brand-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-brand-600 ${code.id === 'special-65-10-11' ? 'border-yellow-500 shadow-[0_0_10px_gold]' : ''}`}>
                                 <span className={`text-xs font-bold uppercase tracking-wider ${code.id === 'special-65-10-11' ? 'text-yellow-400' : 'text-white'}`}>{code.codeName}</span>
                             </div>
                             <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg animate-bounce">
                                 -{Math.floor(Math.random() * 30)}%
                             </div>
                        </div>

                        <div className="text-center space-y-1">
                            <p className="text-slate-300 text-xs font-bold uppercase">{code.id === 'special-65-10-11' ? 'Pack Outsiders' : 'Cote Totale'}</p>
                            <p className="text-5xl font-black text-brand-accent drop-shadow-[0_0_10px_rgba(0,208,98,0.5)]">
                                {code.odds}
                            </p>
                            <div className="flex justify-center gap-1">
                                {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-xs">★</span>)}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-xs text-slate-400 font-bold">Fiabilité</span>
                                <span className="text-xl font-bold text-white">{code.winningChance}%</span>
                            </div>
                            
                            <button 
                                onClick={() => handleUnlockClick(code)}
                                className={`w-full py-3 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 transition-colors shadow-xl ${code.id === 'special-65-10-11' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-brand-900 hover:scale-105' : 'bg-white text-brand-900 hover:bg-brand-accent'}`}
                            >
                                <Lock size={16} /> Débloquer {code.price} F
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* PAYMENT MODAL (Simulated) */}
        {showPayment && selectedCode && (
            <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-brand-800 w-full max-w-sm rounded-3xl border border-brand-600 shadow-2xl overflow-hidden animate-fade-in">
                    
                    {/* Modal Header */}
                    <div className="bg-brand-900 p-4 border-b border-brand-700 flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Lock size={18} className="text-brand-accent" /> Paiement Sécurisé
                        </h3>
                        <button onClick={handleClosePayment} className="bg-brand-800 p-2 rounded-full text-slate-400 hover:text-white"><X size={18}/></button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6">
                        {paymentStep === 'method' && (
                            <>
                                <div className="text-center mb-6">
                                    <p className="text-slate-400 text-xs uppercase font-bold mb-2">Vous achetez</p>
                                    <h2 className="text-3xl font-black text-white mb-1">{selectedCode.codeName}</h2>
                                    <p className="text-brand-accent font-mono text-xl font-bold">{selectedCode.price} FCFA</p>
                                    {selectedCode.id === 'special-65-10-11' && (
                                        <p className="text-[10px] text-yellow-500 font-bold mt-1 uppercase">★ Combi Outsiders / Équipes Faibles ★</p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <button onClick={handlePaymentAttempt} className="w-full bg-[#ff6600] hover:bg-[#e55c00] text-white p-4 rounded-xl flex items-center justify-between font-bold shadow-lg transition-transform active:scale-95">
                                        <span className="flex items-center gap-3"><Smartphone /> Orange Money</span>
                                        <span className="text-xs bg-black/20 px-2 py-1 rounded">Cameroun</span>
                                    </button>
                                    <button onClick={handlePaymentAttempt} className="w-full bg-[#ffcc00] hover:bg-[#e6b800] text-black p-4 rounded-xl flex items-center justify-between font-bold shadow-lg transition-transform active:scale-95">
                                        <span className="flex items-center gap-3"><Smartphone /> MTN Mobile Money</span>
                                        <span className="text-xs bg-black/10 px-2 py-1 rounded">Cameroun</span>
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-slate-500 mt-4 flex items-center justify-center gap-1">
                                    <Lock size={10} /> Transaction chiffrée SSL 256-bit
                                </p>
                            </>
                        )}

                        {paymentStep === 'processing' && (
                            <div className="py-10 text-center space-y-4">
                                <Loader size={48} className="animate-spin text-brand-accent mx-auto" />
                                <h4 className="text-white font-bold animate-pulse">Traitement du paiement...</h4>
                                <p className="text-xs text-slate-400">Veuillez valider sur votre téléphone.</p>
                            </div>
                        )}

                        {paymentStep === 'error' && (
                            <div className="py-6 text-center space-y-4">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/50">
                                    <AlertTriangle size={32} className="text-red-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Paiement Échoué</h4>
                                    <p className="text-xs text-slate-400 mt-2 px-4">
                                        Le service de paiement est temporairement restreint pour ce code haute performance.
                                    </p>
                                    <p className="text-[10px] text-brand-accent mt-2">
                                        Astuce : Entrez le code manuellement dans l'onglet "Mes Coupons".
                                    </p>
                                </div>
                                <div className="pt-4 space-y-2">
                                    <button onClick={() => setPaymentStep('method')} className="w-full py-3 bg-brand-700 rounded-xl text-white font-bold text-sm">Réessayer</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default HotBets;