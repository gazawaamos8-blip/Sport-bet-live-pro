import React, { useState, useEffect } from 'react';
import { Match, MatchEvent, Lineup, LineupPlayer, SportType, BetSlipItem } from '../types';
import { fetchLineups, fetchH2H, getFlag } from '../services/sportApiService';
import { analyzeMatch } from '../services/geminiService';
import { X, Trophy, Activity, Camera, Timer, User as UserIcon, Sparkles, Users, History, BrainCircuit, Shirt, Zap, Lock, AlertCircle, CreditCard, Play, Signal, Server, Loader } from 'lucide-react';
import MatchTracker from './MatchTracker';

interface MatchDetailProps {
  match: Match;
  onClose: () => void;
  onAddToSlip?: (item: BetSlipItem) => void;
}

const StatBar: React.FC<{ label: string, home: number, away: number, total?: number }> = ({ label, home, away, total }) => {
  const max = total || (home + away || 1);
  const homePct = (home / max) * 100;
  const awayPct = (away / max) * 100;
  
  return (
    <div className="mb-6 group">
      <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest group-hover:text-brand-accent transition-colors">
        <span className="text-white text-sm font-mono">{home}</span>
        <span>{label}</span>
        <span className="text-white text-sm font-mono">{away}</span>
      </div>
      <div className="flex h-3 bg-brand-800 rounded-full overflow-hidden p-0.5 border border-brand-700 shadow-inner">
        <div className="bg-gradient-to-r from-brand-accent to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${homePct}%` }}></div>
        <div className="flex-1"></div>
        <div className="bg-gradient-to-l from-red-500 to-orange-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(239,68,68,0.4)]" style={{ width: `${awayPct}%` }}></div>
      </div>
    </div>
  );
};

