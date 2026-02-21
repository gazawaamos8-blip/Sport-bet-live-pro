
import React, { useState } from 'react';
import { Menu, Search, Bell, X, Trash2, Plus, User as UserIcon } from 'lucide-react';

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

  const notifications = [
    { id: 1, text: "Match Manchester City vs Liverpool commence dans 15 min !", read: false },
    { id: 2, text: "Votre dépôt de 5,000 F a été confirmé.", read: true },
    { id: 3, text: "Bonus du jour disponible : Réclamez maintenant !", read: false }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-brand-900/95 backdrop-blur-md border-b border-brand-800 h-16 flex items-center justify-between px-3 md:px-4">
      
      {/* Left: Menu & Brand */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-brand-800 rounded-lg transition-colors text-white"
        >
          <Menu size={24} />
        </button>
        <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-accent bg-clip-text text-transparent hidden sm:block">
          SportBet<span className="text-white">Pro</span>
        </div>
      </div>

      {/* Middle: Search Bar (Expandable) */}
      {showSearch ? (
        <div className="flex-1 max-w-md mx-2 md:mx-4 animate-fade-in relative z-50">
           <input 
             type="text" 
             placeholder="Rechercher équipe, ligue..." 
             value={searchQuery}
             onChange={handleSearchChange}
             className="w-full bg-brand-800 border border-brand-700 rounded-full py-2 pl-4 pr-10 text-white text-sm focus:border-brand-accent focus:outline-none"
             autoFocus
           />
           <button 
             onClick={clearSearch}
             className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
           >
             <X size={16} />
           </button>
        </div>
      ) : (
        <div className="flex-1"></div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* Search Icon */}
        {!showSearch && (
          <button 
            onClick={() => setShowSearch(true)}
            className="p-2 hover:bg-brand-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <Search size={20} />
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 hover:bg-brand-800 rounded-full text-slate-400 hover:text-white transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowNotifs(false)}></div>
              <div className="absolute right-0 top-12 w-72 bg-brand-800 border border-brand-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                 <div className="p-3 bg-brand-900 border-b border-brand-700 flex justify-between items-center">
                    <h4 className="font-bold text-white text-sm">Notifications</h4>
                    <button className="text-[10px] text-brand-accent hover:underline">Tout marquer lu</button>
                 </div>
                 <div className="max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                       <div key={n.id} className={`p-3 border-b border-brand-700 hover:bg-brand-700/50 transition-colors flex gap-3 ${!n.read ? 'bg-brand-700/20' : ''}`}>
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? 'bg-slate-600' : 'bg-brand-accent'}`}></div>
                          <p className="text-xs text-slate-300 leading-snug">{n.text}</p>
                       </div>
                    ))}
                 </div>
                 <div className="p-2 bg-brand-900 text-center">
                    <button className="text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1 w-full">
                       <Trash2 size={12} /> Effacer tout
                    </button>
                 </div>
              </div>
            </>
          )}
        </div>

        {/* Balance & Recharge (New Design) */}
        <div className="flex items-center bg-brand-800 rounded-full p-1 pl-3 border border-brand-700 shadow-sm">
           <span className="font-mono font-bold text-white text-xs md:text-sm mr-2 whitespace-nowrap">
             {balance.toLocaleString()} F
           </span>
           <button 
             onClick={onOpenWallet}
             className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-brand-accent hover:bg-emerald-400 text-brand-900 flex items-center justify-center transition-colors shadow-lg"
             title="Recharger"
           >
             <Plus size={16} strokeWidth={3} />
           </button>
        </div>

        {/* User Profile Avatar */}
        <button 
          onClick={onOpenProfile}
          className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-lg hover:scale-105 transition-transform"
        >
          <UserIcon size={16} className="text-white" />
        </button>

      </div>
    </nav>
  );
};

export default Navbar;