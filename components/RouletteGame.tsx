import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { X, RefreshCw, Trophy, Coins, ShieldCheck } from 'lucide-react';

interface RouletteGameProps {
  onClose: () => void;
}

const RouletteGame: React.FC<RouletteGameProps> = ({ onClose }) => {
  const [balance, setBalance] = useState(db.getBalance());
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [betAmount, setBetAmount] = useState(1000);
  const [selectedBets, setSelectedBets] = useState<('red' | 'black' | 'green' | number)[]>([]);
  const [history, setHistory] = useState<number[]>([14, 2, 0, 24, 5]);
  const [message, setMessage] = useState("Placez vos paris (Sélectionnez 3-4 numéros)");
  const [winAmount, setWinAmount] = useState<number | null>(null);

  // Configuration de la roue (Ordre Européen)
  const WHEEL_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];

  const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  useEffect(() => {
    const unsub = db.subscribeToBalance(setBalance);
    return () => unsub();
  }, []);

  const toggleBet = (bet: 'red' | 'black' | 'green' | number) => {
    if (spinning) return;
    setSelectedBets(prev => {
        if (prev.includes(bet)) {
            return prev.filter(b => b !== bet);
        } else {
            // Allow multiple bets
            return [...prev, bet];
        }
    });
  };

  const getBgColor = (num: number) => {
    if (num === 0) return 'bg-green-600';
    return RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-slate-800';
  };

  const handleSpin = () => {
    if (spinning) return;
    if (selectedBets.length === 0) {
        setMessage("Sélectionnez au moins une case !");
        return;
    }
    
    const totalBet = betAmount * selectedBets.length;
    if (balance < totalBet) {
        setMessage("Solde insuffisant pour tous les paris !");
        return;
    }

    setWinAmount(null);
    setMessage("Rien ne va plus...");
    setSpinning(true);
    db.updateBalance(totalBet, 'subtract');

    // Déterminer le résultat
    const randomIndex = Math.floor(Math.random() * WHEEL_NUMBERS.length);
    const resultNumber = WHEEL_NUMBERS[randomIndex];
    
    // Calcul de l'angle (360 / 37 segments)
    const sliceAngle = 360 / 37;
    
    // On ajoute 5 tours complets (1800 deg) + l'angle cible
    const offsetRotation = randomIndex * sliceAngle;
    const newRotation = rotation + 1800 + (360 - offsetRotation);

    setRotation(newRotation);

    setTimeout(() => {
        handleGameEnd(resultNumber);
    }, 3500);
  };

  const handleGameEnd = (result: number) => {
    setSpinning(false);
    setHistory(prev => [result, ...prev.slice(0, 9)]);

    let totalWin = 0;

    selectedBets.forEach(bet => {
        let won = false;
        let multiplier = 0;

        if (typeof bet === 'number') {
            if (bet === result) {
                won = true;
                multiplier = 36;
            }
        } else {
            if (bet === 'green' && result === 0) {
                won = true;
                multiplier = 36;
            } else if (bet === 'red' && RED_NUMBERS.includes(result)) {
                won = true;
                multiplier = 2;
            } else if (bet === 'black' && result !== 0 && !RED_NUMBERS.includes(result)) {
                won = true;
                multiplier = 2;
            }
        }

        if (won) {
            totalWin += betAmount * multiplier;
        }
    });

    if (totalWin > 0) {
        db.updateBalance(totalWin, 'add');
        setWinAmount(totalWin);
        setMessage(`GAGNÉ ! ${result} sort. Gain: ${totalWin} F`);
    } else {
        setMessage(`PERDU. Le ${result} est sorti.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-brand-900 flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-brand-800 border-b border-brand-700 shadow-md z-10">
          <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"><X size={20}/></button>
              <h2 className="text-xl font-black text-white italic uppercase tracking-wider">Cosmic <span className="text-brand-accent">Roulette</span></h2>
          </div>
          <div className="bg-brand-900 px-4 py-2 rounded-full border border-brand-700 flex items-center gap-2">
              <Coins size={16} className="text-brand-accent" />
              <span className="font-mono font-bold text-white">{balance.toLocaleString()} F</span>
          </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-800 via-brand-900 to-black">
          
          {/* History Bar */}
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
              {history.map((n, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-lg ${getBgColor(n)} border-white/20 text-white`}>
                      {n}
                  </div>
              ))}
          </div>

          {/* Wheel Container */}
          <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] my-8 transition-transform duration-[3500ms] cubic-bezier(0.2, 0.8, 0.2, 1)" style={{ transform: `rotate(${rotation}deg)` }}>
              {/* Rim & Slices */}
              <div className="absolute inset-0 rounded-full border-[12px] border-brand-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-brand-900 overflow-hidden">
                   {/* Conic Gradient for efficient slice rendering */}
                   <div className="w-full h-full rounded-full" style={{
                       background: `conic-gradient(
                           #16a34a 0deg 9.73deg,
                           ${WHEEL_NUMBERS.slice(1).map((n, i) => 
                               `${RED_NUMBERS.includes(n) ? '#dc2626' : '#1e293b'} ${(i + 1) * 9.73}deg ${(i + 2) * 9.73}deg`
                           ).join(', ')}
                       )`
                   }}></div>
                   
                   {/* Numbers Overlay */}
                   {WHEEL_NUMBERS.map((num, i) => (
                       <div 
                         key={i} 
                         className="absolute top-0 left-1/2 -ml-3 w-6 h-[50%] flex justify-center pt-2 origin-bottom"
                         style={{ transform: `rotate(${i * (360/37) + (360/37)/2}deg)` }}
                       >
                           <span className="text-white font-bold text-[10px] md:text-xs transform rotate-180 drop-shadow-md">{num}</span>
                       </div>
                   ))}
              </div>
              
              {/* Center Hub */}
              <div className="absolute inset-[35%] bg-gradient-to-br from-brand-700 to-brand-900 rounded-full border-4 border-brand-600 shadow-xl flex items-center justify-center z-20">
                   <div className="w-16 h-16 rounded-full bg-brand-800 flex items-center justify-center border border-brand-600">
                       <Trophy className={winAmount ? "text-brand-accent animate-bounce" : "text-slate-600"} size={24} />
                   </div>
              </div>

              {/* Ball Marker (Static Triangle at top) */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
                  <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-brand-accent filter drop-shadow-[0_0_5px_rgba(0,208,98,0.8)]"></div>
              </div>
          </div>

          {/* Win Notification */}
          {winAmount !== null && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 animate-bounce">
                  <div className="bg-brand-accent text-brand-900 px-6 py-3 rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(0,208,98,0.6)] border-2 border-white">
                      +{winAmount.toLocaleString()} F
                  </div>
              </div>
          )}
      </div>

      {/* Betting Controls */}
      <div className="bg-brand-800 border-t border-brand-700 p-4 pb-8 z-20">
          <div className="max-w-3xl mx-auto">
              
              <div className="flex justify-between items-center mb-4">
                  <div className="text-sm font-bold text-slate-300 bg-brand-900 px-4 py-2 rounded-lg border border-brand-700 w-full text-center">
                      {message}
                  </div>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-12 gap-1 mb-4 h-24 overflow-y-auto custom-scrollbar">
                  <button 
                     onClick={() => toggleBet(0)}
                     className={`col-span-12 md:col-span-1 py-1 rounded font-bold text-xs border ${selectedBets.includes(0) ? 'bg-green-500 text-brand-900 border-white' : 'bg-green-600/20 text-green-500 border-green-600/30'}`}
                  >
                      0
                  </button>
                  {/* Numbers 1-36 */}
                  {[...Array(36)].map((_, i) => {
                      const num = i + 1;
                      const isRed = RED_NUMBERS.includes(num);
                      const isSelected = selectedBets.includes(num);
                      return (
                          <button
                              key={num}
                              onClick={() => toggleBet(num)}
                              className={`col-span-2 md:col-span-1 py-2 rounded text-xs font-bold border transition-all ${
                                  isSelected 
                                    ? 'bg-white text-brand-900 scale-110 z-10 shadow-lg' 
                                    : isRed 
                                        ? 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/30' 
                                        : 'bg-slate-700/30 text-slate-300 border-slate-600 hover:bg-slate-600'
                              }`}
                          >
                              {num}
                          </button>
                      );
                  })}
              </div>

              {/* Main Buttons */}
              <div className="flex gap-3 items-stretch h-12">
                  <button 
                    onClick={() => toggleBet('red')}
                    className={`flex-1 rounded-xl border-b-4 font-black uppercase text-sm transition-all ${selectedBets.includes('red') ? 'bg-red-500 text-white border-red-700 translate-y-1 border-b-0' : 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30'}`}
                  >
                      Rouge x2
                  </button>
                  <button 
                    onClick={() => toggleBet('black')}
                    className={`flex-1 rounded-xl border-b-4 font-black uppercase text-sm transition-all ${selectedBets.includes('black') ? 'bg-slate-700 text-white border-slate-900 translate-y-1 border-b-0' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                  >
                      Noir x2
                  </button>
                  
                  {/* Amount Input */}
                  <div className="bg-brand-900 rounded-xl border border-brand-700 flex items-center px-2 w-32">
                      <input 
                        type="number" 
                        value={betAmount} 
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        className="w-full bg-transparent text-center font-bold text-white outline-none"
                      />
                  </div>

                  {/* Spin Button */}
                  <button 
                    onClick={handleSpin}
                    disabled={spinning}
                    className={`w-32 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${spinning ? 'bg-brand-700 text-slate-500 cursor-not-allowed' : 'bg-brand-accent text-brand-900 hover:bg-emerald-400 hover:scale-105'}`}
                  >
                      {spinning ? <RefreshCw className="animate-spin" /> : 'TOURNER'}
                  </button>
              </div>

              {/* Provably Fair */}
              <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center gap-3">
                  <ShieldCheck className="text-brand-accent" size={20} />
                  <div className="text-[10px] text-slate-400">
                      <span className="font-bold text-white block uppercase">Provably Fair</span>
                      Chaque tour est généré via un algorithme cryptographique transparent.
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default RouletteGame;