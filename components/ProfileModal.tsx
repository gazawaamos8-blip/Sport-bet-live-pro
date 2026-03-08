import React from 'react';
import { User, AppSection } from '../types';
import { X, User as UserIcon, Phone, ShieldCheck, LogOut, ChevronRight, CreditCard, Settings, HelpCircle, Copy, Clock } from 'lucide-react';
import { db } from '../services/database';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  onOpenWallet: () => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
  onNavigate?: (section: AppSection) => void; // Added prop for navigation
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onLogout, onOpenWallet, onOpenSettings, onOpenSupport, onNavigate }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(user.name);

  if (!isOpen) return null;

  const handleSaveName = () => {
      if (newName.trim()) {
          const updatedUser = { ...user, name: newName };
          // This would normally be handled by a prop or context
          // For now we'll use the db directly and hope the parent re-renders
          db.saveUser(updatedUser);
          setIsEditing(false);
          window.location.reload(); // Simple way to refresh state across app
      }
  };

  const accountId = `ID-${user.phone.substring(5)}${user.name.length}`;

  const handleNavigate = (section: AppSection) => {
      if (onNavigate) {
          onNavigate(section);
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Slide-in Panel */}
      <div className="relative w-full max-w-sm bg-brand-900 h-full shadow-2xl border-l border-brand-700 animate-fade-in flex flex-col">
        
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-brand-800 bg-brand-800">
           <h2 className="text-white font-bold text-lg flex items-center gap-2">
             <UserIcon size={20} className="text-brand-accent" /> Mon Profil
           </h2>
           <button onClick={onClose} className="p-2 bg-brand-900 rounded-full text-slate-400 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>

        {/* User Info Card */}
        <div className="p-6 flex flex-col items-center border-b border-brand-800 bg-gradient-to-b from-brand-800 to-brand-900">
           <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-accent to-emerald-600 p-1 mb-3 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full rounded-full bg-brand-900 flex items-center justify-center text-2xl font-black text-white uppercase">
                 {user.name.substring(0, 2)}
              </div>
           </div>
         {isEditing ? (
             <div className="flex flex-col items-center gap-2 w-full px-10">
                 <input 
                     type="text" 
                     value={newName} 
                     onChange={(e) => setNewName(e.target.value)}
                     className="w-full bg-brand-900 border border-brand-accent rounded-lg px-3 py-2 text-white text-center font-bold focus:outline-none"
                     autoFocus
                 />
                 <div className="flex gap-2 w-full">
                     <button onClick={handleSaveName} className="flex-1 bg-brand-accent text-brand-900 font-bold py-1 rounded-md text-xs">Enregistrer</button>
                     <button onClick={() => setIsEditing(false)} className="flex-1 bg-brand-800 text-slate-400 font-bold py-1 rounded-md text-xs border border-brand-700">Annuler</button>
                 </div>
             </div>
         ) : (
             <div className="flex flex-col items-center">
                 <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                     {user.name}
                     <button onClick={() => setIsEditing(true)} className="p-1 text-slate-500 hover:text-brand-accent transition-colors">
                         <Settings size={14} />
                     </button>
                 </h3>
             </div>
         )}
         <div className="flex items-center gap-2 bg-brand-800 px-3 py-1 rounded-full border border-brand-700 mt-2">
              <span className="text-xs text-slate-400">ID: <span className="text-white font-mono">{accountId}</span></span>
              <Copy size={12} className="text-slate-500 cursor-pointer hover:text-white" />
           </div>
        </div>

        {/* Balance Section */}
        <div className="p-4 m-4 bg-brand-800 rounded-2xl border border-brand-700 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><CreditCard size={80} /></div>
           <p className="text-xs text-slate-400 uppercase font-bold mb-1">Solde Principal</p>
           <div className="text-3xl font-black text-white font-mono mb-4">{user.balance.toLocaleString()} <span className="text-sm text-brand-accent">FCFA</span></div>
           <div className="flex gap-3">
              <button onClick={() => { onClose(); onOpenWallet(); }} className="flex-1 bg-brand-accent text-brand-900 font-bold py-2 rounded-lg text-sm hover:bg-emerald-400 transition-colors">
                 Dépôt
              </button>
              <button onClick={() => { onClose(); onOpenWallet(); }} className="flex-1 bg-brand-700 text-white font-bold py-2 rounded-lg text-sm border border-brand-600 hover:bg-brand-600 transition-colors">
                 Retrait
              </button>
           </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
           
           {/* New: My Bets Quick Link */}
           {onNavigate && (
               <button 
                  onClick={() => handleNavigate(AppSection.HISTORY)}
                  className="w-full p-3 bg-brand-800 rounded-xl flex items-center gap-3 border border-brand-700 hover:bg-brand-700 transition-all text-left group mb-2"
               >
                  <div className="p-2 bg-brand-900 rounded-lg text-blue-400 group-hover:text-white"><Clock size={18} /></div>
                  <div className="flex-1">
                     <p className="text-sm font-bold text-white">Historique des Paris</p>
                     <p className="text-xs text-slate-500">Voir mes tickets en cours et terminés</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-600" />
               </button>
           )}

           <div className="p-3 bg-brand-800/50 rounded-xl flex items-center gap-3 border border-brand-800 cursor-pointer hover:bg-brand-800 hover:border-brand-700 transition-all">
              <div className="p-2 bg-brand-900 rounded-lg text-slate-400"><Phone size={18} /></div>
              <div className="flex-1">
                 <p className="text-sm font-bold text-white">Téléphone</p>
                 <p className="text-xs text-slate-500 font-mono">{user.phone}</p>
              </div>
              <div className="bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Vérifié</div>
           </div>

           <button 
              onClick={() => { onClose(); onOpenSupport(); }}
              className="w-full p-3 bg-brand-800/50 rounded-xl flex items-center gap-3 border border-brand-800 hover:bg-brand-800 hover:border-brand-700 transition-all text-left group"
           >
              <div className="p-2 bg-brand-900 rounded-lg text-slate-400 group-hover:text-brand-accent"><ShieldCheck size={18} /></div>
              <div className="flex-1">
                 <p className="text-sm font-bold text-white">Sécurité</p>
                 <p className="text-xs text-slate-500">Mot de passe, Biométrie</p>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
           </button>

           <button 
              onClick={() => { onClose(); onOpenSettings(); }}
              className="w-full p-3 bg-brand-800/50 rounded-xl flex items-center gap-3 border border-brand-800 hover:bg-brand-800 hover:border-brand-700 transition-all text-left group"
           >
              <div className="p-2 bg-brand-900 rounded-lg text-slate-400 group-hover:text-brand-accent"><Settings size={18} /></div>
              <div className="flex-1">
                 <p className="text-sm font-bold text-white">Paramètres</p>
                 <p className="text-xs text-slate-500">Langue, Notifications</p>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
           </button>

           <button 
              onClick={() => { onClose(); onOpenSupport(); }}
              className="w-full p-3 bg-brand-800/50 rounded-xl flex items-center gap-3 border border-brand-800 hover:bg-brand-800 hover:border-brand-700 transition-all text-left group"
           >
              <div className="p-2 bg-brand-900 rounded-lg text-slate-400 group-hover:text-brand-accent"><HelpCircle size={18} /></div>
              <div className="flex-1">
                 <p className="text-sm font-bold text-white">Aide & Support</p>
                 <p className="text-xs text-slate-500">FAQ, Contact, WhatsApp</p>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
           </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-800">
           <button onClick={onLogout} className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={18} /> Déconnexion
           </button>
           <p className="text-center text-[10px] text-slate-600 mt-3 font-mono">Version 2.5.0 (Build 2026)</p>
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;