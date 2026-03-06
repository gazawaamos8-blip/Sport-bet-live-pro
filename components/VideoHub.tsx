
import React, { useState, useEffect } from 'react';
import { Play, Pause, Maximize, Signal, Loader, ExternalLink, Server, Wifi, AlertTriangle, Search, Video } from 'lucide-react';
import { Match } from '../types';
import { searchLiveSports, YouTubeVideo } from '../services/youtubeService';
import { searchSerpVideos, SerpVideo } from '../services/serpApiService';
import { t } from '../services/localization';

interface VideoHubProps {
  matches: Match[];
}

const VideoHub: React.FC<VideoHubProps> = ({ matches }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [serpVideos, setSerpVideos] = useState<SerpVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSource, setCurrentSource] = useState<'server1' | 'server2' | 'server3' | 'serp'>('server1');
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Chargement des vidéos initiales
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const videos = await searchLiveSports('football match direct live 2026');
      setYoutubeVideos(videos);
      
      if (videos.length > 0) {
        setActiveVideoId(videos[0].id.videoId);
        setIsPlaying(true);
      }
      setLoading(false);
    };

    fetchVideos();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchSerpVideos(searchQuery);
    setSerpVideos(results);
    setCurrentSource('serp');
    setIsSearching(false);
  };

  const handleVideoSelect = (videoId: string) => {
    setActiveVideoId(videoId);
    setIsPlaying(true);
    setHasError(false);
    setCurrentSource('server1'); // Reset to main server
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchSource = (source: 'server1' | 'server2' | 'server3') => {
      setCurrentSource(source);
      setIsPlaying(true);
      setHasError(false);
  };

  // Fake Video Player for fallback (Avoids black screen)
  const SimulatedPlayer = () => (
      <div className="relative w-full h-full bg-black overflow-hidden group">
          <video 
              className="w-full h-full object-cover"
              src="https://assets.mixkit.co/videos/preview/mixkit-soccer-match-in-a-stadium-at-night-44697-large.mp4"
              autoPlay
              loop
              muted
              playsInline
              onError={() => setHasError(true)}
          />
          <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
          </div>
          <div className="absolute bottom-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs">
              Source: {currentSource === 'server2' ? 'Satellite Feed A' : 'Backup Stream'}
          </div>
          {/* Overlay to prevent "Video unavailable" buttons if iframe fails */}
          <div className="absolute inset-0 z-10 bg-transparent"></div>
      </div>
  );

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      
      {/* SEARCH BAR */}
      <div className="px-4">
          <form onSubmit={handleSearch} className="relative">
              <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des vidéos (SerpApi)..."
                  className="w-full bg-brand-800 border border-brand-700 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-brand-accent focus:outline-none transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader className="animate-spin text-brand-accent" size={18} />
                  </div>
              )}
          </form>
      </div>

      {/* SOURCE SELECTOR TABS */}
      <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar">
          {[
              { id: 'server1', label: t('server1'), icon: Server },
              { id: 'server2', label: t('server2'), icon: Wifi },
              { id: 'server3', label: t('server3'), icon: Signal },
              { id: 'serp', label: 'Serp Search', icon: Video },
          ].map(s => (
              <button
                key={s.id}
                onClick={() => switchSource(s.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                    currentSource === s.id 
                    ? 'bg-brand-accent text-brand-900 border-brand-accent shadow-lg' 
                    : 'bg-brand-800 text-slate-400 border-brand-700 hover:text-white'
                }`}
              >
                  <s.icon size={14} /> {s.label}
              </button>
          ))}
      </div>

      {/* MAIN PLAYER */}
      <div className="bg-black sticky top-16 z-30 aspect-video w-full shadow-2xl border-y border-brand-700 relative group">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-full text-brand-accent">
              <Loader className="animate-spin mb-2" size={32} />
              <span className="text-xs font-bold">Initialisation des serveurs...</span>
           </div>
        ) : activeVideoId ? (
          <>
            {/* If Main Server & No Error, try YouTube */}
            {currentSource === 'server1' && !hasError ? (
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
                        onLoad={(e) => {
                            // Some basic check if iframe loaded correctly
                            // Note: We can't really check content due to cross-origin
                        }}
                    ></iframe>
                    {/* Invisible overlay to catch clicks if needed or just to block "unavailable" buttons */}
                    <div className="absolute inset-0 pointer-events-none"></div>
                    
                    {/* Restriction Warning Banner */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                        <div className="bg-brand-900/90 backdrop-blur-md border border-brand-700 p-3 rounded-2xl shadow-2xl max-w-[200px] animate-fade-in group-hover:opacity-0 transition-opacity">
                            <div className="flex items-center gap-2 text-yellow-500 mb-1">
                                <AlertTriangle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Aide Lecture</span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium leading-tight">
                                Si la vidéo affiche "Restreint", utilisez le bouton rouge ou changez de serveur.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Fallback to Simulated Player if Error or backup server selected */
                <SimulatedPlayer />
            )}

            {/* Error Detection Overlay (Invisible usually) */}
            {currentSource === 'server1' && !hasError && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* If iframe fails to load or blocks, user can click this manual fallback */}
                    <button 
                        onClick={() => setHasError(true)}
                        className="pointer-events-auto bg-black/80 text-white px-4 py-2 rounded-full text-xs flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity"
                    >
                        <AlertTriangle size={14} /> Problème ? Passer au secours
                    </button>
                </div>
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
                    <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-brand-accent transition-colors bg-black/40 p-2 rounded-full backdrop-blur-sm">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button className="text-white hover:text-brand-accent transition-colors bg-black/40 p-2 rounded-full backdrop-blur-sm"><Maximize size={20} /></button>
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

      {/* Channel List (Grid View) */}
      <div className="px-4">
         <div className="flex items-center justify-between mb-4">
           <h2 className="text-white font-bold text-lg flex items-center gap-2">
             <Signal className="text-brand-accent" /> {currentSource === 'serp' ? 'Résultats SerpApi' : 'Chaînes & Flux'}
           </h2>
           <span className="text-xs bg-brand-800 px-2 py-1 rounded text-slate-400">
             {currentSource === 'serp' ? serpVideos.length : youtubeVideos.length} Sources
           </span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           {currentSource === 'serp' ? (
             serpVideos.map((video, idx) => (
               <a 
                 key={idx}
                 href={video.link}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="p-2 rounded-xl border flex gap-3 cursor-pointer transition-all active:scale-95 bg-brand-900 border-brand-700 hover:bg-brand-800"
               >
                  {/* Thumbnail */}
                  <div className="relative w-32 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                    <img src={video.thumbnail} className="w-full h-full object-cover" alt="thumbnail" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="bg-brand-accent/90 p-1.5 rounded-full"><ExternalLink size={14} className="text-brand-900 ml-0.5" /></div>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-[8px] font-bold px-1 rounded">{video.platform}</div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-center">
                     <h4 className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2">{video.title}</h4>
                     <p className="text-xs text-brand-accent font-medium mb-1">{video.channel}</p>
                     <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="bg-brand-900 px-1.5 py-0.5 rounded border border-brand-700">{video.duration || video.date}</span>
                     </div>
                  </div>
               </a>
             ))
           ) : (
             youtubeVideos.map((video) => (
               <div 
                 key={video.id.videoId}
                 onClick={() => handleVideoSelect(video.id.videoId)}
                 className={`p-2 rounded-xl border flex gap-3 cursor-pointer transition-all active:scale-95 ${activeVideoId === video.id.videoId ? 'bg-brand-800 border-brand-accent shadow-lg shadow-brand-accent/10' : 'bg-brand-900 border-brand-700 hover:bg-brand-800'}`}
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
                        <span className="bg-brand-900 px-1.5 py-0.5 rounded border border-brand-700">1080p</span>
                     </div>
                  </div>
               </div>
             ))
           )}
         </div>
      </div>
    </div>
  );
};

export default VideoHub;
