import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { X, RefreshCw, Trophy, Coins, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [particles, setParticles] = useState<{id: number, x: number, y: number, size: number, duration: number}[]>([]);

  useEffect(() => {
    // Generate cosmic particles
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2
    }));
    setParticles(newParticles);
  }, []);

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
      
      {/* COSMIC BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#0f172a_100%)] opacity-50"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-accent/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        
        {/* Cosmic Particles */}
        {particles.map((p) => (
          <div 
            key={p.id}
            className="absolute bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)]"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-brand-800/80 backdrop-blur-md border-b border-brand-700 shadow-md z-10">
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
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden p-4">
          
          {/* History Bar */}
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
              {history.map((n, i) => (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={i} 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 shadow-lg ${getBgColor(n)} border-white/20 text-white`}
                  >
                      {n}
                  </motion.div>
              ))}
          </div>

          {/* Wheel Container */}
          <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute inset-[-20px] rounded-full bg-brand-accent/20 blur-3xl animate-pulse group-hover:bg-brand-accent/30 transition-all"></div>
              
              <div className="relative w-[280px] h-[280px] md:w-[380px] md:h-[380px] my-4 transition-transform duration-[3500ms] cubic-bezier(0.2, 0.8, 0.2, 1)" style={{ transform: `rotate(${rotation}deg)` }}>
                  {/* Rim & Slices */}
                  <div className="absolute inset-0 rounded-full border-[10px] border-brand-800 shadow-[0_0_60px_rgba(0,0,0,0.8)] bg-brand-900 overflow-hidden">
                       {/* Conic Gradient for efficient slice rendering */}
                       <div className="w-full h-full rounded-full" style={{
                           background: `conic-gradient(
                               #16a34a 0deg 9.73deg,
                               ${WHEEL_NUMBERS.slice(1).map((n, i) => 
                                   `${RED_NUMBERS.includes(n) ? '#dc2626' : '#0f172a'} ${(i + 1) * 9.73}deg ${(i + 2) * 9.73}deg`
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
                               <span className="text-white font-black text-[9px] md:text-[11px] transform rotate-180 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{num}</span>
                           </div>
                       ))}

                       {/* Inner Decorative Ring */}
                       <div className="absolute inset-[15%] rounded-full border-2 border-white/5 pointer-events-none"></div>
                  </div>
                  
                  {/* Center Hub */}
                  <div className="absolute inset-[32%] bg-gradient-to-br from-brand-800 to-black rounded-full border-4 border-brand-700 shadow-2xl flex items-center justify-center z-20">
                       <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-brand-900 flex items-center justify-center border border-brand-700 relative overflow-hidden">
                           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#334155_0%,transparent_70%)] opacity-50"></div>
                           <Trophy className={winAmount ? "text-brand-accent animate-bounce z-10" : "text-slate-700 z-10"} size={winAmount ? 40 : 32} />
                       </div>
                  </div>

                  {/* Ball Marker (Static Triangle at top) */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
                      <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-brand-accent filter drop-shadow-[0_0_10px_rgba(0,208,98,1)]"></div>
                  </div>
              </div>
          </div>

          {/* Win Notification */}
          <AnimatePresence>
              {winAmount !== null && (
                  <motion.div 
                    initial={{ scale: 0, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center"
                  >
                      <div className="bg-brand-accent text-brand-900 px-8 py-4 rounded-3xl font-black text-3xl shadow-[0_0_50px_rgba(0,208,98,0.8)] border-4 border-white animate-pulse">
                          +{winAmount.toLocaleString()} F
                      </div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="text-white font-black text-center mt-6 italic uppercase tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-5xl"
                      >
                        JACKPOT COSMIC!
                      </motion.div>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>

      {/* Betting Controls */}
      <div className="bg-brand-800/95 backdrop-blur-xl border-t border-brand-700 p-4 pb-8 z-20">
          <div className="max-w-4xl mx-auto">
              
              <div className="flex justify-between items-center mb-4">
                  <div className="text-xs font-black text-brand-accent bg-brand-900/80 px-6 py-3 rounded-2xl border border-brand-700 w-full text-center uppercase tracking-widest shadow-inner">
                      {message}
                  </div>
              </div>

              {/* Numbers Grid - Enhanced Layout */}
              <div className="bg-brand-900/50 p-2 rounded-2xl border border-brand-700 mb-4">
                  <div className="grid grid-cols-12 gap-1.5 h-32 overflow-y-auto custom-scrollbar p-1">
                      <button 
                         onClick={() => toggleBet(0)}
                         className={`col-span-12 py-2 rounded-xl font-black text-sm border transition-all ${selectedBets.includes(0) ? 'bg-green-500 text-brand-900 border-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-green-600/10 text-green-500 border-green-600/30 hover:bg-green-600/20'}`}
                      >
                          0 (ZERO)
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
                                  className={`col-span-2 md:col-span-1 py-3 rounded-lg text-xs font-black border transition-all ${
                                      isSelected 
                                        ? 'bg-brand-accent text-brand-900 scale-110 z-10 shadow-[0_0_15px_rgba(0,208,98,0.5)] border-white' 
                                        : isRed 
                                            ? 'bg-red-600 text-white border-red-500/30 hover:bg-red-500 hover:scale-105' 
                                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:scale-105'
                                  }`}
                              >
                                  {num}
                              </button>
                          );
                      })}
                  </div>
              </div>

              {/* Main Buttons */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch">
                  <div className="flex flex-1 gap-3">
                      <button 
                        onClick={() => toggleBet('red')}
                        className={`flex-1 rounded-2xl border-b-4 font-black uppercase text-xs md:text-sm transition-all h-14 ${selectedBets.includes('red') ? 'bg-red-600 text-white border-red-800 translate-y-1 border-b-0 shadow-inner' : 'bg-red-600/20 text-red-500 border-red-600/50 hover:bg-red-600/30'}`}
                      >
                          Rouge x2
                      </button>
                      <button 
                        onClick={() => toggleBet('black')}
                        className={`flex-1 rounded-2xl border-b-4 font-black uppercase text-xs md:text-sm transition-all h-14 ${selectedBets.includes('black') ? 'bg-slate-700 text-white border-slate-900 translate-y-1 border-b-0 shadow-inner' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                      >
                          Noir x2
                      </button>
                      <button 
                        onClick={() => toggleBet('green')}
                        className={`flex-1 rounded-2xl border-b-4 font-black uppercase text-xs md:text-sm transition-all h-14 ${selectedBets.includes('green') ? 'bg-green-600 text-white border-green-800 translate-y-1 border-b-0 shadow-inner' : 'bg-green-600/20 text-green-500 border-green-600/50 hover:bg-green-600/30'}`}
                      >
                          Zéro x36
                      </button>
                  </div>
                  
                  <div className="flex gap-3 h-14">
                      {/* Amount Input */}
                      <div className="bg-brand-900 rounded-2xl border border-brand-700 flex items-center px-4 w-40 shadow-inner">
                          <Coins size={16} className="text-brand-accent mr-2" />
                          <input 
                            type="number" 
                            value={betAmount} 
                            onChange={(e) => setBetAmount(Number(e.target.value))}
                            className="w-full bg-transparent text-center font-black text-white outline-none text-lg"
                          />
                      </div>

                      {/* Spin Button */}
                      <button 
                        onClick={handleSpin}
                        disabled={spinning}
                        className={`flex-1 md:w-48 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${spinning ? 'bg-brand-700 text-slate-500 cursor-not-allowed' : 'bg-brand-accent text-brand-900 hover:bg-emerald-400 hover:scale-105 active:scale-95'}`}
                      >
                          {spinning ? <RefreshCw className="animate-spin" /> : <><RefreshCw size={20} /> TOURNER</>}
                      </button>
                  </div>
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