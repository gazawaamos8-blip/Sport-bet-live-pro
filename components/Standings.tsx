
import React, { useState, useEffect } from 'react';
import { fetchStandings } from '../services/sportApiService';
import { Standing } from '../types';
import { Trophy, Info, ChevronDown, Filter, TrendingUp, AlertCircle } from 'lucide-react';

interface StandingsProps {
    league: string;
}

const Standings: React.FC<StandingsProps> = ({ league }) => {
    const [standings, setStandings] = useState<Standing[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFullStats, setShowFullStats] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await fetchStandings(league);
            setStandings(data);
            setLoading(false);
        };
        load();
    }, [league]);

    if (loading) return (
        <div className="p-10 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Chargement du classement pro...</p>
        </div>
    );

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header Info */}
            <div className="px-4 flex justify-between items-end">
                <div>
                    <h3 className="text-white font-black uppercase italic text-lg flex items-center gap-2">
                        <Trophy size={20} className="text-brand-accent" /> Classement <span className="text-brand-accent">Pro</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{league} • Saison 2024/25</p>
                </div>
                <button 
                    onClick={() => setShowFullStats(!showFullStats)}
                    className="bg-brand-800 border border-brand-700 px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase flex items-center gap-2 hover:border-brand-accent transition-colors"
                >
                    <Filter size={12} /> {showFullStats ? 'Stats Simples' : 'Stats Complètes'}
                </button>
            </div>

            {/* Legend */}
            <div className="px-4 flex gap-4 overflow-x-auto no-scrollbar pb-1">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Champions League</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Europa League</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Relégation</span>
                </div>
            </div>

            <div className="bg-brand-800 rounded-2xl overflow-hidden border border-brand-700 mx-4 shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand-900/50 text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                <th className="p-4 text-center w-12">Pos</th>
                                <th className="p-4">Équipe</th>
                                <th className="p-4 text-center">J</th>
                                {showFullStats && (
                                    <>
                                        <th className="p-4 text-center">V</th>
                                        <th className="p-4 text-center">N</th>
                                        <th className="p-4 text-center">D</th>
                                        <th className="p-4 text-center">BP</th>
                                        <th className="p-4 text-center">BC</th>
                                    </>
                                )}
                                <th className="p-4 text-center">Diff</th>
                                <th className="p-4 text-center">Pts</th>
                                <th className="p-4 text-center">Forme</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-white divide-y divide-brand-700/50">
                            {standings.map((row) => (
                                <tr key={row.team.id} className="hover:bg-brand-700/30 transition-colors group">
                                    <td className="p-4 text-center font-bold">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg bg-brand-900 text-slate-400">
                                            {row.rank}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={row.team.logo} className="w-8 h-8 rounded-full bg-white/5 p-1 group-hover:scale-110 transition-transform" alt={row.team.name} referrerPolicy="no-referrer" />
                                                {row.rank === 1 && <Trophy size={12} className="absolute -top-1 -right-1 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />}
                                            </div>
                                            <div>
                                                <span className="font-black text-sm block group-hover:text-brand-accent transition-colors">{row.team.name}</span>
                                                <span className="text-[9px] text-slate-500 font-bold uppercase">{row.team.country || 'Elite'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-bold text-slate-400">{row.played}</td>
                                    {showFullStats && (
                                        <>
                                            <td className="p-4 text-center text-green-500/80 font-bold">{Math.floor(row.points / 3)}</td>
                                            <td className="p-4 text-center text-slate-500 font-bold">{Math.floor((row.played - Math.floor(row.points / 3)) / 2)}</td>
                                            <td className="p-4 text-center text-red-500/80 font-bold">{row.played - Math.floor(row.points / 3) - Math.floor((row.played - Math.floor(row.points / 3)) / 2)}</td>
                                            <td className="p-4 text-center text-slate-500">{row.played * 2}</td>
                                            <td className="p-4 text-center text-slate-500">{row.played * 2 - row.goalsDiff}</td>
                                        </>
                                    )}
                                    <td className="p-4 text-center font-bold text-slate-400">
                                        {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-brand-accent font-black text-base drop-shadow-[0_0_8px_rgba(0,208,98,0.3)]">{row.points}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {row.form.split('').map((f, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`w-2.5 h-2.5 rounded-sm flex items-center justify-center text-[6px] font-black ${
                                                        f === 'W' ? 'bg-slate-500 text-white' : 
                                                        f === 'D' ? 'bg-slate-600 text-white' : 
                                                        'bg-slate-700 text-white'
                                                    }`}
                                                    title={f === 'W' ? 'Victoire' : f === 'D' ? 'Nul' : 'Défaite'}
                                                >
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="px-6 py-4 bg-brand-900/30 border-t border-brand-700 mx-4 rounded-b-2xl flex items-start gap-3">
                <Info size={16} className="text-slate-500 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    Le classement est mis à jour en temps réel après chaque match. Les 4 premières équipes se qualifient pour la phase de groupes de la <span className="text-blue-400 font-bold">Champions League</span>. Les 3 dernières sont reléguées en division inférieure.
                </p>
            </div>
        </div>
    );
};

export default Standings;
