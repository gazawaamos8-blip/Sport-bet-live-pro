
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlacedBet, Match } from '../types';
import { ArrowLeft, CheckCircle, MoreVertical, Share2, Printer, Ticket, Download, XCircle, Clock, DollarSign, AlertCircle, ShieldAlert, QrCode, Activity, BarChart2, ExternalLink, Trophy } from 'lucide-react';
import { t } from '../services/localization';
import { getFlag, fetchMatches } from '../services/sportApiService';
import { db } from '../services/database';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import MatchTracker from './MatchTracker';
import BrandIcon from './BrandIcon';

interface BetDetailModalProps {
  bet: PlacedBet;
  onClose: () => void;
}

const BetDetailModal: React.FC<BetDetailModalProps> = ({ bet, onClose }) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showDemandeModal, setShowDemandeModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const isPaid = bet.status === 'won';
  const isLost = bet.status === 'lost';
  const isPending = bet.status === 'pending';

  useEffect(() => {
    const loadMatches = async () => {
      const matches = await fetchMatches();
      setAllMatches(matches);
    };
    loadMatches();
  }, []);

  const handleShowStats = (matchId: string) => {
    const match = allMatches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
    } else {
      // Fallback: Create a mock match if not found in current live matches
      const item = bet.items.find(i => i.matchId === matchId);
      if (item) {
        const mockMatch: Match = {
          id: item.matchId,
          sport: item.sport,
          league: item.league || 'Ligue Pro',
          category: 'europe',
          homeTeam: item.matchInfo.split(' vs ')[0],
          awayTeam: item.matchInfo.split(' vs ')[1],
          homeScore: 0,
          awayScore: 0,
          time: "00:00",
          startDate: new Date(),
          status: 'upcoming',
          odds: { home: item.odds, draw: 3.0, away: 2.5 },
          homeCountryCode: item.homeCountryCode,
          awayCountryCode: item.awayCountryCode,
          homeLogo: getFlag(item.homeCountryCode || 'un'),
          awayLogo: getFlag(item.awayCountryCode || 'un'),
        };
        setSelectedMatch(mockMatch);
      }
    }
  };

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
                title: 'sportbot',
                text: `Regarde mon pari ! Gain potentiel: ${bet.potentialWin.toLocaleString()} F Code Promo: EUROVIC https://ais-dev-fuuqsfldi6ecrfv657ceum-48676101579.europe-west2.run.app/`,
                url: 'https://sportbot.app/'
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
      sportbot PRO LIVE
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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-[120] bg-brand-900 text-white flex flex-col font-sans overflow-hidden"
      >
        {/* Header Dark Mode style */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-brand-800 p-4 flex items-center justify-between border-b border-white/5 shadow-lg sticky top-0 z-10 print:hidden"
        >
         <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors active:scale-90">
                <ArrowLeft size={24} className="text-white" />
            </button>
            <div>
                <h2 className="text-xl font-black text-white leading-tight uppercase italic tracking-tighter">Détails du Pari</h2>
                <div className="flex items-center gap-2 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-yellow-500 animate-pulse' : isPaid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isPending ? 'En cours' : isPaid ? 'Gagné' : 'Perdu'}</span>
                </div>
            </div>
         </div>
         <div className="flex flex-col items-end">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">ID TICKET</div>
            <div className="text-xs font-mono font-bold text-brand-accent bg-brand-900 px-3 py-1.5 rounded-lg border border-white/5">
                {bet.id.slice(0, 12)}...
            </div>
         </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-4 bg-brand-900 relative no-scrollbar">
         
         {/* PROMO CODE WATERMARK */}
         <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-5 transform -rotate-45">
             <div className="text-6xl md:text-8xl font-black text-brand-accent text-center border-4 border-brand-accent px-8 py-4 rounded-xl">
                 {bet.promoCode || 'EUROVIC'}
             </div>
         </div>

         {/* Summary Card */}
         <div className="bg-brand-800 rounded-xl p-5 shadow-xl mb-4 relative z-10 print:shadow-none print:border print:border-white border border-white/5">
             <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2">
                     <Ticket className="text-slate-500" size={20} />
                     <span className="font-bold text-white text-lg">Événements : {bet.items.length}</span>
                 </div>
                 <div className={`px-3 py-1 rounded text-xs font-black uppercase ${isPaid ? 'bg-green-500/20 text-green-400' : isLost ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {isPaid ? t('won') : isLost ? t('lost') : 'EN COURS'}
                 </div>
             </div>
             
             <div className="space-y-4">
                 <div className="flex justify-between items-center">
                     <span className="text-slate-400 text-lg">Cote :</span>
                     <span className="font-bold text-brand-accent text-xl">{bet.totalOdds}</span>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="text-slate-400 text-lg">Mise :</span>
                     <span className="font-bold text-white text-xl">{bet.stake.toLocaleString()} F</span>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="text-slate-400 text-lg">Gains Possibles :</span>
                     <span className={`font-black text-2xl ${isPaid ? 'text-green-400' : 'text-white'}`}>{bet.potentialWin.toLocaleString()} F</span>
                 </div>
             </div>
         </div>

         {/* Match List */}
         <div className="space-y-3 relative z-10">
            {bet.items.map((item, idx) => (
                <div key={idx} className="bg-brand-800 rounded-xl p-5 shadow-xl relative overflow-hidden print:break-inside-avoid border border-white/5">
                    {/* Left decoration line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPaid ? 'bg-green-500' : isLost ? 'bg-red-500' : 'bg-brand-700'}`}></div>
                    
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
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-11 h-11 flex items-center justify-center bg-brand-900 rounded-full border border-white/5 shadow-inner shrink-0">
                                    {item.homeLogo ? (
                                        <img src={item.homeLogo} className="w-8 h-8 object-contain" alt="logo" referrerPolicy="no-referrer" />
                                    ) : item.homeCountryCode && (
                                        getFlag(item.homeCountryCode).startsWith('http') 
                                        ? <img src={getFlag(item.homeCountryCode)} className="w-8 h-8 object-cover rounded-full" alt="flag" referrerPolicy="no-referrer" />
                                        : <span className="text-[10px] font-bold">{getFlag(item.homeCountryCode)}</span>
                                    )}
                                </div>
                                <span className="font-bold text-white text-base truncate">{item.matchInfo.split(' vs ')[0]}</span>
                            </div>
                            
                            <div className="font-bold text-[10px] bg-brand-900 px-2 py-1 rounded text-slate-500 mx-2 shrink-0">
                                VS
                            </div>
                            
                            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                                <span className="font-bold text-white text-base text-right truncate">{item.matchInfo.split(' vs ')[1]}</span>
                                <div className="w-11 h-11 flex items-center justify-center bg-brand-900 rounded-full border border-white/5 shadow-inner shrink-0">
                                    {item.awayLogo ? (
                                        <img src={item.awayLogo} className="w-8 h-8 object-contain" alt="logo" referrerPolicy="no-referrer" />
                                    ) : item.awayCountryCode && (
                                        getFlag(item.awayCountryCode).startsWith('http') 
                                        ? <img src={getFlag(item.awayCountryCode)} className="w-8 h-8 object-cover rounded-full" alt="flag" referrerPolicy="no-referrer" />
                                        : <span className="text-[10px] font-bold">{getFlag(item.awayCountryCode)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div className="text-sm font-bold text-slate-400">
                                Coupon: {
                                    item.selection === 'home' ? '1' : 
                                    item.selection === 'away' ? '2' : 
                                    item.selection === 'draw' ? 'X' : 
                                    item.selection === 'over2.5' ? 'Plus (2.5)' :
                                    item.selection === 'under2.5' ? 'Moins (2.5)' :
                                    item.selection.replace('home', '1').replace('draw', 'X').replace('away', '2')
                                }
                            </div>
                            <div className="font-bold text-brand-accent text-lg">{item.odds}</div>
                        </div>

                        {/* Live Stats Button */}
                        <div className="mt-4 flex justify-end">
                            <button 
                                onClick={() => handleShowStats(item.matchId)}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-700 text-slate-300 rounded-lg text-xs font-bold transition-colors border border-white/5"
                            >
                                <Activity size={14} className="text-brand-accent" />
                                Live & Stats
                            </button>
                        </div>
                    </div>
                </div>
            ))}
         </div>

      </div>

      {/* Footer Actions (Professional Buttons) */}
      <div className="bg-brand-800 p-4 border-t border-white/5 flex flex-col gap-3 print:hidden">
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
                className="flex-1 py-3.5 rounded-xl border-2 border-white/10 text-slate-300 font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
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
                className="flex-1 py-3.5 rounded-xl bg-brand-accent text-brand-900 font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
              >
                  <Download size={20} /> Ticket
              </button>
          </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-brand-800 w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl border border-white/5">
                  <div className="w-full flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-white uppercase italic">QR Coupon</h3>
                      <button onClick={() => setShowQrModal(false)} className="p-2 bg-brand-900 rounded-full text-slate-500 hover:text-white">
                          <XCircle size={24} />
                      </button>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border-4 border-brand-900 mb-6 relative shadow-inner group">
                      <QRCodeCanvas 
                          id="bet-qr-code-canvas"
                          value={`https://sportbot.app/coupon/${bet.id}`}
                          size={256}
                          level="H"
                          includeMargin={true}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px] rounded-2xl pointer-events-none">
                          <div className="bg-brand-900 text-white p-3 rounded-full shadow-2xl">
                              <QrCode size={32} />
                          </div>
                      </div>
                  </div>

                  <p className="text-slate-400 text-sm mb-8 font-medium">
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
              <div className="bg-brand-800 w-full max-w-sm rounded-3xl p-8 flex flex-col shadow-2xl border border-white/5">
                  <div className="w-full flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-white uppercase italic">Informations Pari</h3>
                      <button onClick={() => setShowDemandeModal(false)} className="p-2 bg-brand-900 rounded-full text-slate-500 hover:text-white">
                          <XCircle size={24} />
                      </button>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center p-4 bg-brand-900 rounded-xl border border-white/5">
                          <span className="text-slate-400 font-bold">Cote :</span>
                          <span className="text-brand-accent font-black text-lg">{bet.totalOdds}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-brand-900 rounded-xl border border-white/5">
                          <span className="text-slate-400 font-bold">Mise :</span>
                          <span className="text-white font-black text-lg">{bet.stake.toLocaleString()} F</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <span className="text-blue-400 font-bold">Gains Possibles :</span>
                          <span className="text-blue-300 font-black text-xl">{bet.potentialWin.toLocaleString()} F</span>
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
                          className="w-full bg-brand-900 text-slate-400 font-bold py-3 rounded-2xl transition-colors hover:text-white"
                      >
                          Annuler
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Live Stats Modal */}
      <AnimatePresence>
        {selectedMatch && (
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed inset-0 z-[300] bg-black text-white flex flex-col overflow-hidden"
            >
                <div className="p-4 flex flex-col items-center relative border-b border-white/5 sticky top-0 bg-black/90 backdrop-blur-md z-50">
                    <button 
                      onClick={() => setSelectedMatch(null)} 
                      className="absolute left-4 top-4 p-2 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors active:scale-90"
                    >
                        <XCircle size={24} />
                    </button>
                    
                    <div className="flex flex-col items-center gap-1">
                        <div className="bg-white/10 px-4 py-1 rounded-full border border-white/20">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedMatch.league}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-emerald-400 font-black text-sm italic">{selectedMatch.time}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-12 bg-[#0a0f1a]">
                    {/* Scoreboard - Image Style */}
                    <div className="py-8 flex items-center justify-between px-4">
                        <div className="flex flex-col items-center gap-3 flex-1">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl">
                                    <img 
                                      src={selectedMatch.homeLogo || getFlag(selectedMatch.homeCountryCode || 'un')} 
                                      className="w-14 h-14 object-contain" 
                                      alt="logo" 
                                      referrerPolicy="no-referrer" 
                                    />
                                </div>
                                <div className="absolute -top-1 -right-1 bg-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-md text-white border border-white/20 shadow-lg">LIVE</div>
                            </div>
                            <span className="text-white font-black text-center text-sm uppercase tracking-tighter leading-tight max-w-[100px]">{selectedMatch.homeTeam}</span>
                        </div>
                        
                        <div className="bg-brand-800/50 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-4 shadow-2xl">
                            <div className="text-5xl font-black text-white italic tabular-nums tracking-tighter flex items-center gap-4">
                                {selectedMatch.homeScore} <span className="text-white/20">-</span> {selectedMatch.awayScore}
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-3 flex-1">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl">
                                    <img 
                                      src={selectedMatch.awayLogo || getFlag(selectedMatch.awayCountryCode || 'un')} 
                                      className="w-14 h-14 object-contain" 
                                      alt="logo" 
                                      referrerPolicy="no-referrer" 
                                    />
                                </div>
                                <div className="absolute -top-1 -right-1 bg-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-md text-white border border-white/20 shadow-lg">LIVE</div>
                            </div>
                            <span className="text-white font-black text-center text-sm uppercase tracking-tighter leading-tight max-w-[100px]">{selectedMatch.awayTeam}</span>
                        </div>
                    </div>

                    {/* Action Tabs */}
                    <div className="flex gap-2 px-2">
                        <button className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                            <Activity size={14} /> DIRECT
                        </button>
                        <button className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                            <Trophy size={14} /> PARIS
                        </button>
                        <button className="flex-1 py-3.5 rounded-xl bg-brand-accent text-brand-900 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,118,0.3)]">
                            <Clock size={14} /> LIVE
                        </button>
                    </div>

                    {/* Match Tracker Section */}
                    <div className="px-1">
                        <MatchTracker match={selectedMatch} />
                    </div>

                    {/* Event Card - Goal Scorer Style */}
                    <div className="px-2">
                        <div className="bg-brand-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/5 to-transparent"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full border-2 border-brand-accent/30 overflow-hidden bg-brand-800">
                                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-brand-accent text-brand-900 p-1 rounded-full border-2 border-brand-900">
                                        <Activity size={10} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-lg uppercase italic tracking-tighter leading-none mb-1">Victor Osimhen</h4>
                                    <p className="text-brand-accent text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        BUT ! <span className="w-1 h-1 rounded-full bg-white/30"></span> BUT
                                    </p>
                                </div>
                            </div>
                            <div className="text-slate-500 font-black italic text-lg relative z-10">12'</div>
                        </div>
                    </div>

                    {/* Live Stats - Modern Grid */}
                    <div className="bg-white/[0.03] rounded-[2rem] p-8 border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <BarChart2 size={20} className="text-blue-400" />
                            </div>
                            <h4 className="text-white font-black uppercase italic text-sm tracking-tight">Statistiques Détaillées</h4>
                        </div>

                        <div className="space-y-8">
                            {/* Possession */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black text-white uppercase tracking-widest mb-1">
                                    <span className="text-blue-400">{selectedMatch.homeTeam}</span>
                                    <span>Possession</span>
                                    <span className="text-red-400">{selectedMatch.awayTeam}</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden flex p-0.5 border border-white/5">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${selectedMatch.stats?.possession.home || 50}%` }}
                                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                    ></motion.div>
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${selectedMatch.stats?.possession.away || 50}%` }}
                                      className="h-full bg-gradient-to-l from-red-600 to-red-400 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] ml-auto"
                                    ></motion.div>
                                </div>
                                <div className="flex justify-between text-lg font-black text-white italic">
                                    <span>{selectedMatch.stats?.possession.home || 50}%</span>
                                    <span>{selectedMatch.stats?.possession.away || 50}%</span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Tirs', home: selectedMatch.stats?.shots.home || 0, away: selectedMatch.stats?.shots.away || 0 },
                                    { label: 'Cadrés', home: selectedMatch.stats?.shotsOnTarget.home || 0, away: selectedMatch.stats?.shotsOnTarget.away || 0 },
                                    { label: 'Corners', home: selectedMatch.stats?.corners.home || 0, away: selectedMatch.stats?.corners.away || 0 }
                                ].map((stat, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <span className="text-blue-400 font-black text-xl italic">{stat.home}</span>
                                        <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                                        <span className="text-red-400 font-black text-xl italic">{stat.away}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Match Info - Sleek List */}
                    <div className="bg-white/[0.03] rounded-[2rem] p-8 border border-white/10">
                        <h4 className="text-white font-black uppercase italic text-sm mb-6 tracking-tight">Informations du Match</h4>
                        <div className="space-y-4">
                            {[
                                { label: 'Heure Exacte', value: new Date(selectedMatch.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                                { label: 'Stade', value: 'Stade Olympique de SportBot' },
                                { label: 'Arbitre', value: 'M. Referee Pro' },
                                { label: 'Météo', value: 'Dégagé • 22°C' }
                            ].map((info, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{info.label}</span>
                                    <span className="text-white text-xs font-black uppercase">{info.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default BetDetailModal;
