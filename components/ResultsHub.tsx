
import React, { useState, useEffect } from 'react';
import { Match, SportType } from '../types';
import { fetchMatchesByDate, getFlag } from '../services/sportApiService';
import { generateDailySummary } from '../services/geminiService';
import { Calendar, ChevronLeft, ChevronRight, Trophy, Activity, Sparkles, Filter, Eye, ListOrdered } from 'lucide-react';
import Standings from './Standings';

interface ResultsHubProps {
    onOpenDetails: (match: Match) => void;
}

const ResultsHub: React.FC<ResultsHubProps> = ({ onOpenDetails }) => {
  const [viewMode, setViewMode] = useState<'results' | 'standings'>('results');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [filterLeague, setFilterLeague] = useState<string>('all');

  // Generate last 7 days + next 3 days
  const getDates = () => {
    const dates = [];
    for(let i = -6; i <= 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d);
    }
    return dates;
  };
  const dateList = getDates();

  useEffect(() => {
     loadMatches(selectedDate);
     setSummary(null); // Reset AI summary on date change
  }, [selectedDate]);

  const loadMatches = async (date: Date) => {
      setLoading(true);
      const data = await fetchMatchesByDate(date);
      setMatches(data);
      setLoading(false);
  };

  const handleAiAnalysis = async () => {
      if (matches.length === 0) return;
      setLoadingSummary(true);
      const dateStr = selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      const result = await generateDailySummary(matches, dateStr);
      setSummary(result);
      setLoadingSummary(false);
  };

  const filteredMatches = matches.filter(m => {
      return (selectedSport === 'all' || m.sport === selectedSport) &&
             (filterLeague === 'all' || m.league === filterLeague);
  });

  // Extract unique leagues for filter
  const leagues = Array.from(new Set(matches.map(m => m.league)));

  const formatDateBtn = (date: Date) => {
      const today = new Date();
      if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
      
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) return "Hier";
      
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="pb-24 animate-fade-in space-y-4">
        
        {/* Header */}
        <div className="bg-brand-800 p-4 border-b border-brand-700">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-2">
                    <Trophy className="text-brand-accent" /> Résultats
                </h2>
                
                <div className="flex bg-brand-900 rounded-lg p-1">
                    <button 
                        onClick={() => setViewMode('results')}
                        className={`px-3 py-1 text-xs font-bold rounded transition-colors ${viewMode === 'results' ? 'bg-brand-700 text-white' : 'text-slate-400'}`}
                    >
                        Scores
                    </button>
                    <button 
                        onClick={() => setViewMode('standings')}
                        className={`px-3 py-1 text-xs font-bold rounded transition-colors ${viewMode === 'standings' ? 'bg-brand-700 text-white' : 'text-slate-400'}`}
                    >
                        Classements
                    </button>
                </div>
            </div>
            
            {viewMode === 'results' && (
                <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
                    {dateList.map((d, i) => {
                        const isSelected = d.toDateString() === selectedDate.toDateString();
                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(d)}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-brand-accent text-brand-900 scale-105 shadow-lg' : 'bg-brand-900 text-slate-400 border border-brand-700'}`}
                            >
                                {formatDateBtn(d)}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>

        {viewMode === 'results' ? (
            <>
                {/* Filters & AI */}
                <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar">
                    <button 
                        onClick={handleAiAnalysis} 
                        disabled={loadingSummary || matches.length === 0}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap"
                    >
                        {loadingSummary ? <span className="animate-spin">⏳</span> : <Sparkles size={14} />} 
                        Analyse Journalière I.A
                    </button>

                    <select 
                        value={selectedSport} 
                        onChange={(e) => setSelectedSport(e.target.value as any)}
                        className="bg-brand-900 text-white text-xs font-bold px-3 py-2 rounded-lg border border-brand-700 outline-none"
                    >
                        <option value="all">Tous Sports</option>
                        <option value="football">Football</option>
                        <option value="basketball">Basketball</option>
                        <option value="tennis">Tennis</option>
                    </select>

                    <select 
                        value={filterLeague} 
                        onChange={(e) => setFilterLeague(e.target.value)}
                        className="bg-brand-900 text-white text-xs font-bold px-3 py-2 rounded-lg border border-brand-700 outline-none max-w-[120px]"
                    >
                        <option value="all">Toutes Ligues</option>
                        {leagues.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                {/* AI Summary Box */}
                {summary && (
                    <div className="mx-4 bg-brand-800/80 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 animate-fade-in shadow-xl">
                        <h3 className="text-purple-400 text-xs font-black uppercase mb-2 flex items-center gap-2">
                            <Sparkles size={14} /> Le Résumé de Gemini
                        </h3>
                        <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                            {summary}
                        </div>
                    </div>
                )}

                {/* Results List */}
                <div className="px-4 space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-2 border-brand-accent rounded-full border-t-transparent"></div></div>
                    ) : filteredMatches.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 italic border border-dashed border-brand-700 rounded-xl">
                            Aucun match trouvé pour cette date.
                        </div>
                    ) : (
                        filteredMatches.map(match => (
                            <div key={match.id} className="bg-brand-800 rounded-xl border border-brand-700 overflow-hidden hover:border-brand-600 transition-colors">
                                <div className="bg-brand-900/50 px-3 py-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                                    <span className="flex items-center gap-1">
                                        {match.countryCode && (
                                            getFlag(match.countryCode).startsWith('http') 
                                            ? <img src={getFlag(match.countryCode)} className="w-4 h-3 object-cover rounded-sm" alt="flag" referrerPolicy="no-referrer" />
                                            : <span>{getFlag(match.countryCode)}</span>
                                        )}
                                        {match.league}
                                    </span>
                                    <span>{match.status === 'finished' ? 'Terminé' : match.time}</span>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex flex-col items-center gap-1 flex-1">
                                        <div className="relative">
                                            <img src={match.homeLogo} className="w-8 h-8 rounded-full bg-brand-700 p-0.5" referrerPolicy="no-referrer" />
                                            {match.homeCountryCode && !match.homeLogo?.includes('flagcdn.com') && (
                                                <div className="absolute -bottom-1 -right-1 shadow-md">
                                                    {getFlag(match.homeCountryCode).startsWith('http') 
                                                        ? <img src={getFlag(match.homeCountryCode)} className="w-3 h-2 object-cover rounded-sm border border-brand-900" alt="flag" referrerPolicy="no-referrer" />
                                                        : <span className="bg-brand-900 rounded-full px-0.5 text-[6px]">{getFlag(match.homeCountryCode)}</span>
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-white text-center">{match.homeTeam}</span>
                                    </div>
                                    
                                    <div className="bg-brand-900 px-4 py-2 rounded-lg border border-brand-700 text-center mx-2 min-w-[80px]">
                                        <div className="text-xl font-black text-white tracking-widest">
                                            {match.homeScore} - {match.awayScore}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-1 flex-1">
                                        <div className="relative">
                                            <img src={match.awayLogo} className="w-8 h-8 rounded-full bg-brand-700 p-0.5" referrerPolicy="no-referrer" />
                                            {match.awayCountryCode && !match.awayLogo?.includes('flagcdn.com') && (
                                                <div className="absolute -bottom-1 -right-1 shadow-md">
                                                    {getFlag(match.awayCountryCode).startsWith('http') 
                                                        ? <img src={getFlag(match.awayCountryCode)} className="w-3 h-2 object-cover rounded-sm border border-brand-900" alt="flag" referrerPolicy="no-referrer" />
                                                        : <span className="bg-brand-900 rounded-full px-0.5 text-[6px]">{getFlag(match.awayCountryCode)}</span>
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-white text-center">{match.awayTeam}</span>
                                    </div>
                                </div>
                                
                                {match.status === 'finished' && (
                                    <button 
                                        onClick={() => onOpenDetails(match)}
                                        className="w-full bg-brand-700/30 hover:bg-brand-700 text-slate-400 hover:text-white py-2 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Eye size={12} /> Voir Détails & Buteurs
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </>
        ) : (
            <div className="space-y-4">
                <div className="px-4">
                    <select 
                        value={filterLeague}
                        onChange={(e) => setFilterLeague(e.target.value)}
                        className="w-full bg-brand-900 text-white p-3 rounded-xl border border-brand-700"
                    >
                        <option value="all">Choisir une ligue...</option>
                        {leagues.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <Standings league={filterLeague === 'all' ? 'Premier League' : filterLeague} />
            </div>
        )}
    </div>
  );
};

export default ResultsHub;
