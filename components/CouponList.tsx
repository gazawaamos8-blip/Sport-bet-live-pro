import React, { useState, useEffect } from 'react';
import { BetSlipItem, SavedCoupon } from '../types';
import { db } from '../services/database';
import { Ticket, Copy, Check, Trash2, ArrowRight, DownloadCloud, AlertCircle } from 'lucide-react';
import { t } from '../services/localization';

interface CouponListProps {
    onLoadCoupon: (items: BetSlipItem[]) => void;
}

const CouponList: React.FC<CouponListProps> = ({ onLoadCoupon }) => {
    const [coupons, setCoupons] = useState<SavedCoupon[]>([]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = () => {
        const saved = db.getCoupons();
        // Sort by newest first
        setCoupons(saved.reverse());
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleDelete = (code: string) => {
        const confirm = window.confirm("Supprimer ce coupon ?");
        if(confirm) {
           setCoupons(prev => prev.filter(c => c.code !== code));
        }
    };

    const handleLoadManualCode = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        
        // Logique pour le code spécifique "65 10 11 100 80 9 600"
        // Interprétation: Cote 600, Risque élevé (Équipe Faible/Outsider)
        const cleanCode = manualCode.trim();

        if (cleanCode === "65 10 11 100 80 9 600" || cleanCode === "651011100809600") {
            const specialItems: BetSlipItem[] = [
                { 
                    matchId: 'special_ud_1', 
                    selection: 'away', 
                    odds: 15.00, 
                    matchInfo: 'Man City vs Luton Town', 
                    sport: 'football' 
                }, // Luton wins (Outsider)
                { 
                    matchId: 'special_ud_2', 
                    selection: 'home', 
                    odds: 8.00, 
                    matchInfo: 'Almeria vs Real Madrid', 
                    sport: 'football' 
                }, // Almeria wins (Outsider)
                { 
                    matchId: 'special_ud_3', 
                    selection: 'draw', 
                    odds: 5.00, 
                    matchInfo: 'Maroc vs Sénégal', 
                    sport: 'football' 
                } // Match nul risqué
            ];
            // Total Odds: 15 * 8 * 5 = 600
            
            onLoadCoupon(specialItems);
            setManualCode('');
            alert("Code VIP Outsider chargé ! Cote Totale: 600.00");
            return;
        }

        // Vérification des coupons locaux
        const localCoupon = coupons.find(c => c.code === cleanCode);
        if (localCoupon) {
            onLoadCoupon(localCoupon.items);
            setManualCode('');
        } else {
            setErrorMsg("Code coupon invalide ou expiré.");
        }
    };

    return (
        <div className="pb-24 space-y-4 animate-fade-in">
            {/* Header */}
            <div className="bg-brand-800 p-4 border-b border-brand-700 sticky top-16 z-10 shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-2">
                            <Ticket className="text-pink-500" /> {t('coupons')}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Vos tickets enregistrés & Codes VIP</p>
                    </div>
                    <div className="bg-brand-900 border border-brand-700 px-3 py-1 rounded-full text-xs font-bold text-slate-300">
                        {coupons.length} Tickets
                    </div>
                </div>
            </div>

            {/* Manual Code Loader */}
            <div className="px-4">
                <form onSubmit={handleLoadManualCode} className="bg-brand-800 p-4 rounded-xl border border-brand-700 shadow-lg">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Charger un Code Rapide</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            placeholder="Ex: 65 10 11..."
                            className="flex-1 bg-brand-900 border border-brand-700 rounded-lg px-4 py-3 text-white text-sm font-mono focus:border-brand-accent focus:outline-none"
                        />
                        <button type="submit" className="bg-brand-accent text-brand-900 px-4 rounded-lg font-bold hover:bg-emerald-400 transition-colors">
                            <DownloadCloud size={20} />
                        </button>
                    </div>
                    {errorMsg && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-bold">
                            <AlertCircle size={12} /> {errorMsg}
                        </p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-2 italic">
                        Astuce: Essayez le code spécial <b>65 10 11 100 80 9 600</b> pour le combi "Équipe Faible".
                    </p>
                </form>
            </div>

            <div className="px-4 space-y-4">
                {coupons.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-brand-700 rounded-xl bg-brand-800/50">
                        <Ticket size={48} className="mx-auto mb-3 opacity-20" />
                        <p>{t('noCoupons')}</p>
                    </div>
                ) : (
                    coupons.map((coupon, idx) => (
                        <div key={idx} className="bg-brand-800 rounded-xl border border-brand-700 overflow-hidden relative shadow-lg group">
                            {/* Left Decoration (Ticket holes simulation) */}
                            <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-brand-900 rounded-full border border-brand-700"></div>
                            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-brand-900 rounded-full border border-brand-700"></div>
                            
                            {/* Dashed line */}
                            <div className="absolute left-0 right-0 top-1/2 h-px border-t border-dashed border-brand-700/50"></div>

                            <div className="p-4 pb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-brand-900 rounded-lg flex items-center justify-center border border-brand-700 font-mono font-black text-white text-lg tracking-wider">
                                            {coupon.items.length}
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">Code Coupon</div>
                                            <button 
                                                onClick={() => handleCopy(coupon.code)} 
                                                className="flex items-center gap-2 font-mono font-bold text-xl text-brand-accent hover:text-white transition-colors"
                                            >
                                                {coupon.code}
                                                {copiedCode === coupon.code ? <Check size={14} /> : <Copy size={14} className="opacity-50" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">{new Date(coupon.date).toLocaleDateString()}</div>
                                        <div className="text-white font-bold text-sm">{new Date(coupon.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-brand-900/50 p-3 flex items-center justify-between border-t border-brand-700">
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">Cote Totale</div>
                                    <div className="text-lg font-black text-white">{coupon.totalOdds.toFixed(2)}</div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleDelete(coupon.code)}
                                        className="p-2.5 rounded-lg bg-brand-800 text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => onLoadCoupon(coupon.items)}
                                        className="px-4 py-2 rounded-lg bg-brand-accent text-brand-900 font-bold text-xs uppercase flex items-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg"
                                    >
                                        {t('loadCoupon')} <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CouponList;