const EventRow: React.FC<{ event: MatchEvent }> = ({ event }) => {
  const isHome = event.team === 'home';
  return (
      <div className={`flex items-center gap-4 mb-4 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="w-12 text-center text-xs font-mono font-bold text-slate-500">{event.minute}'</div>
          <div className={`flex-1 flex items-center gap-3 bg-brand-800 p-2 rounded-xl border border-brand-700 ${isHome ? '' : 'flex-row-reverse text-right'}`}>
              <div className="relative">
                  <img src={event.player.photo} className="w-12 h-12 rounded-full border-2 border-brand-600 object-cover" alt={event.player.name} referrerPolicy="no-referrer" />
                  <div className="absolute -bottom-1 -right-1 bg-brand-900 rounded-full p-0.5">
                      {event.type === 'goal' && <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px]">⚽</div>}
                      {event.type.includes('card') && <div className={`w-4 h-4 rounded-sm ${event.type === 'card_yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>}
                  </div>
              </div>
              <div>
                  <div className="text-sm font-bold text-white">{event.player.name}</div>
                  <div className="text-[10px] text-slate-400 uppercase">{event.type === 'goal' ? 'BUT !' : 'CARTON'} {event.detail && `• ${event.detail}`}</div>
              </div>
          </div>
      </div>
  );
};

const LineupView: React.FC<{ lineup: Lineup, color: string }> = ({ lineup, color }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 bg-brand-800/80 backdrop-blur-sm p-3 rounded-xl border border-brand-700 shadow-lg">
            <span className="flex items-center gap-2 uppercase tracking-widest"><UserIcon size={14} className="text-brand-accent"/> Coach: <span className="text-white">{lineup.coach.name}</span></span>
            <span className="bg-brand-accent px-3 py-1 rounded-full text-brand-900 font-black border border-white/20 shadow-lg">{lineup.formation}</span>
        </div>
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-800"></div>
                <p className="text-[10px] font-black uppercase text-brand-accent tracking-[0.3em]">Titulaires</p>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-800"></div>
            </div>
            {lineup.startXI.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-brand-800/20 p-2.5 rounded-xl border border-brand-800/50 hover:bg-brand-800 hover:border-brand-accent/30 transition-all group cursor-pointer">
                    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-sm font-black text-white shadow-lg border-2 border-white/10 group-hover:scale-110 transition-transform`}>
                        {p.number}
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-black text-white leading-none group-hover:text-brand-accent transition-colors">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">{p.pos}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Zap size={14} className="text-brand-accent" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const MatchDetail: React.FC<MatchDetailProps> = ({ match, onClose, onAddToSlip }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'stats' | 'lineups' | 'ai' | 'tips' | 'h2h' | 'odds' | 'video'>('odds');
  const [lineups, setLineups] = useState<{ home: Lineup; away: Lineup } | null>(null);
  const [h2h, setH2h] = useState<Match[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<'server1' | 'server2' | 'server3' | 'server4' | 'server5' | 'server6' | 'server7' | 'server8' | 'server9' | 'server10' | 'server11' | 'server12' | 'server13' | 'proxy'>('server1');
  const [videoLoading, setVideoLoading] = useState(false);

  const getSourceUrl = (videoId: string) => {
    switch (currentSource) {
      case 'server4': return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
      case 'server5': return `https://vidsrc.to/embed/movie/${videoId}`;
      case 'server6': return `https://embed.su/embed/movie/${videoId}`;
      case 'server7': return `https://invidious.snopyta.org/embed/${videoId}`;
      case 'server8': return `https://yewtu.be/embed/${videoId}`;
      case 'server9': return `https://invidious.projectsegfau.lt/embed/${videoId}`;
      case 'server10': return `https://invidious.io.lol/embed/${videoId}`;
      case 'server11': return `https://inv.tux.rs/embed/${videoId}`;
      case 'server12': return `https://invidious.namazso.eu/embed/${videoId}`;
      case 'server13': return `https://vid.puffyan.us/embed/${videoId}`;
      case 'proxy': return `https://piped.video/embed/${videoId}`;
      default: return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    }
  };

  useEffect(() => {
    if (match.status === 'live') {
      const query = `${match.homeTeam} vs ${match.awayTeam} live stream direct`;
      import('../services/youtubeService').then(service => {
        service.searchLiveSports(query, 1).then(result => {
          if (result.items.length > 0) {
            setLiveVideoId(result.items[0].id.videoId);
            // Auto-switch to video tab if live and video found
            setActiveTab('video');
          }
        });
      });
    }
  }, [match]);

  const isMatchLocked = () => {
    if (match.status === 'finished') return true;
    if (match.status === 'upcoming') return false;
    const matchMinute = parseInt(match.time.replace("'", ""));
    const isNearEnd = !isNaN(matchMinute) && matchMinute >= 85;

    // 0-0 near end -> Lock match
    if (isNearEnd && match.homeScore === 0 && match.awayScore === 0) return true;

    // 1-0 or 0-1 near end -> Lock match (Dominating lead near end)
    if (isNearEnd && ((match.homeScore === 1 && match.awayScore === 0) || (match.homeScore === 0 && match.awayScore === 1))) return true;

    const scoreDiff = Math.abs(match.homeScore - match.awayScore);
    const hasBigLead = scoreDiff >= 2;
    return hasBigLead;
  };

  const isSelectionLocked = (selection: string) => {
    if (isMatchLocked()) return true;

    const matchMinute = parseInt(match.time.replace("'", ""));
    const isNearEnd = !isNaN(matchMinute) && matchMinute >= 85;

    if (isNearEnd) {
        // 1-0 or 1-2 (one goal lead) near end -> Lock leading team
        if (match.homeScore === 1 && match.awayScore === 0 && selection === 'home') return true;
        if (match.homeScore === 0 && match.awayScore === 1 && selection === 'away') return true;
        if (match.homeScore === 1 && match.awayScore === 2 && selection === 'away') return true;
        if (match.homeScore === 2 && match.awayScore === 1 && selection === 'home') return true;
        
        // Double chance locking
        if (match.homeScore === 1 && match.awayScore === 0 && (selection === 'homeDraw' || selection === 'homeAway')) return true;
        if (match.homeScore === 0 && match.awayScore === 1 && (selection === 'drawAway' || selection === 'homeAway')) return true;
    }

    return false;
  };

  useEffect(() => {
      fetchLineups(match.id).then(setLineups);
      fetchH2H(match.id).then(setH2h);
  }, [match.id]);

  useEffect(() => {
      if (activeTab === 'ai' && !aiAnalysis) {
          setAiAnalysis("Gemini analyse le match...");
          analyzeMatch(match).then(setAiAnalysis);
      }
  }, [activeTab, match]);

  const statLabels = {
      possession: 'Possession %',
      shots: 'Tirs Totaux',
      onTarget: 'Tirs Cadrés',
      corners: 'Corners / Coups Francs'
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-md flex flex-col overflow-y-auto animate-fade-in">
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-brand-900 border-b border-brand-700 shadow-xl">
        <div className="p-4 flex items-center">
            <div className="flex-1">
                <button onClick={onClose} className="w-10 h-10 bg-brand-800 rounded-full text-white hover:bg-brand-700 flex items-center justify-center shadow-lg border border-brand-700 transition-all active:scale-90">
                    <X size={20} />
                </button>
            </div>
            
            <div className="flex-[2] text-center">
                <div className="inline-flex flex-col items-center">
                    <div className="flex items-center gap-2 bg-brand-800 px-4 py-2 rounded-full border border-brand-700 shadow-xl mb-1">
                        {match.countryCode && (
                            getFlag(match.countryCode).startsWith('http') 
                            ? <img src={getFlag(match.countryCode)} className="w-5 h-3.5 object-cover rounded-sm" alt="flag" referrerPolicy="no-referrer" />
                            : <span className="text-sm">{getFlag(match.countryCode)}</span>
                        )}
                        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{match.league}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                         {match.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
                         <span className="font-mono text-brand-accent font-black text-lg tracking-tighter">{match.time}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 flex justify-end">
                {/* Placeholder to balance the X button */}
                <div className="w-10 h-10"></div>
            </div>
        </div>

        <div className="flex justify-between items-center px-6 pb-6 pt-2">
             <div className="flex flex-col items-center w-1/3">
                 <div className="relative group/team">
                    <img src={match.homeLogo} className="w-16 h-16 rounded-full bg-brand-700 p-1 border border-brand-600 shadow-lg object-cover relative z-10 mb-2" alt={match.homeTeam} referrerPolicy="no-referrer" />
                    {match.status === 'live' && (
                      <div className="absolute top-0 right-0 bg-red-600 text-[6px] font-black text-white px-1 py-0.5 rounded-sm animate-pulse z-20 shadow-sm">LIVE</div>
                    )}
                    {match.homeCountryCode && !match.homeLogo?.includes('flagcdn.com') && (
                        <div className="absolute bottom-4 right-0 shadow-lg z-20">
                            {getFlag(match.homeCountryCode).startsWith('http') 
                                ? <img src={getFlag(match.homeCountryCode)} className="w-8 h-5 object-cover rounded-sm border-2 border-brand-900" alt="flag" referrerPolicy="no-referrer" />
                                : <span className="bg-brand-900 rounded-full px-1.5 text-[12px]">{getFlag(match.homeCountryCode)}</span>
                            }
                        </div>
                    )}
                 </div>
                 <span className="text-sm font-black text-white text-center leading-tight">{match.homeTeam}</span>
             </div>
             <div className="text-5xl font-black text-white font-mono tracking-tighter whitespace-nowrap bg-brand-800 px-6 py-3 rounded-2xl border border-brand-700 shadow-2xl">
                 {match.homeScore} - {match.awayScore}
             </div>
             <div className="flex flex-col items-center w-1/3">
                 <div className="relative group/team">
                    <img src={match.awayLogo} className="w-16 h-16 rounded-full bg-brand-700 p-1 border border-brand-600 shadow-lg object-cover relative z-10 mb-2" alt={match.awayTeam} referrerPolicy="no-referrer" />
                    {match.status === 'live' && (
                      <div className="absolute top-0 right-0 bg-red-600 text-[6px] font-black text-white px-1 py-0.5 rounded-sm animate-pulse z-20 shadow-sm">LIVE</div>
                    )}
                    {match.awayCountryCode && !match.awayLogo?.includes('flagcdn.com') && (
                        <div className="absolute bottom-4 right-0 shadow-lg z-20">
                            {getFlag(match.awayCountryCode).startsWith('http') 
                                ? <img src={getFlag(match.awayCountryCode)} className="w-8 h-5 object-cover rounded-sm border-2 border-brand-900" alt="flag" referrerPolicy="no-referrer" />
                                : <span className="bg-brand-900 rounded-full px-1.5 text-[12px]">{getFlag(match.awayCountryCode)}</span>
                            }
                        </div>
                    )}
                 </div>
                 <span className="text-sm font-black text-white text-center leading-tight">{match.awayTeam}</span>
             </div>
        </div>
        
        {/* Tabs */}
        <div className="flex px-4 gap-2 overflow-x-auto no-scrollbar pb-4">
            {[
                ...(match.status === 'live' ? [{ id: 'video', label: 'Direct', icon: Activity }] : []),
                { id: 'odds', label: 'Paris', icon: Trophy },
                { id: 'timeline', label: 'Live', icon: Timer },
                { id: 'stats', label: 'Stats', icon: Activity },
                { id: 'lineups', label: 'Joueurs', icon: Shirt },
                { id: 'h2h', label: 'H2H', icon: History },
                { id: 'ai', label: 'Gemini AI', icon: Sparkles },
                { id: 'tips', label: 'Conseils', icon: Trophy },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[100px] py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all relative overflow-hidden ${activeTab === tab.id ? 'bg-brand-accent text-brand-900 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105 z-10' : 'bg-brand-800 text-slate-400 border border-brand-700 hover:border-brand-accent/50'}`}
                >
                    {activeTab === tab.id && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                    )}
                    <tab.icon size={14} className={activeTab === tab.id ? 'animate-pulse' : ''} /> {tab.label}
                </button>
            ))}
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full pb-10">
         {activeTab === 'video' && (
             <div className="space-y-4 animate-fade-in">
                 <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-brand-700 shadow-2xl">
                     {liveVideoId ? (
                         videoLoading ? (
                             <div className="absolute inset-0 flex items-center justify-center text-brand-accent bg-brand-900">
                                 <Loader className="animate-spin" size={32} />
                             </div>
                         ) : (
                             <iframe
                                 src={getSourceUrl(liveVideoId)}
                                 className="absolute inset-0 w-full h-full"
                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                                 sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation"
                                 allowFullScreen
                                 referrerPolicy="no-referrer"
                             />
                         )
                     ) : (
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-brand-900">
                             <Play size={48} className="text-brand-accent mb-4 animate-pulse" />
                             <h3 className="text-white font-black uppercase tracking-widest mb-2">Recherche de flux...</h3>
                             <p className="text-slate-400 text-xs">Nous cherchons un flux vidéo en direct pour ce match.</p>
                         </div>
                     )}
                 </div>

                 <div className="flex gap-3">
                    <div className="flex-1 bg-brand-800/50 p-3 rounded-xl border border-brand-700">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-3 flex items-center gap-2">
                            <Server size={12} className="text-brand-accent" /> Changer de Serveur
                        </p>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {['server1', 'server4', 'server7', 'server11', 'server13', 'proxy'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => {
                                        setVideoLoading(true);
                                        setCurrentSource(s as any);
                                        setTimeout(() => setVideoLoading(false), 500);
                                    }}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${currentSource === s ? 'bg-brand-accent text-brand-900' : 'bg-brand-900 text-slate-500 border border-brand-700'}`}
                                >
                                    {s === 'server1' ? 'Principal' : s === 'server4' ? 'Anti-Blocage' : s === 'proxy' ? 'Proxy' : s.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('open-casino', { detail: 'cosmic-roulette' }))}
                      className="bg-gradient-to-br from-brand-accent to-emerald-600 text-brand-900 px-4 rounded-xl flex flex-col items-center justify-center gap-1 shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      <Zap size={18} fill="currentColor" />
                      <span className="text-[8px] font-black uppercase">Roulette</span>
                    </button>
                 </div>

                 <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl">
                     <p className="text-[11px] text-brand-accent font-bold leading-relaxed">
                         <span className="text-white font-black uppercase block mb-1 flex items-center gap-2">
                            <Signal size={12} className="text-brand-accent" /> Flux Live Optimisé
                         </span>
                         Si la vidéo ne se lance pas, essayez le serveur "Anti-Blocage" ou "Proxy". Les flux sont mis à jour en temps réel.
                     </p>
                 </div>
             </div>
         )}
         {activeTab === 'odds' && (
             <div className="space-y-6 animate-fade-in relative">
                 {isMatchLocked() && (
                     <div className="absolute inset-0 z-10 bg-brand-900/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                         <div className="bg-brand-900/90 border border-brand-700 p-6 rounded-2xl flex flex-col items-center gap-3 shadow-2xl">
                             <Lock size={40} className="text-slate-500" />
                             <span className="text-sm font-black text-white uppercase tracking-widest">Paris Verrouillés</span>
                             <p className="text-[10px] text-slate-400 text-center max-w-[150px]">Le match est trop avancé ou le score est définitif.</p>
                         </div>
                     </div>
                 )}
                 <div className="bg-brand-800 rounded-2xl p-5 border border-brand-700 shadow-xl relative overflow-hidden">
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl"></div>
                     <h4 className="text-white font-black uppercase italic mb-4 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Trophy size={18} className="text-brand-accent" /> Résultat Final (1X2)
                         </div>
                         <span className="text-[9px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full border border-brand-accent/20 animate-pulse">Live Odds</span>
                     </h4>
                     <div className="grid grid-cols-3 gap-3">
                         {[
                             { l: '1', v: match.odds.home, s: 'home', hot: match.odds.home < 2.0 },
                             { l: 'X', v: match.odds.draw, s: 'draw', hot: false },
                             { l: '2', v: match.odds.away, s: 'away', hot: match.odds.away < 2.0 }
                         ].map((opt, idx) => (
                             <button 
                                 key={idx}
                                 onClick={() => !isSelectionLocked(opt.s) && onAddToSlip?.({
                                     matchId: match.id,
                                     selection: opt.s as any,
                                     odds: opt.v,
                                     matchInfo: `${match.homeTeam} vs ${match.awayTeam}`,
                                     league: match.league,
                                     sport: match.sport,
                                     countryCode: match.countryCode,
                                     homeCountryCode: match.homeCountryCode,
                                     awayCountryCode: match.awayCountryCode,
                                     homeLogo: match.homeLogo,
                                     awayLogo: match.awayLogo
                                 })}
                                 className={`flex flex-col items-center bg-brand-900 hover:bg-brand-700 py-4 rounded-2xl border border-brand-700 transition-all hover:border-brand-accent active:scale-95 group relative ${isSelectionLocked(opt.s) ? 'opacity-30 cursor-not-allowed' : ''}`}
                             >
                                 {opt.hot && !isSelectionLocked(opt.s) && (
                                     <div className="absolute -top-2 -right-1 bg-red-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full shadow-lg z-10 animate-bounce">HOT</div>
                                 )}
                                 <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-500 font-black group-hover:text-brand-accent uppercase mb-1 tracking-widest">{opt.l}</span>
                                    {isSelectionLocked(opt.s) && !isMatchLocked() && <Lock size={10} className="text-slate-500 mb-1" />}
                                 </div>
                                 <span className="text-xl font-black text-white font-mono">{opt.v.toFixed(2)}</span>
                                 <div className="w-8 h-0.5 bg-brand-800 rounded-full mt-2 group-hover:bg-brand-accent transition-colors"></div>
                             </button>
                         ))}
                     </div>
                 </div>

                 {match.doubleChance && (
                     <div className="bg-brand-800 rounded-2xl p-5 border border-brand-700 shadow-xl">
                         <h4 className="text-white font-black uppercase italic mb-4 flex items-center gap-2">
                             <Zap size={18} className="text-yellow-500" /> Double Chance
                         </h4>
                         <div className="grid grid-cols-3 gap-3">
                             {[
                                 { l: '1X', v: match.doubleChance.homeDraw, s: 'homeDraw' },
                                 { l: '12', v: match.doubleChance.homeAway, s: 'homeAway' },
                                 { l: 'X2', v: match.doubleChance.drawAway, s: 'drawAway' }
                             ].map((opt, idx) => (
                                 <button 
                                     key={idx}
                                     onClick={() => !isSelectionLocked(opt.s) && onAddToSlip?.({
                                         matchId: match.id,
                                         selection: opt.s as any,
                                         odds: opt.v,
                                         matchInfo: `${match.homeTeam} vs ${match.awayTeam}`,
                                         league: match.league,
                                         sport: match.sport,
                                         countryCode: match.countryCode,
                                         homeCountryCode: match.homeCountryCode,
                                         awayCountryCode: match.awayCountryCode,
                                         homeLogo: match.homeLogo,
                                         awayLogo: match.awayLogo
                                     })}
                                     className={`flex flex-col items-center bg-brand-900 hover:bg-brand-700 py-4 rounded-2xl border border-brand-700 transition-all hover:border-brand-accent active:scale-95 group ${isSelectionLocked(opt.s) ? 'opacity-30 cursor-not-allowed' : ''}`}
                                 >
                                     <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-slate-500 font-bold group-hover:text-brand-accent uppercase mb-1">{opt.l}</span>
                                        {isSelectionLocked(opt.s) && !isMatchLocked() && <Lock size={10} className="text-slate-500 mb-1" />}
                                     </div>
                                     <span className="text-lg font-black text-white">{opt.v.toFixed(2)}</span>
                                 </button>
                             ))}
                         </div>
                     </div>
                 )}

                  {match.overUnder25 && (
                      <div className="bg-brand-800 rounded-2xl p-5 border border-brand-700 shadow-xl">
                          <h4 className="text-white font-black uppercase italic mb-4 flex items-center gap-2">
                              <Activity size={18} className="text-blue-500" /> Plus / Moins (2.5)
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                              {[
                                  { l: 'Plus de 2.5', v: match.overUnder25.over, s: 'over2.5' },
                                  { l: 'Moins de 2.5', v: match.overUnder25.under, s: 'under2.5' }
                              ].map((opt, idx) => (
                                  <button 
                                      key={idx}
                                      onClick={() => !isSelectionLocked(opt.s) && onAddToSlip?.({
                                          matchId: match.id,
                                          selection: opt.s as any,
                                          odds: opt.v,
                                          matchInfo: `${match.homeTeam} vs ${match.awayTeam}`,
                                          league: match.league,
                                          sport: match.sport,
                                          countryCode: match.countryCode,
                                          homeCountryCode: match.homeCountryCode,
                                          awayCountryCode: match.awayCountryCode,
                                          homeLogo: match.homeLogo,
                                          awayLogo: match.awayLogo
                                      })}
                                      className={`flex flex-col items-center bg-brand-900 hover:bg-brand-700 py-4 rounded-2xl border border-brand-700 transition-all hover:border-brand-accent active:scale-95 group ${isSelectionLocked(opt.s) ? 'opacity-30 cursor-not-allowed' : ''}`}
                                  >
                                      <div className="flex items-center gap-1">
                                         <span className="text-[10px] text-slate-500 font-bold group-hover:text-brand-accent uppercase mb-1">{opt.l}</span>
                                         {isSelectionLocked(opt.s) && !isMatchLocked() && <Lock size={10} className="text-slate-500 mb-1" />}
                                      </div>
                                      <span className="text-lg font-black text-white">{opt.v.toFixed(2)}</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}

                  {match.extraOdds && (
                    <>
                      <div className="bg-brand-800 rounded-2xl p-5 border border-brand-700 shadow-xl">
                          <h4 className="text-white font-black uppercase italic mb-4 flex items-center gap-2">
                              <AlertCircle size={18} className="text-orange-500" /> Blessés (3 Joueurs)
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                              {[
                                  { l: 'Plus de 1.5', v: match.extraOdds['injuriesOver1.5'], s: 'injuriesOver1.5' },
                                  { l: 'Moins de 1.5', v: match.extraOdds['injuriesUnder1.5'], s: 'injuriesUnder1.5' }
                              ].map((opt, idx) => (
                                  <button 
                                      key={idx}
                                      onClick={() => !isSelectionLocked(opt.s) && onAddToSlip?.({
                                          matchId: match.id,
                                          selection: opt.s as any,
                                          odds: opt.v,
                                          matchInfo: `${match.homeTeam} vs ${match.awayTeam}`,
                                          league: match.league,
                                          sport: match.sport,
                                          countryCode: match.countryCode,
                                          homeCountryCode: match.homeCountryCode,
                                          awayCountryCode: match.awayCountryCode,
                                          homeLogo: match.homeLogo,
                                          awayLogo: match.awayLogo
                                      })}
                                      className={`flex flex-col items-center bg-brand-900 hover:bg-brand-700 py-4 rounded-2xl border border-brand-700 transition-all hover:border-brand-accent active:scale-95 group ${isSelectionLocked(opt.s) ? 'opacity-30 cursor-not-allowed' : ''}`}
                                  >
                                      <div className="flex items-center gap-1">
                                         <span className="text-[10px] text-slate-500 font-bold group-hover:text-brand-accent uppercase mb-1">{opt.l}</span>
                                         {isSelectionLocked(opt.s) && !isMatchLocked() && <Lock size={10} className="text-slate-500 mb-1" />}
                                      </div>
                                      <span className="text-lg font-black text-white">{opt.v.toFixed(2)}</span>
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="bg-brand-800 rounded-2xl p-5 border border-brand-700 shadow-xl">
                          <h4 className="text-white font-black uppercase italic mb-4 flex items-center gap-2">
                              <CreditCard size={18} className="text-red-500" /> Cartons (1 Total)
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                              {[
                                  { l: 'Plus de 3.5', v: match.extraOdds['cardsOver3.5'], s: 'cardsOver3.5' },
                                  { l: 'Moins de 3.5', v: match.extraOdds['cardsUnder3.5'], s: 'cardsUnder3.5' },
                                  { l: 'Jaunes +2.5', v: match.extraOdds['yellowCardsOver2.5'], s: 'yellowCardsOver2.5' },
                                  { l: 'Carton Rouge', v: match.extraOdds['redCardYes'], s: 'redCardYes' }
                              ].map((opt, idx) => (
                                  <button 
                                      key={idx}
                                      onClick={() => !isSelectionLocked(opt.s) && onAddToSlip?.({
                                          matchId: match.id,
                                          selection: opt.s as any,
                                          odds: opt.v,
                                          matchInfo: `${match.homeTeam} vs ${match.awayTeam}`,
                                          league: match.league,
                                          sport: match.sport,
                                          countryCode: match.countryCode,
                                          homeCountryCode: match.homeCountryCode,
                                          awayCountryCode: match.awayCountryCode,
                                          homeLogo: match.homeLogo,
                                          awayLogo: match.awayLogo
                                      })}
                                      className={`flex flex-col items-center bg-brand-900 hover:bg-brand-700 py-4 rounded-2xl border border-brand-700 transition-all hover:border-brand-accent active:scale-95 group ${isSelectionLocked(opt.s) ? 'opacity-30 cursor-not-allowed' : ''}`}
                                  >
                                      <div className="flex items-center gap-1">
                                         <span className="text-[10px] text-slate-500 font-bold group-hover:text-brand-accent uppercase mb-1">{opt.l}</span>
                                         {isSelectionLocked(opt.s) && !isMatchLocked() && <Lock size={10} className="text-slate-500 mb-1" />}
                                      </div>
                                      <span className="text-lg font-black text-white">{opt.v.toFixed(2)}</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                    </>
                  )}
             </div>
         )}

         {activeTab === 'timeline' && (
             <div className="space-y-6">
                 {/* Live Match Tracker (Pitch) */}
                 {match.status === 'live' && (
                     <div className="animate-fade-in">
                         <MatchTracker match={match} />
                     </div>
                 )}

                 <div className="relative">
                     <div className="absolute left-[24px] top-0 bottom-0 w-px bg-brand-700 -z-10"></div>
                     {match.events && match.events.length > 0 ? (
                         match.events.map(event => <EventRow key={event.id} event={event} />)
                     ) : (
                         <div className="text-center py-10 text-slate-500 italic flex flex-col items-center">
                             <Timer size={40} className="mb-2 opacity-20"/>
                             En attente d'événements marquants...
                         </div>
                     )}
                 </div>
             </div>
         )}

         {activeTab === 'stats' && match.stats && (
             <div className="bg-brand-900 rounded-2xl p-6 border border-brand-700 animate-fade-in space-y-6">
                 <h4 className="text-center text-white font-black uppercase mb-4">Statistiques du Match</h4>
                 <StatBar label={statLabels.possession} home={match.stats.possession.home} away={match.stats.possession.away} total={100} />
                 <StatBar label={statLabels.shots} home={match.stats.shots.home} away={match.stats.shots.away} />
                 <StatBar label={statLabels.onTarget} home={match.stats.shotsOnTarget.home} away={match.stats.shotsOnTarget.away} />
                 <StatBar label={statLabels.corners} home={match.stats.corners.home} away={match.stats.corners.away} />
             </div>
         )}

         {activeTab === 'lineups' && lineups && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                 <div>
                     <h4 className="text-center text-white font-bold mb-3 border-b-2 border-brand-accent pb-2 inline-block w-full">{match.homeTeam}</h4>
                     <LineupView lineup={lineups.home} color="bg-brand-700" />
                 </div>
                 <div>
                     <h4 className="text-center text-white font-bold mb-3 border-b-2 border-red-500 pb-2 inline-block w-full">{match.awayTeam}</h4>
                     <LineupView lineup={lineups.away} color="bg-red-700" />
                 </div>
             </div>
         )}

         {activeTab === 'h2h' && (
             <div className="animate-fade-in space-y-4">
                 <h4 className="text-white font-bold uppercase text-xs border-b border-brand-700 pb-2">Dernières Confrontations</h4>
                 {h2h.map(h => (
                     <div key={h.id} className="bg-brand-800 p-3 rounded-xl border border-brand-700 flex justify-between items-center">
                         <div className="flex items-center gap-2 w-1/3">
                             <img src={h.homeLogo} className="w-6 h-6 rounded-full" alt="" referrerPolicy="no-referrer" />
                             <span className="text-xs text-white font-bold truncate">{h.homeTeam}</span>
                         </div>
                         <div className="bg-brand-900 px-3 py-1 rounded font-mono text-brand-accent font-bold">
                             {h.homeScore} - {h.awayScore}
                         </div>
                         <div className="flex items-center gap-2 w-1/3 justify-end">
                             <span className="text-xs text-white font-bold truncate">{h.awayTeam}</span>
                             <img src={h.awayLogo} className="w-6 h-6 rounded-full" alt="" referrerPolicy="no-referrer" />
                         </div>
                     </div>
                 ))}
             </div>
         )}

         {activeTab === 'ai' && (
             <div className="animate-fade-in space-y-4">
                 <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-900/40 border-2 border-purple-500/30 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><BrainCircuit size={150} className="text-white"/></div>
                     <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px]"></div>
                     <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-accent/20 rounded-full blur-[80px]"></div>
                     
                     <div className="flex items-center justify-between mb-6 relative z-10">
                       <h3 className="text-2xl font-black text-white italic flex items-center gap-3">
                           <div className="bg-purple-500 p-2 rounded-xl shadow-lg shadow-purple-500/30">
                               <Sparkles className="text-white" size={20} />
                           </div>
                           L'Analyse Gemini
                       </h3>
                       <div className="bg-brand-900/80 px-3 py-1.5 rounded-full border border-purple-500/30 flex items-center gap-2">
                           <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                           <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">IA Active</span>
                       </div>
                     </div>

                     <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 relative z-10">
                       <div className="text-slate-200 leading-relaxed font-medium text-sm italic">
                           "{aiAnalysis}"
                       </div>
                     </div>

                     <div className="mt-8 grid grid-cols-3 gap-3 relative z-10">
                         <div className="bg-brand-900/80 rounded-2xl p-4 text-center border border-purple-500/20 shadow-lg group hover:border-brand-accent transition-all">
                             <p className="text-[9px] text-purple-300 uppercase font-black tracking-tighter mb-1">Victoire {match.homeTeam}</p>
                             <p className="text-2xl font-black text-white font-mono">{match.aiProbabilities?.home || 33}%</p>
                             <div className="w-full h-1 bg-brand-800 rounded-full mt-2 overflow-hidden">
                               <div className="h-full bg-brand-accent" style={{ width: `${match.aiProbabilities?.home || 33}%` }}></div>
                             </div>
                         </div>
                         <div className="bg-brand-900/80 rounded-2xl p-4 text-center border border-purple-500/20 shadow-lg group hover:border-brand-accent transition-all">
                             <p className="text-[9px] text-purple-300 uppercase font-black tracking-tighter mb-1">Match Nul</p>
                             <p className="text-2xl font-black text-white font-mono">{match.aiProbabilities?.draw || 33}%</p>
                             <div className="w-full h-1 bg-brand-800 rounded-full mt-2 overflow-hidden">
                               <div className="h-full bg-slate-400" style={{ width: `${match.aiProbabilities?.draw || 33}%` }}></div>
                             </div>
                         </div>
                         <div className="bg-brand-900/80 rounded-2xl p-4 text-center border border-purple-500/20 shadow-lg group hover:border-brand-accent transition-all">
                             <p className="text-[9px] text-purple-300 uppercase font-black tracking-tighter mb-1">Victoire {match.awayTeam}</p>
                             <p className="text-2xl font-black text-white font-mono">{match.aiProbabilities?.away || 33}%</p>
                             <div className="w-full h-1 bg-brand-800 rounded-full mt-2 overflow-hidden">
                               <div className="h-full bg-red-500" style={{ width: `${match.aiProbabilities?.away || 33}%` }}></div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'tips' && (
              <div className="animate-fade-in space-y-4">
                  <div className="bg-brand-800 rounded-2xl p-5 border border-brand-700 shadow-xl">
                      <div className="flex items-center gap-2 mb-4">
                          <Trophy className="text-yellow-500" size={20} />
                          <h3 className="text-white font-black uppercase italic">Conseils d'Experts</h3>
                      </div>
                      <div className="space-y-4">
                          <div className="bg-brand-900/50 p-4 rounded-xl border-l-4 border-brand-accent">
                              <p className="text-brand-accent text-[10px] font-black uppercase mb-1">Option Recommandée</p>
                              <p className="text-white font-bold text-sm">Plus de 1.5 buts dans le match</p>
                              <p className="text-slate-400 text-xs mt-1">L'historique des deux équipes montre une forte tendance offensive.</p>
                          </div>
                          <div className="bg-brand-900/50 p-4 rounded-xl border-l-4 border-blue-500">
                              <p className="text-blue-400 text-[10px] font-black uppercase mb-1">Score Exact Probable</p>
                              <p className="text-white font-bold text-sm">2 - 1 ou 1 - 1</p>
                              <p className="text-slate-400 text-xs mt-1">Basé sur les simulations de forme actuelle.</p>
                          </div>
                          <div className="bg-brand-900/50 p-4 rounded-xl border-l-4 border-purple-500">
                              <p className="text-purple-400 text-[10px] font-black uppercase mb-1">Cote de Valeur</p>
                              <p className="text-white font-bold text-sm">Buteur : {match.homeTeam} (Attaquant Principal)</p>
                              <p className="text-slate-400 text-xs mt-1">Excellente forme lors des 3 derniers matchs.</p>
                          </div>
                      </div>
                      <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                          <p className="text-[10px] text-yellow-500 font-bold uppercase">Attention : Les paris sportifs comportent des risques. Jouez responsable.</p>
                      </div>
                  </div>
              </div>
          )}
      </div>

    </div>
  );
};

export default MatchDetail;
