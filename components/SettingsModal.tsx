import React, { useState, useEffect } from 'react';
import { X, Globe, Bell, Check, Moon, Sun, ShieldCheck, Fingerprint } from 'lucide-react';
import { setAppLanguage, getAppLanguage, t, Language } from '../services/localization';
import { db } from '../services/database';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void; // Trigger app re-render
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onUpdate }) => {
  const [language, setLanguage] = useState<Language>(getAppLanguage());
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notifs, setNotifs] = useState({
    push: true,
    sms: false,
    email: true
  });

  useEffect(() => {
    // Load current state
    const storedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if(storedTheme) setTheme(storedTheme);

    const user = db.getUser();
    if (user) {
        setBiometricEnabled(user.isBiometricEnabled);
        if (user.notifications) setNotifs(user.notifications);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setAppLanguage(lang);
    onUpdate(); // Refresh translations in parent
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('bg-brand-900');
        document.body.classList.add('bg-slate-100');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('bg-brand-900');
        document.body.classList.remove('bg-slate-100');
    }
    onUpdate();
  };

  const saveSettings = () => {
      const user = db.getUser();
      if (user) {
          user.isBiometricEnabled = biometricEnabled;
          user.notifications = notifs;
          db.saveUser(user);
          alert("Paramètres sauvegardés avec succès !");
      }
      onClose();
  };

  const languages: {id: Language, label: string, flag: string}[] = [
    { id: 'fr', label: 'Français', flag: '🇫🇷' },
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'es', label: 'Español', flag: '🇪🇸' },
    { id: 'zh', label: '中文 (Chinois)', flag: '🇨🇳' },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-brand-900 w-full max-w-sm rounded-2xl border border-brand-700 shadow-2xl animate-fade-in overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-4 bg-brand-800 border-b border-brand-700 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-bold text-white text-lg">{t('settings')}</h3>
          <button onClick={onClose} className="p-2 bg-brand-900 rounded-full hover:bg-brand-700 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
            
            {/* Langue */}
            <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <Globe size={16} /> {t('language')}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    {languages.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => handleLanguageChange(lang.id)}
                            className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                                language === lang.id 
                                ? 'bg-brand-accent/20 border-brand-accent text-white' 
                                : 'bg-brand-800 border-brand-700 text-slate-400 hover:border-slate-500'
                            }`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="text-sm font-bold">{lang.label}</span>
                            {language === lang.id && <Check size={16} className="text-brand-accent ml-auto" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-px bg-brand-800"></div>

            {/* Theme */}
            <div>
                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} {t('theme')}
                </h4>
                <div className="flex bg-brand-800 p-1 rounded-xl border border-brand-700">
                    <button 
                        onClick={() => handleThemeChange('dark')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'bg-brand-900 text-brand-accent shadow' : 'text-slate-400'}`}
                    >
                        <Moon size={14} /> {t('darkMode')}
                    </button>
                    <button 
                        onClick={() => handleThemeChange('light')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${theme === 'light' ? 'bg-white text-brand-900 shadow' : 'text-slate-400'}`}
                    >
                        <Sun size={14} /> {t('lightMode')}
                    </button>
                </div>
            </div>

            <div className="h-px bg-brand-800"></div>

            {/* Sécurité */}
            <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <ShieldCheck size={16} /> Sécurité
                </h4>
                <div className="bg-brand-800 rounded-xl p-4 border border-brand-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Fingerprint size={20} className={biometricEnabled ? "text-green-500" : "text-slate-500"} />
                            <span className="text-sm text-white font-medium">Connexion Biométrique</span>
                        </div>
                        <button 
                            onClick={() => setBiometricEnabled(!biometricEnabled)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${biometricEnabled ? 'bg-brand-accent' : 'bg-brand-900'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${biometricEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-px bg-brand-800"></div>

            {/* Notifications */}
            <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <Bell size={16} /> {t('notifications')}
                </h4>
                <div className="space-y-3 bg-brand-800 rounded-xl p-4 border border-brand-700">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-white font-medium">Notifications Push</span>
                        <button 
                            onClick={() => setNotifs({...notifs, push: !notifs.push})}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${notifs.push ? 'bg-brand-accent' : 'bg-brand-900'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${notifs.push ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-white font-medium">Emails Promo</span>
                        <button 
                            onClick={() => setNotifs({...notifs, email: !notifs.email})}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${notifs.email ? 'bg-brand-accent' : 'bg-brand-900'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${notifs.email ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            <button onClick={saveSettings} className="w-full bg-brand-700 text-white py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors">
                {t('save')}
            </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;