import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Star, Zap, Trophy, Coins, ChevronRight, Gift, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/database';

interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'bonus' | 'avatar' | 'theme' | 'perk';
    icon: React.ReactNode;
    color: string;
}

const ShieldCheck = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const SHOP_ITEMS: ShopItem[] = [
    {
        id: '1',
        name: 'Bonus de Dépôt 50%',
        description: 'Recevez 50% de bonus sur votre prochain dépôt.',
        price: 5000,
        category: 'bonus',
        icon: <Zap size={24} />,
        color: 'text-yellow-400'
    },
    {
        id: '2',
        name: 'Avatar Légendaire',
        description: 'Un badge exclusif "Légende" sur votre profil.',
        price: 15000,
        category: 'avatar',
        icon: <Star size={24} />,
        color: 'text-purple-400'
    },
    {
        id: '3',
        name: 'Thème Dark Gold',
        description: 'Personnalisez votre interface avec des accents dorés.',
        price: 25000,
        category: 'theme',
        icon: <Sparkles size={24} />,
        color: 'text-brand-accent'
    },
    {
        id: '4',
        name: 'Assurance Pari',
        description: 'Récupérez 20% de votre mise si un seul match perd.',
        price: 10000,
        category: 'perk',
        icon: <ShieldCheck size={24} />,
        color: 'text-blue-400'
    }
];

interface ShopModalProps {
    onClose: () => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ onClose }) => {
    const [balance, setBalance] = useState(db.getBalance());
    const [points, setPoints] = useState(650); // Mock loyalty points
    const [buying, setBuying] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const unsub = db.subscribeToBalance(setBalance);
        return () => unsub();
    }, []);

    const handleBuy = (item: ShopItem) => {
        if (points < item.price) {
            alert("Points de fidélité insuffisants !");
            return;
        }

        setBuying(item.id);
        setTimeout(() => {
            setPoints(prev => prev - item.price);
            setBuying(null);
            setSuccess(item.name);
            setTimeout(() => setSuccess(null), 3000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-brand-900 w-full max-w-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-brand-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 flex items-center justify-center border border-brand-accent/30">
                            <ShoppingBag className="text-brand-accent" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white italic uppercase leading-none">Boutique <span className="text-brand-accent">PRO</span></h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Échangez vos points de fidélité</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Points Banner */}
                <div className="bg-gradient-to-r from-brand-accent/20 to-purple-600/20 p-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-900/50 p-2 rounded-xl border border-white/10">
                            <Trophy className="text-brand-accent" size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Vos Points de Fidélité</span>
                            <span className="text-xl font-black text-white">{points.toLocaleString()} <span className="text-brand-accent text-sm">PTS</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-brand-900/50 px-4 py-2 rounded-xl border border-white/10">
                        <Coins className="text-brand-accent" size={16} />
                        <span className="text-sm font-bold text-white">{balance.toLocaleString()} F</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 bg-green-500/20 border border-green-500/50 p-4 rounded-2xl flex items-center gap-3"
                        >
                            <Gift className="text-green-500" />
                            <p className="text-green-500 text-sm font-bold">Félicitations ! Vous avez débloqué : {success}</p>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SHOP_ITEMS.map(item => (
                            <div key={item.id} className="bg-brand-800/50 rounded-3xl p-5 border border-white/5 hover:border-brand-accent/30 transition-all group relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${item.color}`}>
                                    {item.icon}
                                </div>
                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl bg-brand-900/50 flex items-center justify-center mb-4 border border-white/10 ${item.color}`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="text-white font-black uppercase text-sm mb-1">{item.name}</h3>
                                    <p className="text-slate-400 text-[10px] leading-relaxed mb-4">{item.description}</p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Trophy size={12} className="text-brand-accent" />
                                            <span className="text-sm font-black text-white">{item.price.toLocaleString()}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleBuy(item)}
                                            disabled={buying === item.id || points < item.price}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                                points < item.price 
                                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                                : 'bg-brand-accent text-brand-900 hover:scale-105 active:scale-95'
                                            }`}
                                        >
                                            {buying === item.id ? 'Achat...' : 'Acheter'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* VIP Section Preview */}
                    <div className="mt-8 bg-brand-800 rounded-3xl p-6 border border-brand-accent/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10"><Star size={80} /></div>
                        <div className="relative z-10">
                            <h3 className="text-white font-black uppercase italic text-lg mb-2">Accès <span className="text-brand-accent">VIP GOLD</span></h3>
                            <p className="text-slate-400 text-xs mb-4">Débloquez des récompenses exclusives et des limites de retrait plus élevées.</p>
                            <div className="flex items-center gap-2 text-brand-accent font-bold text-[10px] uppercase tracking-widest">
                                <Zap size={14} /> Bientôt disponible dans votre région
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-brand-800/50 border-t border-white/5 flex justify-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
                        Les articles achetés sont activés instantanément sur votre compte.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ShopModal;
