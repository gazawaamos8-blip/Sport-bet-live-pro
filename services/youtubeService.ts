
// Rotation de clés API pour éviter les quotas
const API_KEYS = [
  'AIzaSyDFko_ouqtmkabLfElMHTU_LAjD35EavUY', // Clé fournie
  'AIzaSyB_placeholder_key_2_for_rotation',   // Placeholder
  'AIzaSyC_placeholder_key_3_for_rotation'
];

let currentKeyIndex = 0;

const getApiKey = () => {
  return API_KEYS[currentKeyIndex];
};

const rotateKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.log("Rotation API Key YouTube vers index:", currentKeyIndex);
};

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
        id: { videoId: 'h8b98_c_g50' }, // Highlight example
        snippet: {
            title: "LIVE: Manchester City vs Liverpool - Premier League",
            channelTitle: "Sky Sports Premier League",
            thumbnails: { medium: { url: "https://i.ytimg.com/vi/h8b98_c_g50/mqdefault.jpg" }, high: { url: "" } },
            liveBroadcastContent: "live"
        }
    },
    {
        id: { videoId: 'L_tqK4E0' }, // Placeholder ID
        snippet: {
            title: "Direct: Real Madrid vs Barcelona - La Liga",
            channelTitle: "Canal+ Sport",
            thumbnails: { medium: { url: "https://img.youtube.com/vi/L_tqK4E0/mqdefault.jpg" }, high: { url: "" } },
            liveBroadcastContent: "live"
        }
    },
    {
        id: { videoId: 'demo_sport_3' },
        snippet: {
            title: "NBA: Lakers vs Warriors - 4th Quarter",
            channelTitle: "ESPN",
            thumbnails: { medium: { url: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=500&auto=format" }, high: { url: "" } },
            liveBroadcastContent: "live"
        }
    }
];

export const searchLiveSports = async (query: string = 'football live match'): Promise<YouTubeVideo[]> => {
  try {
    const key = getApiKey();
    // AJOUT IMPORTANT : videoEmbeddable=true permet d'éviter l'erreur 153 (lecture interdite sur site tiers)
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&videoEmbeddable=true&q=${encodeURIComponent(query)}&key=${key}&maxResults=10`
    );

    if (!response.ok) {
      if (response.status === 403) {
        rotateKey(); // Quota dépassé, on change de clé
      }
      console.warn("YouTube API issue, using fallback data.");
      return MOCK_VIDEOS;
    }

    const data = await response.json();
    return data.items && data.items.length > 0 ? data.items : MOCK_VIDEOS;
  } catch (error) {
    console.error("Erreur fetch YouTube:", error);
    return MOCK_VIDEOS; 
  }
};
