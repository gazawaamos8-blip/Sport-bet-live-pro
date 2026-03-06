import React, { useState, useEffect } from 'react';
import { Match, MatchEvent, Lineup, LineupPlayer, SportType } from '../types';
import { fetchLineups, fetchH2H, getFlag } from '../services/sportApiService';
import { analyzeMatch } from '../services/geminiService';
import { X, Trophy, Activity, Camera, Timer, User as UserIcon, Sparkles, Users, History, BrainCircuit, Shirt } from 'lucide-react';
import MatchTracker from './MatchTracker';

interface MatchDetailProps {
  match: Match;
  onClose: () => void;
}

const StatBar: React.FC<{ label: string, home: number, away: number, total?: number }> = ({ label, home, away, total }) => {
  const max = total || (home + away || 1);
  const homePct = (home / max) * 100;
  const awayPct = (away / max) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
        <span>{home}</span>
        <span className="text-slate-500 uppercase">{label}</span>
        <span>{away}</span>
      </div>
      <div className="flex h-2 bg-brand-800 rounded-full overflow-hidden">
        <div className="bg-brand-accent transition-all duration-500" style={{ width: `${homePct}%` }}></div>
        <div className="bg-red-500 transition-all duration-500" style={{ width: `${awayPct}%` }}></div>
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
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 bg-brand-800 p-2 rounded-lg">
            <span className="flex items-center gap-2"><UserIcon size={12}/> Coach: {lineup.coach.name}</span>
            <span className="bg-brand-900 px-2 py-1 rounded text-white border border-brand-700">{lineup.formation}</span>
        </div>
        <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-brand-accent mb-1 border-b border-brand-800 pb-1">Titulaires</p>
            {lineup.startXI.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-brand-800/30 p-2 rounded-lg border border-brand-800 hover:bg-brand-800 transition-colors">
                    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-xs font-black text-white shadow-md border border-white/10`}>
                        {p.number}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white leading-none">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.pos}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const MatchDetail: React.FC<MatchDetailProps> = ({ match, onClose }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'stats' | 'lineups' | 'ai' | 'tips' | 'h2h'>('timeline');
  const [lineups, setLineups] = useState<{ home: Lineup; away: Lineup } | null>(null);
  const [h2h, setH2h] = useState<Match[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

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
        <div className="p-4 flex justify-between items-start">
            <button onClick={onClose} className="p-2 bg-brand-800 rounded-full text-white hover:bg-brand-700"><X size={20} /></button>
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                    {match.countryCode && (
                        getFlag(match.countryCode).startsWith('http') 
                        ? <img src={getFlag(match.countryCode)} className="w-4 h-3 object-cover rounded-sm" alt="flag" referrerPolicy="no-referrer" />
                        : <span className="text-xs">{getFlag(match.countryCode)}</span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{match.league}</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                     {match.status === 'live' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                     <span className="font-mono text-brand-accent font-bold">{match.time}</span>
                </div>
            </div>
            <div className="w-9"></div> 
        </div>

        <div className="flex justify-between items-center px-6 pb-6 pt-2">
             <div className="flex flex-col items-center w-1/3">
                 <div className="relative">
                    <img src={match.homeLogo} className="w-16 h-16 rounded-full mb-2 bg-brand-800 p-2 border-2 border-brand-700" alt={match.homeTeam} referrerPolicy="no-referrer" />
                    {match.homeCountryCode && !match.homeLogo?.includes('flagcdn.com') && (
                        <div className="absolute bottom-2 right-0 shadow-lg">
                            {getFlag(match.homeCountryCode).startsWith('http') 
                                ? <img src={getFlag(match.homeCountryCode)} className="w-6 h-4 object-cover rounded-sm border border-brand-900" alt="flag" referrerPolicy="no-referrer" />
                                : <span className="bg-brand-900 rounded-full px-1 text-[10px]">{getFlag(match.homeCountryCode)}</span>
                            }
                        </div>
                    )}
                 </div>
                 <span className="text-sm font-black text-white text-center leading-tight">{match.homeTeam}</span>
             </div>
             <div className="text-5xl font-black text-white font-mono tracking-tighter whitespace-nowrap bg-brand-800 px-4 py-2 rounded-xl border border-brand-700">
                 {match.homeScore}-{match.awayScore}
             </div>
             <div className="flex flex-col items-center w-1/3">
                 <div className="relative">
                    <img src={match.awayLogo} className="w-16 h-16 rounded-full mb-2 bg-brand-800 p-2 border-2 border-brand-700" alt={match.awayTeam} referrerPolicy="no-referrer" />
                    {match.awayCountryCode && !match.awayLogo?.includes('flagcdn.com') && (
                        <div className="absolute bottom-2 right-0 shadow-lg">
                            {getFlag(match.awayCountryCode).startsWith('http') 
                                ? <img src={getFlag(match.awayCountryCode)} className="w-6 h-4 object-cover rounded-sm border border-brand-900" alt="flag" referrerPolicy="no-referrer" />
                                : <span className="bg-brand-900 rounded-full px-1 text-[10px]">{getFlag(match.awayCountryCode)}</span>
                            }
                        </div>
                    )}
                 </div>
                 <span className="text-sm font-black text-white text-center leading-tight">{match.awayTeam}</span>
             </div>
        </div>
        
        {/* Tabs */}
        <div className="flex px-4 gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
                { id: 'timeline', label: 'Live', icon: Timer },
                { id: 'stats', label: 'Stats', icon: Activity },
                { id: 'lineups', label: 'Joueurs', icon: Shirt },
                { id: 'h2h', label: 'H2H', icon: History },
                { id: 'ai', label: 'Gemini AI', icon: BrainCircuit },
                { id: 'tips', label: 'Tips Pro', icon: Trophy },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[90px] py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase transition-all ${activeTab === tab.id ? 'bg-brand-accent text-brand-900 shadow-lg' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
                >
                    <tab.icon size={14} /> {tab.label}
                </button>
            ))}
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full pb-10">
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
                 <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit size={100} className="text-white"/></div>
                     <h3 className="text-xl font-black text-white italic mb-4 flex items-center gap-2">
                         <Sparkles className="text-purple-400" /> L'Analyse Gemini
                     </h3>
                     <div className="text-slate-200 leading-relaxed font-medium">
                         {aiAnalysis}
                     </div>
                     <div className="mt-6 flex gap-2">
                         <div className="flex-1 bg-black/30 rounded-lg p-3 text-center border border-purple-500/20">
                             <p className="text-[10px] text-purple-300 uppercase font-bold">Confiance 1</p>
                             <p className="text-white font-bold">{match.aiProbabilities?.home || 33}%</p>
                         </div>
                         <div className="flex-1 bg-black/30 rounded-lg p-3 text-center border border-purple-500/20">
                             <p className="text-[10px] text-purple-300 uppercase font-bold">Confiance X</p>
                             <p className="text-white font-bold">{match.aiProbabilities?.draw || 33}%</p>
                         </div>
                         <div className="flex-1 bg-black/30 rounded-lg p-3 text-center border border-purple-500/20">
                             <p className="text-[10px] text-purple-300 uppercase font-bold">Confiance 2</p>
                             <p className="text-white font-bold">{match.aiProbabilities?.away || 33}%</p>
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
