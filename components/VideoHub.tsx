import React, { useState, useEffect } from 'react';
import { Play, Maximize, Signal, Loader, Server, Search, Video, Share2, ChevronDown, History, Film, Globe, ExternalLink, BellRing, Check, ShieldCheck, RotateCw } from 'lucide-react';
import { Match } from '../types';
import { searchLiveSports, YouTubeVideo } from '../services/youtubeService';
import { searchSerpVideos, SerpVideo } from '../services/serpApiService';
import { t } from '../services/localization';
import { db } from '../services/database';

interface VideoHubProps {
  matches: Match[];
  searchQuery?: string;
}

const VideoHub: React.FC<VideoHubProps> = ({ matches, searchQuery: externalSearchQuery = '' }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [serpVideos, setSerpVideos] = useState<SerpVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSource, setCurrentSource] = useState<'server1' | 'server2' | 'server3' | 'server4' | 'proxy' | 'serp' | 'films'>('server1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isRotated, setIsRotated] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [subscriptions, setSubscriptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('video_subscriptions');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('video_search_history');
    return saved ? JSON.parse(saved) : ['Football Live', 'NBA Highlights', 'Films Action 2026'];
  });

  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('video_search_history', JSON.stringify(newHistory));
  };

  // Chargement des vidéos initiales ou recherche externe
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const query = externalSearchQuery || 'football match direct live 2026';
      const result = await searchLiveSports(query, 50);
      setYoutubeVideos(result.items);
      setNextPageToken(result.nextPageToken);
      
      if (result.items.length > 0 && !activeVideoId) {
        setActiveVideoId(result.items[0].id.videoId);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [externalSearchQuery]);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSearch = overrideQuery || searchQuery;
    if (!queryToSearch.trim()) return;

    setIsSearching(true);
    saveToHistory(queryToSearch);
    
    if (currentSource === 'films' || currentSource === 'serp') {
        const results = await searchSerpVideos(queryToSearch, currentSource === 'films');
        setSerpVideos(results);
    } else {
        const result = await searchLiveSports(queryToSearch, 50);
        setYoutubeVideos(result.items);
        setNextPageToken(result.nextPageToken);
        if (result.items.length > 0) {
            setActiveVideoId(result.items[0].id.videoId);
        }
    }
    
    setIsSearching(false);
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSerpPlay = (video: SerpVideo) => {
    const ytId = extractYoutubeId(video.link);
    if (ytId) {
        setActiveVideoId(ytId);
        setCurrentSource('server1');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.open(video.link, '_blank');
    }
  };

  const toggleFullScreen = () => {
    const element = document.getElementById('main-video-player');
    if (element) {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            element.requestFullscreen();
        }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
        setIsRotated(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleVideoSelect = (videoId: string) => {
    setActiveVideoId(videoId);
    setCurrentSource('server1'); // Reset to main server
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchSource = async (source: 'server1' | 'server2' | 'server3' | 'server4' | 'proxy' | 'serp') => {
      setCurrentSource(source);
      
      if (source === 'server1' || source === 'proxy' || source === 'server2' || source === 'server3' || source === 'server4') {
          setLoading(true);
          let query = searchQuery || externalSearchQuery || 'football match direct live 2026';
          if (source === 'server2') query += ' stream';
          if (source === 'server3') query += ' highlights';
          if (source === 'server4') query += ' live football';
          
          const result = await searchLiveSports(query, 50);
          setYoutubeVideos(result.items);
          setNextPageToken(result.nextPageToken);
          if (result.items.length > 0) {
              setActiveVideoId(result.items[0].id.videoId);
          }
          setLoading(false);
      }
  };

  const handleShare = async (video: YouTubeVideo | SerpVideo) => {
    const title = 'snippet' in video ? video.snippet.title : video.title;
    const link = 'snippet' in video ? `https://www.youtube.com/watch?v=${video.id.videoId}` : video.link;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Regarde ce match en direct !',
                text: title,
                url: link,
            });
        } catch (err) {
            console.log('Share failed', err);
        }
    } else {
        navigator.clipboard.writeText(link);
        alert('Lien copié dans le presse-papier !');
    }
  };

  const handleViewMore = async () => {
      if (currentSource !== 'serp' && currentSource !== 'films' && nextPageToken) {
          setIsSearching(true);
          const query = searchQuery || externalSearchQuery || 'football match direct live 2026';
          const result = await searchLiveSports(query, 50, nextPageToken);
          setYoutubeVideos(prev => [...prev, ...result.items]);
          setNextPageToken(result.nextPageToken);
          setIsSearching(false);
      } else {
          setVisibleCount(prev => prev + 50);
      }
  };

  const toggleSubscription = (query: string) => {
    if (!query.trim()) return;
    const isSubscribed = subscriptions.includes(query);
    let newSubs: string[];
    
    if (isSubscribed) {
        newSubs = subscriptions.filter(s => s !== query);
    } else {
        newSubs = [...subscriptions, query];
        // Simulate a notification when subscribing
        db.addNotification({
            title: 'Abonnement activé',
            text: `Vous recevrez des alertes pour : ${query}`,
            type: 'promo'
        });
    }
    
    setSubscriptions(newSubs);
    localStorage.setItem('video_subscriptions', JSON.stringify(newSubs));
  };

  return (
    <div className={`animate-fade-in pb-12 ${isCinemaMode ? 'bg-black/95 min-h-screen' : ''}`}>
      {/* MAIN PLAYER */}
      <div 
        id="main-video-player" 
        className={`bg-black sticky top-16 z-30 aspect-video w-full shadow-2xl border-y border-brand-700 relative group transition-all duration-500 ${isRotated ? 'rotate-90 scale-150' : ''} ${isCinemaMode ? 'max-w-6xl mx-auto rounded-2xl overflow-hidden mt-4' : ''}`}
      >
        {loading ? (
           <div className="flex flex-col items-center justify-center h-full text-brand-accent">
              <Loader className="animate-spin mb-2" size={32} />
              <span className="text-xs font-bold">Initialisation des serveurs...</span>
           </div>
        ) : activeVideoId ? (
          <div className="relative w-full h-full">
              <iframe
                  width="100%"
                  height="100%"
                  src={currentSource === 'proxy' 
                      ? `https://piped.video/embed/${activeVideoId}` 
                      : currentSource === 'server4'
                      ? `https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&modestbranding=1&rel=0&controls=1`
                      : `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&modestbranding=0&rel=0&controls=1&showinfo=1&fs=1&iv_load_policy=1&enablejsapi=1`}
                  title="Live Match"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
              ></iframe>
              
              {/* Overlay Controls */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-40">
                  <button 
                    onClick={() => setIsRotated(!isRotated)}
                    className={`p-2 backdrop-blur-md border border-white/20 rounded-lg text-white transition-all ${isRotated ? 'bg-brand-accent text-brand-900' : 'bg-black/60 hover:bg-brand-accent hover:text-brand-900'}`}
                    title="Rotation Écran"
                  >
                      <RotateCw size={18} className={isRotated ? 'animate-spin-slow' : ''} />
                  </button>
                  <button 
                    onClick={() => setIsCinemaMode(!isCinemaMode)}
                    className="p-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-brand-accent hover:text-brand-900 transition-all"
                    title="Mode Cinéma"
                  >
                      <Maximize size={18} />
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${activeVideoId}`, '_blank')}
                    className="p-2 bg-red-600 border border-red-500 rounded-lg text-white hover:bg-red-500 transition-all"
                    title="Ouvrir sur YouTube"
                  >
                      <ExternalLink size={18} />
                  </button>
              </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 font-bold flex-col px-4 text-center">
            <Signal size={40} className="mb-2 opacity-50" />
            <p>Aucun signal vidéo direct détecté.</p>
            <p className="text-xs mt-1">Veuillez sélectionner un match ci-dessous.</p>
          </div>
        )}
      </div>

      {/* Source Selection & Search */}
      <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button 
                onClick={() => switchSource('server1')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server1' ? 'bg-brand-accent text-brand-900 shadow-lg shadow-brand-accent/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <Server size={14} /> Serveur 1
              </button>
              <button 
                onClick={() => switchSource('server2')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server2' ? 'bg-brand-accent text-brand-900 shadow-lg shadow-brand-accent/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <Server size={14} /> Serveur 2
              </button>
              <button 
                onClick={() => switchSource('server3')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server3' ? 'bg-brand-accent text-brand-900 shadow-lg shadow-brand-accent/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <Server size={14} /> Serveur 3
              </button>
              <button 
                onClick={() => switchSource('server4')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server4' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <ShieldCheck size={14} /> Serveur 4 (Anti-Blocage)
              </button>
              <button 
                onClick={() => setCurrentSource('proxy')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'proxy' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <Globe size={14} /> Serveur Proxy
              </button>
              <button 
                onClick={() => setCurrentSource('serp')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'serp' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <Search size={14} /> Serp Search
              </button>
              <button 
                onClick={() => { setCurrentSource('films'); handleSearch(undefined, 'films illimités 2026'); }}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'films' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <Film size={14} /> Films Illimités
              </button>
          </div>

          <form onSubmit={handleSearch} className="relative">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un match, une équipe ou une chaîne..."
                className="w-full bg-brand-800 border border-brand-700 text-white px-12 py-4 rounded-2xl text-sm font-bold focus:outline-none focus:border-brand-accent transition-all shadow-inner"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchQuery && (
                      <button 
                        type="button"
                        onClick={() => toggleSubscription(searchQuery)}
                        className={`p-2 rounded-xl transition-all ${subscriptions.includes(searchQuery) ? 'bg-brand-accent text-brand-900' : 'bg-brand-700 text-slate-400 hover:text-white'}`}
                        title={subscriptions.includes(searchQuery) ? "Ne plus suivre" : "Suivre ce sujet"}
                      >
                          {subscriptions.includes(searchQuery) ? <Check size={18} /> : <BellRing size={18} />}
                      </button>
                  )}
                  <button 
                    type="submit"
                    disabled={isSearching}
                    className="bg-brand-accent text-brand-900 p-2 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
                  >
                      {isSearching ? <Loader className="animate-spin" size={18} /> : <Video size={18} />}
                  </button>
              </div>
          </form>

          {/* Video Security Info */}
          <div className="mt-4 p-3 bg-brand-800/50 border border-brand-700/50 rounded-xl flex items-center gap-3">
              <ShieldCheck className="text-brand-accent" size={20} />
              <div className="text-[10px] text-slate-400">
                  <span className="font-bold text-white block uppercase">Lecture Vidéo Sécurisée</span>
                  Nos flux sont optimisés pour une lecture sans restriction. Si un serveur est bloqué, essayez le Serveur 4 ou le Proxy.
              </div>
          </div>

          {/* Search History */}
          <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-1 mt-1">
                  <History size={10} /> Historique:
              </span>
              {searchHistory.map((q, i) => (
                  <button 
                    key={i}
                    onClick={() => { setSearchQuery(q); handleSearch(undefined, q); }}
                    className="text-[10px] font-bold text-slate-400 bg-brand-800 border border-brand-700 px-3 py-1 rounded-full hover:text-brand-accent hover:border-brand-accent transition-all"
                  >
                      {q}
                  </button>
              ))}
          </div>
      </div>

      {/* Channel List (Grid View) */}
      <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Signal className="text-brand-accent" /> {currentSource === 'serp' ? 'Résultats SerpApi' : currentSource === 'films' ? 'Films en Illimité' : 'Chaînes & Flux'}
            </h2>
            <span className="text-xs bg-brand-800 px-2 py-1 rounded text-slate-400">
              {currentSource === 'serp' || currentSource === 'films' ? serpVideos.length : youtubeVideos.length} Sources
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentSource === 'serp' || currentSource === 'films' ? (
              serpVideos.slice(0, visibleCount).map((video, idx) => (
                <div 
                  key={idx}
                  className="p-2 rounded-xl border flex gap-3 cursor-pointer transition-all active:scale-95 bg-brand-900 border-brand-700 hover:bg-brand-800 relative group/card"
                >
                   {/* Thumbnail */}
                   <div 
                    onClick={() => handleSerpPlay(video)}
                    className="relative w-32 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0"
                   >
                     <img src={video.thumbnail} className="w-full h-full object-cover" alt="thumbnail" referrerPolicy="no-referrer" />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                       <div className="bg-brand-accent/90 p-1.5 rounded-full">
                           {extractYoutubeId(video.link) ? <Play size={14} className="text-brand-900 ml-0.5" /> : <ExternalLink size={14} className="text-brand-900 ml-0.5" />}
                       </div>
                     </div>
                     <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-[8px] font-bold px-1 rounded">{video.platform}</div>
                   </div>
 
                   {/* Info */}
                   <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2">{video.title}</h4>
                      <p className="text-xs text-brand-accent font-medium mb-1">{video.channel}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                         <span className="bg-brand-900 px-1.5 py-0.5 rounded border border-brand-700">{video.duration || video.date}</span>
                         <span className="text-brand-accent font-bold">1080p HD</span>
                      </div>
                   </div>

                   {/* Share Button */}
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleShare(video); }}
                    className="absolute top-2 right-2 p-2 bg-brand-800 rounded-full text-slate-400 hover:text-brand-accent opacity-0 group-hover/card:opacity-100 transition-opacity"
                   >
                       <Share2 size={14} />
                   </button>
                </div>
              ))
            ) : (
              youtubeVideos.slice(0, visibleCount).map((video) => (
                <div 
                  key={video.id.videoId}
                  onClick={() => handleVideoSelect(video.id.videoId)}
                  className={`p-2 rounded-xl border flex gap-3 cursor-pointer transition-all active:scale-95 relative group/card ${activeVideoId === video.id.videoId ? 'bg-brand-800 border-brand-accent shadow-lg shadow-brand-accent/10' : 'bg-brand-900 border-brand-700 hover:bg-brand-800'}`}
                >
                   {/* Thumbnail */}
                   <div className="relative w-32 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                     <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover" alt="thumbnail" referrerPolicy="no-referrer" />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                       <div className="bg-brand-accent/90 p-1.5 rounded-full"><Play size={14} className="text-brand-900 ml-0.5" /></div>
                     </div>
                     <div className="absolute bottom-1 right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded">LIVE</div>
                   </div>
 
                   {/* Info */}
                   <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2">{video.snippet.title}</h4>
                      <p className="text-xs text-brand-accent font-medium mb-1">{video.snippet.channelTitle}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                         <span className="bg-brand-900 px-1.5 py-0.5 rounded border border-brand-700">1080p HD</span>
                         <span className="text-brand-accent font-bold">Normal</span>
                      </div>
                   </div>

                   {/* Share Button */}
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleShare(video); }}
                    className="absolute top-2 right-2 p-2 bg-brand-800 rounded-full text-slate-400 hover:text-brand-accent opacity-0 group-hover/card:opacity-100 transition-opacity"
                   >
                       <Share2 size={14} />
                   </button>
                </div>
              ))
            )}
          </div>

          {/* View More Button */}
          {(((currentSource === 'serp' || currentSource === 'films') && serpVideos.length > visibleCount) || (currentSource !== 'serp' && currentSource !== 'films' && (youtubeVideos.length > visibleCount || nextPageToken))) && (
              <div className="flex justify-center mt-6">
                  <button 
                    onClick={handleViewMore}
                    disabled={isSearching}
                    className="flex items-center gap-2 bg-brand-800 border border-brand-700 text-white px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                      {isSearching ? <Loader className="animate-spin" size={16} /> : <>Voir plus <ChevronDown size={16} /></>}
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};

export default VideoHub;
