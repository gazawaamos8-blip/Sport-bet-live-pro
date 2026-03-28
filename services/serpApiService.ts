
const API_KEY = '1374966436869df17b071546668572dd758a8893766a6698eaf0127963f47a2a';
const BASE_URL = 'https://serpapi.com/search.json';

export interface SerpVideo {
  title: string;
  link: string;
  thumbnail: string;
  channel: string;
  duration: string;
  platform: string;
  date: string;
  isMovie?: boolean;
}

export const searchSerpVideos = async (query: string = 'football match highlights', isMovie: boolean = false, start: number = 0): Promise<SerpVideo[]> => {
  try {
    const finalQuery = isMovie ? `film complet vf gratuit illimité ${query}` : query;
    const params = new URLSearchParams({
      q: finalQuery,
      location: 'United States',
      hl: 'en',
      gl: 'us',
      api_key: API_KEY,
      engine: 'google_videos',
      start: start.toString()
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);

    if (!response.ok) {
      console.warn("SerpApi issue:", response.statusText);
      return [];
    }

    const data = await response.json();
    
    // SerpApi returns videos in different places depending on the engine
    // For 'google_videos', it's usually in 'video_results'
    const results = data.video_results || data.inline_videos || [];
    
    return results.map((v: any) => ({
      title: v.title || 'Vidéo sans titre',
      link: v.link || '#',
      thumbnail: v.thumbnail || '',
      channel: v.channel || v.source || 'Source inconnue',
      duration: v.duration || '',
      platform: v.platform || 'Web',
      date: v.date || ''
    }));
  } catch (error) {
    console.error("Erreur fetch SerpApi:", error);
    return [];
  }
};
