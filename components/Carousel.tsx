import React, { useEffect, useState } from 'react';
import { Signal, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppSection } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselProps {
  onNavigate?: (section: AppSection, videoId?: string) => void;
}

const CAROUSEL_ITEMS = [
  {
    id: 1,
    type: "STADE",
    name: "Camp Nou",
    subtitle: "Barcelone, Espagne",
    info: "99,354 PLACES",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1920&h=1080"
  },
  {
    id: 2,
    type: "STADE",
    name: "Wembley Stadium",
    subtitle: "Londres, Royaume-Uni",
    info: "90,000 PLACES",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=1920&h=1080"
  },
  {
    id: 3,
    type: "JOUEUR",
    name: "Kylian Mbappé",
    subtitle: "Real Madrid • Capitaine",
    info: "BALLON D'OR 2026",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1920&h=1080"
  },
  {
    id: 4,
    type: "TROPHÉE",
    name: "Coupe du Monde FIFA",
    subtitle: "Édition 2026 • USA/MEX/CAN",
    info: "LE GRAAL ULTIME",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1920&h=1080"
  },
  {
    id: 5,
    type: "STADE",
    name: "Santiago Bernabéu",
    subtitle: "Madrid, Espagne",
    info: "81,044 PLACES",
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=1920&h=1080"
  },
  {
    id: 6,
    type: "JOUEUR",
    name: "Erling Haaland",
    subtitle: "Manchester City • Buteur",
    info: "SOULIER D'OR 2026",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=1920&h=1080"
  },
  {
    id: 7,
    type: "STADE",
    name: "Lusail Stadium",
    subtitle: "Lusail, Qatar",
    info: "88,966 PLACES",
    image: "https://images.unsplash.com/photo-1518091043644-c1d445bb51ed?auto=format&fit=crop&q=80&w=1920&h=1080"
  },
  {
    id: 8,
    type: "TROPHÉE",
    name: "Champions League",
    subtitle: "UEFA • La Coupe aux Grandes Oreilles",
    info: "PRESTIGE EUROPÉEN",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1920&h=1080"
  },
  {
    id: 9,
    type: "STADE",
    name: "Allianz Arena",
    subtitle: "Munich, Allemagne",
    info: "75,000 PLACES",
    image: "https://images.unsplash.com/photo-1563299796-17596ed6b017?auto=format&fit=crop&q=80&w=1920&h=1080"
  },
  {
    id: 10,
    type: "STADE",
    name: "Maracanã",
    subtitle: "Rio de Janeiro, Brésil",
    info: "78,838 PLACES",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=1920&h=1080"
  },
  {
    id: 11,
    type: "STADE",
    name: "Stade de France",
    subtitle: "Saint-Denis, France",
    info: "80,698 PLACES",
    image: "https://images.unsplash.com/photo-1518091043644-c1d445bb51ed?auto=format&fit=crop&q=80&w=1920&h=1080"
  }
];

const Carousel: React.FC<CarouselProps> = ({ onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length);

  return (
    <div 
      className="relative w-full h-56 md:h-72 overflow-hidden group bg-brand-900 cursor-pointer"
      onClick={() => onNavigate && onNavigate(AppSection.VIDEO)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img 
            src={CAROUSEL_ITEMS[currentIndex].image} 
            alt={CAROUSEL_ITEMS[currentIndex].name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/20 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-6 w-full animate-fade-in">
             <div className="flex items-center gap-2 mb-2">
               <span className="bg-brand-accent text-brand-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                 {CAROUSEL_ITEMS[currentIndex].type}
               </span>
               <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-white/20">
                 {CAROUSEL_ITEMS[currentIndex].info}
               </span>
             </div>
             <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic leading-tight mb-1 drop-shadow-lg">
               {CAROUSEL_ITEMS[currentIndex].name}
             </h2>
             <p className="text-brand-highlight font-bold text-xs uppercase tracking-wide opacity-90">
               {CAROUSEL_ITEMS[currentIndex].subtitle}
             </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-accent hover:text-brand-900"
      >
        <ChevronLeft size={20} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-accent hover:text-brand-900"
      >
        <ChevronRight size={20} />
      </button>
      
      {/* Pagination Dots */}
      <div className="absolute bottom-4 right-6 flex gap-1.5 z-20">
        {CAROUSEL_ITEMS.map((_, idx) => (
          <span 
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? 'w-8 bg-brand-accent' : 'w-2 bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;