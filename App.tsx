import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Carousel from './components/Carousel';
import MatchList from './components/MatchList';
import WalletModal from './components/WalletModal';
import Referral from './components/Referral';
import BetHistory from './components/BetHistory';
import LiveChat from './components/LiveChat';
import AuthScreen from './components/AuthScreen';
import VideoHub from './components/VideoHub';
import CasinoHub from './components/CasinoHub';
import ResultsHub from './components/ResultsHub';
import MatchDetail from './components/MatchDetail';
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';
import SupportModal from './components/SupportModal';
import UpcomingMatches from './components/UpcomingMatches';
import AboutModal from './components/AboutModal';
import ScoreTicker from './components/ScoreTicker';
import Sidebar from './components/Sidebar';
import CouponList from './components/CouponList';
import TransactionHistory from './components/TransactionHistory';
import StatisticsView from './components/StatisticsView';
import ResponsibleGamingView from './components/ResponsibleGamingView';
import PromotionsHub from './components/PromotionsHub';
import NewsHub from './components/NewsHub';
import Leaderboard from './components/Leaderboard';
import AssistantView from './components/AssistantView';
import AppInstallPrompt from './components/AppInstallPrompt';
import SearchPage from './components/SearchPage';
import PaymentVerificationGate from './components/PaymentVerificationGate';
import MonetizationModal from './components/MonetizationModal';
import { BetSlipItem, AppSection, PlacedBet, User, Match } from './types';
import { Home, Trophy, Ticket, Activity, Tv, Gamepad2, AlertTriangle, PartyPopper, Calendar, Minus, Plus, Save, X, Menu, BrainCircuit, Sparkles, Share2, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMatches, subscribeToMatchUpdates, checkBetResults } from './services/sportApiService';
import { db } from './services/database';
import { t, setAppLanguage, getAppLanguage } from './services/localization';
import { getMatchOfTheDayInsight } from './services/geminiService';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  
  // Navigation
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.AUTH);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modals
  const [walletOpen, setWalletOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [monetizationOpen, setMonetizationOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false); 
  const [chatOpen, setChatOpen] = useState(false);
  const [betSlipOpen, setBetSlipOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Data
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [stake, setStake] = useState<number>(500);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error' | 'win' | 'loss'} | null>(null);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Insight State
  const [matchOfDay, setMatchOfDay] = useState<{title: string, insight: string} | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    setAppLanguage(getAppLanguage());
    const storedUser = db.getUser();
    if (storedUser) {
      setUser(storedUser);
      setCurrentSection(AppSection.HOME);
    }
    const unsubscribe = db.subscribeToBalance((newBal) => {
        setBalance(newBal);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Matches & AI Insight
  useEffect(() => {
    const init = async () => {
        const matches = await fetchMatches();
        setAllMatches(matches);
        
        // Load AI Insight only once initially to save tokens
        const insight = await getMatchOfTheDayInsight(matches);
        setMatchOfDay(insight);
    };
    init();

    const unsubscribe = subscribeToMatchUpdates((updated) => {
        setAllMatches(updated);
    });
    return () => unsubscribe();
  }, []);

  // Simulate real-time score change notifications
  useEffect(() => {
    if (currentSection !== AppSection.HOME) return;
    
    const interval = setInterval(() => {
        const liveMatches = allMatches.filter(m => m.status === 'live');
        if (liveMatches.length > 0) {
            const randomMatch = liveMatches[Math.floor(Math.random() * liveMatches.length)];
            const isHomeGoal = Math.random() > 0.5;
            
            // Create a notification
            const goalMsg = `BUT ! ${isHomeGoal ? randomMatch.homeTeam : randomMatch.awayTeam} vient de marquer ! Score actuel: ${isHomeGoal ? randomMatch.homeScore + 1 : randomMatch.homeScore} - ${isHomeGoal ? randomMatch.awayScore : randomMatch.awayScore + 1}`;
            
            db.addNotification({
                title: 'Alerte Score',
                text: goalMsg,
                type: 'match'
            });

            showNotification(goalMsg, 'win');
        }
    }, 45000); // Every 45 seconds simulate a goal

    return () => clearInterval(interval);
  }, [allMatches, currentSection]);

  // Check bet results periodically
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
        checkBetResults();
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  // --- AUTH ---
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentSection(AppSection.HOME);
    showNotification(`${t('welcome')}, ${loggedInUser.name} !`);
    db.syncWithServer();
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
    setProfileOpen(false);
    setCurrentSection(AppSection.AUTH);
  };

  // --- SEARCH ---
  const handleSearch = (query: string) => {
      setSearchQuery(query);
      setIsSearchOpen(true);
  };

  // --- BETTING LOGIC ---
  const addToSlip = (item: BetSlipItem) => {
    setBetSlip(prev => {
        const exists = prev.find(i => i.matchId === item.matchId);
        if (exists && exists.selection === item.selection) {
            return prev.filter(i => i.matchId !== item.matchId);
        } else if (exists) {
            return prev.map(i => i.matchId === item.matchId ? item : i);
        }
        return [...prev, item];
    });
    setBetSlipOpen(true);
  };

  const removeFromSlip = (matchId: string) => {
    setBetSlip(prev => prev.filter(i => i.matchId !== matchId));
  };

  const handleLoadCoupon = (items: BetSlipItem[]) => {
      setBetSlip(items);
      setBetSlipOpen(true);
      showNotification(t('coupon') + " chargé !", 'success');
  };

  const placeBet = async () => {
    if (balance < stake) {
      showNotification("Solde insuffisant !", 'error');
      setWalletOpen(true);
      return;
    }

    // Multi-bet Bonus Logic
    let bonusPct = 0;
    if (betSlip.length >= 3 && betSlip.length <= 5) bonusPct = 0.05;
    else if (betSlip.length >= 6 && betSlip.length <= 10) bonusPct = 0.10;
    else if (betSlip.length >= 11) bonusPct = 0.20;

    const totalOdds = betSlip.reduce((acc, item) => acc * item.odds, 1);
    const baseWin = stake * totalOdds;
    const bonusAmount = Math.floor(baseWin * bonusPct);
    const potentialWin = Math.floor(baseWin + bonusAmount);

    const bet: PlacedBet = {
      id: `BET-${Date.now()}`,
      date: new Date().toLocaleString(),
      items: [...betSlip],
      stake,
      totalOdds: parseFloat(totalOdds.toFixed(2)),
      potentialWin,
      status: 'pending'
    };
    await db.placeBet(bet);
    setBetSlip([]);
    setBetSlipOpen(false);
    
    let successMsg = "Pari validé avec succès !";
    if (bonusAmount > 0) {
        successMsg += `\n🎁 Bonus combiné (+${(bonusPct * 100)}%) : +${bonusAmount.toLocaleString()} F`;
    }
    showNotification(successMsg, 'success');
  };

  const handleTransaction = (amount: number, type: 'deposit' | 'withdraw', provider: string) => {
      let msg = type === 'deposit' 
        ? `Dépôt de ${amount.toLocaleString()} F réussi via ${provider}`
        : `Retrait de ${amount.toLocaleString()} F initié via ${provider}`;
      
      if (type === 'deposit' && user && !user.hasReceivedFirstDepositBonus) {
          const bonus = amount; // 100% bonus
          db.updateBalance(bonus, 'add');
          const updatedUser = { ...user, hasReceivedFirstDepositBonus: true };
          setUser(updatedUser);
          db.saveUser(updatedUser);
          msg += `\n🎁 Bonus de premier dépôt : +${bonus.toLocaleString()} F !`;
      }
      
      showNotification(msg, 'success');
  };

  const showNotification = (msg: string, type: 'success' | 'error' | 'win' | 'loss' = 'success') => {
    setNotification({msg, type});
    setTimeout(() => setNotification(null), 4000);
  };

  if (currentSection === AppSection.AUTH) {
      return <AuthScreen onLogin={handleLogin} />;
  }

  const totalOdds = betSlip.reduce((acc, item) => acc * item.odds, 1);

  return (
    <PaymentVerificationGate>
      <div className="min-h-screen bg-brand-900 pb-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* GLOBAL NOTIFICATION */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-xl shadow-2xl animate-fade-in flex items-center gap-3 border-2 ${
            notification.type === 'win' ? 'bg-brand-accent text-brand-900 border-white scale-110' : 
            notification.type === 'error' ? 'bg-red-500 text-white border-red-700' :
            notification.type === 'loss' ? 'bg-slate-800 text-slate-300 border-slate-600' :
            'bg-brand-800 text-white border-brand-accent'
        }`}>
            {notification.type === 'win' && (
                <div className="absolute inset-0 -z-10 bg-brand-accent blur-xl opacity-50 animate-pulse"></div>
            )}
            {notification.type === 'win' && <Trophy size={24} className="animate-bounce text-brand-900" />}
            {notification.type === 'error' && <AlertTriangle size={24} />}
            <span className="font-black text-sm md:text-base uppercase italic tracking-tight">{notification.msg}</span>
        </div>
      )}

      {/* TOP NAVBAR */}
      <Navbar 
        onMenuClick={() => setSidebarOpen(true)} 
        onOpenWallet={() => setWalletOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        balance={balance}
        onSearch={handleSearch} 
      />

      <div className="flex flex-col min-h-screen">
         {/* MAIN CONTENT AREA */}
         <div className="flex-1 pb-24">
           
           {currentSection === AppSection.HOME && (
             <>
               {!searchQuery && <Carousel />}
               {!searchQuery && <ScoreTicker matches={allMatches} />}
               
               {/* Match of the Day AI Banner */}
               {!searchQuery && matchOfDay && (
                   <div className="mx-3 mt-4 bg-gradient-to-r from-brand-800 to-brand-900 rounded-xl p-4 border border-brand-700 shadow-lg relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-3 opacity-10"><BrainCircuit size={80} className="text-brand-accent"/></div>
                       <div className="flex items-start gap-3 relative z-10">
                           <div className="bg-brand-accent p-2 rounded-full text-brand-900">
                               <Sparkles size={20} className="animate-pulse" />
                           </div>
                           <div>
                               <p className="text-[10px] font-black uppercase text-brand-accent mb-1">Analyse Gemini 3 • Match du Jour</p>
                               <h3 className="text-white font-bold text-sm mb-1">{matchOfDay.title}</h3>
                               <p className="text-slate-300 text-xs italic">"{matchOfDay.insight}"</p>
                           </div>
                       </div>
                   </div>
               )}

               {/* QUICK NAV GRID */}
               {!searchQuery && (
                   <div className="grid grid-cols-4 gap-2 p-3">
                      {[
                        { s: AppSection.LIVE, l: 'Direct', i: Activity, c: 'text-red-500' },
                        { s: AppSection.CASINO, l: 'Casino', i: Gamepad2, c: 'text-purple-500' },
                        { s: AppSection.VIDEO, l: 'TV', i: Tv, c: 'text-blue-500' },
                        { s: AppSection.UPCOMING, l: 'Calendrier', i: Calendar, c: 'text-yellow-500' },
                      ].map(btn => (
                        <button 
                          key={btn.l} 
                          onClick={() => setCurrentSection(btn.s)}
                          className="flex flex-col items-center justify-center bg-brand-800 p-3 rounded-xl border border-brand-700 shadow hover:bg-brand-700 active:scale-95 transition-all"
                        >
                            <btn.i size={24} className={`mb-1 ${btn.c}`} />
                            <span className="text-[10px] font-bold text-white uppercase">{btn.l}</span>
                        </button>
                      ))}
                   </div>
               )}

               {/* Matches List (With Filters built-in) */}
               <MatchList 
                  onAddToSlip={addToSlip} 
                  onWatch={(m) => { setSelectedMatch(m); setCurrentSection(AppSection.VIDEO); }}
                  onOpenDetails={setSelectedMatch}
                  searchQuery={searchQuery}
               />
             </>
           )}

           {currentSection === AppSection.LIVE && (
              <div className="p-2">
                  <h2 className="text-xl font-black text-white italic uppercase mb-4 flex items-center gap-2"><Activity className="text-red-500"/> En Direct</h2>
                  <MatchList onAddToSlip={addToSlip} onOpenDetails={setSelectedMatch} />
              </div>
           )}

           {currentSection === AppSection.UPCOMING && <UpcomingMatches onOpenDetails={setSelectedMatch} onAddToSlip={addToSlip} />}
           {currentSection === AppSection.CASINO && <CasinoHub searchQuery={searchQuery} />}
           {currentSection === AppSection.VIDEO && <VideoHub matches={allMatches.filter(m => m.status === 'live')} />}
           {currentSection === AppSection.RESULTS && <ResultsHub onOpenDetails={setSelectedMatch} />}
           {currentSection === AppSection.REFERRAL && <Referral />}
           {currentSection === AppSection.HISTORY && <BetHistory />}
           {currentSection === AppSection.COUPONS && <CouponList onLoadCoupon={handleLoadCoupon} />}
           {currentSection === AppSection.TRANSACTIONS && <TransactionHistory />}
           {currentSection === AppSection.STATISTICS && <StatisticsView />}
           {currentSection === AppSection.RESPONSIBLE_GAMING && <ResponsibleGamingView />}
           
           {/* NEW SECTIONS */}
           {currentSection === AppSection.PROMOTIONS && <PromotionsHub />}

           {currentSection === AppSection.VIP_CLUB && (
               <div className="p-4 animate-fade-in text-center">
                   <div className="w-20 h-20 bg-brand-highlight/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-brand-highlight">
                       <Trophy size={40} className="text-brand-highlight" />
                   </div>
                   <h2 className="text-2xl font-black text-white italic uppercase mb-2">Club VIP SportBot</h2>
                   <p className="text-slate-400 text-sm mb-6">Accédez à des avantages exclusifs, des retraits prioritaires et des bonus personnalisés.</p>
                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-brand-800 p-4 rounded-xl border border-brand-700">
                           <p className="text-brand-highlight font-bold">BRONZE</p>
                           <p className="text-[10px] text-slate-500">Niveau actuel</p>
                       </div>
                       <div className="bg-brand-800 p-4 rounded-xl border border-brand-700 opacity-50">
                           <p className="text-slate-300 font-bold">SILVER</p>
                           <p className="text-[10px] text-slate-500">Prochain niveau</p>
                       </div>
                   </div>
               </div>
           )}

           {currentSection === AppSection.STATISTICS && (
               <div className="p-4 animate-fade-in">
                   <h2 className="text-xl font-black text-white italic uppercase mb-4 flex items-center gap-2">📊 Statistiques Pro</h2>
                   <div className="bg-brand-800 rounded-2xl p-6 border border-brand-700 text-center">
                       <Activity size={48} className="text-cyan-400 mx-auto mb-4" />
                       <p className="text-white font-bold">Analyse de Forme</p>
                       <p className="text-slate-400 text-xs mt-2">Consultez les statistiques détaillées des équipes avant de parier.</p>
                       <button className="mt-4 w-full bg-brand-700 text-white py-3 rounded-xl font-bold text-sm">Explorer les Stats</button>
                   </div>
               </div>
           )}

           {currentSection === AppSection.RESPONSIBLE_GAMING && (
               <div className="p-4 animate-fade-in">
                   <h2 className="text-xl font-black text-white italic uppercase mb-4 flex items-center gap-2">🛡️ Jeu Responsable</h2>
                   <div className="bg-brand-800 rounded-2xl p-5 border border-brand-700 space-y-4">
                       <p className="text-slate-300 text-sm">Le jeu doit rester un plaisir. Fixez-vous des limites et jouez de manière responsable.</p>
                       <div className="space-y-2">
                           <button className="w-full bg-brand-900 border border-brand-700 text-white py-3 rounded-xl text-sm font-bold">Limites de Dépôt</button>
                           <button className="w-full bg-brand-900 border border-brand-700 text-white py-3 rounded-xl text-sm font-bold">Auto-Exclusion</button>
                       </div>
                   </div>
               </div>
           )}

           {currentSection === AppSection.NEWS && <NewsHub />}
           {currentSection === AppSection.LEADERBOARD && <Leaderboard />}
           {currentSection === AppSection.ASSISTANT && <AssistantView />}
         </div>
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-brand-900 border-t border-brand-800 flex justify-between items-center px-4 py-3 z-40 safe-area-pb">
          <button 
            onClick={() => setCurrentSection(AppSection.HOME)}
            className={`flex flex-col items-center gap-1 ${currentSection === AppSection.HOME ? 'text-brand-accent' : 'text-slate-500'}`}
          >
              <Home size={22} strokeWidth={currentSection === AppSection.HOME ? 3 : 2} />
              <span className="text-[10px] font-bold">Accueil</span>
          </button>
          
          <button 
            onClick={() => setCurrentSection(AppSection.LIVE)}
            className={`flex flex-col items-center gap-1 ${currentSection === AppSection.LIVE ? 'text-red-500' : 'text-slate-500'}`}
          >
              <Activity size={22} strokeWidth={currentSection === AppSection.LIVE ? 3 : 2} />
              <span className="text-[10px] font-bold">Live</span>
          </button>

          <div className="relative -top-5">
              <button 
                onClick={() => setBetSlipOpen(!betSlipOpen)}
                className="w-16 h-16 rounded-full bg-brand-accent border-4 border-brand-900 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,208,98,0.5)] active:scale-95 transition-transform"
              >
                  <Ticket size={28} className="text-brand-900" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-white text-[10px] flex items-center justify-center font-bold border-2 border-brand-900">
                      {betSlip.length}
                  </span>
              </button>
          </div>

          <button 
            onClick={() => setCurrentSection(AppSection.HISTORY)}
            className={`flex flex-col items-center gap-1 ${currentSection === AppSection.HISTORY ? 'text-blue-400' : 'text-slate-500'}`}
          >
              <Trophy size={22} strokeWidth={currentSection === AppSection.HISTORY ? 3 : 2} />
              <span className="text-[10px] font-bold">Paris</span>
          </button>

          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-white"
          >
              <Menu size={22} />
              <span className="text-[10px] font-bold">Menu</span>
          </button>
      </div>

      {/* BET SLIP MODAL */}
      {betSlip.length > 0 && betSlipOpen && (
         <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex flex-col justify-end">
             <div className="bg-brand-900 rounded-t-2xl shadow-2xl border-t border-brand-700 max-h-[80vh] flex flex-col animate-fade-in">
                
                <div className="p-4 bg-brand-800 border-b border-brand-700 flex justify-between items-center rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-accent text-brand-900 font-bold w-8 h-8 rounded-full flex items-center justify-center">{betSlip.length}</div>
                        <h3 className="font-bold text-white uppercase">{t('coupon')}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                const code = prompt("Entrez le code du coupon :");
                                if (code) {
                                    const coupon = db.getCoupon(code);
                                    if (coupon) handleLoadCoupon(coupon.items);
                                    else showNotification("Coupon invalide !", 'error');
                                }
                            }}
                            className="bg-brand-700 p-2 rounded-full text-slate-300 hover:text-white transition-colors"
                            title="Charger un coupon"
                        >
                            <QrCode size={18}/>
                        </button>
                        <button onClick={() => setBetSlipOpen(false)} className="bg-brand-900 p-2 rounded-full text-white"><X size={18}/></button>
                    </div>
                </div>

                <div className="p-4 overflow-y-auto space-y-3">
                   {betSlip.map((item, idx) => (
                      <div key={idx} className="bg-brand-800 p-3 rounded-lg border border-brand-700 flex justify-between items-center relative group">
                          <div>
                              <p className="text-xs text-slate-500 font-bold uppercase">{item.matchInfo}</p>
                              <p className="text-sm font-bold text-white mt-1">
                                  {item.selection === 'home' ? 'Victoire 1' : item.selection === 'away' ? 'Victoire 2' : 'Match Nul'}
                              </p>
                          </div>
                          <span className="bg-brand-900 text-brand-accent px-2 py-1 rounded font-bold">{item.odds}</span>
                          <button onClick={() => removeFromSlip(item.matchId)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                      </div>
                   ))}
                </div>

                <div className="p-4 bg-brand-800 border-t border-brand-700 space-y-4 rounded-b-none">
                   <div className="flex justify-between items-center">
                       <span className="text-slate-400 text-sm font-bold">{t('stake')}</span>
                       <div className="flex items-center gap-2">
                           <button onClick={() => setStake(Math.max(100, stake - 100))} className="bg-brand-700 p-2 rounded"><Minus size={14} className="text-white"/></button>
                           <input 
                               type="number" 
                               value={stake} 
                               onChange={(e) => setStake(Number(e.target.value))}
                               className="w-24 bg-brand-900 border border-brand-700 rounded p-2 text-center text-white font-bold"
                           />
                           <button onClick={() => setStake(stake + 100)} className="bg-brand-700 p-2 rounded"><Plus size={14} className="text-white"/></button>
                       </div>
                   </div>
                   
                   <div className="flex justify-between items-center">
                       <span className="text-slate-400 text-xs font-bold uppercase">{t('potentialWin')}</span>
                       <span className="text-brand-accent font-black text-xl">{(stake * totalOdds).toLocaleString()} F</span>
                   </div>

                   <div className="flex gap-2">
                        <button 
                            onClick={() => { const coupon = db.saveCoupon(betSlip); setGeneratedCode(coupon.code); }}
                            className="flex-1 bg-brand-700 text-slate-300 py-3 rounded-xl font-bold text-xs"
                        >
                            {generatedCode ? generatedCode : <span className="flex items-center justify-center gap-1"><Save size={14}/> Enregistrer</span>}
                        </button>
                        <button 
                            onClick={() => {
                                const text = `Regarde mon coupon SportBot ! Code: ${generatedCode || 'N/A'}. Cote totale: ${totalOdds.toFixed(2)}. Rejoins-moi sur SportBot !`;
                                if (navigator.share) {
                                    navigator.share({ title: 'Mon Coupon SportBot', text, url: window.location.href }).catch(() => {});
                                } else {
                                    navigator.clipboard.writeText(text);
                                    showNotification("Lien copié !", 'success');
                                }
                            }}
                            className="bg-brand-700 text-slate-300 p-3 rounded-xl hover:text-white transition-colors"
                        >
                            <Share2 size={18} />
                        </button>
                        <button 
                            onClick={placeBet}
                            className="flex-[2] bg-brand-accent text-brand-900 py-3 rounded-xl font-black text-lg uppercase shadow-lg"
                        >
                            {t('placeBet')}
                        </button>
                   </div>
                </div>
             </div>
         </div>
      )}

      {/* SIDEBAR & MODALS */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        onOpenWallet={() => setWalletOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenMonetization={() => setMonetizationOpen(true)}
        onLogout={handleLogout}
        balance={balance}
      />

      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} onTransaction={handleTransaction} />
      <ProfileModal 
         isOpen={profileOpen} 
         onClose={() => setProfileOpen(false)} 
         user={user!} 
         onLogout={handleLogout}
         onOpenWallet={() => setWalletOpen(true)}
         onOpenSettings={() => setSettingsOpen(true)}
         onOpenSupport={() => setSupportOpen(true)}
         onNavigate={setCurrentSection} 
      />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onUpdate={() => {}} />
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
      <MonetizationModal isOpen={monetizationOpen} onClose={() => setMonetizationOpen(false)} />
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <LiveChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      {selectedMatch && <MatchDetail match={selectedMatch} onClose={() => setSelectedMatch(null)} onAddToSlip={addToSlip} />}
      
      <AnimatePresence>
        {isSearchOpen && (
          <SearchPage 
            onClose={() => setIsSearchOpen(false)} 
            initialQuery={searchQuery} 
          />
        )}
      </AnimatePresence>

      {/* App Install Prompt */}
      {user && <AppInstallPrompt />}

    </div>
    </PaymentVerificationGate>
  );
};

export default App;
