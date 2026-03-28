import React, { useState, useEffect } from 'react';
import { Search, Bookmark, Share2, MessageSquare, TrendingUp, X, Send, Bell, Smartphone, ShieldCheck, Zap, AlertCircle, Trophy, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/database';
import { subscribeToOrangeAlerts, getOrangeSportAlerts, OrangeSportAlert } from '../services/orangeSportService';

interface NewsArticle {
  id: string;
  title: string;
  category: 'transfer' | 'match' | 'injury' | 'odds' | 'africa' | 'video';
  image: string;
  videoUrl?: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  views: number;
  comments: number;
  isBookmarked?: boolean;
  isTrending?: boolean;
}

interface NewsHubProps {
  globalSearchQuery?: string;
}

const NewsHub: React.FC<NewsHubProps> = ({ globalSearchQuery = '' }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [orangeAlerts, setOrangeAlerts] = useState<OrangeSportAlert[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [commentText, setCommentText] = useState('');
  const [publishForm, setPublishForm] = useState({ title: '', category: 'africa', content: '', imageUrl: '', videoUrl: '' });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'image') {
        setPublishForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      } else {
        // For video, we might just store the blob URL for preview
        setPublishForm(prev => ({ ...prev, videoUrl: URL.createObjectURL(file) }));
      }
      setIsUploading(false);
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { msg: `${type === 'image' ? 'Image' : 'Vidéo'} chargée !`, type: 'success' } 
      }));
    };
    if (type === 'image') {
      reader.readAsDataURL(file);
    } else {
      // For video, we'll just use the blob URL directly
      setPublishForm(prev => ({ ...prev, videoUrl: URL.createObjectURL(file) }));
      setIsUploading(false);
    }
  };

  const searchQuery = globalSearchQuery || localSearchQuery;

  useEffect(() => {
    // Generate mock articles
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        title: "Mercato: Kylian Mbappé vers le Real Madrid, c'est fait !",
        category: 'transfer',
        image: "https://picsum.photos/seed/mbappe/800/400",
        summary: "Le capitaine de l'équipe de France a enfin signé son contrat avec le club madrilène.",
        content: "Après des années de suspense, le transfert le plus attendu de la décennie est enfin officiel. Kylian Mbappé rejoindra le Real Madrid dès la saison prochaine. Le contrat porterait sur 5 ans avec un salaire record...",
        author: "Jean Dupont",
        date: "Il y a 2h",
        views: 15420,
        comments: 142
      },
      {
        id: '2',
        title: "CAN 2026: Le Sénégal impressionne face au Cameroun",
        category: 'africa',
        image: "https://picsum.photos/seed/can/800/400",
        summary: "Les Lions de la Teranga ont dominé les Lions Indomptables dans un match épique.",
        content: "Dans une ambiance électrique au stade de Dakar, le Sénégal a montré pourquoi il est le favori pour sa propre succession. Sadio Mané a été l'homme du match avec un doublé magistral...",
        author: "Amadou Sow",
        date: "Il y a 5h",
        views: 8900,
        comments: 56
      },
      {
        id: '3',
        title: "Alerte Blessure: Inquiétude pour Erling Haaland",
        category: 'injury',
        image: "https://picsum.photos/seed/haaland/800/400",
        summary: "L'attaquant de Manchester City est sorti sur blessure lors du dernier entraînement.",
        content: "C'est un coup dur pour Pep Guardiola. Erling Haaland souffrirait d'une entorse à la cheville. Sa participation au quart de finale de la Ligue des Champions est fortement compromise...",
        author: "Marc Lefebvre",
        date: "Il y a 1h",
        views: 12300,
        comments: 89
      },
      {
        id: '4',
        title: "Cotes Boostées: Profitez des meilleures offres du weekend",
        category: 'odds',
        image: "https://picsum.photos/seed/odds/800/400",
        summary: "Découvrez notre sélection de cotes boostées pour les matchs de Premier League.",
        content: "Ce weekend s'annonce riche en émotions. SportBot vous propose des cotes exclusives sur les victoires combinées de Liverpool et d'Arsenal. Ne manquez pas cette opportunité de maximiser vos gains...",
        author: "Expert Paris",
        date: "Il y a 8h",
        views: 5600,
        comments: 23
      },
      {
        id: '5',
        title: "Vidéo: Les plus beaux buts de la semaine en Ligue 1",
        category: 'video',
        image: "https://picsum.photos/seed/goals/800/400",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        summary: "Revivez les moments forts de la dernière journée de championnat.",
        content: "De la lucarne de Mbappé au retourné acrobatique de Lacazette, cette semaine a été riche en buts spectaculaires. Voici notre top 5 des plus belles réalisations...",
        author: "SportBot TV",
        date: "Il y a 10h",
        views: 25000,
        comments: 156
      },
      {
        id: '6',
        title: "Transfert: Victor Osimhen pisté par le PSG",
        category: 'transfer',
        image: "https://picsum.photos/seed/osimhen/800/400",
        summary: "Le club parisien cherche un remplaçant à Kylian Mbappé.",
        content: "Le PSG aurait jeté son dévolu sur l'attaquant nigérian de Naples. Une offre de 120 millions d'euros serait en préparation pour convaincre le club italien...",
        author: "Mercato Live",
        date: "Il y a 12h",
        views: 18000,
        comments: 92
      }
    ];
    setArticles(mockArticles);
    setOrangeAlerts(getOrangeSportAlerts());
  }, []);

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'africa', label: '🌍 Afrique' },
    { id: 'transfer', label: '🔄 Mercato' },
    { id: 'match', label: '⚽ Matchs' },
    { id: 'video', label: '📺 Vidéos' },
    { id: 'injury', label: '🏥 Blessures' },
    { id: 'odds', label: '📈 Cotes' },
  ];

  const filteredArticles = articles.filter(a => 
    (activeCategory === 'all' || a.category === activeCategory) &&
    (a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      setSubscriptionMessage({ text: "Veuillez entrer un numéro de téléphone valide.", type: 'error' });
      return;
    }

    setIsSubscribing(true);
    setSubscriptionMessage(null);
    
    const result = await subscribeToOrangeAlerts(phoneNumber);
    
    setIsSubscribing(false);
    setSubscriptionMessage({ 
      text: result.message, 
      type: result.success ? 'success' : 'error' 
    });

    if (result.success) {
      setPhoneNumber('');
      // Clear message after 5 seconds
      setTimeout(() => setSubscriptionMessage(null), 5000);
    }
  };

  const toggleBookmark = (id: string) => {
    setArticles(prev => prev.map(a => 
      a.id === id ? { ...a, isBookmarked: !a.isBookmarked } : a
    ));
  };

  const handlePublish = () => {
    if (!publishForm.title || !publishForm.content) return;
    
    const newArticle: NewsArticle = {
      id: Math.random().toString(36).substring(2, 11),
      title: publishForm.title,
      category: publishForm.category as any,
      image: publishForm.imageUrl || `https://picsum.photos/seed/${publishForm.title}/800/400`,
      videoUrl: publishForm.videoUrl,
      summary: publishForm.content.substring(0, 100) + '...',
      content: publishForm.content,
      author: "Moi",
      date: "À l'instant",
      views: 0,
      comments: 0
    };
    
    setArticles([newArticle, ...articles]);
    setIsPublishModalOpen(false);
    setPublishForm({ title: '', category: 'africa', content: '', imageUrl: '', videoUrl: '' });
    
    // Notify user
    window.dispatchEvent(new CustomEvent('show-notification', { 
      detail: { msg: "Article envoyé pour validation !", type: 'success' } 
    }));
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedArticle) return;
    
    setSelectedArticle({
      ...selectedArticle,
      comments: selectedArticle.comments + 1
    });
    setCommentText('');
    
    window.dispatchEvent(new CustomEvent('show-notification', { 
      detail: { msg: "Commentaire ajouté !", type: 'success' } 
    }));
  };

  const handleBetFromArticle = (selection: string, odds: number) => {
    if (!selectedArticle) return;
    
    const betItem = {
      matchId: `news-${selectedArticle.id}`,
      matchInfo: selectedArticle.title.substring(0, 30),
      selection,
      odds,
      league: "News Special"
    };
    
    // We need to trigger the addToSlip function from App.tsx
    // Since we don't have direct access, we'll use a custom event
    window.dispatchEvent(new CustomEvent('add-to-slip', { detail: betItem }));
    setSelectedArticle(null);
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-brand-800 p-4 sticky top-16 z-10 border-b border-brand-700 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-2">
            <TrendingUp className="text-brand-accent" /> News Hub
          </h2>
          <button 
            onClick={() => setIsPublishModalOpen(true)}
            className="bg-brand-accent text-brand-900 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-400 transition-all shadow-lg"
          >
            Publier un article
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                activeCategory === cat.id 
                ? 'bg-brand-accent text-brand-900 border-brand-accent shadow-lg scale-105' 
                : 'bg-brand-900 text-slate-400 border-brand-700 hover:border-brand-accent/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher une actualité..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full bg-brand-900 border border-brand-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-brand-accent focus:outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Featured Article */}
        {!searchQuery && activeCategory === 'all' && articles.length > 0 && (
          <div 
            onClick={() => setSelectedArticle(articles[0])}
            className="relative h-64 rounded-3xl overflow-hidden border border-brand-700 shadow-2xl group cursor-pointer"
          >
            <img src={articles[0].image} alt={articles[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-brand-accent text-brand-900 text-[9px] font-black px-2 py-0.5 rounded uppercase">À LA UNE</span>
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{articles[0].category}</span>
              </div>
              <h3 className="text-xl font-black text-white leading-tight mb-2 group-hover:text-brand-accent transition-colors">{articles[0].title}</h3>
              <div className="flex items-center gap-3 text-white/60 text-[10px] font-bold">
                <span>{articles[0].author}</span>
                <span>•</span>
                <span>{articles[0].date}</span>
              </div>
            </div>
          </div>
        )}

        {/* Trending Section */}
        {!searchQuery && (
          <div className="bg-brand-800/50 rounded-2xl p-4 border border-brand-700">
            <h3 className="text-white font-black uppercase italic text-xs mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-accent" /> Tendances
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {articles.slice(1, 5).map((article, idx) => (
                <div 
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="flex-shrink-0 w-48 space-y-2 group cursor-pointer"
                >
                  <div className="aspect-video rounded-xl overflow-hidden border border-brand-700 relative">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-lg border border-white/10">
                      {idx + 1}
                    </div>
                  </div>
                  <h4 className="text-[11px] font-bold text-white line-clamp-2 group-hover:text-brand-accent transition-colors leading-tight">{article.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orange Sport Alerts Section */}
        <div className="bg-gradient-to-br from-orange-600/20 to-brand-900 border border-orange-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/30">
              <Bell className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-black uppercase italic text-sm">Alertes Orange Sport</h3>
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Blessures • Compos • Cotes</p>
            </div>
          </div>

          <div className="space-y-3 mb-5">
            {orangeAlerts.map(alert => (
              <div key={alert.id} className="bg-brand-800/50 p-3 rounded-xl border border-brand-700 flex items-start gap-3 group hover:bg-brand-800 transition-all">
                <div className={`p-1.5 rounded-lg ${
                  alert.type === 'injury' ? 'bg-red-500/20 text-red-500' : 
                  alert.type === 'lineup' ? 'bg-blue-500/20 text-blue-500' : 
                  'bg-brand-accent/20 text-brand-accent'
                }`}>
                  {alert.type === 'injury' ? <AlertCircle size={14} /> : 
                   alert.type === 'lineup' ? <Zap size={14} /> : <Trophy size={14} />}
                </div>
                <p className="text-[11px] text-slate-200 leading-tight font-medium">{alert.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="tel" 
                placeholder="Votre numéro (ex: 07000000)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-orange-500 focus:outline-none transition-all shadow-inner"
              />
            </div>
            <button 
              type="submit"
              disabled={isSubscribing}
              className={`w-full py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
                isSubscribing ? 'bg-orange-800 text-slate-400' : 'bg-orange-500 text-white hover:bg-orange-400 active:scale-95'
              }`}
            >
              {isSubscribing ? 'Inscription...' : 'Recevoir par SMS'}
            </button>
            {subscriptionMessage && (
              <p className={`text-[10px] font-bold text-center uppercase tracking-widest ${subscriptionMessage.type === 'success' ? 'text-brand-accent' : 'text-red-500'}`}>
                {subscriptionMessage.text}
              </p>
            )}
          </form>
          <div className="mt-4 flex items-center justify-center gap-2 opacity-50">
            <ShieldCheck size={12} className="text-orange-400" />
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Service sécurisé par Orange Sport</span>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {filteredArticles.map(article => (
            <div 
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-brand-800 rounded-2xl overflow-hidden border border-brand-700 shadow-xl group cursor-pointer hover:border-brand-accent transition-all"
            >
              <div className="aspect-video relative overflow-hidden">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute top-3 left-3 bg-brand-accent text-brand-900 text-[9px] font-black px-2 py-0.5 rounded shadow-lg uppercase">
                  {categories.find(c => c.id === article.category)?.label.split(' ')[1] || article.category}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900 to-transparent opacity-60"></div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-black text-sm mb-2 leading-tight group-hover:text-brand-accent transition-colors">{article.title}</h3>
                <p className="text-slate-400 text-[11px] line-clamp-2 mb-4 leading-relaxed">{article.summary}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-700 flex items-center justify-center text-[10px] font-black text-white border border-brand-600">
                      {article.author[0]}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">{article.author} • {article.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} />
                      <span className="text-[10px] font-mono">{article.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span className="text-[10px] font-mono">{article.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col"
          >
            <div className="h-14 bg-brand-900 flex justify-between items-center px-4 border-b border-brand-700 sticky top-0 z-10">
              <button onClick={() => setSelectedArticle(null)} className="bg-brand-800 p-2 rounded-full hover:bg-brand-700 text-white"><X size={20}/></button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleBookmark(selectedArticle.id)}
                  className={`p-2 rounded-full transition-all ${selectedArticle.isBookmarked ? 'bg-brand-accent text-brand-900' : 'bg-brand-800 text-white'}`}
                >
                  <Bookmark size={20} fill={selectedArticle.isBookmarked ? "currentColor" : "none"} />
                </button>
                <button className="bg-brand-800 p-2 rounded-full text-white hover:bg-brand-700"><Share2 size={20}/></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="aspect-video rounded-2xl overflow-hidden border border-brand-700 shadow-2xl relative group">
                {selectedArticle.videoUrl ? (
                  <iframe 
                    src={selectedArticle.videoUrl} 
                    className="w-full h-full" 
                    allowFullScreen 
                    title={selectedArticle.title}
                  ></iframe>
                ) : (
                  <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
                {selectedArticle.videoUrl && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                    <Zap size={12} fill="currentColor" /> VIDEO
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-accent/10 text-brand-accent text-[10px] font-black px-2 py-0.5 rounded border border-brand-accent/20 uppercase">
                    {selectedArticle.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">{selectedArticle.date} • {selectedArticle.views.toLocaleString()} vues</span>
                </div>
                
                <h1 className="text-2xl font-black text-white leading-tight italic">{selectedArticle.title}</h1>
                
                <div className="flex items-center gap-3 p-3 bg-brand-800 rounded-xl border border-brand-700">
                  <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center text-sm font-black text-white border border-brand-600">
                    {selectedArticle.author[0]}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">{selectedArticle.author}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Journaliste SportBot</p>
                  </div>
                </div>
                
                <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                  {selectedArticle.content.split('\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                {/* Betting Integration in Article */}
                <div className="bg-brand-900 border-2 border-brand-accent/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80} className="text-brand-accent"/></div>
                  <h4 className="text-white font-black uppercase italic mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-brand-accent" /> Parier sur ce match
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleBetFromArticle('home', 2.45)}
                      className="bg-brand-800 hover:bg-brand-700 p-3 rounded-xl border border-brand-700 text-center transition-all"
                    >
                      <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Victoire 1</p>
                      <p className="text-lg font-black text-white font-mono">2.45</p>
                    </button>
                    <button 
                      onClick={() => handleBetFromArticle('draw', 3.10)}
                      className="bg-brand-800 hover:bg-brand-700 p-3 rounded-xl border border-brand-700 text-center transition-all"
                    >
                      <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Nul X</p>
                      <p className="text-lg font-black text-white font-mono">3.10</p>
                    </button>
                    <button 
                      onClick={() => handleBetFromArticle('away', 2.85)}
                      className="bg-brand-800 hover:bg-brand-700 p-3 rounded-xl border border-brand-700 text-center transition-all"
                    >
                      <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Victoire 2</p>
                      <p className="text-lg font-black text-white font-mono">2.85</p>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 pt-6 border-t border-brand-700">
                  <h4 className="text-white font-black uppercase italic flex items-center gap-2">
                    <MessageSquare size={18} className="text-brand-accent" /> Commentaires ({selectedArticle.comments})
                  </h4>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-700 flex-shrink-0"></div>
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        placeholder="Ajouter un commentaire..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                        className="w-full bg-brand-900 border border-brand-700 rounded-xl py-2 px-4 text-xs text-white focus:border-brand-accent focus:outline-none"
                      />
                      <button 
                        onClick={handleAddComment}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-accent"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-700 flex-shrink-0"></div>
                        <div className="flex-1 bg-brand-800 p-3 rounded-2xl border border-brand-700">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-black text-white">Utilisateur_{i}</span>
                            <span className="text-[9px] text-slate-500">Il y a {i * 2}h</span>
                          </div>
                          <p className="text-[11px] text-slate-300">Super analyse ! Je pense aussi que le Real a fait le bon choix.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Article Modal */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-brand-800 w-full max-w-md rounded-[2rem] border border-brand-700 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-brand-700 flex justify-between items-center">
                <h3 className="text-xl font-black text-white italic uppercase">Publier un Article</h3>
                <button onClick={() => setIsPublishModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Titre de l'article</label>
                  <input 
                    type="text" 
                    placeholder="Entrez un titre percutant..."
                    value={publishForm.title}
                    onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                    className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3 px-4 text-xs text-white focus:border-brand-accent focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Catégorie</label>
                  <select 
                    value={publishForm.category}
                    onChange={(e) => setPublishForm({ ...publishForm, category: e.target.value })}
                    className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3 px-4 text-xs text-white focus:border-brand-accent focus:outline-none appearance-none"
                  >
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Image (Fichier)</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'image')}
                        className="hidden"
                        id="image-upload"
                      />
                      <label 
                        htmlFor="image-upload"
                        className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3 px-4 text-xs text-slate-400 focus:border-brand-accent focus:outline-none cursor-pointer flex items-center gap-2 hover:bg-brand-700 transition-all"
                      >
                        <Zap size={14} className="text-brand-accent" /> {publishForm.imageUrl ? 'Image sélectionnée' : 'Choisir image'}
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vidéo (Fichier)</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'video')}
                        className="hidden"
                        id="video-upload"
                      />
                      <label 
                        htmlFor="video-upload"
                        className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3 px-4 text-xs text-slate-400 focus:border-brand-accent focus:outline-none cursor-pointer flex items-center gap-2 hover:bg-brand-700 transition-all"
                      >
                        <Activity size={14} className="text-blue-500" /> {publishForm.videoUrl ? 'Vidéo sélectionnée' : 'Choisir vidéo'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ou URL de l'image</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={publishForm.imageUrl}
                    onChange={(e) => setPublishForm({ ...publishForm, imageUrl: e.target.value })}
                    className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3 px-4 text-xs text-white focus:border-brand-accent focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ou URL de la vidéo</label>
                  <input 
                    type="text" 
                    placeholder="Lien YouTube, Vimeo..."
                    value={publishForm.videoUrl}
                    onChange={(e) => setPublishForm({ ...publishForm, videoUrl: e.target.value })}
                    className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3 px-4 text-xs text-white focus:border-brand-accent focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contenu</label>
                  <textarea 
                    rows={4}
                    placeholder="Rédigez votre article ici..."
                    value={publishForm.content}
                    onChange={(e) => setPublishForm({ ...publishForm, content: e.target.value })}
                    className="w-full bg-brand-900 border border-brand-700 rounded-xl py-3 px-4 text-xs text-white focus:border-brand-accent focus:outline-none resize-none"
                  ></textarea>
                </div>
                <button 
                  onClick={handlePublish}
                  className="w-full bg-brand-accent text-brand-900 py-4 rounded-xl font-black uppercase text-sm shadow-xl hover:bg-emerald-400 active:scale-95 transition-all"
                >
                  Envoyer pour validation
                </button>
                <p className="text-[9px] text-slate-500 text-center uppercase font-bold">Votre article sera examiné par nos modérateurs avant publication.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsHub;
