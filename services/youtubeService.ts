const API_KEY = 'AIzaSyDFko_ouqtmkabLfElMHTU_LAjD35EavUY';
const BASE_API_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: { url: string };
      high: { url: string };
    };
    liveBroadcastContent: string;
  };
}

// Fallback data if API fails or returns restricted content
export const MOCK_VIDEOS: YouTubeVideo[] = [
    {
        id: { videoId: 'h8b98_c_g50' }, 
        snippet: {
            title: "LIVE: Manchester City vs Liverpool - Premier League",
            channelTitle: "Sky Sports Premier League",
            thumbnails: { medium: { url: "https://i.ytimg.com/vi/h8b98_c_g50/mqdefault.jpg" }, high: { url: "" } },
            liveBroadcastContent: "live"
        }
    },
    {
        id: { videoId: 'L_tqK4E0' },
        snippet: {
            title: "Direct: Real Madrid vs Barcelona - La Liga",
            channelTitle: "Canal+ Sport",
            thumbnails: { medium: { url: "https://img.youtube.com/vi/L_tqK4E0/mqdefault.jpg" }, high: { url: "" } },
            liveBroadcastContent: "live"
        }
    }
];

export const searchLiveSports = async (query: string = 'football live match'): Promise<YouTubeVideo[]> => {
  try {
    // videoEmbeddable=true is crucial to avoid error 153 (playback forbidden on third-party sites)
    const url = `${BASE_API_URL}/search?part=snippet&eventType=live&type=video&videoEmbeddable=true&q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=12`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.warn("YouTube API issue:", errorData?.error?.message || response.statusText);
      return MOCK_VIDEOS;
    }

    const data = await response.json();
    return data.items && data.items.length > 0 ? data.items : MOCK_VIDEOS;
  } catch (error) {
    console.error("Erreur fetch YouTube:", error);
    return MOCK_VIDEOS; 
  }
};
