import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Users, MessageCircle, Search, Paperclip, Image as ImageIcon, Video, FileText, Phone, PhoneCall, BrainCircuit } from 'lucide-react';
import { ChatMessage, Match } from '../types';
import { t } from '../services/localization';
import { storageService } from '../services/storageService';
import { db } from '../services/database';
import { fetchMatches } from '../services/sportApiService';
import { generateChatBotMessage } from '../services/geminiService';

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// Données simulées
const FAKE_USERS = [
    { name: "Moussa237", phone: "694***84" },
    { name: "BetKing_Pro", phone: "677***22" },
    { name: "SarahFoot", phone: "655***11" },
    { name: "Lions237", phone: "699***00" }
];
const FAKE_MESSAGES = [
  "Ce match est incroyable ! 🔥",
  "Qui a misé sur le nul ?",
  "Regardez ce but !",
  "La cote du Real monte !",
  "Allez les lions !!! 🦁",
];

const LiveChat: React.FC<LiveChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'System', text: 'Bienvenue dans le Chat Live SportBot Pro !', time: 'Now', isUser: false, isSystem: true },
    { id: '2', user: 'Moussa237', phone: '694***84', text: 'Salut la team, des pronos pour ce soir ?', time: '12:00', isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<{user: string, type: 'voice' | 'video'} | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiBotActive, setAiBotActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = storageService.getUser();

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Simulation de messages entrants & IA BOT Logic
  useEffect(() => {
    if (!isOpen) return;

    // Standard Fake Users
    const interval = setInterval(() => {
      const randomUser = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
      const randomMsg = FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)];
      
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        user: randomUser.name,
        phone: randomUser.phone,
        text: randomMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false
      };

      setMessages(prev => [...prev.slice(-50), newMsg]);
    }, 5500);

    // GEMINI BOT TRIGGER
    if (!aiBotActive) {
        setAiBotActive(true);
        setTimeout(async () => {
            const bets = db.getBets();
            const lastBet = bets.length > 0 ? bets[0] : undefined;
            const matches = await fetchMatches();
            // Look for Maroc vs Senegal specifically
            const featured = matches.find(m => m.homeTeam === 'Maroc' && m.awayTeam === 'Sénégal') || matches[0];

            const aiText = await generateChatBotMessage(lastBet, featured);

            const botMsg: ChatMessage = {
                id: `ai_${Date.now()}`,
                user: "Gemini_Analyst",
                phone: "IA",
                text: aiText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isUser: false,
                isSystem: true // Styling choice
            };
            setMessages(prev => [...prev, botMsg]);
        }, 3000); // Wait 3s after opening chat to inject bot message
    }

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    let attachment = undefined;
    if (selectedFile) {
        const type = selectedFile.type.startsWith('image/') ? 'image' : selectedFile.type.startsWith('video/') ? 'video' : 'file';
        attachment = {
            type: type as any,
            url: URL.createObjectURL(selectedFile),
            name: selectedFile.name
        };
    }

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: currentUser?.name || 'Moi',
      phone: currentUser?.phone || 'Unknown',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
      attachment: attachment
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setSelectedFile(null);
    setUploadMenuOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
          setUploadMenuOpen(false);
      }
  };

  const startCall = (user: string, type: 'voice' | 'video') => {
      setActiveCall({ user, type });
      // Simulate call duration
      setTimeout(() => {
          setActiveCall(null);
      }, 5000); // Auto close after 5s for demo
  };

  const filteredMessages = messages.filter(msg => 
      msg.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
      msg.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
      <div className="absolute inset-0 bg-black/60 pointer-events-auto backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-brand-900 w-full max-w-3xl mx-auto rounded-t-3xl shadow-2xl border-t border-brand-accent/50 pointer-events-auto flex flex-col h-[85vh] md:h-[600px] transform transition-transform duration-300 relative">
        
        {/* CALL OVERLAY */}
        {activeCall && (
            <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center rounded-t-3xl animate-fade-in">
                <div className="w-24 h-24 rounded-full bg-brand-800 border-4 border-brand-accent flex items-center justify-center mb-4 animate-pulse">
                     {activeCall.type === 'video' ? <Video size={40} className="text-white"/> : <Phone size={40} className="text-white"/>}
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{t('calling')}</h3>
                <p className="text-slate-400 mb-8">{activeCall.user}</p>
                <button 
                    onClick={() => setActiveCall(null)}
                    className="bg-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-red-600 transition-colors"
                >
                    {t('endCall')}
                </button>
            </div>
        )}

        {/* Header */}
        <div className="p-4 bg-brand-800 rounded-t-3xl border-b border-brand-700 flex flex-col gap-3 shadow-lg z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="relative">
                <MessageCircle className="text-brand-accent" size={24} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                </div>
                <div>
                <h3 className="font-bold text-white leading-tight">Fan Zone Live</h3>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Users size={10} /> 1,243 en ligne
                </p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-brand-700 rounded-full text-slate-400 hover:text-white transition-colors">
                <X size={20} />
            </button>
          </div>
          
          {/* SEARCH BAR */}
          <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input 
                 type="text" 
                 placeholder={t('searchTeam')} 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-brand-900 rounded-xl pl-10 pr-4 py-2 text-sm text-white border border-brand-700 focus:border-brand-accent focus:outline-none placeholder:text-slate-600"
              />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-900 scroll-smooth">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center my-4' : msg.isUser ? 'items-end' : 'items-start'}`}>
              
              {msg.isSystem ? (
                <span className={`text-xs px-3 py-1 rounded-full border font-medium flex items-center gap-2 ${msg.user === 'Gemini_Analyst' ? 'bg-purple-900/50 text-purple-300 border-purple-500/50' : 'bg-brand-800 text-brand-accent border-brand-700'}`}>
                  {msg.user === 'Gemini_Analyst' && <BrainCircuit size={12} />}
                  {msg.text}
                </span>
              ) : (
                <div className={`max-w-[85%] ${msg.isUser ? 'order-1' : 'order-2'}`}>
                  {!msg.isUser && (
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-slate-300 font-bold">{msg.user}</span>
                        <span className="text-[9px] text-brand-accent font-mono border border-brand-700 px-1 rounded bg-black/20">{msg.phone}</span>
                        <div className="flex gap-1">
                            <button onClick={() => startCall(msg.user, 'voice')} className="p-1 hover:bg-white/10 rounded"><Phone size={10} className="text-green-400"/></button>
                            <button onClick={() => startCall(msg.user, 'video')} className="p-1 hover:bg-white/10 rounded"><Video size={10} className="text-blue-400"/></button>
                        </div>
                    </div>
                  )}
                  
                  <div className={`px-4 py-2 rounded-2xl text-sm relative shadow-sm ${
                    msg.isUser 
                      ? 'bg-brand-accent text-brand-900 rounded-tr-none font-medium' 
                      : 'bg-brand-800 text-slate-200 rounded-tl-none border border-brand-700'
                  }`}>
                    {/* Attachments */}
                    {msg.attachment && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-black/10">
                            {msg.attachment.type === 'image' && <img src={msg.attachment.url} alt="att" className="max-w-full h-auto" referrerPolicy="no-referrer" />}
                            {msg.attachment.type === 'video' && <video src={msg.attachment.url} controls className="max-w-full h-auto" />}
                            {msg.attachment.type === 'file' && (
                                <div className="flex items-center gap-2 p-2 bg-black/20">
                                    <FileText size={20} />
                                    <span className="text-xs underline truncate">{msg.attachment.name}</span>
                                </div>
                            )}
                        </div>
                    )}
                    {msg.text}
                  </div>
                  <span className={`text-[9px] text-slate-600 mt-1 block ${msg.isUser ? 'text-right mr-1' : 'ml-1'}`}>
                    {msg.time}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-brand-800 border-t border-brand-700 safe-area-pb relative">
          
          {/* File Upload Preview */}
          {selectedFile && (
              <div className="absolute bottom-full left-0 right-0 p-2 bg-brand-800 border-t border-brand-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white">
                      <FileText size={16} className="text-brand-accent" />
                      {selectedFile.name}
                  </div>
                  <button onClick={() => setSelectedFile(null)}><X size={16} className="text-red-500"/></button>
              </div>
          )}

          {/* Upload Menu */}
          {uploadMenuOpen && (
              <div className="absolute bottom-16 left-4 bg-brand-800 border border-brand-700 rounded-xl shadow-xl p-2 flex flex-col gap-2 animate-fade-in z-20">
                  <button className="flex items-center gap-3 px-4 py-2 hover:bg-brand-700 rounded-lg text-white text-sm" onClick={() => fileInputRef.current?.click()}>
                      <ImageIcon size={18} className="text-blue-400"/> Image / Vidéo
                  </button>
                  <button className="flex items-center gap-3 px-4 py-2 hover:bg-brand-700 rounded-lg text-white text-sm" onClick={() => fileInputRef.current?.click()}>
                      <FileText size={18} className="text-yellow-400"/> Document (PDF)
                  </button>
              </div>
          )}

          <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*,video/*,application/pdf"
             onChange={handleFileSelect}
          />

          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <button 
                type="button" 
                onClick={() => setUploadMenuOpen(!uploadMenuOpen)}
                className="p-3 text-slate-400 hover:text-white hover:bg-brand-700 rounded-full transition-colors"
            >
                <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('typeMessage')}
              className="flex-1 bg-brand-900 text-white placeholder-slate-500 text-sm rounded-full px-4 py-3 border border-brand-700 focus:border-brand-accent focus:outline-none transition-colors"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim() && !selectedFile}
              className="bg-brand-accent text-brand-900 rounded-full p-3 hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Send size={20} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default LiveChat;