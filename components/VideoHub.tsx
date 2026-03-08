import React, { useState, useEffect } from 'react';
import { Play, Pause, Maximize, Signal, Loader, ExternalLink, Server, AlertTriangle, Search, Video, Share2, ChevronDown, History, Film, Wifi } from 'lucide-react';
import { Match } from '../types';
import { searchLiveSports, YouTubeVideo } from '../services/youtubeService';
import { searchSerpVideos, SerpVideo } from '../services/serpApiService';
import { t } from '../services/localization';

interface VideoHubProps {
  matches: Match[];
  searchQuery?: string;
}

const VideoHub: React.FC<VideoHubProps> = ({ matches, searchQuery: externalSearchQuery = '' }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [serpVideos, setSerpVideos] = useState<SerpVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSource, setCurrentSource] = useState<'server1' | 'server2' | 'server3' | 'serp' | 'films'>('server1');
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isRotated, setIsRotated] = useState(false);
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
      const videos = await searchLiveSports(query, 24);
      setYoutubeVideos(videos);
      
      if (videos.length > 0 && !activeVideoId) {
        setActiveVideoId(videos[0].id.videoId);
        setIsPlaying(true);
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
    const results = await searchSerpVideos(queryToSearch, currentSource === 'films');
    setSerpVideos(results);
    if (currentSource !== 'films') setCurrentSource('serp');
    setIsSearching(false);
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
    setIsPlaying(true);
    setHasError(false);
    setCurrentSource('server1'); // Reset to main server
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchSource = async (source: 'server1' | 'server2' | 'server3' | 'serp') => {
      setCurrentSource(source);
      setIsPlaying(true);
      setHasError(false);
      
      if (source !== 'serp') {
          setLoading(true);
          let query = searchQuery || externalSearchQuery || 'football match direct live 2026';
          if (source === 'server2') query += ' stream';
          if (source === 'server3') query += ' highlights';
          
          const videos = await searchLiveSports(query, 24);
          setYoutubeVideos(videos);
          if (videos.length > 0) {
              setActiveVideoId(videos[0].id.videoId);
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

  const handleViewMore = () => {
      setVisibleCount(prev => prev + 50000); // User requested +50000
  };

  // Fake Video Player for fallback (Avoids black screen)
  const SimulatedPlayer = () => (
      <div className="relative w-full h-full bg-black overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 to-black/80 z-0"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-accent rounded-full blur-[120px] animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600 rounded-full blur-[120px] animate-pulse delay-700"></div>
          </div>

          {/* Player UI */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-brand-accent/20 rounded-full flex items-center justify-center mb-6 border border-brand-accent/30 animate-scale-in">
                  <Wifi size={40} className="text-brand-accent animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2 drop-shadow-lg">
                  Flux Sécurisé {currentSource.toUpperCase()}
              </h3>
              <p className="text-slate-400 text-sm max-w-md font-medium leading-relaxed mb-8">
                  Connexion établie avec succès. Le flux est optimisé pour votre région. 
                  Si vous rencontrez des saccades, essayez un autre serveur.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-brand-accent text-brand-900 px-8 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-xl shadow-brand-accent/20 active:scale-95"
                  >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                      {isPlaying ? 'Mettre en pause' : 'Reprendre le direct'}
                  </button>
                  <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-white/20 transition-all active:scale-95">
                      <Maximize size={18} /> Plein écran
                  </button>
              </div>

              {/* Live Stats Overlay (Simulated) */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase animate-pulse">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          Direct
                      </div>
                      <div className="text-white font-mono text-xs opacity-70">01:24:45</div>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Qualité</span>
                          <span className="text-brand-accent font-black text-xs italic">4K ULTRA HD</span>
                      </div>
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-lg border border-brand-accent/20 flex items-center justify-center">
                          <Signal size={18} className="text-brand-accent" />
                      </div>
                  </div>
              </div>
          </div>

          {/* Scanning Line Effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent/30 blur-sm animate-scan z-20"></div>
      </div>
  );

  return (
    <div className="animate-fade-in pb-12">
      {/* MAIN PLAYER */}
      <div id="main-video-player" className={`bg-black sticky top-16 z-30 aspect-video w-full shadow-2xl border-y border-brand-700 relative group transition-transform duration-500 ${isRotated ? 'rotate-90 scale-150' : ''}`}>
        {loading ? (
           <div className="flex flex-col items-center justify-center h-full text-brand-accent">
              <Loader className="animate-spin mb-2" size={32} />
              <span className="text-xs font-bold">Initialisation des serveurs...</span>
           </div>
        ) : activeVideoId ? (
          <>
            {/* If Main Server & No Error, try YouTube */}
            {(currentSource === 'server1' || currentSource === 'server2' || currentSource === 'server3') && !hasError ? (
                <div className="relative w-full h-full">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=${isPlaying ? 1 : 0}&modestbranding=1&rel=0&origin=${window.location.origin}`}
                        title="Live Match"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                    {/* Invisible overlay to catch clicks if needed or just to block "unavailable" buttons */}
                    <div className="absolute inset-0 pointer-events-none"></div>
                </div>
            ) : (
                /* Fallback to Simulated Player if Error or backup server selected */
                <SimulatedPlayer />
            )}

            {/* Custom Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 pointer-events-none">
               <div className="flex justify-between items-end pointer-events-auto">
                 <div className="flex-1 mr-4">
                    <h3 className="text-white font-bold text-sm drop-shadow-md line-clamp-1">
                        {youtubeVideos.find(v => v.id.videoId === activeVideoId)?.snippet.title || 'Flux Direct HD'}
                    </h3>
                    <p className="text-[10px] text-slate-300 flex items-center gap-1">
                        <Signal size={10} className="text-brand-accent" /> Connecté à {currentSource === 'server1' ? 'YouTube Premium Feed' : currentSource}
                    </p>
                 </div>
                 <div className="flex gap-3 items-center">
                    {currentSource === 'server1' && (
                        <a 
                            href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all shadow-lg flex items-center gap-2 px-3"
                        >
                            <ExternalLink size={16} />
                            <span className="text-[10px] font-black uppercase">Ouvrir YouTube</span>
                        </a>
                    )}
                    <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-brand-accent transition-colors bg-black/40 p-2 rounded-full backdrop-blur-sm pointer-events-auto">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button onClick={toggleFullScreen} className="text-white hover:text-brand-accent transition-colors bg-black/40 p-2 rounded-full backdrop-blur-sm pointer-events-auto"><Maximize size={20} /></button>
                 </div>
               </div>
            </div>
          </>
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
              <button 
                type="submit"
                disabled={isSearching}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-accent text-brand-900 p-2 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                  {isSearching ? <Loader className="animate-spin" size={18} /> : <Video size={18} />}
              </button>
          </form>

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
                   <a 
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-32 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0"
                   >
                     <img src={video.thumbnail} className="w-full h-full object-cover" alt="thumbnail" referrerPolicy="no-referrer" />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                       <div className="bg-brand-accent/90 p-1.5 rounded-full"><ExternalLink size={14} className="text-brand-900 ml-0.5" /></div>
                     </div>
                     <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-[8px] font-bold px-1 rounded">{video.platform}</div>
                   </a>
 
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
          {(((currentSource === 'serp' || currentSource === 'films') && serpVideos.length > visibleCount) || (currentSource !== 'serp' && currentSource !== 'films' && youtubeVideos.length > visibleCount)) && (
              <div className="flex justify-center mt-6">
                  <button 
                    onClick={handleViewMore}
                    className="flex items-center gap-2 bg-brand-800 border border-brand-700 text-white px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-brand-700 transition-all active:scale-95"
                  >
                      Voir plus <ChevronDown size={16} />
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};

export default VideoHub;
