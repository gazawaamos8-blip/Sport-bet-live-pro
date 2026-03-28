import React, { useState } from 'react';
import { Trophy, Medal, TrendingUp, User as UserIcon, X, Target, Zap, Activity, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LEADERS = [
    { id: 1, name: "Moussa K.", winRate: 82, profit: 1250000, avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
    { id: 2, name: "Fatou D.", winRate: 78, profit: 980000, avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
    { id: 3, name: "Jean-Paul B.", winRate: 75, profit: 850000, avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
    { id: 4, name: "Awa S.", winRate: 72, profit: 620000, avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
    { id: 5, name: "Ibrahim T.", winRate: 70, profit: 540000, avatar: "https://randomuser.me/api/portraits/men/5.jpg" },
];

const Leaderboard: React.FC = () => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="p-4 animate-fade-in space-y-6 pb-20">
            <div className="text-center space-y-2">
                <div className="inline-block p-3 bg-yellow-500/20 rounded-full border border-yellow-500/30 mb-2">
                    <Trophy className="text-yellow-500" size={32} />
                </div>
                <h2 className="text-2xl font-black text-white italic uppercase">Classement <span className="text-brand-accent">PRO</span></h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Elite des Parieurs de la Semaine</p>
            </div>

            {/* Pro Stats Summary */}
            <div className="grid grid-cols-3 gap-2 px-2">
                <div className="bg-brand-800/50 p-3 rounded-xl border border-brand-700 text-center">
                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Total Gains</p>
                    <p className="text-xs font-black text-white">45.2M F</p>
                </div>
                <div className="bg-brand-800/50 p-3 rounded-xl border border-brand-700 text-center">
                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Win Rate Avg</p>
                    <p className="text-xs font-black text-brand-accent">68%</p>
                </div>
                <div className="bg-brand-800/50 p-3 rounded-xl border border-brand-700 text-center">
                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Mises Totales</p>
                    <p className="text-xs font-black text-white">12.8k</p>
                </div>
            </div>

            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-2 pt-10 pb-6">
                {/* 2nd */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img src={LEADERS[1].avatar} className="w-16 h-16 rounded-full border-4 border-slate-400 shadow-lg" alt="2nd" referrerPolicy="no-referrer" />
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
                        <img src={LEADERS[0].avatar} className="w-20 h-20 rounded-full border-4 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]" alt="1st" referrerPolicy="no-referrer" />
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
                        <img src={LEADERS[2].avatar} className="w-16 h-16 rounded-full border-4 border-orange-600 shadow-lg" alt="3rd" referrerPolicy="no-referrer" />
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
                        <img src={leader.avatar} className="w-10 h-10 rounded-full border border-brand-600" alt={leader.name} referrerPolicy="no-referrer" />
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
                <button 
                    onClick={() => setShowDetails(true)}
                    className="bg-brand-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-brand-800 transition-colors"
                >
                    Voir Détails
                </button>
            </div>

            <AnimatePresence>
                {showDetails && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-brand-800 w-full max-w-sm rounded-3xl border border-brand-700 shadow-2xl overflow-hidden"
                        >
                            <div className="p-5 bg-brand-900 border-b border-brand-700 flex justify-between items-center">
                                <h3 className="font-black text-white italic uppercase flex items-center gap-2">
                                    <Activity className="text-brand-accent" size={18} /> Détails Performance
                                </h3>
                                <button onClick={() => setShowDetails(false)} className="p-2 bg-brand-800 rounded-full text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-brand-accent/20 flex items-center justify-center border-2 border-brand-accent">
                                        <UserIcon size={32} className="text-brand-accent" />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-lg">Vous</p>
                                        <p className="text-slate-500 text-xs font-bold uppercase">Rang Actuel: <span className="text-brand-accent">#1,245</span></p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-brand-900/50 p-4 rounded-2xl border border-brand-700">
                                        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Win Rate</p>
                                        <p className="text-xl font-black text-white">64.5%</p>
                                        <div className="w-full h-1 bg-brand-800 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-brand-accent w-[64.5%]"></div>
                                        </div>
                                    </div>
                                    <div className="bg-brand-900/50 p-4 rounded-2xl border border-brand-700">
                                        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Profit Net</p>
                                        <p className="text-xl font-black text-green-500">+85k F</p>
                                        <p className="text-[8px] text-slate-500 mt-1">Ce mois-ci</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Analyses Avancées</h4>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Précision Combinés', value: 42, icon: Zap, color: 'text-yellow-500' },
                                            { label: 'Efficacité Live', value: 78, icon: Target, color: 'text-red-500' },
                                            { label: 'Score de Discipline', value: 92, icon: ShieldCheck, color: 'text-blue-400' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between bg-brand-900/30 p-3 rounded-xl border border-brand-700/50">
                                                <div className="flex items-center gap-3">
                                                    <item.icon size={16} className={item.color} />
                                                    <span className="text-xs font-bold text-slate-300">{item.label}</span>
                                                </div>
                                                <span className="text-xs font-black text-white">{item.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setShowDetails(false)}
                                    className="w-full py-4 bg-brand-accent text-brand-900 font-black uppercase rounded-2xl shadow-lg shadow-brand-accent/20 active:scale-95 transition-all"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ShieldCheck = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        <path d="m9 12 2 2 4-4"/>
    </svg>
);

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6"/>
    </svg>
);

export default Leaderboard;
