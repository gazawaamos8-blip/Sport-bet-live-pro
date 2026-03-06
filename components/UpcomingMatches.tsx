import React, { useState, useEffect } from 'react';
import { Match, BetSlipItem } from '../types';
import { fetchMatches, toggleMatchFavorite, subscribeToMatchUpdates, getFlag } from '../services/sportApiService';
import { Star, Clock, Calendar, Bell } from 'lucide-react';

interface UpcomingMatchesProps {
    onOpenDetails: (match: Match) => void;
    onAddToSlip: (item: BetSlipItem) => void;
}

const UpcomingMatches: React.FC<UpcomingMatchesProps> = ({ onOpenDetails, onAddToSlip }) => {
    const [allUpcoming, setAllUpcoming] = useState<Match[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [now, setNow] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>('today');

    useEffect(() => {
        const load = async () => {
            const all = await fetchMatches();
            const upcoming = all.filter(m => m.status === 'upcoming');
            setAllUpcoming(upcoming);
            filterMatches(upcoming, 'today');
        };
        load();

        const unsubscribe = subscribeToMatchUpdates((updated) => {
            const upcoming = updated.filter(m => m.status === 'upcoming');
            setAllUpcoming(upcoming);
            filterMatches(upcoming, selectedDate);
        });

        // Timer for countdowns - updates every second
        const interval = setInterval(() => setNow(new Date()), 1000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const filterMatches = (data: Match[], dateKey: string) => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(today.getDate() + 2);

        let filtered = data;
        if (dateKey === 'today') {
            filtered = data.filter(m => new Date(m.startDate).getDate() === today.getDate());
        } else if (dateKey === 'tomorrow') {
            filtered = data.filter(m => new Date(m.startDate).getDate() === tomorrow.getDate());
        } else if (dateKey === 'later') {
            filtered = data.filter(m => new Date(m.startDate).getDate() >= dayAfter.getDate());
        }
        setMatches(filtered);
    };

    const handleDateChange = (key: string) => {
        setSelectedDate(key);
        filterMatches(allUpcoming, key);
    };

    const getCountdown = (targetDate: Date) => {
        const dateObj = new Date(targetDate);
        const diff = dateObj.getTime() - now.getTime();
        
        if (diff <= 0) return "En cours";
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) return `${days}j ${hours}h`;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        toggleMatchFavorite(id);
    };

    return (
        <div className="pb-24 space-y-4 animate-fade-in">
            <div className="bg-brand-800 p-4 border-b border-brand-700 sticky top-16 z-10 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-2">
                            <Calendar className="text-brand-accent" /> À Venir
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Ne manquez pas les prochains chocs</p>
                    </div>
                    <div className="bg-brand-900 border border-brand-700 px-3 py-1 rounded-full text-xs font-bold text-slate-300">
                        {matches.length} Matchs
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { k: 'today', l: "Aujourd'hui" },
                        { k: 'tomorrow', l: 'Demain' },
                        { k: 'later', l: 'Plus tard' }
                    ].map(d => (
                        <button
                            key={d.k}
                            onClick={() => handleDateChange(d.k)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-all ${selectedDate === d.k ? 'bg-brand-accent text-brand-900 shadow-lg' : 'bg-brand-900 text-slate-400 border border-brand-700'}`}
                        >
                            {d.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 space-y-3">
                {matches.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 border border-dashed border-brand-700 rounded-xl bg-brand-800/50">
                        <Calendar size={40} className="mx-auto mb-2 opacity-20" />
                        Aucun match prévu prochainement.
                    </div>
                ) : (
                    matches.map(match => (
                        <div key={match.id} className="bg-brand-800 rounded-xl border border-brand-700 overflow-hidden relative group hover:border-brand-600 transition-all shadow-md">
                             <div className="bg-brand-900/50 px-3 py-2 flex justify-between items-center text-[10px] font-bold uppercase text-slate-400 border-b border-brand-700/50">
                                 <span className="flex items-center gap-1">
                                     {match.countryCode && (
                                         getFlag(match.countryCode).startsWith('http') 
                                         ? <img src={getFlag(match.countryCode)} className="w-4 h-3 object-cover rounded-sm" alt="flag" referrerPolicy="no-referrer" />
                                         : <span>{getFlag(match.countryCode)}</span>
                                     )}
                                     {match.league}
                                 </span>
                                 <span className="flex items-center gap-1 text-brand-accent font-mono"><Clock size={12}/> {getCountdown(match.startDate)}</span>
                             </div>

                             <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-brand-700/20 transition-colors" onClick={() => onOpenDetails(match)}>
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <div className="relative group/team">
                                        <div className="w-12 h-12 rounded-full bg-brand-700 p-1 border border-brand-600 shadow-lg">
                                            <img src={match.homeLogo} className="w-full h-full rounded-full object-cover" alt={match.homeTeam} referrerPolicy="no-referrer" />
                                        </div>
                                        {match.homeCountryCode && !match.homeLogo?.includes('flagcdn.com') && (
                                            <div className="absolute -bottom-1 -right-1 shadow-md">
                                                {getFlag(match.homeCountryCode).startsWith('http') 
                                                    ? <img src={getFlag(match.homeCountryCode)} className="w-4 h-3 object-cover rounded-sm border border-brand-900" alt="flag" referrerPolicy="no-referrer" />
                                                    : <span className="bg-brand-900 rounded-full px-1 text-[8px]">{getFlag(match.homeCountryCode)}</span>
                                                }
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-white text-center line-clamp-1 leading-tight">{match.homeTeam}</span>
                                </div>

                                <div className="flex flex-col items-center justify-center px-2">
                                    <div className="text-slate-500 text-[10px] font-black tracking-widest mb-1">VS</div>
                                    <div className="bg-brand-900 px-2 py-1 rounded text-xs font-bold text-slate-300 border border-brand-700">{match.time}</div>
                                </div>

                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <div className="relative group/team">
                                        <div className="w-12 h-12 rounded-full bg-brand-700 p-1 border border-brand-600 shadow-lg">
                                            <img src={match.awayLogo} className="w-full h-full rounded-full object-cover" alt={match.awayTeam} referrerPolicy="no-referrer" />
                                        </div>
                                        {match.awayCountryCode && !match.awayLogo?.includes('flagcdn.com') && (
                                            <div className="absolute -bottom-1 -right-1 shadow-md">
                                                {getFlag(match.awayCountryCode).startsWith('http') 
                                                    ? <img src={getFlag(match.awayCountryCode)} className="w-4 h-3 object-cover rounded-sm border border-brand-900" alt="flag" referrerPolicy="no-referrer" />
                                                    : <span className="bg-brand-900 rounded-full px-1 text-[8px]">{getFlag(match.awayCountryCode)}</span>
                                                }
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-white text-center line-clamp-1 leading-tight">{match.awayTeam}</span>
                                </div>

                                <div className="absolute top-10 right-2">
                                    <button 
                                        onClick={(e) => handleToggleFavorite(e, match.id)}
                                        className={`p-2 rounded-full transition-colors ${match.isFavorite ? 'text-yellow-400 scale-110' : 'text-slate-600 hover:text-white'}`}
                                    >
                                        <Star size={16} fill={match.isFavorite ? "currentColor" : "none"} />
                                    </button>
                                </div>
                             </div>

                             {/* Quick Odds Buttons - Adds to Coupon */}
                             <div className="grid grid-cols-3 divide-x divide-brand-700 border-t border-brand-700 bg-brand-900/30">
                                {[
                                    { l: '1', v: match.odds.home, s: 'home' },
                                    { l: 'X', v: match.odds.draw, s: 'draw' },
                                    { l: '2', v: match.odds.away, s: 'away' }
                                ].map((o) => (
                                    <button 
                                        key={o.l}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddToSlip({
                                                matchId: match.id,
                                                selection: o.s as any,
                                                odds: o.v,
                                                matchInfo: `${match.homeTeam} vs ${match.awayTeam}`,
                                                league: match.league,
                                                sport: match.sport,
                                                countryCode: match.countryCode,
                                                homeCountryCode: match.homeCountryCode,
                                                awayCountryCode: match.awayCountryCode
                                            });
                                        }}
                                        className="py-2 hover:bg-brand-700 transition-colors flex flex-col items-center group/odd active:bg-brand-accent/20"
                                    >
                                        <span className="text-[9px] text-slate-500 font-bold group-hover/odd:text-brand-accent transition-colors">{o.l}</span>
                                        <span className="text-sm font-black text-white">{o.v.toFixed(2)}</span>
                                    </button>
                                ))}
                             </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UpcomingMatches;