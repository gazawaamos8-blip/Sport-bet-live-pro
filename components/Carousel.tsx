import React, { useEffect, useState } from 'react';

// Images haute qualité de stades et moments de sport
const IMAGES = [
  { url: "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=1000", title: "Vive la CAN 2026", subtitle: "Le rendez-vous de l'Afrique" },
  { url: "https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&q=80&w=1000", title: "Vive la Champions League 2026", subtitle: "Le sommet du football européen" },
  { url: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1000", title: "NBA Finals 2026", subtitle: "Cotes boostées cette nuit" },
];

const Carousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-56 md:h-72 overflow-hidden group">
      {IMAGES.map((item, idx) => (
        <div 
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          <img 
            src={item.url} 
            alt={item.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* SuperSport Style Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-6 w-full animate-fade-in">
             <span className="bg-brand-accent text-brand-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest mb-2 inline-block">
               En Une
             </span>
             <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic leading-none mb-1">{item.title}</h2>
             <p className="text-brand-highlight font-bold text-sm uppercase tracking-wide">{item.subtitle}</p>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {IMAGES.map((_, idx) => (
          <div 
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-brand-accent' : 'w-2 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;