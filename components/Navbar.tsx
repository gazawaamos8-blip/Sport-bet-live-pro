
import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, X, Trash2, Plus, User as UserIcon, Activity, Wallet, Gift, ShieldCheck, Info } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { db } from '../services/database';
import { notificationService, AppNotification } from '../services/notificationService';

interface NavbarProps {
  onMenuClick: () => void;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
  balance: number;
  onSearch: (query: string) => void; // New prop
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, onOpenWallet, onOpenProfile, balance, onSearch }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);
  const [vpnEnabled, setVpnEnabled] = useState(false);

  useEffect(() => {
    const checkVpn = () => {
        setVpnEnabled(localStorage.getItem('vpn_enabled') === 'true');
    };
    checkVpn();
    window.addEventListener('storage', checkVpn);
    return () => window.removeEventListener('storage', checkVpn);
  }, []);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notifs) => {
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchQuery(val);
      onSearch(val);
  };

  const clearSearch = () => {
      setShowSearch(false);
      setSearchQuery('');
      onSearch('');
  };

  const getNotifIcon = (type: string) => {
      switch(type) {
          case 'bet_won': return <Activity size={14} className="text-emerald-500" />;
          case 'bet_lost': return <Activity size={14} className="text-red-500" />;
          case 'deposit': return <Wallet size={14} className="text-blue-500" />;
          case 'withdrawal': return <Wallet size={14} className="text-orange-500" />;
          case 'bonus': return <Gift size={14} className="text-brand-accent" />;
          default: return <Info size={14} className="text-slate-400" />;
      }
  };

  return (
    <div className="sticky top-0 z-50">
      <nav className="bg-brand-900/95 backdrop-blur-md border-b border-brand-800 h-16 flex items-center justify-between px-3 md:px-4">
      
      {/* Left: Menu & Brand */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-brand-800 rounded-lg transition-colors text-white"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <BrandIcon size={32} className="flex-shrink-0" />
          <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-accent bg-clip-text text-transparent hidden sm:block">
            SportBot<span className="text-white">Pro</span>
          </div>
          <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full ml-1 hidden xs:flex">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Live</span>
          </div>
        </div>
      </div>

      {/* Middle: Search Bar (Expandable) */}
      <div className={`flex-1 max-w-2xl mx-2 md:mx-8 transition-all duration-500 ease-in-out relative ${showSearch ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none md:opacity-100 md:scale-100 md:pointer-events-auto'}`}>
         <div className="relative group">
            <div 
              className="absolute inset-y-0 left-0 pl-4 flex items-center cursor-pointer z-10"
              onClick={() => onSearch(searchQuery)}
            >
              <Search size={18} className="text-slate-500 group-focus-within:text-brand-accent transition-all duration-300" />
            </div>
            <input 
              type="text" 
              placeholder="Rechercher équipe, ligue, match..." 
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => onSearch(searchQuery)}
              className="w-full bg-brand-800/40 backdrop-blur-sm hover:bg-brand-800/60 border border-brand-700/50 rounded-2xl py-3 pl-12 pr-12 text-white text-sm focus:border-brand-accent focus:bg-brand-800 focus:ring-8 focus:ring-brand-accent/5 focus:outline-none transition-all placeholder:text-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); onSearch(''); }}
                    className="text-slate-500 hover:text-white p-1.5 hover:bg-brand-700 rounded-full transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
                <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-brand-900/50 border border-brand-700 rounded-lg text-[10px] font-bold text-slate-500">
                    <span className="text-slate-400">⌘</span>
                    <span>K</span>
                </div>
            </div>
         </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 md:gap-5 ml-auto flex-shrink-0">
        
        {/* Search Toggle (Always visible on mobile) */}
        <button 
          onClick={() => setShowSearch(!showSearch)}
          className="p-1.5 sm:p-2.5 rounded-2xl transition-all md:hidden text-slate-400 hover:bg-brand-800 hover:text-white flex-shrink-0"
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className={`p-1.5 sm:p-2.5 rounded-2xl transition-all relative group ${showNotifs ? 'bg-brand-accent text-brand-900 shadow-[0_0_20px_rgba(0,208,98,0.4)]' : 'text-slate-400 hover:bg-brand-800 hover:text-white'}`}
          >
            <Bell size={18} sm:size={20} className={showNotifs ? 'animate-none' : 'group-hover:animate-bounce'} />
            {unreadCount > 0 && (
              <span className={`absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-brand-900 transition-transform ${showNotifs ? 'scale-0' : 'scale-100 animate-pulse'}`}></span>
            )}
          </button>

          {/* Notifications Dropdown (The "Centre") */}
          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowNotifs(false)}></div>
              <div className="fixed md:absolute inset-x-4 md:inset-x-auto md:right-0 top-20 md:top-16 w-auto md:w-[440px] bg-brand-900 border border-brand-700/50 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-fade-in ring-1 ring-white/10">
                 <div className="p-6 bg-gradient-to-br from-brand-800 to-brand-900 border-b border-brand-700/50 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-[20px] bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20 shadow-inner">
                            <Bell size={24} className="text-brand-accent" />
                        </div>
                        <div>
                            <h4 className="font-black text-white text-base uppercase tracking-tighter leading-none mb-1">Centre de Notifications</h4>
                            <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${unreadCount > 0 ? 'bg-brand-accent animate-pulse' : 'bg-slate-500'}`}></span>
                                <p className="text-[10px] text-brand-accent font-black uppercase tracking-widest">{unreadCount} Nouveaux messages</p>
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-brand-900/80 backdrop-blur-xl">
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                           <div 
                             key={n.id} 
                             onClick={() => notificationService.markAsRead(n.id)}
                             className={`p-6 border-b border-brand-800/30 hover:bg-brand-800/50 transition-all flex gap-5 cursor-pointer relative group ${!n.read ? 'bg-brand-accent/[0.03]' : 'opacity-50'}`}
                           >
                              {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-accent shadow-[0_0_15px_rgba(0,208,98,0.5)]"></div>}
                              <div className={`mt-1 w-12 h-12 rounded-[22px] flex items-center justify-center flex-shrink-0 border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${!n.read ? 'bg-brand-900 border-brand-600 shadow-xl' : 'bg-brand-900/50 border-brand-800'}`}>
                                  {getNotifIcon(n.type)}
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                      <h5 className={`text-sm font-black tracking-tight leading-tight ${!n.read ? 'text-white' : 'text-slate-400'}`}>{n.title}</h5>
                                      <span className="text-[10px] text-slate-500 font-black bg-brand-800/80 px-2.5 py-1 rounded-xl border border-brand-700/50">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">{n.message}</p>
                                  {!n.read && (
                                      <div className="mt-4 flex gap-3">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedNotif(n); notificationService.markAsRead(n.id); }}
                                            className="text-[10px] font-black uppercase text-brand-900 bg-brand-accent px-4 py-1.5 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-brand-accent/20"
                                          >
                                            Voir détails
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); notificationService.markAsRead(n.id); }}
                                            className="text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors px-2"
                                          >
                                            Ignorer
                                          </button>
                                      </div>
                                  )}
                              </div>
                           </div>
                        ))
                    ) : (
                        <div className="py-24 text-center flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-brand-800/50 flex items-center justify-center mb-5 text-slate-700 border border-brand-700/50">
                                <Bell size={40} />
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-tight">Aucune notification</p>
                            <p className="text-slate-600 text-[10px] font-black uppercase mt-2 tracking-widest">Vous êtes à jour !</p>
                        </div>
                    )}
                 </div>
                 
                 <div className="p-5 bg-brand-900 border-t border-brand-800 flex items-center justify-between">
                    <button 
                      onClick={() => notificationService.clearAll()}
                      className="text-[11px] font-black uppercase text-slate-500 hover:text-red-500 transition-all flex items-center gap-2 group"
                    >
                       <Trash2 size={16} className="group-hover:rotate-12 transition-transform" /> Tout effacer
                    </button>
                    <div className="flex gap-4">
                        <button className="text-[11px] font-black uppercase text-slate-500 hover:text-white transition-colors">
                           Aide
                        </button>
                        <button className="text-[11px] font-black uppercase text-brand-accent hover:text-emerald-400 transition-colors">
                           Paramètres
                        </button>
                    </div>
                 </div>
              </div>
            </>
          )}
        </div>

        {/* Balance Pill */}
        <div 
          className="flex items-center bg-brand-800 rounded-full px-1.5 xs:px-2 sm:px-3 py-1.5 border border-brand-700 shadow-inner h-8 sm:h-9 flex-shrink-0 max-w-[60px] xs:max-w-[85px] sm:max-w-[150px] md:max-w-[200px] overflow-hidden cursor-help"
          title={`${balance.toLocaleString()} F`}
        >
           <span className="font-mono font-bold text-white text-[9px] xs:text-[10px] sm:text-xs md:text-sm whitespace-nowrap truncate">
             {balance.toLocaleString()} F
           </span>
        </div>

        {/* Recharge Button */}
        <button 
          onClick={onOpenWallet}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-accent hover:bg-emerald-400 text-brand-900 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(0,208,98,0.3)] hover:scale-110 active:scale-90 flex-shrink-0 z-10"
          title="Recharger"
        >
          <Plus size={16} sm:size={18} strokeWidth={3} />
        </button>

        {/* User Profile Avatar */}
        <button 
          onClick={onOpenProfile}
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-brand-accent via-brand-500 to-purple-600 flex items-center justify-center border-2 border-white/30 shadow-[0_0_20px_rgba(0,208,98,0.3)] hover:scale-110 active:scale-90 transition-all ring-2 ring-brand-accent/20 flex-shrink-0 z-10"
        >
          <UserIcon size={16} sm:size={18} className="text-white drop-shadow-md" />
        </button>
      </div>

    </nav>
    </div>
  );
};

export default Navbar;