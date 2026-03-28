import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/database'; // CHANGED: use db instead of storageService
import { X, Rocket, Trophy, History, Users, RefreshCw, AlertTriangle, Coins, Settings, Printer, Share2, Download, PlayCircle, PauseCircle, ShieldCheck } from 'lucide-react';
import { t } from '../services/localization';

interface CrashGameProps {
  onClose: () => void;
}

type GameState = 'LOADING' | 'BETTING' | 'FLYING' | 'CRASHED';
type BetMode = 'manual' | 'auto';

const CrashGame: React.FC<CrashGameProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('LOADING');
  const [multiplier, setMultiplier] = useState(1.00);
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(100);
  const [betAmount2, setBetAmount2] = useState(100);
  const [hasBet, setHasBet] = useState(false);
  const [hasBet2, setHasBet2] = useState(false);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const [cashedOutAt2, setCashedOutAt2] = useState<number | null>(null);
  const [nextRoundCountdown, setNextRoundCountdown] = useState(5);
  const [crashHistory, setCrashHistory] = useState<number[]>([1.45, 2.30, 1.10, 8.50, 1.05]);
  const [fakePlayers, setFakePlayers] = useState<{name: string, bet: number, cashout?: number, win?: number}[]>([]);
  const [chatMessages, setChatMessages] = useState<{user: string, text: string}[]>([
    { user: 'Admin', text: 'Bienvenue sur Aviator !' },
    { user: 'User123', text: 'Gros multiplicateur en vue !' }
  ]);
  
  // Advanced Controls
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);
  const [autoCashoutValue, setAutoCashoutValue] = useState<string>("2.00");
  const [autoCashoutEnabled2, setAutoCashoutEnabled2] = useState(false);
  const [autoCashoutValue2, setAutoCashoutValue2] = useState<string>("2.00");

  const [activeTab, setActiveTab] = useState<'bets' | 'stats'>('bets');
  const [stats, setStats] = useState({ totalBets: 0, totalWins: 0, highestMult: 0 });

  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);

  // Stats update
  useEffect(() => {
    if (gameState === 'CRASHED') {
        setStats(prev => ({
            ...prev,
            totalBets: prev.totalBets + (hasBet ? 1 : 0) + (hasBet2 ? 1 : 0),
            totalWins: prev.totalWins + (cashedOutAt ? 1 : 0) + (cashedOutAt2 ? 1 : 0),
            highestMult: Math.max(prev.highestMult, multiplier)
        }));
    }
  }, [gameState]);

  // CHANGED: Subscribe to balance via DB
  useEffect(() => {
      const unsub = db.subscribeToBalance(setBalance);
      startBettingPhase();
      return () => {
          unsub();
          cancelAnimationFrame(requestRef.current!);
      }
  }, []);

  // Génération des bots joueurs
  useEffect(() => {
    if (gameState === 'BETTING') {
      const bots = Array.from({ length: Math.floor(Math.random() * 5) + 5 }).map(() => ({
        name: `User${Math.floor(Math.random() * 9000) + 1000}`,
        bet: Math.floor(Math.random() * 5000) + 100
      }));
      setFakePlayers(bots);
    }
  }, [gameState]);

  // Logique des bots pendant le vol & AUTO CASHOUT Logic
  useEffect(() => {
    if (gameState === 'FLYING') {
      
      // Bot Logic
      const interval = setInterval(() => {
        setFakePlayers(prev => prev.map(p => {
          if (!p.cashout && Math.random() < 0.1 && multiplier > 1.2) {
            return { ...p, cashout: multiplier, win: Math.floor(p.bet * multiplier) };
          }
          return p;
        }));
      }, 500);

      // AUTO CASHOUT Logic for User
      if (hasBet && !cashedOutAt && autoCashoutEnabled && betMode === 'auto') {
          const target = parseFloat(autoCashoutValue);
          if (!isNaN(target) && multiplier >= target) {
              handleCashOut();
          }
      }
      if (hasBet2 && !cashedOutAt2 && autoCashoutEnabled2 && betMode === 'auto') {
          const target = parseFloat(autoCashoutValue2);
          if (!isNaN(target) && multiplier >= target) {
              handleCashOut2();
          }
      }

      // Chat Simulation
      if (Math.random() < 0.05) {
          const users = ['ProGamer', 'LuckyShot', 'AviatorKing', 'SkyHigh'];
          const msgs = ['Wow !', 'C\'est parti !', 'J\'ai raté le cashout...', 'Gros gain !', 'Encore un tour !'];
          setChatMessages(prev => [...prev.slice(-10), { 
              user: users[Math.floor(Math.random() * users.length)], 
              text: msgs[Math.floor(Math.random() * msgs.length)] 
          }]);
      }

      return () => clearInterval(interval);
    }
  }, [gameState, multiplier, hasBet, cashedOutAt, hasBet2, cashedOutAt2, autoCashoutEnabled, autoCashoutEnabled2, betMode, autoCashoutValue, autoCashoutValue2]);


  const startBettingPhase = () => {
    setGameState('BETTING');
    setMultiplier(1.00);
    setCashedOutAt(null);
    setCashedOutAt2(null);
    setNextRoundCountdown(5);
    
    // Timer 5s
    let count = 5;
    const interval = setInterval(() => {
      count--;
      setNextRoundCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        startFlightPhase();
      }
    }, 1000);
  };

  const startFlightPhase = () => {
    setGameState('FLYING');
    // Crash point determination
    if (Math.random() < 0.01) {
        crashPointRef.current = 1.00;
    } else {
        crashPointRef.current = 100 / (Math.floor(Math.random() * 100) + 1);
        if (crashPointRef.current < 1) crashPointRef.current = 1.1;
        if (crashPointRef.current > 50) crashPointRef.current = 50;
    }
    
    startTimeRef.current = Date.now();
    requestRef.current = requestAnimationFrame(animateFlight);
  };

  const animateFlight = () => {
    const elapsed = Date.now() - startTimeRef.current;
    const growth = Math.exp(elapsed / 3000); 
    const currentMult = parseFloat(growth.toFixed(2));

    if (currentMult >= crashPointRef.current) {
      handleCrash(crashPointRef.current);
    } else {
      setMultiplier(currentMult);
      requestRef.current = requestAnimationFrame(animateFlight);
    }
  };

  const handleCrash = (finalValue: number) => {
    setGameState('CRASHED');
    setMultiplier(finalValue);
    setCrashHistory(prev => [finalValue, ...prev.slice(0, 15)]);
    
    setTimeout(() => {
        setHasBet(false); 
        setHasBet2(false); 
        startBettingPhase();
    }, 3000);
  };

  const handlePlaceBet = () => {
    if (balance >= betAmount && gameState === 'BETTING') {
      db.updateBalance(betAmount, 'subtract');
      setHasBet(true);
      db.addTransaction({
          amount: betAmount,
          type: 'bet_stake',
          status: 'success',
          provider: 'Aviator Crash'
      });
    }
  };

  const handlePlaceBet2 = () => {
    if (balance >= betAmount2 && gameState === 'BETTING') {
      db.updateBalance(betAmount2, 'subtract');
      setHasBet2(true);
      db.addTransaction({
          amount: betAmount2,
          type: 'bet_stake',
          status: 'success',
          provider: 'Aviator Crash'
      });
    }
  };

  const handleCashOut = () => {
    if (gameState === 'FLYING' && hasBet && !cashedOutAt) {
      const winAmount = Math.floor(betAmount * multiplier);
      db.updateBalance(winAmount, 'add');
      setCashedOutAt(multiplier);
      db.addTransaction({
          amount: winAmount,
          type: 'bet_win',
          status: 'success',
          provider: 'Aviator Crash'
      });
    }
  };

  const handleCashOut2 = () => {
    if (gameState === 'FLYING' && hasBet2 && !cashedOutAt2) {
      const winAmount = Math.floor(betAmount2 * multiplier);
      db.updateBalance(winAmount, 'add');
      setCashedOutAt2(multiplier);
      db.addTransaction({
          amount: winAmount,
          type: 'bet_win',
          status: 'success',
          provider: 'Aviator Crash'
      });
    }
  };

  // Tools
  const handlePrint = () => window.print();
  const handleShare = () => {
      if (navigator.share) navigator.share({ title: 'sportbot', text: `J'ai gagné sur Aviator ! Multiplicateur: ${multiplier}x Code Promo: EUROVIC https://ais-dev-fuuqsfldi6ecrfv657ceum-48676101579.europe-west2.run.app/`, url: 'https://sportbot.app/' });
      else alert("Share not supported on this device");
  };
  const handleDownload = () => alert("Downloading round receipt...");

  // SVG Logic
  const svgHeight = 250;
  const getRocketPosition = () => {
      if (gameState === 'BETTING') return { x: '0%', y: svgHeight };
      const x = Math.min(100, (multiplier - 1) * 20); 
      const y = svgHeight - (Math.min(1, Math.log(multiplier) / 3) * svgHeight); 
      return { x: `${x}%`, y: y };
  };
  const rocketPos = getRocketPosition();

  return (
    <div className="fixed inset-0 z-[110] bg-[#0f1923] flex flex-col font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-[#1a242d] p-2 flex justify-between items-center border-b border-white/10 shadow-md z-20 print:hidden">
         <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><X size={20} /></button>
             <div className="flex items-center gap-1">
                 <Rocket className="text-red-500 fill-red-500" size={20} />
                 <span className="font-black text-xl text-white italic tracking-wider">AVIATOR</span>
             </div>
         </div>
         
         <div className="flex items-center gap-2">
             <button onClick={handlePrint} className="p-2 bg-slate-800 rounded text-slate-400 hover:text-white" title={t('print')}><Printer size={16} /></button>
             <button onClick={handleShare} className="p-2 bg-slate-800 rounded text-slate-400 hover:text-white" title={t('share')}><Share2 size={16} /></button>
             <button onClick={handleDownload} className="p-2 bg-slate-800 rounded text-slate-400 hover:text-white" title={t('download')}><Download size={16} /></button>
         </div>

         <div className="bg-[#0f1923] border border-green-500/30 px-4 py-1.5 rounded-full flex items-center gap-2">
            <Coins size={16} className="text-green-500" />
            <span className="text-green-400 font-mono font-bold">{balance.toLocaleString()} F</span>
         </div>
      </div>

      {/* HISTORY BAR */}
      <div className="h-8 bg-[#141b21] border-b border-white/5 flex items-center px-4 relative z-10">
         <div className="flex gap-2 justify-end mask-linear-fade flex-1">
             {crashHistory.map((val, idx) => (
                 <div key={idx} className={`px-2 py-0.5 rounded text-[10px] font-bold text-white min-w-[40px] text-center ${val < 2 ? 'bg-blue-600' : val < 10 ? 'bg-purple-600' : 'bg-pink-500'}`}>
                     {val.toFixed(2)}x
                 </div>
             ))}
         </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex relative">
         
         {/* LEFT: Game & Controls */}
         <div className="flex-1 relative bg-[#0f1923] flex flex-col">
            
            {/* GRAPH */}
            <div className="flex-1 relative overflow-hidden bg-[#0f1923]">
                {/* Moving Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute w-full h-full animate-pulse bg-[radial-gradient(circle_at_50%_50%,#ef444422_0%,transparent_70%)]"></div>
                    <div className="absolute top-10 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <div className="absolute top-40 left-3/4 w-1 h-1 bg-white rounded-full animate-ping delay-700"></div>
                    <div className="absolute top-20 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-ping delay-300"></div>
                </div>

                {/* Provably Fair Info */}
                <div className="absolute top-4 left-4 z-20 opacity-50 hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded px-2 py-1 flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-brand-accent" />
                        <span className="text-[10px] text-white font-bold uppercase tracking-wider">Provably Fair</span>
                    </div>
                </div>

                {/* Grid */}
                <div className="absolute inset-0 opacity-10" style={{ 
                    backgroundImage: 'linear-gradient(#4f5b66 1px, transparent 1px), linear-gradient(90deg, #4f5b66 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}></div>

                {/* Multiplier Big Text */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    {gameState === 'BETTING' ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <div className="text-5xl font-black text-white">{nextRoundCountdown.toFixed(1)}s</div>
                            <div className="w-48 h-1 bg-slate-700 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-red-500" style={{ width: `${(nextRoundCountdown/5)*100}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <div className={`text-7xl font-black tracking-tighter ${gameState === 'CRASHED' ? 'text-red-500' : 'text-white'}`}>
                            {multiplier.toFixed(2)}x
                        </div>
                    )}
                    {gameState === 'CRASHED' && (
                        <div className="absolute mt-24 text-red-500 font-black uppercase text-2xl">FLEW AWAY!</div>
                    )}
                </div>

                {/* SVG Curve */}
                {gameState !== 'BETTING' && (
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                        <path 
                            d={`M 0 ${svgHeight} Q ${parseFloat(rocketPos.x) / 2}% ${svgHeight}, ${rocketPos.x} ${rocketPos.y}`}
                            fill="none" stroke="#ef4444" strokeWidth="4" className="drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                        />
                        <path 
                            d={`M 0 ${svgHeight} Q ${parseFloat(rocketPos.x) / 2}% ${svgHeight}, ${rocketPos.x} ${rocketPos.y} L ${rocketPos.x} ${svgHeight} Z`}
                            fill="url(#gradientRed)" opacity="0.2"
                        />
                        <defs>
                            <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                    </svg>
                )}
                
                {/* Rocket Icon */}
                {gameState !== 'BETTING' && (
                    <div 
                        className="absolute transition-all duration-75 ease-linear z-20"
                        style={{ left: rocketPos.x, top: rocketPos.y, transform: 'translate(-50%, -50%) rotate(-15deg)' }}
                    >
                        <Rocket size={48} className={`text-red-500 fill-red-600 ${gameState === 'CRASHED' ? 'opacity-0 scale-150' : ''}`} />
                    </div>
                )}
            </div>

            {/* CONTROLS AREA */}
            <div className="bg-[#1a242d] border-t border-white/5 p-4 z-30">
                
                {/* TABS (Manual / Auto) */}
                <div className="flex justify-center mb-4">
                    <div className="bg-[#0f1923] p-1 rounded-full flex">
                        <button 
                            onClick={() => setBetMode('manual')}
                            className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${betMode === 'manual' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            {t('manual')}
                        </button>
                        <button 
                            onClick={() => setBetMode('auto')}
                            className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${betMode === 'auto' ? 'bg-brand-accent text-brand-900' : 'text-slate-500 hover:text-white'}`}
                        >
                            {t('auto')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                    {/* Bet Panel 1 */}
                    <div className="flex gap-3 items-stretch bg-[#141b21] p-3 rounded-2xl border border-white/5">
                        <div className="flex-1 bg-[#0f1923] rounded-xl p-3 border border-slate-700 flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{t('stake')}</span>
                                {betMode === 'auto' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400">{t('autoCashout')}</span>
                                        <button 
                                            onClick={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
                                            className={`w-8 h-4 rounded-full p-0.5 transition-colors ${autoCashoutEnabled ? 'bg-brand-accent' : 'bg-slate-700'}`}
                                        >
                                            <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${autoCashoutEnabled ? 'translate-x-4' : ''}`}></div>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mb-2">
                                <button onClick={() => !hasBet && setBetAmount(Math.max(100, betAmount - 100))} disabled={hasBet} className="w-8 h-8 bg-slate-700 rounded text-white font-bold">-</button>
                                <input 
                                    type="number" 
                                    value={betAmount} 
                                    onChange={(e) => !hasBet && setBetAmount(Number(e.target.value))}
                                    disabled={hasBet}
                                    className="flex-1 bg-transparent text-center font-black text-xl text-white outline-none"
                                />
                                <button onClick={() => !hasBet && setBetAmount(betAmount + 100)} disabled={hasBet} className="w-8 h-8 bg-slate-700 rounded text-white font-bold">+</button>
                            </div>
                            
                            {betMode === 'auto' && autoCashoutEnabled && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700">
                                    <span className="text-xs text-brand-accent font-bold">À</span>
                                    <input 
                                        type="text" 
                                        value={autoCashoutValue}
                                        onChange={(e) => setAutoCashoutValue(e.target.value)}
                                        className="w-full bg-[#1a242d] rounded px-2 py-1 text-white font-bold text-center text-sm outline-none border border-slate-600 focus:border-brand-accent"
                                        placeholder="2.00"
                                    />
                                    <span className="text-xs text-brand-accent font-bold">x</span>
                                </div>
                            )}
                        </div>

                        <div className="w-32 md:w-40">
                            {hasBet && !cashedOutAt && gameState !== 'CRASHED' ? (
                                <button 
                                    onClick={handleCashOut}
                                    className={`w-full h-full rounded-xl bg-orange-500 hover:bg-orange-400 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] ${gameState === 'BETTING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={gameState === 'BETTING'}
                                >
                                    <span className="text-xs font-bold text-orange-900 uppercase">{t('cashout')}</span>
                                    <span className="text-xl font-black text-white">
                                        {Math.floor(betAmount * multiplier).toLocaleString()}
                                    </span>
                                </button>
                            ) : (
                                <button 
                                    onClick={handlePlaceBet}
                                    disabled={hasBet || gameState !== 'BETTING'}
                                    className={`w-full h-full rounded-xl flex flex-col items-center justify-center border-b-4 transition-all
                                        ${hasBet 
                                            ? 'bg-[#26a17b] border-[#1e6f56] opacity-50 cursor-default'
                                            : gameState === 'BETTING' 
                                                ? 'bg-green-500 hover:bg-green-400 border-green-700 text-white cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                                : 'bg-red-500/20 border-red-500/50 text-red-500 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {hasBet ? (
                                        <>
                                            <span className="text-xs font-bold uppercase text-white/80">{t('pending')}</span>
                                            <span className="text-xl font-black text-white">...</span>
                                        </>
                                    ) : gameState === 'BETTING' ? (
                                        <>
                                            <span className="text-lg font-black uppercase">{t('placeBet')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm font-black uppercase">{t('pending')}</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bet Panel 2 */}
                    <div className="flex gap-3 items-stretch bg-[#141b21] p-3 rounded-2xl border border-white/5">
                        <div className="flex-1 bg-[#0f1923] rounded-xl p-3 border border-slate-700 flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{t('stake')}</span>
                                {betMode === 'auto' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400">{t('autoCashout')}</span>
                                        <button 
                                            onClick={() => setAutoCashoutEnabled2(!autoCashoutEnabled2)}
                                            className={`w-8 h-4 rounded-full p-0.5 transition-colors ${autoCashoutEnabled2 ? 'bg-brand-accent' : 'bg-slate-700'}`}
                                        >
                                            <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${autoCashoutEnabled2 ? 'translate-x-4' : ''}`}></div>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mb-2">
                                <button onClick={() => !hasBet2 && setBetAmount2(Math.max(100, betAmount2 - 100))} disabled={hasBet2} className="w-8 h-8 bg-slate-700 rounded text-white font-bold">-</button>
                                <input 
                                    type="number" 
                                    value={betAmount2} 
                                    onChange={(e) => !hasBet2 && setBetAmount2(Number(e.target.value))}
                                    disabled={hasBet2}
                                    className="flex-1 bg-transparent text-center font-black text-xl text-white outline-none"
                                />
                                <button onClick={() => !hasBet2 && setBetAmount2(betAmount2 + 100)} disabled={hasBet2} className="w-8 h-8 bg-slate-700 rounded text-white font-bold">+</button>
                            </div>
                            
                            {betMode === 'auto' && autoCashoutEnabled2 && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700">
                                    <span className="text-xs text-brand-accent font-bold">À</span>
                                    <input 
                                        type="text" 
                                        value={autoCashoutValue2}
                                        onChange={(e) => setAutoCashoutValue2(e.target.value)}
                                        className="w-full bg-[#1a242d] rounded px-2 py-1 text-white font-bold text-center text-sm outline-none border border-slate-600 focus:border-brand-accent"
                                        placeholder="2.00"
                                    />
                                    <span className="text-xs text-brand-accent font-bold">x</span>
                                </div>
                            )}
                        </div>

                        <div className="w-32 md:w-40">
                            {hasBet2 && !cashedOutAt2 && gameState !== 'CRASHED' ? (
                                <button 
                                    onClick={handleCashOut2}
                                    className={`w-full h-full rounded-xl bg-orange-500 hover:bg-orange-400 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] ${gameState === 'BETTING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={gameState === 'BETTING'}
                                >
                                    <span className="text-xs font-bold text-orange-900 uppercase">{t('cashout')}</span>
                                    <span className="text-xl font-black text-white">
                                        {Math.floor(betAmount2 * multiplier).toLocaleString()}
                                    </span>
                                </button>
                            ) : (
                                <button 
                                    onClick={handlePlaceBet2}
                                    disabled={hasBet2 || gameState !== 'BETTING'}
                                    className={`w-full h-full rounded-xl flex flex-col items-center justify-center border-b-4 transition-all
                                        ${hasBet2 
                                            ? 'bg-[#26a17b] border-[#1e6f56] opacity-50 cursor-default'
                                            : gameState === 'BETTING' 
                                                ? 'bg-green-500 hover:bg-green-400 border-green-700 text-white cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                                : 'bg-red-500/20 border-red-500/50 text-red-500 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {hasBet2 ? (
                                        <>
                                            <span className="text-xs font-bold uppercase text-white/80">{t('pending')}</span>
                                            <span className="text-xl font-black text-white">...</span>
                                        </>
                                    ) : gameState === 'BETTING' ? (
                                        <>
                                            <span className="text-lg font-black uppercase">{t('placeBet')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm font-black uppercase">{t('pending')}</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
         </div>

          {/* RIGHT: Live Bets & Chat Sidebar (Hidden on mobile) */}
          <div className="w-80 bg-[#1a242d] border-l border-white/5 flex flex-col hidden lg:flex">
              <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex bg-[#242f38] border-b border-white/5">
                      <button 
                        onClick={() => setActiveTab('bets')}
                        className={`flex-1 p-3 font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'bets' ? 'text-brand-highlight border-b-2 border-brand-highlight bg-brand-highlight/5' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Paris du tour
                      </button>
                      <button 
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 p-3 font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'text-brand-highlight border-b-2 border-brand-highlight bg-brand-highlight/5' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Mes Stats
                      </button>
                  </div>

                  {activeTab === 'bets' ? (
                      <>
                        <div className="p-3 bg-[#242f38]/50 font-bold text-[10px] text-slate-500 uppercase flex justify-between items-center">
                            <span>Liste des joueurs</span>
                            <div className="flex items-center gap-1 text-green-500"><Users size={12} /> {fakePlayers.length + (hasBet ? 1 : 0) + (hasBet2 ? 1 : 0)}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {hasBet && (
                                <div className={`flex justify-between items-center p-2 rounded border ${cashedOutAt ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-[#2c3842] border-transparent'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-orange-500 text-white flex items-center justify-center font-black text-[10px]">1</div>
                                        <span className="text-xs font-black text-white uppercase italic">Moi (Bet 1)</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-300">{betAmount} F</div>
                                        {cashedOutAt && <div className="text-[10px] font-black text-green-500">x{cashedOutAt.toFixed(2)}</div>}
                                    </div>
                                </div>
                            )}
                            {hasBet2 && (
                                <div className={`flex justify-between items-center p-2 rounded border ${cashedOutAt2 ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-[#2c3842] border-transparent'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-orange-500 text-white flex items-center justify-center font-black text-[10px]">2</div>
                                        <span className="text-xs font-black text-white uppercase italic">Moi (Bet 2)</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-300">{betAmount2} F</div>
                                        {cashedOutAt2 && <div className="text-[10px] font-black text-green-500">x{cashedOutAt2.toFixed(2)}</div>}
                                    </div>
                                </div>
                            )}
                            {fakePlayers.map((player, i) => (
                                <div key={i} className={`flex justify-between items-center p-2 rounded transition-colors ${player.cashout ? 'bg-green-500/5 border border-green-500/10' : 'hover:bg-white/5'}`}>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{player.name}</div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-[10px] font-bold text-slate-400">{player.bet}</div>
                                        {player.cashout ? (
                                            <div className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px] font-black min-w-[45px] text-right">
                                                {player.cashout.toFixed(2)}x
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-slate-700 italic font-black">...</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                      </>
                  ) : (
                      <div className="flex-1 p-4 space-y-4">
                          <div className="bg-[#0f1923] p-4 rounded-2xl border border-white/5">
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Total Paris</p>
                              <p className="text-2xl font-black text-white italic">{stats.totalBets}</p>
                          </div>
                          <div className="bg-[#0f1923] p-4 rounded-2xl border border-white/5">
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Victoires</p>
                              <p className="text-2xl font-black text-green-500 italic">{stats.totalWins}</p>
                          </div>
                          <div className="bg-[#0f1923] p-4 rounded-2xl border border-white/5">
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Meilleur Multiplicateur</p>
                              <p className="text-2xl font-black text-brand-highlight italic">{stats.highestMult.toFixed(2)}x</p>
                          </div>
                          <div className="bg-brand-highlight/10 p-4 rounded-2xl border border-brand-highlight/20">
                              <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                      <Trophy size={16} className="text-brand-highlight" />
                                      <span className="text-[10px] font-black text-brand-highlight uppercase">Niveau Aviator Pro</span>
                                  </div>
                                  <button 
                                    onClick={() => alert("Détails du niveau: Vous êtes à 45% du niveau 'Pilote d'Élite'. Continuez à parier pour débloquer des bonus exclusifs !")}
                                    className="text-[8px] font-black text-brand-highlight uppercase border border-brand-highlight/30 px-2 py-1 rounded hover:bg-brand-highlight hover:text-brand-900 transition-all"
                                  >
                                    Voir Détails
                                  </button>
                              </div>
                              <div className="w-full h-2 bg-brand-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-brand-highlight" style={{ width: '45%' }}></div>
                              </div>
                              <p className="text-[9px] text-slate-500 mt-2 font-bold">Gagnez encore 1500 F pour passer au niveau suivant.</p>
                          </div>
                      </div>
                  )}
              </div>

             <div className="h-64 border-t border-white/5 flex flex-col min-h-0">
                 <div className="p-3 bg-[#242f38] font-bold text-xs text-slate-400 uppercase">Chat en direct</div>
                 <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                     {chatMessages.map((msg, i) => (
                         <div key={i} className="text-xs">
                             <span className="font-bold text-brand-accent mr-2">{msg.user}:</span>
                             <span className="text-slate-300">{msg.text}</span>
                         </div>
                     ))}
                 </div>
                 <div className="p-2 bg-[#0f1923]">
                     <input 
                        type="text" 
                        placeholder="Écrire un message..." 
                        className="w-full bg-[#1a242d] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-brand-accent"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = (e.target as HTMLInputElement).value;
                                if (val.trim()) {
                                    setChatMessages(prev => [...prev, { user: 'Moi', text: val }]);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }
                        }}
                     />
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default CrashGame;