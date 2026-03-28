import React, { useState } from 'react';
import { Gift, Sparkles, Zap, Clock, ChevronRight, CheckCircle2, Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/database';
import ShopModal from './ShopModal';

interface Promotion {
    id: string;
    title: string;
    description: string;
    code: string;
    type: 'bonus' | 'cashback' | 'freebet' | 'tournament';
    value: string;
    expiry: string;
    image: string;
    claimed: boolean;
}

const PROMOTIONS_DATA: Promotion[] = [
    {
        id: '1',
        title: "Bonus de Bienvenue 200%",
        description: "Doublez votre premier dépôt jusqu'à 100 000 XAF. Offre exclusive nouveaux joueurs.",
        code: "WELCOME200",
        type: 'bonus',
        value: "100k XAF",
        expiry: "31 Déc 2026",
        image: "https://picsum.photos/seed/promo1/800/400",
        claimed: false
    },
    {
        id: '2',
        title: "Cashback Lundi Perdu",
        description: "Récupérez 10% de vos pertes du weekend chaque lundi matin automatiquement.",
        code: "MONDAYBACK",
        type: 'cashback',
        value: "10%",
        expiry: "Permanent",
        image: "https://picsum.photos/seed/promo2/800/400",
        claimed: false
    },
    {
        id: '3',
        title: "Freebet Champions League",
        description: "Placez 5 000 XAF sur la LDC et recevez un pari gratuit de 2 000 XAF.",
        code: "UCLFREE",
        type: 'freebet',
        value: "2k XAF",
        expiry: "15 Nov 2026",
        image: "https://picsum.photos/seed/promo3/800/400",
        claimed: false
    },
    {
        id: '4',
        title: "Tournoi des Rois du Prono",
        description: "Participez au classement hebdomadaire et gagnez une part de la cagnotte de 1M XAF.",
        code: "KINGPRONO",
        type: 'tournament',
        value: "1M XAF",
        expiry: "Chaque Dimanche",
        image: "https://picsum.photos/seed/promo4/800/400",
        claimed: false
    }
];

const PromotionsHub: React.FC = () => {
    const [promos, setPromos] = useState<Promotion[]>(PROMOTIONS_DATA);
    const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
    const [claiming, setClaiming] = useState<string | null>(null);
    const [showShop, setShowShop] = useState(false);

    const handleClaim = (id: string) => {
        setClaiming(id);
        setTimeout(() => {
            setPromos(prev => prev.map(p => p.id === id ? { ...p, claimed: true } : p));
            setClaiming(null);
            // In a real app, we'd update the user's account/bonuses in DB
        }, 1500);
    };

    return (
        <div className="p-4 animate-fade-in space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white italic uppercase flex items-center gap-2">
                        <Gift className="text-brand-accent" /> Promotions
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Boostez vos gains</p>
                </div>
                <div className="bg-brand-accent/20 px-3 py-1 rounded-full border border-brand-accent/30">
                    <span className="text-[10px] font-black text-brand-accent uppercase">4 Offres Actives</span>
                </div>
            </div>

            {/* Featured Promo */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-brand-700 group cursor-pointer" onClick={() => setSelectedPromo(promos[0])}>
                <img 
                    src={promos[0].image} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt="Featured Promo"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-5 w-full">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="bg-brand-accent text-brand-900 text-[10px] font-black px-2 py-1 rounded mb-2 inline-block uppercase">Populaire</span>
                            <h3 className="text-xl font-black text-white leading-tight">{promos[0].title}</h3>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
                            <Zap size={20} className="text-brand-accent" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Promo Grid */}
            <div className="grid grid-cols-1 gap-4">
                {promos.map(promo => (
                    <div 
                        key={promo.id} 
                        className={`bg-brand-800 rounded-2xl border transition-all duration-300 overflow-hidden ${promo.claimed ? 'border-brand-accent/50 opacity-80' : 'border-brand-700 hover:border-brand-accent/30'}`}
                    >
                        <div className="p-4 flex gap-4">
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                promo.type === 'bonus' ? 'bg-orange-500/20 text-orange-500' :
                                promo.type === 'cashback' ? 'bg-blue-500/20 text-blue-500' :
                                promo.type === 'freebet' ? 'bg-green-500/20 text-green-500' :
                                'bg-purple-500/20 text-purple-500'
                            }`}>
                                {promo.type === 'bonus' && <Sparkles size={32} />}
                                {promo.type === 'cashback' && <Zap size={32} />}
                                {promo.type === 'freebet' && <Trophy size={32} />}
                                {promo.type === 'tournament' && <Star size={32} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-white font-bold text-sm">{promo.title}</h4>
                                    <span className="text-[10px] font-black text-brand-accent uppercase">{promo.value}</span>
                                </div>
                                <p className="text-slate-400 text-[10px] mt-1 line-clamp-2">{promo.description}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase">
                                        <Clock size={10} /> Expire: {promo.expiry}
                                    </div>
                                    <button 
                                        disabled={promo.claimed || claiming === promo.id}
                                        onClick={() => handleClaim(promo.id)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                            promo.claimed 
                                            ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/30' 
                                            : 'bg-brand-accent text-brand-900 hover:scale-105 active:scale-95'
                                        }`}
                                    >
                                        {claiming === promo.id ? 'Activation...' : promo.claimed ? 'Activé' : 'Activer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loyalty Program Section */}
            <div className="bg-gradient-to-r from-brand-accent/20 to-purple-600/20 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Trophy size={100} /></div>
                <div className="relative z-10">
                    <h3 className="text-white font-black uppercase italic text-lg mb-1">Programme de Fidélité</h3>
                    <p className="text-slate-300 text-xs mb-4">Gagnez des points à chaque pari et échangez-les contre des cadeaux réels.</p>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 h-2 bg-brand-900 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-accent w-[65%] shadow-[0_0_10px_#00d062]"></div>
                        </div>
                        <span className="text-[10px] font-black text-white">650 / 1000 pts</span>
                    </div>
                    <button 
                        onClick={() => setShowShop(true)}
                        className="w-full bg-white/10 backdrop-blur-md text-white font-bold py-2 rounded-xl text-xs uppercase border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                    >
                        Voir ma boutique <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* Shop Modal */}
            <AnimatePresence>
                {showShop && <ShopModal onClose={() => setShowShop(false)} />}
            </AnimatePresence>

            {/* Promo Modal */}
            <AnimatePresence>
                {selectedPromo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-brand-800 w-full max-w-md rounded-3xl border border-brand-600 overflow-hidden shadow-2xl"
                        >
                            <img src={selectedPromo.image} className="w-full h-48 object-cover" alt="Promo Detail" referrerPolicy="no-referrer" />
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-black text-white uppercase italic">{selectedPromo.title}</h3>
                                    <button onClick={() => setSelectedPromo(null)} className="text-slate-400 hover:text-white"><Zap size={24} /></button>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">{selectedPromo.description}</p>
                                
                                <div className="bg-brand-900 p-4 rounded-2xl border border-brand-700 space-y-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-bold uppercase">Code Promo</span>
                                        <span className="text-brand-accent font-black">{selectedPromo.code}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-bold uppercase">Validité</span>
                                        <span className="text-white font-bold">{selectedPromo.expiry}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => { handleClaim(selectedPromo.id); setSelectedPromo(null); }}
                                    className="w-full bg-brand-accent text-brand-900 font-black py-4 rounded-2xl text-lg uppercase shadow-lg shadow-brand-accent/20"
                                >
                                    Profiter de l'offre
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PromotionsHub;
