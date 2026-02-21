
import React, { useState, useEffect } from 'react';
import { fetchStandings } from '../services/sportApiService';
import { Standing } from '../types';

interface StandingsProps {
    league: string;
}

const Standings: React.FC<StandingsProps> = ({ league }) => {
    const [standings, setStandings] = useState<Standing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await fetchStandings(league);
            setStandings(data);
            setLoading(false);
        };
        load();
    }, [league]);

    if (loading) return <div className="p-10 text-center animate-pulse text-slate-500">Chargement du classement...</div>;

    return (
        <div className="bg-brand-800 rounded-xl overflow-hidden border border-brand-700 mx-4">
            <div className="bg-brand-900 p-3 border-b border-brand-700 flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase">{league}</span>
                <span className="text-[10px] text-slate-500">Saison 2024/25</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-brand-800 text-[10px] text-slate-400 uppercase">
                            <th className="p-3 text-center w-10">#</th>
                            <th className="p-3">Équipe</th>
                            <th className="p-3 text-center">J</th>
                            <th className="p-3 text-center">Diff</th>
                            <th className="p-3 text-center">Pts</th>
                            <th className="p-3 text-center hidden md:table-cell">Forme</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs text-white divide-y divide-brand-700">
                        {standings.map((row) => (
                            <tr key={row.team.id} className="hover:bg-brand-700/50 transition-colors">
                                <td className="p-3 text-center font-bold">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center ${row.rank <= 4 ? 'bg-blue-600' : row.rank >= 18 ? 'bg-red-600' : 'bg-brand-900'}`}>
                                        {row.rank}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <img src={row.team.logo} className="w-6 h-6 rounded-full bg-white/10 p-0.5" alt={row.team.name} />
                                        <span className="font-bold">{row.team.name}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-center text-slate-400">{row.played}</td>
                                <td className="p-3 text-center text-slate-400">{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</td>
                                <td className="p-3 text-center font-black text-brand-accent text-sm">{row.points}</td>
                                <td className="p-3 hidden md:flex items-center justify-center gap-1">
                                    {row.form.split('').map((f, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${f === 'W' ? 'bg-green-500' : f === 'D' ? 'bg-yellow-500' : 'bg-red-500'}`} title={f}></div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Standings;
