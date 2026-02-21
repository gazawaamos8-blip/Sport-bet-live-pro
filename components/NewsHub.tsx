import React from 'react';
import { Newspaper, Clock, ChevronRight, TrendingUp } from 'lucide-react';

const NEWS_DATA = [
    {
        id: '1',
        title: "Sénégal vs Côte d'Ivoire : Le choc des titans approche",
        summary: "Les deux géants d'Afrique s'affrontent ce weekend pour une place en finale. Analyse des forces en présence.",
        category: "Football",
        time: "Il y a 2h",
        image: "https://picsum.photos/seed/foot1/800/400"
    },
    {
        id: '2',
        title: "NBA : Les Lakers en quête de rachat",
        summary: "Après une série de défaites, LeBron James et ses coéquipiers doivent réagir face aux Warriors.",
        category: "Basketball",
        time: "Il y a 4h",
        image: "https://picsum.photos/seed/basket1/800/400"
    },
    {
        id: '3',
        title: "Transferts : Un prodige nigérian vers l'Europe ?",
        summary: "Le jeune attaquant de 18 ans attire l'attention des plus grands clubs européens après sa saison exceptionnelle.",
        category: "Mercato",
        time: "Il y a 6h",
        image: "https://picsum.photos/seed/transfer/800/400"
    }
];

const NewsHub: React.FC = () => {
    return (
        <div className="p-4 animate-fade-in space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic uppercase flex items-center gap-2">
                    <Newspaper className="text-brand-accent" /> Actualités
                </h2>
                <div className="bg-brand-800 px-3 py-1 rounded-full border border-brand-700">
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Live News</span>
                </div>
            </div>

            {/* Featured News */}
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl">
                <img 
                    src={NEWS_DATA[0].image} 
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt="Featured" 
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-5">
                    <span className="bg-brand-accent text-brand-900 text-[10px] font-black px-2 py-1 rounded mb-2 inline-block uppercase">À la une</span>
                    <h3 className="text-xl font-black text-white leading-tight mb-2">{NEWS_DATA[0].title}</h3>
                    <div className="flex items-center gap-3 text-slate-300 text-xs">
                        <span className="flex items-center gap-1"><Clock size={12}/> {NEWS_DATA[0].time}</span>
                        <span className="flex items-center gap-1"><TrendingUp size={12}/> 15k lectures</span>
                    </div>
                </div>
            </div>

            {/* News List */}
            <div className="space-y-4">
                {NEWS_DATA.slice(1).map(news => (
                    <div key={news.id} className="bg-brand-800 rounded-xl p-3 border border-brand-700 flex gap-4 hover:border-brand-accent/30 transition-colors cursor-pointer group">
                        <img 
                            src={news.image} 
                            className="w-24 h-24 rounded-lg object-cover" 
                            alt={news.title} 
                            referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] font-black text-brand-accent uppercase">{news.category}</span>
                                <h4 className="text-white font-bold text-sm line-clamp-2 group-hover:text-brand-accent transition-colors">{news.title}</h4>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                                <span>{news.time}</span>
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Newsletter */}
            <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-2xl p-6 text-center">
                <h3 className="text-white font-black uppercase italic mb-2">Restez informé</h3>
                <p className="text-slate-400 text-xs mb-4">Recevez les meilleures cotes et actus directement par SMS.</p>
                <div className="flex gap-2">
                    <input 
                        type="tel" 
                        placeholder="Votre numéro..." 
                        className="flex-1 bg-brand-900 border border-brand-700 rounded-xl px-4 py-2 text-white text-sm focus:border-brand-accent outline-none"
                    />
                    <button className="bg-brand-accent text-brand-900 font-black px-4 py-2 rounded-xl text-xs uppercase">OK</button>
                </div>
            </div>
        </div>
    );
};

export default NewsHub;
