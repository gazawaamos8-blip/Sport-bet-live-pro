import React, { useState, useEffect } from 'react';

const images = [
  "https://raw.githubusercontent.com/gazawaamos8-blip/Icon-sport-bet-pro/refs/heads/main/sportbet-icon%20(1).png",
  "https://picsum.photos/seed/casino1/800/400",
  "https://picsum.photos/seed/casino2/800/400",
  "https://picsum.photos/seed/casino3/800/400",
  "https://picsum.photos/seed/casino4/800/400"
];

const CasinoCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-2xl mb-6 shadow-2xl border border-brand-700">
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={img}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-transparent"></div>
        </div>
      ))}
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-brand-accent w-6' : 'bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CasinoCarousel;
