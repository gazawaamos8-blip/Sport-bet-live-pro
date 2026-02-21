
import React from 'react';
import { X, Server, ShieldCheck, MapPin, Globe, Award, Database, CloudLightning, Activity } from 'lucide-react';
import { t } from '../services/localization';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl overflow-y-auto animate-fade-in">
        
        {/* Navigation Bar Style */}
        <div className="sticky top-0 z-50 bg-brand-900/90 border-b border-brand-700 backdrop-blur-md px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Globe className="text-brand-accent" size={24} />
                <h2 className="text-xl font-black text-white italic tracking-tighter">SPORTBET<span className="text-brand-accent">CORP</span></h2>
            </div>
            <button onClick={onClose} className="p-2 bg-brand-800 rounded-full hover:bg-brand-700 text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-12">
            
            {/* Hero Section */}
            <div className="text-center space-y-4 py-10">
                <div className="inline-block p-4 rounded-full bg-brand-800 border-2 border-brand-accent shadow-[0_0_30px_rgba(0,208,98,0.3)] mb-4">
                    <Award size={48} className="text-brand-accent" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase leading-tight">
                    Le Futur du <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-emerald-400">Pari Sportif</span>
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Une infrastructure technologique unique combinant intelligence artificielle, streaming ultra-rapide et sécurité bancaire.
                </p>
            </div>

            {/* Server Status Grid (The "dB Server" aspect) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "DB Cluster Europe", status: "Online", ping: "24ms", color: "green", icon: Database },
                    { label: "Stream CDN Africa", status: "Active", ping: "45ms", color: "blue", icon: CloudLightning },
                    { label: "AI Prediction Engine", status: "Processing", ping: "12ms", color: "purple", icon: Activity },
                ].map((server, idx) => (
                    <div key={idx} className="bg-brand-800 p-6 rounded-2xl border border-brand-700 hover:border-brand-600 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <server.icon className={`text-${server.color}-400 group-hover:scale-110 transition-transform`} size={28} />
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full bg-${server.color}-500 animate-pulse`}></span>
                                <span className={`text-xs font-bold text-${server.color}-400 uppercase`}>{server.status}</span>
                            </div>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">{server.label}</h3>
                        <p className="text-slate-500 text-sm font-mono">Latency: {server.ping}</p>
                    </div>
                ))}
            </div>

            {/* Visual Feature Showcase with Images from URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <h3 className="text-3xl font-black text-white uppercase italic">Immersion Totale</h3>
                    <p className="text-slate-300 leading-relaxed">
                        Vivez chaque match comme si vous y étiez. Nos serveurs vidéo dédiés récupèrent les flux satellites les plus stables pour une expérience sans coupure, même en 3G/4G.
                    </p>
                    <ul className="space-y-3">
                        {["Multi-Vue 4K", "Replays Instantanés", "Statistiques Live Data"].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-200 font-bold">
                                <div className="bg-brand-accent/20 p-1 rounded-full"><ShieldCheck size={14} className="text-brand-accent" /></div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-brand-700 group">
                    <img 
                        src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1000" 
                        alt="Stadium Tech" 
                        className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900 to-transparent opacity-80"></div>
                    <div className="absolute bottom-4 left-4">
                        <span className="bg-brand-accent text-brand-900 text-xs font-black px-2 py-1 rounded">LIVE FEED TECH</span>
                    </div>
                </div>
            </div>

            {/* Partners / Trust */}
            <div className="bg-brand-800 rounded-3xl p-8 border border-brand-700 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-6">Partenaires Technologiques</p>
                <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Cloud_logo.svg/1024px-Google_Cloud_logo.svg.png" className="h-8" alt="Google Cloud" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png" className="h-8 invert" alt="Apple" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg" className="h-8" alt="MongoDB" />
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-brand-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
                <p>&copy; 2025 SportBet Corp. Tous droits réservés.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <span>Termes & Conditions</span>
                    <span>Confidentialité</span>
                    <span>Licence #893-22</span>
                </div>
            </div>

        </div>
    </div>
  );
};

export default AboutModal;
