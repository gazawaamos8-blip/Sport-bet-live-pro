import React, { useState } from 'react';
import { Newspaper, Clock, ChevronRight, TrendingUp, Search, Filter, Share2, Bookmark, Plus, X, Image as ImageIcon, Send, Upload, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NEWS_DATA = [
    {
        id: '1',
        title: "Sénégal vs Côte d'Ivoire : Le choc des titans approche",
        summary: "Les deux géants d'Afrique s'affrontent ce weekend pour une place en finale. Analyse des forces en présence.",
        content: "Le stade Abdoulaye Wade s'apprête à vibrer pour ce qui est sans doute l'affiche la plus attendue de cette compétition. Les Lions de la Teranga, champions en titre, font face à une équipe ivoirienne en pleine renaissance. Les statistiques montrent un léger avantage pour le Sénégal, mais l'histoire des confrontations entre ces deux nations nous a appris que tout peut arriver.",
        category: "Football",
        time: "Il y a 2h",
        image: "https://picsum.photos/seed/foot1/800/400",
        reads: "15k",
        trending: true
    },
    {
        id: '2',
        title: "NBA : Les Lakers en quête de rachat",
        summary: "Après une série de défaites, LeBron James et ses coéquipiers doivent réagir face aux Warriors.",
        content: "La crise couve à Los Angeles. Avec seulement 2 victoires sur les 10 derniers matchs, les Lakers pointent à une décevante 11ème place. Le match de ce soir face aux Golden State Warriors de Stephen Curry s'annonce comme un tournant décisif pour la saison des Angelinos.",
        category: "Basketball",
        time: "Il y a 4h",
        image: "https://picsum.photos/seed/basket1/800/400",
        reads: "8k",
        trending: false
    },
    {
        id: '3',
        title: "Transferts : Un prodige nigérian vers l'Europe ?",
        summary: "Le jeune attaquant de 18 ans attire l'attention des plus grands clubs européens.",
        content: "Victor Boniface n'est plus le seul nigérian à affoler les compteurs. Un nouveau talent issu de l'académie de Lagos vient de signer une saison à 25 buts. Le Real Madrid et Manchester City seraient déjà sur les rangs pour s'attacher les services de ce futur crack.",
        category: "Mercato",
        time: "Il y a 6h",
        image: "https://picsum.photos/seed/transfer/800/400",
        reads: "22k",
        trending: true
    },
    {
        id: '4',
        title: "Tennis : Alcaraz confirme sa domination",
        summary: "Le jeune espagnol remporte son troisième titre consécutif sur terre battue.",
        content: "Carlos Alcaraz semble intouchable. En finale du tournoi de Madrid, il n'a laissé aucune chance à son adversaire, s'imposant en deux sets secs. Sa préparation pour Roland-Garros semble parfaite.",
        category: "Tennis",
        time: "Il y a 8h",
        image: "https://picsum.photos/seed/tennis1/800/400",
        reads: "5k",
        trending: false
    },
    {
        id: '5',
        title: "Ligue des Champions : Le tirage au sort complet",
        summary: "Découvrez les affiches des quarts de finale de la plus prestigieuse des compétitions.",
        content: "Le tirage au sort a rendu son verdict. Le choc entre le Bayern Munich et le PSG sera l'affiche phare de ces quarts de finale. De son côté, le Real Madrid affrontera Arsenal dans un duel qui promet des étincelles.",
        category: "Football",
        time: "Il y a 12h",
        image: "https://picsum.photos/seed/ucl/800/400",
        reads: "45k",
        trending: true
    }
];

const CATEGORIES = ["Tous", "Football", "Basketball", "Tennis", "Mercato", "Autres"];

const NewsHub: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState("Tous");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedArticle, setSelectedArticle] = useState<typeof NEWS_DATA[0] | null>(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
    const [isPlaying, setIsPlaying] = useState(false);
    const [publishData, setPublishData] = useState({ 
        title: '', 
        content: '', 
        category: 'Football',
        media: null as string | null,
        mediaType: 'image' as 'image' | 'video'
    });
    const [isUploading, setIsUploading] = useState(false);

    const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
    const [comments, setComments] = useState<{[key: string]: {user: string, text: string, time: string}[]}>({});
    const [newComment, setNewComment] = useState("");

    const toggleBookmark = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setBookmarkedArticles(prev => 
            prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
        );
    };

    const handleAddComment = (articleId: string) => {
        if (!newComment.trim()) return;
        const comment = {
            user: "Vous",
            text: newComment,
            time: "À l'instant"
        };
        setComments(prev => ({
            ...prev,
            [articleId]: [comment, ...(prev[articleId] || [])]
        }));
        setNewComment("");
    };

    const handleShare = (e: React.MouseEvent, article: typeof NEWS_DATA[0]) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.summary,
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(`${article.title} - ${window.location.href}`);
            alert("Lien copié !");
        }
    };

    const handleNewsletter = () => {
        alert("Félicitations ! Vous êtes maintenant inscrit à Orange Sport Info. Vous recevrez les alertes par SMS.");
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPublishData({ 
                    ...publishData, 
                    media: reader.result as string,
                    mediaType: file.type.startsWith('video') ? 'video' : 'image'
                });
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePublish = () => {
        if (!publishData.title || !publishData.content) return;
        alert("Votre article avec média a été envoyé pour validation par l'équipe de modération.");
        setShowPublishModal(false);
        setPublishData({ title: '', content: '', category: 'Football', media: null, mediaType: 'image' });
    };

    const filteredNews = NEWS_DATA.filter(news => {
        const matchesCategory = selectedCategory === "Tous" || news.category === selectedCategory;
        const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            news.summary.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="p-4 animate-fade-in space-y-6 pb-24 relative">
            {/* Floating Action Button */}
            <button 
                onClick={() => setShowPublishModal(true)}
                className="fixed bottom-28 right-6 z-40 w-14 h-14 bg-brand-accent text-brand-900 rounded-full shadow-[0_0_20px_rgba(0,208,98,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
            >
                <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white italic uppercase flex items-center gap-2">
                        <Newspaper className="text-brand-accent" /> Actualités
                    </h2>
                    <div className="bg-brand-800 px-3 py-1 rounded-full border border-brand-700">
                        <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Live News</span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Rechercher une actualité..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-brand-800 border border-brand-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-brand-accent outline-none transition-all"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                                selectedCategory === cat 
                                ? 'bg-brand-accent text-brand-900 shadow-[0_0_10px_#00d062]' 
                                : 'bg-brand-800 text-slate-400 border border-brand-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured News (Only if not searching/filtering) */}
            {selectedCategory === "Tous" && !searchQuery && filteredNews.length > 0 && (
                <div 
                    className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl border border-brand-700"
                    onClick={() => setSelectedArticle(filteredNews[0])}
                >
                    <img 
                        src={filteredNews[0].image} 
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" 
                        alt="Featured" 
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-5 w-full">
                        <span className="bg-brand-accent text-brand-900 text-[10px] font-black px-2 py-1 rounded mb-2 inline-block uppercase">À la une</span>
                        <h3 className="text-2xl font-black text-white leading-tight mb-2">{filteredNews[0].title}</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-300 text-xs">
                                <span className="flex items-center gap-1"><Clock size={12}/> {filteredNews[0].time}</span>
                                <span className="text-brand-accent/60 font-bold">• 5 min</span>
                                <span className="flex items-center gap-1"><TrendingUp size={12}/> {filteredNews[0].reads} lectures</span>
                            </div>
                            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                                <ChevronRight size={20} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* News List */}
            <div className="space-y-4">
                {(selectedCategory === "Tous" && !searchQuery ? filteredNews.slice(1) : filteredNews).map(news => (
                    <div 
                        key={news.id} 
                        onClick={() => setSelectedArticle(news)}
                        className="bg-brand-800 rounded-2xl p-3 border border-brand-700 flex gap-4 hover:border-brand-accent/30 transition-all cursor-pointer group active:scale-95"
                    >
                        <div className="relative flex-shrink-0">
                            <img 
                                src={news.image} 
                                className="w-24 h-24 rounded-xl object-cover" 
                                alt={news.title} 
                                referrerPolicy="no-referrer"
                            />
                            {news.trending && (
                                <div className="absolute -top-1 -right-1 bg-brand-accent p-1 rounded-full shadow-lg">
                                    <TrendingUp size={10} className="text-brand-900" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black text-brand-accent uppercase">{news.category}</span>
                                    <Bookmark 
                                        size={14} 
                                        onClick={(e) => toggleBookmark(e, news.id)}
                                        className={`transition-colors ${bookmarkedArticles.includes(news.id) ? 'text-brand-accent fill-brand-accent' : 'text-slate-600 hover:text-brand-accent'}`} 
                                    />
                                </div>
                                <h4 className="text-white font-bold text-sm line-clamp-2 group-hover:text-brand-accent transition-colors mt-1">{news.title}</h4>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1"><Clock size={10}/> {news.time}</span>
                                    <span className="text-brand-accent/40">• 3 min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span>{news.reads}</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredNews.length === 0 && (
                <div className="text-center py-12 space-y-4">
                    <div className="bg-brand-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-brand-700">
                        <Filter size={24} className="text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-sm font-bold">Aucune actualité trouvée pour cette recherche.</p>
                </div>
            )}

            {/* Newsletter (Orange Sport Integration) */}
            <div className="bg-gradient-to-br from-brand-800 to-brand-900 border border-brand-700 rounded-2xl p-6 text-center shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent"></div>
                <div className="absolute -right-4 -top-4 opacity-10">
                    <Newspaper size={120} className="text-white" />
                </div>
                <h3 className="text-white font-black uppercase italic mb-2 text-lg flex items-center justify-center gap-2">
                    <span className="text-brand-accent">Orange</span> Sport Info
                </h3>
                <p className="text-slate-400 text-xs mb-4">Recevez les alertes blessures, compos et cotes Orange Sport par SMS.</p>
                <div className="flex gap-2 relative z-10">
                    <input 
                        type="tel" 
                        placeholder="Votre numéro..." 
                        className="flex-1 bg-brand-900 border border-brand-700 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-accent outline-none"
                    />
                    <button 
                        onClick={handleNewsletter}
                        className="bg-brand-accent text-brand-900 font-black px-6 py-3 rounded-xl text-xs uppercase shadow-lg shadow-brand-accent/20 active:scale-95 transition-transform"
                    >
                        S'abonner
                    </button>
                </div>
            </div>

            {/* Article Detail Modal */}
            <AnimatePresence>
                {selectedArticle && (
                    <div className="fixed inset-0 z-[100] flex flex-col bg-brand-900 animate-fade-in">
                        <div className="relative h-72 bg-black group">
                            {activeMedia === 'image' || !selectedArticle.videoUrl ? (
                                <img 
                                    src={selectedArticle.image} 
                                    className="w-full h-full object-cover" 
                                    alt="Article" 
                                    referrerPolicy="no-referrer" 
                                />
                            ) : (
                                <div className="w-full h-full relative">
                                    {isPlaying ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`${selectedArticle.videoUrl.replace('watch?v=', 'embed/')}?autoplay=1`}
                                            title="Article Video"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        ></iframe>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-800 relative">
                                            <img 
                                                src={selectedArticle.image} 
                                                className="w-full h-full object-cover opacity-40" 
                                                alt="preview"
                                                referrerPolicy="no-referrer"
                                            />
                                            <button 
                                                onClick={() => setIsPlaying(true)}
                                                className="absolute inset-0 flex items-center justify-center group/play"
                                            >
                                                <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center shadow-xl group-hover/play:scale-110 transition-transform">
                                                    <Play size={32} className="text-brand-900 ml-1" />
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-900 to-transparent pointer-events-none"></div>
                            
                            {/* Media Toggles */}
                            {selectedArticle.videoUrl && (
                                <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                                    <button 
                                        onClick={() => { setActiveMedia('image'); setIsPlaying(false); }}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${activeMedia === 'image' ? 'bg-brand-accent text-brand-900' : 'bg-black/60 text-white backdrop-blur-md'}`}
                                    >
                                        <ImageIcon size={12} /> Photo
                                    </button>
                                    <button 
                                        onClick={() => { setActiveMedia('video'); setIsPlaying(true); }}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${activeMedia === 'video' ? 'bg-brand-accent text-brand-900' : 'bg-black/60 text-white backdrop-blur-md'}`}
                                    >
                                        <Play size={12} /> Vidéo
                                    </button>
                                </div>
                            )}

                            <button 
                                onClick={() => { setSelectedArticle(null); setIsPlaying(false); }}
                                className="absolute top-4 left-4 bg-black/50 backdrop-blur-md p-2 rounded-full text-white z-10"
                            >
                                <ChevronRight size={24} className="rotate-180" />
                            </button>
                            <button 
                                onClick={(e) => handleShare(e, selectedArticle)}
                                className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full text-white z-10"
                            >
                                <Share2 size={20} />
                            </button>
                        </div>
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                            <div className="flex items-center gap-2">
                                <span className="bg-brand-accent text-brand-900 text-[10px] font-black px-2 py-1 rounded uppercase">{selectedArticle.category}</span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase">{selectedArticle.time}</span>
                            </div>
                            <h3 className="text-2xl font-black text-white leading-tight italic uppercase">{selectedArticle.title}</h3>
                            <div className="flex items-center gap-4 py-2 border-y border-brand-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-xs">SB</div>
                                    <span className="text-xs text-slate-300 font-bold">Rédaction SportBot</span>
                                </div>
                                <span className="text-slate-600 text-xs">•</span>
                                <span className="text-xs text-slate-500">{selectedArticle.reads} lectures</span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed font-medium">
                                {selectedArticle.content}
                            </p>

                            {/* Betting Integration */}
                             <div className="bg-brand-800 p-4 rounded-2xl border border-brand-700 mt-6 shadow-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-white font-black text-sm uppercase italic">Cotes du Match</p>
                                    <span className="text-[10px] font-bold text-brand-accent uppercase">Live Odds</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="bg-brand-900 p-2 rounded-lg border border-brand-700 text-center">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">1</div>
                                        <div className="text-brand-accent font-black">2.15</div>
                                    </div>
                                    <div className="bg-brand-900 p-2 rounded-lg border border-brand-700 text-center">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">X</div>
                                        <div className="text-brand-accent font-black">3.40</div>
                                    </div>
                                    <div className="bg-brand-900 p-2 rounded-lg border border-brand-700 text-center">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">2</div>
                                        <div className="text-brand-accent font-black">3.10</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => alert("Match ajouté au coupon !")}
                                    className="w-full bg-brand-accent text-brand-900 font-black py-3 rounded-xl text-xs uppercase shadow-lg active:scale-95 transition-transform"
                                >
                                    Parier sur ce match
                                </button>
                            </div>

                            {/* Related Articles */}
                            <div className="mt-8">
                                <h4 className="text-white font-black uppercase italic text-sm mb-4">Articles Similaires</h4>
                                <div className="space-y-3">
                                    {NEWS_DATA.filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category).slice(0, 2).map(related => (
                                        <div 
                                            key={related.id}
                                            onClick={() => setSelectedArticle(related)}
                                            className="flex gap-3 bg-brand-800/50 p-2 rounded-xl border border-brand-700 cursor-pointer hover:border-brand-accent/30 transition-all"
                                        >
                                            <img src={related.image} className="w-16 h-16 rounded-lg object-cover" alt="related" referrerPolicy="no-referrer" />
                                            <div className="flex-1">
                                                <h5 className="text-white text-xs font-bold line-clamp-2">{related.title}</h5>
                                                <span className="text-[10px] text-slate-500">{related.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="mt-8 pb-12">
                                <h4 className="text-white font-black uppercase italic text-sm mb-4">Commentaires ({comments[selectedArticle.id]?.length || 0})</h4>
                                <div className="flex gap-2 mb-6">
                                    <input 
                                        type="text" 
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Votre avis..." 
                                        className="flex-1 bg-brand-800 border border-brand-700 rounded-xl px-4 py-2 text-white text-sm focus:border-brand-accent outline-none"
                                    />
                                    <button 
                                        onClick={() => handleAddComment(selectedArticle.id)}
                                        className="bg-brand-accent text-brand-900 p-2 rounded-xl"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {(comments[selectedArticle.id] || []).map((comment, idx) => (
                                        <div key={idx} className="bg-brand-800/30 p-3 rounded-xl border border-brand-700">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-brand-accent text-[10px] font-black uppercase">{comment.user}</span>
                                                <span className="text-slate-600 text-[10px]">{comment.time}</span>
                                            </div>
                                            <p className="text-slate-300 text-xs">{comment.text}</p>
                                        </div>
                                    ))}
                                    {(!comments[selectedArticle.id] || comments[selectedArticle.id].length === 0) && (
                                        <p className="text-center text-slate-600 text-xs py-4 italic">Soyez le premier à commenter !</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Publish Modal */}
            <AnimatePresence>
                {showPublishModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-brand-800 w-full max-w-lg rounded-3xl border border-brand-600 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-brand-700 flex justify-between items-center bg-brand-900/50">
                                <h3 className="text-xl font-black text-white uppercase italic">Publier une Actualité</h3>
                                <button onClick={() => setShowPublishModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">Titre de l'article</label>
                                        <input 
                                            type="text" 
                                            value={publishData.title}
                                            onChange={(e) => setPublishData({ ...publishData, title: e.target.value })}
                                            placeholder="Ex: Nouveau record pour Mbappé..." 
                                            className="w-full bg-brand-900 border border-brand-700 rounded-xl p-4 text-white text-sm focus:border-brand-accent focus:outline-none transition-all"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">Catégorie</label>
                                        <div className="flex flex-wrap gap-2">
                                            {CATEGORIES.filter(c => c !== "Tous").map(cat => (
                                                <button 
                                                    key={cat}
                                                    onClick={() => setPublishData({ ...publishData, category: cat })}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                                        publishData.category === cat 
                                                        ? 'bg-brand-accent text-brand-900' 
                                                        : 'bg-brand-900 text-slate-500 border border-brand-700'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">Contenu</label>
                                        <textarea 
                                            rows={5}
                                            value={publishData.content}
                                            onChange={(e) => setPublishData({ ...publishData, content: e.target.value })}
                                            placeholder="Rédigez votre article ici..." 
                                            className="w-full bg-brand-900 border border-brand-700 rounded-xl p-4 text-white text-sm focus:border-brand-accent focus:outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">Média (Image ou Vidéo)</label>
                                        {publishData.media ? (
                                            <div className="relative rounded-2xl overflow-hidden border border-brand-700 aspect-video bg-black/50">
                                                {publishData.mediaType === 'video' ? (
                                                    <video src={publishData.media} controls className="w-full h-full object-contain" />
                                                ) : (
                                                    <img src={publishData.media} className="w-full h-full object-cover" alt="Preview" />
                                                )}
                                                <button 
                                                    onClick={() => setPublishData({ ...publishData, media: null })}
                                                    className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="w-full h-32 bg-brand-900 border-2 border-dashed border-brand-700 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-accent transition-all group">
                                                {isUploading ? (
                                                    <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Upload size={24} className="text-slate-600 group-hover:text-brand-accent transition-colors" />
                                                        <span className="text-[10px] text-slate-500 font-black uppercase">Cliquez pour ajouter un média</span>
                                                    </>
                                                )}
                                                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                                            </label>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={handlePublish}
                                            className="w-full bg-brand-accent text-brand-900 py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase shadow-lg shadow-brand-accent/20 hover:bg-emerald-400 transition-all active:scale-95"
                                        >
                                            <Send size={18} /> Publier l'article
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NewsHub;
