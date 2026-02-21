import React from 'react';
import { Trophy, Medal, TrendingUp, User as UserIcon } from 'lucide-react';

const LEADERS = [
    { id: 1, name: "Moussa K.", winRate: 82, profit: 1250000, avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
    { id: 2, name: "Fatou D.", winRate: 78, profit: 980000, avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
    { id: 3, name: "Jean-Paul B.", winRate: 75, profit: 850000, avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
    { id: 4, name: "Awa S.", winRate: 72, profit: 620000, avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
    { id: 5, name: "Ibrahim T.", winRate: 70, profit: 540000, avatar: "https://randomuser.me/api/portraits/men/5.jpg" },
];

const Leaderboard: React.FC = () => {
    return (
        <div className="p-4 animate-fade-in space-y-6 pb-20">
            <div className="text-center space-y-2">
                <div className="inline-block p-3 bg-yellow-500/20 rounded-full border border-yellow-500/30 mb-2">
                    <Trophy className="text-yellow-500" size={32} />
                </div>
                <h2 className="text-2xl font-black text-white italic uppercase">Classement Pro</h2>
                <p className="text-slate-400 text-xs">Les parieurs les plus performants de la semaine.</p>
            </div>

            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-2 pt-10 pb-6">
                {/* 2nd */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img src={LEADERS[1].avatar} className="w-16 h-16 rounded-full border-4 border-slate-400 shadow-lg" alt="2nd" />
                        <div className="absolute -top-2 -right-2 bg-slate-400 text-brand-900 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">2</div>
                    </div>
                    <div className="bg-brand-800 h-24 w-24 mt-2 rounded-t-xl border-t-2 border-slate-400 flex flex-col items-center justify-center">
                        <span className="text-white font-bold text-[10px]">{LEADERS[1].name}</span>
                        <span className="text-slate-400 text-[8px] font-black uppercase">{LEADERS[1].profit.toLocaleString()} F</span>
                    </div>
                </div>

                {/* 1st */}
                <div className="flex flex-col items-center scale-110 z-10">
                    <div className="relative">
                        <img src={LEADERS[0].avatar} className="w-20 h-20 rounded-full border-4 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]" alt="1st" />
                        <div className="absolute -top-3 -right-3 bg-yellow-500 text-brand-900 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">1</div>
                        <Medal className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-yellow-500" size={24} />
                    </div>
                    <div className="bg-brand-800 h-32 w-28 mt-2 rounded-t-xl border-t-4 border-yellow-500 flex flex-col items-center justify-center shadow-2xl">
                        <span className="text-white font-black text-xs">{LEADERS[0].name}</span>
                        <span className="text-yellow-500 text-[10px] font-black uppercase">{LEADERS[0].profit.toLocaleString()} F</span>
                    </div>
                </div>

                {/* 3rd */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img src={LEADERS[2].avatar} className="w-16 h-16 rounded-full border-4 border-orange-600 shadow-lg" alt="3rd" />
                        <div className="absolute -top-2 -right-2 bg-orange-600 text-brand-900 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">3</div>
                    </div>
                    <div className="bg-brand-800 h-20 w-24 mt-2 rounded-t-xl border-t-2 border-orange-600 flex flex-col items-center justify-center">
                        <span className="text-white font-bold text-[10px]">{LEADERS[2].name}</span>
                        <span className="text-slate-400 text-[8px] font-black uppercase">{LEADERS[2].profit.toLocaleString()} F</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-2">
                {LEADERS.map((leader, idx) => (
                    <div key={leader.id} className="bg-brand-800 p-4 rounded-xl border border-brand-700 flex items-center gap-4">
                        <span className="text-slate-500 font-black w-4">{idx + 1}</span>
                        <img src={leader.avatar} className="w-10 h-10 rounded-full border border-brand-600" alt={leader.name} />
                        <div className="flex-1">
                            <p className="text-white font-bold text-sm">{leader.name}</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                                <span className="text-green-500 flex items-center gap-0.5"><TrendingUp size={10}/> {leader.winRate}% Win</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-400">{leader.profit.toLocaleString()} F Profit</span>
                            </div>
                        </div>
                        <div className="bg-brand-900 px-2 py-1 rounded border border-brand-700">
                            <ChevronRight size={16} className="text-slate-500" />
                        </div>
                    </div>
                ))}
            </div>

            {/* User Stats */}
            <div className="bg-brand-accent text-brand-900 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-900/20 p-2 rounded-full"><UserIcon size={20}/></div>
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-60">Votre Rang</p>
                        <p className="font-black">#1,245</p>
                    </div>
                </div>
                <button className="bg-brand-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">Voir Détails</button>
            </div>
        </div>
    );
};

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6"/>
    </svg>
);

export default Leaderboard;
