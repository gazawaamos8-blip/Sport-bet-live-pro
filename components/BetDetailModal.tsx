
import React from 'react';
import { PlacedBet } from '../types';
import { ArrowLeft, CheckCircle, MoreVertical, Share2, Printer, Ticket, Download, XCircle, Clock } from 'lucide-react';
import { t } from '../services/localization';
import { getFlag } from '../services/sportApiService';

interface BetDetailModalProps {
  bet: PlacedBet;
  onClose: () => void;
}

const BetDetailModal: React.FC<BetDetailModalProps> = ({ bet, onClose }) => {
  const isPaid = bet.status === 'won';
  const isLost = bet.status === 'lost';

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'SportBet Pro Ticket',
                text: `Regarde mon pari ! Gain potentiel: ${bet.potentialWin.toLocaleString()} F\nCode Promo: ${bet.promoCode || 'EUROVIC'}`,
                url: window.location.href
            });
        } catch (err) {
            console.error("Error sharing:", err);
        }
    } else {
        alert(t('shareError'));
    }
  };

  const handleDownload = () => {
      // Create a text receipt
      const receipt = `
================================
      SPORTBET PRO LIVE
      Ticket Officiel
================================
ID Pari: ${bet.id}
Date: ${bet.date}
Code Promo: ${bet.promoCode || 'EUROVIC'}
--------------------------------
${bet.items.map(i => `${i.sport.toUpperCase()}
${i.matchInfo}
Sélection: ${i.selection} @ ${i.odds}`).join('\n\n')}
--------------------------------
Mise: ${bet.stake.toLocaleString()} FCFA
Cote Totale: ${bet.totalOdds}
GAIN POTENTIEL: ${bet.potentialWin.toLocaleString()} FCFA
--------------------------------
Statut: ${bet.status.toUpperCase()}
================================
      `;

      const blob = new Blob([receipt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${bet.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert(t('downloadSuccess'));
  };

  return (
    <div className="fixed inset-0 z-[120] bg-white text-slate-900 flex flex-col font-sans animate-fade-in">
      {/* Header Light Mode style based on image */}
      <div className="bg-white p-4 flex items-center justify-between border-b border-slate-100 shadow-sm sticky top-0 z-10 print:hidden">
         <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">{t('betDetails')}</h2>
         </div>
         <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
            {bet.id}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative">
         
         {/* PROMO CODE WATERMARK */}
         <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-15 transform -rotate-45">
             <div className="text-6xl md:text-8xl font-black text-blue-600 text-center border-4 border-blue-600 px-8 py-4 rounded-xl">
                 {bet.promoCode || 'EUROVIC'}
             </div>
         </div>

         {/* Summary Card */}
         <div className="bg-white rounded-xl p-4 shadow-sm mb-4 relative z-10 print:shadow-none print:border print:border-black">
             <div className="flex justify-between items-center mb-2">
                 <div className="flex items-center gap-2">
                     <Ticket className="text-slate-400" size={18} />
                     <span className="font-bold text-slate-700">{t('events')} : {bet.items.length}</span>
                 </div>
                 <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isPaid ? 'bg-green-100 text-green-600' : isLost ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {isPaid ? t('won') : isLost ? t('lost') : t('pending')}
                 </div>
             </div>
             
             <div className="space-y-2 mt-4">
                 <div className="flex justify-between">
                     <span className="text-slate-500 font-medium">Cote :</span>
                     <span className="font-bold text-slate-800">{bet.totalOdds}</span>
                 </div>
                 <div className="flex justify-between">
                     <span className="text-slate-500 font-medium">{t('stake')} :</span>
                     <span className="font-bold text-slate-800">{bet.stake.toLocaleString()} F</span>
                 </div>
                 <div className="flex justify-between">
                     <span className="text-slate-500 font-medium">{t('potentialWin')} :</span>
                     <span className={`font-black text-xl ${isPaid ? 'text-green-600' : 'text-slate-800'}`}>{bet.potentialWin.toLocaleString()} F</span>
                 </div>
             </div>
         </div>

         {/* Match List */}
         <div className="space-y-3 relative z-10">
            {bet.items.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm relative overflow-hidden print:break-inside-avoid">
                    {/* Left decoration line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPaid ? 'bg-green-500' : isLost ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                    
                    <div className="pl-3">
                        <div className="flex items-center gap-2 mb-2">
                            {item.countryCode && (
                                getFlag(item.countryCode).startsWith('http') 
                                ? <img src={getFlag(item.countryCode)} className="w-4 h-3 object-cover rounded-sm" alt="flag" />
                                : <span className="text-[10px]">{getFlag(item.countryCode)}</span>
                            )}
                            <span className="text-xs font-bold text-slate-400 uppercase">{item.league || item.sport}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 flex-1">
                                {item.homeCountryCode && (
                                    <img src={getFlag(item.homeCountryCode)} className="w-5 h-3.5 object-cover rounded-sm border border-slate-100" alt="flag" />
                                )}
                                <span className="font-bold text-slate-800">{item.matchInfo.split(' vs ')[0]}</span>
                            </div>
                            
                            <div className="font-mono font-black text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-400 mx-2">
                                VS
                            </div>
                            
                            <div className="flex items-center gap-2 flex-1 justify-end">
                                <span className="font-bold text-slate-800 text-right">{item.matchInfo.split(' vs ')[1]}</span>
                                {item.awayCountryCode && (
                                    <img src={getFlag(item.awayCountryCode)} className="w-5 h-3.5 object-cover rounded-sm border border-slate-100" alt="flag" />
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                            <div>
                                <div className="text-xs font-bold text-slate-500 mb-0.5">
                                    {t('coupon')}: {item.selection === 'home' ? '1' : item.selection === 'away' ? '2' : 'X'}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-800">{item.odds}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
         </div>

      </div>

      {/* Footer Actions (Professional Buttons) */}
      <div className="bg-white p-4 border-t border-slate-100 flex gap-4 print:hidden">
          <button 
             onClick={handlePrint}
             className="flex-1 py-3 rounded-lg border-2 border-slate-200 text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
          >
              <Printer size={18} /> {t('print')}
          </button>
          
          <button 
             onClick={handleShare}
             className="flex-1 py-3 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
          >
              <Share2 size={18} /> {t('share')}
          </button>

          <button 
             onClick={handleDownload}
             className="flex-1 py-3 rounded-lg bg-brand-accent text-brand-900 font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
          >
              <Download size={18} /> {t('download')}
          </button>
      </div>
    </div>
  );
};

export default BetDetailModal;
