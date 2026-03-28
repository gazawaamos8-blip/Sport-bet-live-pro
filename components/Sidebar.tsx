import React, { useState, useEffect } from 'react';
import { AppSection, User } from '../types';
import { db } from '../services/database';
import { X, Home, Activity, Calendar, Tv, Gamepad2, Users, Settings, HelpCircle, LogOut, ChevronRight, Wallet, Trophy, Clock, Bookmark, FileText, Gift, BarChart2, ShieldCheck, Star, Zap, Newspaper, Medal, Download, DollarSign, MessageCircle } from 'lucide-react';
import BrandIcon from './BrandIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: AppSection;
  onNavigate: (section: AppSection) => void;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
  onOpenMonetization: () => void;
  onOpenChat: () => void;
  onLogout: () => void;
  balance: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentSection, onNavigate, onOpenWallet, onOpenProfile, onOpenSettings, onOpenSupport, onOpenMonetization, onOpenChat, onLogout, balance }) => {
  const [canClaimBonus, setCanClaimBonus] = useState(false);

  useEffect(() => {
      const checkBonus = () => {
          const user = db.getUser();
          if (user) {
              const lastBonus = user.lastDailyBonus ? new Date(user.lastDailyBonus) : null;
              const now = new Date();
              // Check if bonus was claimed today
              if (!lastBonus || lastBonus.getDate() !== now.getDate() || lastBonus.getMonth() !== now.getMonth()) {
                  setCanClaimBonus(true);
              } else {
                  setCanClaimBonus(false);
              }
          }
      };
      if(isOpen) checkBonus();
  }, [isOpen]);

  const handleClaimBonus = () => {
      const bonusAmount = 500;
      db.updateBalance(bonusAmount, 'add');
      
      // Update user date
      const user = db.getUser();
      if(user) {
          user.lastDailyBonus = new Date().toISOString();
          db.saveUser(user);
      }
      setCanClaimBonus(false);
      alert(`Félicitations ! Vous avez reçu un bonus quotidien de ${bonusAmount} F !`);
  };

  const handleDownloadApp = () => {
      const user = db.getUser();
      if (user && !user.hasDownloadedApp) {
          const bonusAmount = 100;
          db.updateBalance(bonusAmount, 'add');
          user.hasDownloadedApp = true;
          db.saveUser(user);
          alert(`Félicitations ! Vous avez reçu ${bonusAmount} CFA pour le téléchargement de l'application SportBot !`);
      }
      // In a real app, this would trigger the actual APK download
      window.open('https://ais-dev-fuuqsfldi6ecrfv657ceum-48676101579.europe-west2.run.app/sportbot.apk', '_blank');
  };

  const menuItems = [
    { id: AppSection.HOME, label: 'Accueil', icon: Home, color: 'text-brand-accent' },
    { id: AppSection.LIVE, label: 'En Direct', icon: Activity, color: 'text-red-500' },
    { id: AppSection.UPCOMING, label: 'À Venir', icon: Calendar, color: 'text-yellow-500' },
    { id: AppSection.HISTORY, label: 'Mes Paris', icon: Clock, color: 'text-blue-400' },
    { id: AppSection.COUPONS, label: 'Mes Coupons', icon: Bookmark, color: 'text-pink-500' },
    { id: AppSection.TRANSACTIONS, label: 'Historique Trans.', icon: FileText, color: 'text-slate-300' },
    { id: AppSection.PROMOTIONS, label: 'Promotions', icon: Zap, color: 'text-orange-400' },
    { id: AppSection.VIP_CLUB, label: 'Club VIP', icon: Star, color: 'text-brand-highlight' },
    { id: AppSection.STATISTICS, label: 'Statistiques', icon: BarChart2, color: 'text-cyan-400' },
    { id: AppSection.VIDEO, label: 'TV & Streaming', icon: Tv, color: 'text-blue-500' },
    { id: AppSection.CASINO, label: 'Casino & Jeux', icon: Gamepad2, color: 'text-purple-500' },
    { id: AppSection.RESULTS, label: 'Résultats', icon: Trophy, color: 'text-orange-500' },
    { id: AppSection.NEWS, label: 'Actualités', icon: Newspaper, color: 'text-brand-accent' },
    { id: 'chat', label: 'Chat Live', icon: MessageCircle, color: 'text-emerald-400' },
    { id: AppSection.LEADERBOARD, label: 'Classement Pro', icon: Medal, color: 'text-yellow-500' },
    { id: AppSection.REFERRAL, label: 'Parrainage', icon: Users, color: 'text-green-400' },
    { id: AppSection.RESPONSIBLE_GAMING, label: 'Jeu Responsable', icon: ShieldCheck, color: 'text-emerald-500' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-brand-900 z-[70] shadow-2xl transform transition-transform duration-300 border-r border-brand-800 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-5 bg-brand-800 border-b border-brand-700 flex justify-between items-center">
             <div className="flex items-center gap-3">
                 <BrandIcon size={40} />
                 <div className="flex flex-col">
                     <h2 className="text-xl font-black italic text-white tracking-tighter uppercase">
                        sportbot
                     </h2>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Édition Live</p>
                 </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                 <X size={20} />
             </button>
        </div>

        {/* User Quick Actions */}
        <div className="p-4 bg-gradient-to-b from-brand-800 to-brand-900 border-b border-brand-700">
             <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => { onClose(); onOpenProfile(); }}>
                 <div className="w-10 h-10 rounded-full bg-brand-700 border border-brand-600 flex items-center justify-center">
                     <Users size={20} className="text-slate-300" />
                 </div>
                 <div>
                     <p className="text-sm font-bold text-white">Mon Compte</p>
                     <p className="text-xs text-brand-accent font-mono">{balance.toLocaleString()} F</p>
                 </div>
                 <ChevronRight size={16} className="ml-auto text-slate-600" />
             </div>
             <button onClick={() => { onClose(); onOpenWallet(); }} className="w-full bg-brand-accent text-brand-900 font-black text-sm uppercase py-2.5 rounded-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
                 <Wallet size={16} /> Dépôt / Retrait
             </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
            <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Menu Principal</p>
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => { 
                        if (item.id === 'chat') {
                            onOpenChat();
                        } else {
                            onNavigate(item.id as AppSection); 
                        }
                        onClose(); 
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${currentSection === item.id ? 'bg-brand-800 text-white shadow-lg border border-brand-700' : 'text-slate-400 hover:bg-brand-800/50 hover:text-white'}`}
                >
                    <item.icon size={20} className={currentSection === item.id ? item.color : 'text-slate-500'} />
                    <span className="text-sm font-bold">{item.label}</span>
                    {currentSection === item.id && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')}`}></div>}
                </button>
            ))}

            <div className="h-px bg-brand-800 my-2 mx-3"></div>
            
            <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Support & Revenus</p>
            <button 
                onClick={() => { onClose(); onOpenMonetization(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all border border-emerald-500/20 mb-2"
            >
                <DollarSign size={20} />
                <span className="text-sm font-black uppercase italic">Activer la Monétisation</span>
            </button>
            <button 
                onClick={() => { onClose(); onOpenSettings(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-brand-800/50 transition-all"
            >
                <Settings size={20} />
                <span className="text-sm font-bold">Paramètres</span>
            </button>
            <button 
                onClick={() => { onClose(); onOpenSupport(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-brand-800/50 transition-all"
            >
                <HelpCircle size={20} />
                <span className="text-sm font-bold">Aide en ligne</span>
            </button>

            <div className="h-px bg-brand-800 my-2 mx-3"></div>
            
            <div className="px-3 py-2">
                <button 
                    onClick={handleDownloadApp}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase py-3 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg flex flex-col items-center justify-center gap-1 border border-blue-400/30 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className="flex items-center gap-2 relative z-10">
                        <Download size={16} className="animate-bounce" />
                        <span>Télécharger l'App</span>
                    </div>
                    <span className="text-[9px] text-blue-200 font-medium relative z-10 bg-black/20 px-2 py-0.5 rounded-full mt-1">
                        +100 CFA Offerts !
                    </span>
                </button>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-800 bg-brand-900">
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 text-sm font-bold py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                <LogOut size={18} /> Déconnexion
            </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;