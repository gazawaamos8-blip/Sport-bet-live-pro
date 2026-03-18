
import React, { useState } from 'react';
import { PlacedBet } from '../types';
import { ArrowLeft, CheckCircle, MoreVertical, Share2, Printer, Ticket, Download, XCircle, Clock, DollarSign, AlertCircle, ShieldAlert, QrCode } from 'lucide-react';
import { t } from '../services/localization';
import { getFlag } from '../services/sportApiService';
import { db } from '../services/database';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

interface BetDetailModalProps {
  bet: PlacedBet;
  onClose: () => void;
}

const BetDetailModal: React.FC<BetDetailModalProps> = ({ bet, onClose }) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showDemandeModal, setShowDemandeModal] = useState(false);
  const isPaid = bet.status === 'won';
  const isLost = bet.status === 'lost';
  const isPending = bet.status === 'pending';

  const calculateCashOut = (bet: PlacedBet) => {
    // Simulate if the user is "winning" or "losing" based on bet ID or random seed
    const isWinning = (parseInt(bet.id.split('-')[1]) % 2 === 0);
    
    let base;
    if (isWinning) {
        // Winning: Offer more (70% - 90% of potential win)
        base = bet.potentialWin * (0.7 + Math.random() * 0.2);
    } else {
        // Losing: Offer less (10% - 30% of potential win)
        base = bet.potentialWin * (0.1 + Math.random() * 0.2);
    }
    
    return Math.floor(base);
  };

  const cashOutAmount = calculateCashOut(bet);

  const handleCashOut = async () => {
    await db.cashOutBet(bet.id, cashOutAmount);
    onClose();
  };

  const handleDownloadQr = () => {
    const canvas = document.getElementById('bet-qr-code-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    try {
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR-BET-${bet.id}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
    } catch (e) {
        console.error("Error downloading QR:", e);
        alert("Erreur lors du téléchargement du QR Code. Veuillez réessayer.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Sport Bet',
                text: `Regarde mon pari ! Gain potentiel: ${bet.potentialWin.toLocaleString()} F Code Promo: EUROVIC https://ais-dev-fuuqsfldi6ecrfv657ceum-48676101579.europe-west2.run.app/`,
                url: 'https://sportbet.app/'
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
                <ArrowLeft size={24} className="text-slate-800" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">Détails du<br/>Pari</h2>
         </div>
         <div className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-2 rounded-lg break-all max-w-[120px]">
            BET-{bet.id}
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
         <div className="bg-white rounded-xl p-5 shadow-sm mb-4 relative z-10 print:shadow-none print:border print:border-black border border-slate-100">
             <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2">
                     <Ticket className="text-slate-400" size={20} />
                     <span className="font-bold text-slate-800 text-lg">Événements : {bet.items.length}</span>
                 </div>
                 <div className={`px-3 py-1 rounded text-xs font-black uppercase ${isPaid ? 'bg-green-100 text-green-600' : isLost ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {isPaid ? t('won') : isLost ? t('lost') : 'EN COURS'}
                 </div>
             </div>
             
             <div className="space-y-4">
                 <div className="flex justify-between items-center">
                     <span className="text-slate-500 text-lg">Cote :</span>
                     <span className="font-bold text-slate-800 text-xl">{bet.totalOdds}</span>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="text-slate-500 text-lg">Mise :</span>
                     <span className="font-bold text-slate-800 text-xl">{bet.stake.toLocaleString()} F</span>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="text-slate-500 text-lg">Gains Possibles :</span>
                     <span className={`font-black text-2xl ${isPaid ? 'text-green-600' : 'text-slate-800'}`}>{bet.potentialWin.toLocaleString()} F</span>
                 </div>
             </div>
         </div>

         {/* Match List */}
         <div className="space-y-3 relative z-10">
            {bet.items.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-5 shadow-sm relative overflow-hidden print:break-inside-avoid border border-slate-100">
                    {/* Left decoration line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPaid ? 'bg-green-500' : isLost ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                    
                    <div className="pl-4">
                        <div className="flex items-center gap-2 mb-4">
                            {item.countryCode && (
                                getFlag(item.countryCode).startsWith('http') 
                                ? <img src={getFlag(item.countryCode)} className="w-5 h-3.5 object-cover rounded-sm" alt="flag" referrerPolicy="no-referrer" />
                                : <span className="text-xs">{getFlag(item.countryCode)}</span>
                            )}
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">{item.league || item.sport}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3 flex-1">
                                {item.homeCountryCode && (
                                    <img src={getFlag(item.homeCountryCode)} className="w-6 h-4 object-cover rounded-sm border border-slate-100" alt="flag" referrerPolicy="no-referrer" />
                                )}
                                <span className="font-bold text-slate-900 text-lg">{item.matchInfo.split(' vs ')[0]}</span>
                            </div>
                            
                            <div className="font-bold text-sm bg-slate-100 px-3 py-1 rounded text-slate-400 mx-4">
                                VS
                            </div>
                            
                            <div className="flex items-center gap-3 flex-1 justify-end">
                                <span className="font-bold text-slate-900 text-lg text-right">{item.matchInfo.split(' vs ')[1]}</span>
                                {item.awayCountryCode && (
                                    <img src={getFlag(item.awayCountryCode)} className="w-6 h-4 object-cover rounded-sm border border-slate-100" alt="flag" referrerPolicy="no-referrer" />
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <div className="text-sm font-bold text-slate-600">
                                Coupon: {
                                    item.selection === 'home' ? '1' : 
                                    item.selection === 'away' ? '2' : 
                                    item.selection === 'draw' ? 'X' : 
                                    item.selection === 'over2.5' ? 'Plus (2.5)' :
                                    item.selection === 'under2.5' ? 'Moins (2.5)' :
                                    item.selection.replace('home', '1').replace('draw', 'X').replace('away', '2')
                                }
                            </div>
                            <div className="font-bold text-slate-900 text-lg">{item.odds}</div>
                        </div>
                    </div>
                </div>
            ))}
         </div>

      </div>

      {/* Footer Actions (Professional Buttons) */}
      <div className="bg-white p-4 border-t border-slate-100 flex flex-col gap-3 print:hidden">
          {isPending && (
              <button 
                onClick={() => setShowDemandeModal(true)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:from-blue-500 hover:to-blue-700 transition-all active:scale-95 mb-1"
              >
                  <DollarSign size={20} /> Demande
              </button>
          )}
          <div className="flex gap-3">
              <button 
                onClick={() => setShowQrModal(true)}
                className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
              >
                  <QrCode size={20} /> QR Code
              </button>
              
              <button 
                onClick={handleShare}
                className="flex-1 py-3.5 rounded-xl bg-[#1a242d] text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
              >
                  <Share2 size={20} /> Partager
              </button>

              <button 
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl bg-[#00e676] text-slate-900 font-bold flex items-center justify-center gap-2 hover:bg-[#00c853] transition-colors"
              >
                  <Download size={20} /> Ticket
              </button>
          </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-white w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
                  <div className="w-full flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-900 uppercase italic">QR Coupon</h3>
                      <button onClick={() => setShowQrModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                          <XCircle size={24} />
                      </button>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 mb-6 relative">
                      <QRCodeCanvas 
                          id="bet-qr-code-canvas"
                          value={`https://sportbot.app/coupon/${bet.id}`}
                          size={256}
                          level="H"
                          includeMargin={true}
                          imageSettings={{
                              src: "https://raw.githubusercontent.com/gazawaamos8-blip/Mon-icon-/refs/heads/main/sportbot-icon.png",
                              x: undefined,
                              y: undefined,
                              height: 60,
                              width: 60,
                              excavate: true,
                          }}
                      />
                  </div>

                  <p className="text-slate-500 text-sm mb-8 font-medium">
                      Scannez ce code pour charger ce coupon sur un autre appareil.
                  </p>

                  <button 
                      onClick={handleDownloadQr}
                      className="w-full bg-brand-accent text-brand-900 font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform"
                  >
                      <Download size={20} /> Télécharger QR
                  </button>
              </div>
          </div>
      )}
      {/* Demande Info Modal */}
      {showDemandeModal && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-white w-full max-w-sm rounded-3xl p-8 flex flex-col shadow-2xl">
                  <div className="w-full flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-900 uppercase italic">Informations Pari</h3>
                      <button onClick={() => setShowDemandeModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                          <XCircle size={24} />
                      </button>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-500 font-bold">Cote :</span>
                          <span className="text-slate-900 font-black text-lg">{bet.totalOdds}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-500 font-bold">Mise :</span>
                          <span className="text-slate-900 font-black text-lg">{bet.stake.toLocaleString()} F</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <span className="text-blue-600 font-bold">Gains Possibles :</span>
                          <span className="text-blue-700 font-black text-xl">{bet.potentialWin.toLocaleString()} F</span>
                      </div>
                  </div>

                  <p className="text-slate-500 text-xs mb-8 text-center leading-relaxed">
                      En acceptant, le montant du rachat sera immédiatement crédité sur votre solde SportBot.
                  </p>

                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={handleCashOut}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform uppercase tracking-widest"
                      >
                          Accepter ({cashOutAmount.toLocaleString()} F)
                      </button>
                      <button 
                          onClick={() => setShowDemandeModal(false)}
                          className="w-full bg-slate-100 text-slate-500 font-bold py-3 rounded-2xl transition-colors"
                      >
                          Annuler
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BetDetailModal;
