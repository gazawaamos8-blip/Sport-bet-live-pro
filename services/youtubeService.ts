const API_KEYS = [
  'AIzaSyDFko_ouqtmkabLfElMHTU_LAjD35EavUY', // Clé par défaut
  'AIzaSyA_fallback_key_placeholder' 
];
const BASE_API_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    description?: string;
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
            description: "Watch the biggest match of the season live from Anfield.",
            thumbnails: { medium: { url: "https://i.ytimg.com/vi/h8b98_c_g50/mqdefault.jpg" }, high: { url: "" } },
            liveBroadcastContent: "live"
        }
    },
    {
        id: { videoId: 'L_tqK4E0' },
        snippet: {
            title: "Direct: Real Madrid vs Barcelona - La Liga",
            channelTitle: "Canal+ Sport",
            description: "El Clasico is here! Real Madrid hosts Barcelona in a crucial title race clash.",
            thumbnails: { medium: { url: "https://img.youtube.com/vi/L_tqK4E0/mqdefault.jpg" }, high: { url: "" } },
            liveBroadcastContent: "live"
        }
    },
    {
        id: { videoId: '9_v0_v0' },
        snippet: {
            title: "Sénégal vs Côte d'Ivoire - CAN 2026",
            channelTitle: "CAF TV",
            description: "The Lions of Teranga face the Elephants in this epic African showdown.",
            thumbnails: { medium: { url: "https://picsum.photos/seed/can1/320/180" }, high: { url: "" } },
            liveBroadcastContent: "live"
        }
    },
    {
        id: { videoId: '8_v0_v1' },
        snippet: {
            title: "PSG vs Marseille - Le Classique",
            channelTitle: "BeIN Sports",
            description: "The biggest rivalry in French football live from Parc des Princes.",
            thumbnails: { medium: { url: "https://picsum.photos/seed/psg1/320/180" }, high: { url: "" } },
            liveBroadcastContent: "live"
        }
    }
];

export const searchLiveSports = async (query: string = 'football live match', maxResults: number = 12, pageToken?: string): Promise<{items: YouTubeVideo[], nextPageToken?: string}> => {
  for (const key of API_KEYS) {
    try {
      let url = `${BASE_API_URL}/search?part=snippet&eventType=live&type=video&videoEmbeddable=true&q=${encodeURIComponent(query)}&key=${key}&maxResults=${maxResults}`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        return {
          items: data.items || [],
          nextPageToken: data.nextPageToken
        };
      }
    } catch (error) {
      console.error(`Erreur fetch YouTube avec clé ${key.substring(0, 5)}...:`, error);
    }
  }
  return { items: MOCK_VIDEOS };
};
