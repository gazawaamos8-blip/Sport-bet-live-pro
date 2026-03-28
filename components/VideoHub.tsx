import React, { useState, useEffect } from 'react';
import { Play, Maximize, Signal, Loader, Server, Search, Video, Share2, ChevronDown, History, Film, Globe, ExternalLink, BellRing, Check, ShieldCheck, RotateCw, X, Ban, Sparkles, RefreshCw, Link2, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match } from '../types';
import { searchLiveSports, YouTubeVideo } from '../services/youtubeService';
import { searchSerpVideos, SerpVideo } from '../services/serpApiService';
import { t } from '../services/localization';
import { db } from '../services/database';

interface VideoHubProps {
  matches: Match[];
  searchQuery?: string;
  initialVideoId?: string | null;
}

const VideoHub: React.FC<VideoHubProps> = ({ matches, searchQuery: externalSearchQuery = '', initialVideoId }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(initialVideoId || null);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [serpVideos, setSerpVideos] = useState<SerpVideo[]>([]);
  const [serpStart, setSerpStart] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentSource, setCurrentSource] = useState<'server1' | 'server2' | 'server3' | 'server4' | 'server5' | 'server6' | 'server7' | 'server8' | 'server9' | 'server10' | 'server11' | 'server12' | 'server13' | 'proxy' | 'serp' | 'films' | 'direct'>('server1');
  const [searchQuery, setSearchQuery] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [showDirectInput, setShowDirectInput] = useState(false);
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
      const query = externalSearchQuery || 'football match direct live stream 2026';
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

  // Handle initialVideoId changes
  useEffect(() => {
    if (initialVideoId) {
      setActiveVideoId(initialVideoId);
      setCurrentSource('server4'); // Use anti-restriction server by default for carousel videos
    }
  }, [initialVideoId]);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSearch = overrideQuery || searchQuery;
    if (!queryToSearch.trim()) return;

    setIsSearching(true);
    saveToHistory(queryToSearch);
    
    if (currentSource === 'films' || currentSource === 'serp') {
        const results = await searchSerpVideos(queryToSearch, currentSource === 'films', 0);
        setSerpVideos(results);
        setSerpStart(results.length);
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

  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const switchSource = async (source: 'server1' | 'server2' | 'server3' | 'server4' | 'server5' | 'server6' | 'server7' | 'server8' | 'server9' | 'server10' | 'server11' | 'server12' | 'server13' | 'proxy' | 'serp' | 'films' | 'direct') => {
      setCurrentSource(source);
      setLoading(true);
      
      // Small delay to ensure iframe reloads
      setTimeout(async () => {
          let query = searchQuery || externalSearchQuery || 'football match direct live 2026';
          if (source === 'server2') query += ' stream';
          if (source === 'server3') query += ' highlights';
          if (source === 'server4') query += ' live football direct';
          if (source === 'server5') query += ' tv live stream';
          if (source === 'server6') query += ' global stream direct';
          if (source === 'server7') query += ' invidious stream';
          if (source === 'server8') query += ' yewtu stream';
          if (source === 'server9') query += ' invidious live';
          if (source === 'server10') query += ' invidious direct';
          if (source === 'server11') query += ' live match direct';
          if (source === 'server12') query += ' football live direct';
          if (source === 'server13') query += ' live stream 2026';
          
          if (source !== 'direct' && source !== 'films' && source !== 'serp') {
            const result = await searchLiveSports(query, 50);
            setYoutubeVideos(result.items);
            setNextPageToken(result.nextPageToken);
            if (result.items.length > 0) {
                setActiveVideoId(result.items[0].id.videoId);
            }
          }
          setLoading(false);
      }, 500);
  };

  const tryNextServer = () => {
      const sources: ('server1' | 'server2' | 'server3' | 'server4' | 'server5' | 'server6' | 'server7' | 'server8' | 'proxy')[] = ['server1', 'server2', 'server3', 'server4', 'server5', 'server6', 'server7', 'server8', 'proxy'];
      const currentIndex = sources.indexOf(currentSource as any);
      const nextIndex = (currentIndex + 1) % sources.length;
      switchSource(sources[nextIndex]);
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
      setIsSearching(true);
      const query = searchQuery || externalSearchQuery || 'football match direct live 2026';
      
      if (currentSource !== 'serp' && currentSource !== 'films') {
          if (nextPageToken) {
              const result = await searchLiveSports(query, 50, nextPageToken);
              setYoutubeVideos(prev => [...prev, ...result.items]);
              setNextPageToken(result.nextPageToken);
          } else {
              setVisibleCount(prev => prev + 50);
          }
      } else {
          const results = await searchSerpVideos(query, currentSource === 'films', serpStart);
          setSerpVideos(prev => [...prev, ...results]);
          setSerpStart(prev => prev + results.length);
          setVisibleCount(prev => prev + 50);
      }
      setIsSearching(false);
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
                      ? `https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&modestbranding=1&rel=0&controls=1&origin=${window.location.origin}`
                      : currentSource === 'server5'
                      ? `https://vidsrc.to/embed/movie/${activeVideoId}`
                      : currentSource === 'server6'
                      ? `https://embed.su/embed/movie/${activeVideoId}`
                      : currentSource === 'server7'
                      ? `https://invidious.snopyta.org/embed/${activeVideoId}`
                      : currentSource === 'server8'
                      ? `https://yewtu.be/embed/${activeVideoId}`
                      : currentSource === 'server9'
                      ? `https://invidious.projectsegfau.lt/embed/${activeVideoId}`
                      : currentSource === 'server10'
                      ? `https://invidious.io.lol/embed/${activeVideoId}`
                      : currentSource === 'server11'
                      ? `https://inv.tux.rs/embed/${activeVideoId}`
                      : currentSource === 'server12'
                      ? `https://invidious.namazso.eu/embed/${activeVideoId}`
                      : currentSource === 'server13'
                      ? `https://vid.puffyan.us/embed/${activeVideoId}`
                      : currentSource === 'direct'
                      ? directUrl
                      : `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&modestbranding=0&rel=0&controls=1&showinfo=1&fs=1&iv_load_policy=1&enablejsapi=1&origin=${window.location.origin}`}
                  title="Live Match"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation"
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
            <div className="mt-4 p-3 bg-brand-800/30 border border-brand-700/50 rounded-xl text-[10px] text-slate-400 max-w-xs">
                <span className="text-brand-accent font-black block mb-1 uppercase">Note Pro</span>
                Si vous voyez "Vidéo non disponible", essayez de changer de serveur ou d'ouvrir le lien externe.
                <button 
                  onClick={() => setShowTroubleshooting(true)}
                  className="mt-2 text-brand-accent underline block font-bold"
                >
                  Dépannage Vidéo
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Troubleshooting Modal */}
      {showTroubleshooting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-brand-800 w-full max-w-md rounded-2xl border border-brand-700 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="text-brand-accent" />
                Dépannage Vidéo
              </h3>
              <button onClick={() => setShowTroubleshooting(false)} className="p-2 hover:bg-brand-700 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-brand-900/50 border border-brand-700 rounded-xl">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Ban className="text-red-500" size={16} />
                  Vidéo Restreinte ?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Certaines vidéos YouTube sont restreintes par les administrateurs réseau ou Google Workspace. Voici comment contourner cela :
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => { switchSource('server4'); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-orange-600/10 border border-orange-600/30 rounded-xl hover:bg-orange-600/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-orange-500">Utiliser le Serveur Anti-Blocage</div>
                    <div className="text-[10px] text-slate-500">Utilise youtube-nocookie.com pour contourner certaines restrictions.</div>
                  </div>
                  <ChevronDown className="-rotate-90 text-orange-500" size={16} />
                </button>

                <button 
                  onClick={() => { switchSource('server5'); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-purple-600/10 border border-purple-600/30 rounded-xl hover:bg-purple-600/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-purple-500">Serveur TV (VidSrc)</div>
                    <div className="text-[10px] text-slate-500">Serveur optimisé pour les flux TV et films.</div>
                  </div>
                  <ChevronDown className="-rotate-90 text-purple-500" size={16} />
                </button>

                <button 
                  onClick={() => { switchSource('server6'); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl hover:bg-blue-600/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-blue-500">Serveur Global (Embed.su)</div>
                    <div className="text-[10px] text-slate-500">Serveur de secours international sans restriction.</div>
                  </div>
                  <ChevronDown className="-rotate-90 text-blue-500" size={16} />
                </button>

                <button 
                  onClick={() => { switchSource('server7'); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-emerald-600/10 border border-emerald-600/30 rounded-xl hover:bg-emerald-600/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-emerald-500">Serveur Invidious (Privé)</div>
                    <div className="text-[10px] text-slate-500">Contourne les restrictions Workspace via une instance décentralisée.</div>
                  </div>
                  <ChevronDown className="-rotate-90 text-emerald-500" size={16} />
                </button>

                <button 
                  onClick={() => { switchSource('proxy'); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl hover:bg-blue-600/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-blue-500">Serveur Proxy Piped</div>
                    <div className="text-[10px] text-slate-500">Interface alternative sans publicité ni restriction Google.</div>
                  </div>
                  <ChevronDown className="-rotate-90 text-blue-500" size={16} />
                </button>

                <button 
                  onClick={() => { setShowDirectInput(true); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-brand-accent/10 border border-brand-accent/30 rounded-xl hover:bg-brand-accent/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-brand-accent">Lien Direct Personnel</div>
                    <div className="text-[10px] text-slate-500">Entrez votre propre lien de streaming direct.</div>
                  </div>
                  <ChevronDown className="-rotate-90 text-brand-accent" size={16} />
                </button>

                <button 
                  onClick={() => { setCurrentSource('server9'); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-emerald-600/10 border border-emerald-600/30 rounded-xl hover:bg-emerald-600/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-emerald-500">Serveur Invidious (Projet Segfault)</div>
                    <div className="text-[10px] text-slate-500">Instance alternative pour contourner les restrictions Google.</div>
                  </div>
                  <ChevronDown className="-rotate-90 text-emerald-500" size={16} />
                </button>

                <button 
                  onClick={() => { setCurrentSource('server10'); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-purple-600/10 border border-purple-600/30 rounded-xl hover:bg-purple-600/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-purple-500">Serveur Invidious (IO LOL)</div>
                    <div className="text-[10px] text-slate-500">Une autre instance robuste pour le streaming direct.</div>
                  </div>
                  <ChevronDown className="-rotate-90 text-purple-500" size={16} />
                </button>

                <button 
                  onClick={() => { setCurrentSource('server11'); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-emerald-600/10 border border-emerald-600/30 rounded-xl hover:bg-emerald-600/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-emerald-500">Serveur Invidious (Tux.rs)</div>
                    <div className="text-[10px] text-slate-500">Instance rapide et sécurisée pour le live.</div>
                  </div>
                  <ChevronDown className="-rotate-90 text-emerald-500" size={16} />
                </button>

                <button 
                  onClick={() => { setCurrentSource('server12'); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl hover:bg-blue-600/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-blue-500">Serveur Invidious (Namazso)</div>
                    <div className="text-[10px] text-slate-500">Instance européenne haute performance.</div>
                  </div>
                  <ChevronDown className="-rotate-90 text-blue-500" size={16} />
                </button>

                <button 
                  onClick={() => { setCurrentSource('server13'); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-orange-600/10 border border-orange-600/30 rounded-xl hover:bg-orange-600/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-orange-500">Serveur Invidious (Puffyan)</div>
                    <div className="text-[10px] text-slate-500">Instance stable pour contourner les blocages.</div>
                  </div>
                  <ChevronDown className="-rotate-90 text-orange-500" size={16} />
                </button>

                <button 
                  onClick={() => { window.open(`https://www.youtube.com/watch?v=${activeVideoId}`, '_blank'); setShowTroubleshooting(false); }}
                  className="flex items-center justify-between p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl hover:bg-blue-600/20 transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-bold text-blue-500">Ouvrir en Externe</div>
                    <div className="text-[10px] text-slate-500">Ouvre la vidéo directement dans l'application YouTube.</div>
                  </div>
                  <ExternalLink className="text-blue-500" size={16} />
                </button>
              </div>

              <div className="p-4 bg-brand-900/50 border border-brand-700 rounded-xl">
                <p className="text-[10px] text-slate-500 italic">
                  Note : Si vous êtes sur un réseau d'entreprise ou scolaire, les restrictions peuvent être appliquées au niveau du pare-feu. Dans ce cas, l'utilisation du Serveur Proxy est recommandée.
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowTroubleshooting(false)}
              className="w-full mt-6 py-4 bg-brand-700 text-white rounded-xl font-black uppercase text-xs hover:bg-brand-600 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Source Selection & Search */}
      <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button 
                onClick={() => { setSearchQuery('football live match direct'); handleSearch(undefined, 'football live match direct'); }}
                className="flex-shrink-0 flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase bg-red-600 text-white shadow-lg shadow-red-600/30 animate-pulse"
              >
                  <Signal size={14} /> DIRECT LIVE
              </button>
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
                onClick={() => switchSource('server5')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server5' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <Video size={14} /> Serveur 5 (TV)
              </button>
              <button 
                onClick={() => switchSource('server6')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server6' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <Globe size={14} /> Serveur 6 (Global)
              </button>
              <button 
                onClick={() => switchSource('server7')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server7' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <ShieldCheck size={14} /> Serveur 7 (Invidious)
              </button>
              <button 
                onClick={() => switchSource('server8')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server8' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <ShieldCheck size={14} /> Serveur 8 (Yewtu.be)
              </button>
              <button 
                onClick={() => switchSource('server9')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server9' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <ShieldCheck size={14} /> Serveur 9 (Invidious 2)
              </button>
              <button 
                onClick={() => switchSource('server10')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server10' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <ShieldCheck size={14} /> Serveur 10
              </button>
              <button 
                onClick={() => switchSource('server11')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server11' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <ShieldCheck size={14} /> Serveur 11
              </button>
              <button 
                onClick={() => switchSource('server12')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server12' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <ShieldCheck size={14} /> Serveur 12
              </button>
              <button 
                onClick={() => switchSource('server13')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentSource === 'server13' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <ShieldCheck size={14} /> Serveur 13
              </button>
              <button 
                onClick={() => setShowDirectInput(!showDirectInput)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${showDirectInput ? 'bg-brand-accent text-brand-900 shadow-lg shadow-brand-accent/20' : 'bg-brand-800 text-slate-400 border border-brand-700'}`}
              >
                  <ExternalLink size={14} /> Lien Direct
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

          <AnimatePresence>
            {showDirectInput && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-brand-800 border border-brand-accent/30 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Globe size={16} className="text-brand-accent" />
                  <span className="text-xs font-black text-white uppercase">Lien Vidéo Direct (Streaming/TV)</span>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    placeholder="Collez l'URL du flux (m3u8, mp4, embed...)"
                    className="flex-1 bg-brand-900 border border-brand-700 text-white px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-brand-accent"
                  />
                  <button 
                    onClick={() => switchSource('direct')}
                    className="bg-brand-accent text-brand-900 px-4 py-3 rounded-xl font-black uppercase text-xs hover:bg-emerald-400 transition-all"
                  >
                    Lire
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 mt-2 italic">Note: Utilisez des liens HTTPS pour une meilleure compatibilité.</p>
              </motion.div>
            )}
          </AnimatePresence>

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
          {(((currentSource === 'serp' || currentSource === 'films') && (serpVideos.length > visibleCount || serpVideos.length >= 10)) || (currentSource !== 'serp' && currentSource !== 'films' && (youtubeVideos.length > visibleCount || nextPageToken))) && (
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
