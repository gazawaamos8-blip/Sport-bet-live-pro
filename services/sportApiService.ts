import { Match, MatchEvent, MatchHighlight, MatchStats, Standing, Lineup, LineupPlayer, SportType } from '../types';
import { db } from './database';

// API KEY PROVIDED BY USER
const API_KEY = "221f837d3d230af85f23bf1eae26c541";
const API_BASE_URL = "https://v3.football.api-sports.io";

const getLogo = (name: string, code?: string) => {
    // If we have a specific country code that isn't a generic region, use the flag
    if (code && code !== 'eu' && code !== 'un' && code !== 'wo' && code !== 'africa') {
        return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
    }
    
    // Check if the team name itself has a known code
    const teamCode = TEAM_DATA[name]?.code;
    if (teamCode) {
        return `https://flagcdn.com/w160/${teamCode.toLowerCase()}.png`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&font-size=0.5&bold=true`;
};

const TEAM_DATA: Record<string, { code: string }> = {
    // AFCON / National Teams
    "Sénégal": { code: "sn" },
    "Maroc": { code: "ma" },
    "Côte d'Ivoire": { code: "ci" },
    "Cameroun": { code: "cm" },
    "Égypte": { code: "eg" },
    "Algérie": { code: "dz" },
    "Nigeria": { code: "ng" },
    "Ghana": { code: "gh" },
    "Tunisie": { code: "tn" },
    "RDC": { code: "cd" },
    "Mali": { code: "ml" },
    "Burkina Faso": { code: "bf" },
    "Guinée": { code: "gn" },
    "Afrique du Sud": { code: "za" },
    "Zambie": { code: "zm" },
    "Gabon": { code: "ga" },
    "Angola": { code: "ao" },
    "Cap-Vert": { code: "cv" },
    "Mauritanie": { code: "mr" },
    "Namibie": { code: "na" },
    "Guinée Équatoriale": { code: "gq" },
    "Gambie": { code: "gm" },
    "Tanzanie": { code: "tz" },
    "Mozambique": { code: "mz" },
    "Soudan": { code: "sd" },
    "Libye": { code: "ly" },
    "Bénin": { code: "bj" },
    "Togo": { code: "tg" },
    "Ouganda": { code: "ug" },
    "Kenya": { code: "ke" },
    "Rwanda": { code: "rw" },
    "Éthiopie": { code: "et" },
    "Zimbabwe": { code: "zw" },
    "Madagascar": { code: "mg" },
    "Sierra Leone": { code: "sl" },
    "Liberia": { code: "lr" },
    "Centrafrique": { code: "cf" },
    "Congo": { code: "cg" },
    "Burundi": { code: "bi" },
    "Comores": { code: "km" },
    "Djibouti": { code: "dj" },
    "Érythrée": { code: "er" },
    "Eswatini": { code: "sz" },
    "Lesotho": { code: "ls" },
    "Malawi": { code: "mw" },
    "Maurice": { code: "mu" },
    "Seychelles": { code: "sc" },
    "Somalie": { code: "so" },
    "Soudan du Sud": { code: "ss" },
    "Tchad": { code: "td" },

    // European Teams (UCL / Leagues)
    "Real Madrid": { code: "es" },
    "Barcelona": { code: "es" },
    "Atlético": { code: "es" },
    "Sevilla": { code: "es" },
    "Valencia": { code: "es" },
    "Real Sociedad": { code: "es" },
    "Villarreal": { code: "es" },
    "Betis": { code: "es" },
    "Girona": { code: "es" },
    "Bilbao": { code: "es" },
    "Man City": { code: "gb" },
    "Liverpool": { code: "gb" },
    "Arsenal": { code: "gb" },
    "Man Utd": { code: "gb" },
    "Chelsea": { code: "gb" },
    "Spurs": { code: "gb" },
    "Newcastle": { code: "gb" },
    "Aston Villa": { code: "gb" },
    "West Ham": { code: "gb" },
    "Bayern": { code: "de" },
    "Bayern Munich": { code: "de" },
    "Dortmund": { code: "de" },
    "Leipzig": { code: "de" },
    "Leverkusen": { code: "de" },
    "Frankfurt": { code: "de" },
    "PSG": { code: "fr" },
    "Marseille": { code: "fr" },
    "Lyon": { code: "fr" },
    "Monaco": { code: "fr" },
    "Lille": { code: "fr" },
    "Lens": { code: "fr" },
    "Inter": { code: "it" },
    "Inter Milan": { code: "it" },
    "Milan": { code: "it" },
    "AC Milan": { code: "it" },
    "Juventus": { code: "it" },
    "Napoli": { code: "it" },
    "Roma": { code: "it" },
    "Lazio": { code: "it" },
    "Atalanta": { code: "it" },
    "Fiorentina": { code: "it" },
    "Bologna": { code: "it" },
    "Torino": { code: "it" },
    "Benfica": { code: "pt" },
    "Porto": { code: "pt" },
    "Sporting CP": { code: "pt" },
    "Braga": { code: "pt" },
    "Guimarães": { code: "pt" },
    "Ajax": { code: "nl" },
    "PSV": { code: "nl" },
    "Feyenoord": { code: "nl" },
    "AZ Alkmaar": { code: "nl" },
    "Twente": { code: "nl" },
    "Celtic": { code: "gb" },
    "Rangers": { code: "gb" },
    "Club Brugge": { code: "be" },
    "Anderlecht": { code: "be" },
    "Gent": { code: "be" },
    "Salzburg": { code: "at" },
    "Sturm Graz": { code: "at" },
    "Sparta Praha": { code: "cz" },
    "Slavia Praha": { code: "cz" },
    "Shakhtar": { code: "ua" },
    "Dynamo Kyiv": { code: "ua" },
    "Galatasaray": { code: "tr" },
    "Fenerbahce": { code: "tr" },
    "Besiktas": { code: "tr" },
    "Trabzonspor": { code: "tr" },
    "AEK Athens": { code: "gr" },
    "PAOK": { code: "gr" },

    // African Clubs
    "Al Ahly": { code: "eg" },
    "Zamalek": { code: "eg" },
    "Pyramids FC": { code: "eg" },
    "Raja CA": { code: "ma" },
    "Wydad AC": { code: "ma" },
    "AS FAR": { code: "ma" },
    "RS Berkane": { code: "ma" },
    "Espérance Tunis": { code: "tn" },
    "Étoile du Sahel": { code: "tn" },
    "Club Africain": { code: "tn" },
    "MC Alger": { code: "dz" },
    "CR Belouizdad": { code: "dz" },
    "JS Kabylie": { code: "dz" },
    "USM Alger": { code: "dz" },
    "Mamelodi Sundowns": { code: "za" },
    "Orlando Pirates": { code: "za" },
    "Kaizer Chiefs": { code: "za" },
    "TP Mazembe": { code: "cd" },
    "AS Vita Club": { code: "cd" },
    "ASEC Mimosas": { code: "ci" },
    "Enyimba": { code: "ng" },
    "Asante Kotoko": { code: "gh" },
    "Hearts of Oak": { code: "gh" },
    "Teungueth FC": { code: "sn" },
    "Jaraaf": { code: "sn" },
    "Pikine": { code: "sn" },
    "Casa Sports": { code: "sn" },

    // Portuguese Teams
    "Maritimo": { code: "pt" },
    "Sporting CP B": { code: "pt" },
    "Benfica B": { code: "pt" },
    "Porto B": { code: "pt" },
    "Santa Clara": { code: "pt" },
    "Farense": { code: "pt" },
    "Nacional": { code: "pt" },
    "Rio Ave": { code: "pt" },
    "Moreirense": { code: "pt" },
    "Arouca": { code: "pt" },
    "Boavista": { code: "pt" },
    "Gil Vicente": { code: "pt" },
    "Estoril": { code: "pt" },
    "Vizela": { code: "pt" },
    "Chaves": { code: "pt" },
    "Portimonense": { code: "pt" },
    "Casa Pia": { code: "pt" },
    "Estrela Amadora": { code: "pt" },

    // Basketball (EuroLeague / NBA)
    "Lakers": { code: "us" },
    "Warriors": { code: "us" },
    "Celtics": { code: "us" },
    "Bulls": { code: "us" },
    "Heat": { code: "us" },
    "Knicks": { code: "us" },
    "Bucks": { code: "us" },
    "Suns": { code: "us" },
    "Mavericks": { code: "us" },
    "Nuggets": { code: "us" },
    "Real Madrid B.": { code: "es" },
    "Barcelona B.": { code: "es" },
    "Olympiacos": { code: "gr" },
    "Panathinaikos": { code: "gr" },
    "Fenerbahçe": { code: "tr" },
    "Maccabi": { code: "il" },
    "Partizan": { code: "rs" },
    "Virtus Bologna": { code: "it" },
    "Olimpia Milano": { code: "it" },
    "Monaco Basket": { code: "fr" },
    "Valencia Basket": { code: "es" },

    // Rugby (Six Nations)
    "France": { code: "fr" },
    "Ireland": { code: "ie" },
    "England": { code: "gb" },
    "Scotland": { code: "gb" },
    "Wales": { code: "gb" },
    "Italy": { code: "it" },

    // Tennis
    "Djokovic N.": { code: "rs" },
    "Alcaraz C.": { code: "es" },
    "Medvedev D.": { code: "ru" },
    "Sinner J.": { code: "it" },
    "Nadal R.": { code: "es" },
    "Rublev A.": { code: "ru" },
    "Zverev A.": { code: "de" },
    "Tsitsipas S.": { code: "gr" },
    "Rune H.": { code: "dk" },
    "Hurkacz H.": { code: "pl" },
    "Fritz T.": { code: "us" },
    "Ruud C.": { code: "no" },
    "De Minaur A.": { code: "au" },
    "Swiatek I.": { code: "pl" },
    "Sabalenka A.": { code: "by" },
    "Gauff C.": { code: "us" },
    "Rybakina E.": { code: "kz" },
    "Pegula J.": { code: "us" },
    "Jabeur O.": { code: "tn" },
    "Vondrousova M.": { code: "cz" },
    "Sakkari M.": { code: "gr" },
    "Muchova K.": { code: "cz" },
    "Krejcikova B.": { code: "cz" },
};

export const getFlag = (code: string) => {
    if (code === 'africa') return '🌍';
    if (code === 'eu') return '🇪🇺';
    if (code === 'wo' || code === 'un') return 'https://flagcdn.com/w40/un.png';
    return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

export const getLeagueInfo = (leagueName: string) => {
    return Object.values(LEAGUES).find(l => l.name === leagueName);
};

const getPlayerPhoto = (seed: number) => `https://randomuser.me/api/portraits/men/${seed % 99}.jpg`;

// Expanded Database of Leagues and Teams for 500+ matches generation
const LEAGUES = {
  // --- FOOTBALL ---
  AFCON: { 
      name: "Africa Cup of Nations", category: 'africa', code: 'africa', sport: 'football',
      teams: ["Sénégal", "Cameroun", "Côte d'Ivoire", "Maroc", "Égypte", "Algérie", "Mali", "Nigeria", "Ghana", "Tunisie", "Burkina Faso", "Guinée", "RDC", "Afrique du Sud", "Zambie", "Gabon", "Angola", "Cap-Vert", "Mauritanie", "Namibie", "Guinée Équatoriale", "Gambie", "Tanzanie", "Mozambique"] 
  },
  NPFL: {
      name: "Nigeria Premier League", category: 'africa', code: 'ng', sport: 'football',
      teams: ["Enyimba", "Remo Stars", "Lobi Stars", "Kano Pillars", "Rangers Int."]
  },
  BOTOLA: {
      name: "Botola Pro", category: 'africa', code: 'ma', sport: 'football',
      teams: ["Raja CA", "Wydad AC", "AS FAR", "RS Berkane", "FUS Rabat"]
  },
  LIGUE1_DZ: {
      name: "Ligue 1 Algérie", category: 'africa', code: 'dz', sport: 'football',
      teams: ["MC Alger", "CR Belouizdad", "JS Kabylie", "ES Sétif", "USM Alger"]
  },
  PSL_SA: {
      name: "PSL South Africa", category: 'africa', code: 'za', sport: 'football',
      teams: ["Mamelodi Sundowns", "Orlando Pirates", "Kaizer Chiefs", "SuperSport Utd"]
  },
  EGYPT_PL: {
      name: "Egyptian Premier League", category: 'africa', code: 'eg', sport: 'football',
      teams: ["Al Ahly", "Zamalek", "Pyramids FC", "Al Masry"]
  },
  TUNISIA_L1: {
      name: "Ligue 1 Tunisie", category: 'africa', code: 'tn', sport: 'football',
      teams: ["Espérance Tunis", "Étoile du Sahel", "Club Africain", "CS Sfaxien"]
  },
  GHANA_PL: {
      name: "Ghana Premier League", category: 'africa', code: 'gh', sport: 'football',
      teams: ["Asante Kotoko", "Hearts of Oak", "Medeama SC", "Aduana Stars"]
  },
  SENEGAL_L1: {
      name: "Ligue 1 Sénégal", category: 'africa', code: 'sn', sport: 'football',
      teams: ["Teungueth FC", "Jaraaf", "Pikine", "Casa Sports"]
  },
  CIV_L1: {
      name: "Ligue 1 Côte d'Ivoire", category: 'africa', code: 'ci', sport: 'football',
      teams: ["ASEC Mimosas", "San Pédro", "AFAD", "SC Gagnoa"]
  },
  UCL: { 
      name: "UEFA Champions League", category: 'europe', code: 'eu', sport: 'football',
      teams: ["Real Madrid", "Man City", "Bayern", "PSG", "Barcelona", "Inter", "Arsenal", "Milan", "Dortmund", "Atlético", "Leipzig", "Benfica", "Porto", "Feyenoord", "Lazio", "Celtic"] 
  },
  PL: { 
      name: "Premier League", category: 'europe', code: 'gb', sport: 'football',
      teams: ["Liverpool", "Chelsea", "Man Utd", "Spurs", "Newcastle", "Aston Villa", "West Ham", "Brighton", "Bournemouth", "Fulham", "Wolves", "Everton", "Brentford", "Nottingham", "Palace", "Luton", "Burnley", "Sheffield"] 
  },
  LIGA: { 
      name: "La Liga", category: 'europe', code: 'es', sport: 'football',
      teams: ["Sevilla", "Atletico", "Valencia", "Betis", "Girona", "Bilbao", "Espanyol", "Barcelona", "Real Madrid", "Sociedad", "Villarreal", "Mallorca", "Osasuna", "Rayo Vallecano", "Getafe", "Alavés"] 
  },
  SERIEA: {
      name: "Serie A", category: 'europe', code: 'it', sport: 'football',
      teams: ["Juventus", "AC Milan", "Inter Milan", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina"]
  },
  BUNDESLIGA: {
      name: "Bundesliga", category: 'europe', code: 'de', sport: 'football',
      teams: ["Bayern Munich", "Dortmund", "Leipzig", "Leverkusen", "Frankfurt", "Wolfsburg"]
  },
  LIGUE1: {
      name: "Ligue 1", category: 'europe', code: 'fr', sport: 'football',
      teams: ["PSG", "Marseille", "Lyon", "Monaco", "Lille", "Lens", "Rennes"]
  },
  EREDIVISIE: {
      name: "Eredivisie", category: 'europe', code: 'nl', sport: 'football',
      teams: ["Ajax", "PSV", "Feyenoord", "AZ Alkmaar", "Twente"]
  },
  PRIMEIRA: {
      name: "Primeira Liga", category: 'europe', code: 'pt', sport: 'football',
      teams: ["Benfica", "Porto", "Sporting CP", "Braga", "Guimarães"]
  },
  MLS: {
      name: "Major League Soccer", category: 'world', code: 'us', sport: 'football',
      teams: ["Inter Miami", "LA Galaxy", "LAFC", "NY Red Bulls", "Seattle Sounders"]
  },
  SAUDI: {
      name: "Saudi Pro League", category: 'world', code: 'sa', sport: 'football',
      teams: ["Al-Nassr", "Al-Hilal", "Al-Ittihad", "Al-Ahli", "Al-Shabab"]
  },
  ARGENTINA: {
      name: "Primera División", category: 'world', code: 'ar', sport: 'football',
      teams: ["River Plate", "Boca Juniors", "Racing Club", "Independiente", "San Lorenzo"]
  },
  BRAZIL: {
      name: "Série A", category: 'world', code: 'br', sport: 'football',
      teams: ["Flamengo", "Palmeiras", "São Paulo", "Corinthians", "Fluminense"]
  },
  
  // --- BASKETBALL ---
  NBA: {
      name: "NBA", category: 'world', code: 'us', sport: 'basketball',
      teams: ["Lakers", "Warriors", "Celtics", "Heat", "Bulls", "Knicks", "Nets", "Sixers", "Bucks", "Suns", "Mavericks", "Nuggets", "Clippers", "Kings", "Grizzlies", "Spurs"]
  },
  ACB: {
      name: "Liga ACB", category: 'europe', code: 'es', sport: 'basketball',
      teams: ["Real Madrid B.", "Barcelona B.", "Unicaja", "Valencia Basket", "Tenerife"]
  },
  LEGA_BASKET: {
      name: "Lega Basket", category: 'europe', code: 'it', sport: 'basketball',
      teams: ["Olimpia Milano", "Virtus Bologna", "Venezia", "Sassari"]
  },
  EUROLEAGUE: {
      name: "EuroLeague", category: 'europe', code: 'eu', sport: 'basketball',
      teams: ["Real Madrid B.", "Barcelona B.", "Olympiacos", "Monaco Basket", "Fenerbahçe", "Panathinaikos", "Maccabi", "Virtus Bologna", "Partizan", "Valencia Basket"]
  },

  // --- TENNIS ---
  ROLAND_GARROS: {
      name: "Roland Garros", category: 'europe', code: 'fr', sport: 'tennis',
      teams: ["Djokovic N.", "Alcaraz C.", "Nadal R.", "Sinner J."]
  },
  WIMBLEDON: {
      name: "Wimbledon", category: 'europe', code: 'gb', sport: 'tennis',
      teams: ["Djokovic N.", "Alcaraz C.", "Medvedev D.", "Sinner J."]
  },
  US_OPEN: {
      name: "US Open", category: 'world', code: 'us', sport: 'tennis',
      teams: ["Djokovic N.", "Alcaraz C.", "Medvedev D.", "Sinner J."]
  },
  AUS_OPEN: {
      name: "Australian Open", category: 'world', code: 'au', sport: 'tennis',
      teams: ["Djokovic N.", "Alcaraz C.", "Medvedev D.", "Sinner J."]
  },
  ATP: {
      name: "ATP Tour", category: 'world', code: 'un', sport: 'tennis',
      teams: ["Djokovic N.", "Alcaraz C.", "Medvedev D.", "Sinner J.", "Rublev A.", "Zverev A.", "Tsitsipas S.", "Rune H.", "Hurkacz H.", "Fritz T.", "Ruud C.", "De Minaur A."]
  },
  WTA: {
      name: "WTA Tour", category: 'world', code: 'un', sport: 'tennis',
      teams: ["Swiatek I.", "Sabalenka A.", "Gauff C.", "Rybakina E.", "Pegula J.", "Jabeur O.", "Vondrousova M.", "Sakkari M.", "Muchova K.", "Krejcikova B."]
  },

  // --- RUGBY ---
  TOP14: {
      name: "Top 14", category: 'europe', code: 'fr', sport: 'rugby',
      teams: ["Toulouse", "La Rochelle", "Stade Français", "Bordeaux", "Racing 92", "Toulon", "Lyon", "Bayonne", "Castres", "Clermont", "Pau", "Perpignan"]
  }
};

let matchesState: Match[] = [];
let listeners: ((matches: Match[]) => void)[] = [];

// --- Mock WebSocket Engine ---
class MockSocket {
  interval: any = null;

  start() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.updateLiveMatches();
    }, 2000); // Updates every 2 seconds
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  updateLiveMatches() {
    let hasChanges = false;
    matchesState = matchesState.map(match => {
      if (match.status !== 'live') return match;

      let newTime = match.time;
      let newHomeScore = match.homeScore;
      let newAwayScore = match.awayScore;
      let newEvents = match.events || [];

      // Logic differs by sport
      if (match.sport === 'football' || match.sport === 'rugby') {
          const timeVal = parseInt(match.time.replace("'", ""));
          if (!isNaN(timeVal) && timeVal < 90) {
            newTime = `${timeVal + 1}'`;
            hasChanges = true;
          }
      } else if (match.sport === 'basketball') {
          // Basketball time counts down usually, simplified here
          if (Math.random() > 0.5) newTime = `Q4 ${Math.floor(Math.random()*10)}:00`;
      }

      // Random Scoring Simulation
      if (Math.random() < 0.05) { 
        const isHome = Math.random() > 0.5;
        let points = 1;
        let eventType = 'goal';
        let detail = "But";

        if (match.sport === 'basketball') {
            points = Math.floor(Math.random() * 3) + 1; // 1, 2 or 3 points
            eventType = 'goal';
            detail = `${points} Pts`;
        } else if (match.sport === 'rugby') {
            points = Math.random() > 0.7 ? 5 : 3; // Try or Penalty
            eventType = 'goal';
            detail = points === 5 ? "Essai" : "Pénalité";
        } else if (match.sport === 'tennis') {
            points = 0; 
        }

        if (points > 0) {
            if (isHome) newHomeScore += points; else newAwayScore += points;
            hasChanges = true;
            
            newEvents = [...newEvents, {
                id: `e_live_${Date.now()}_${match.id}`,
                minute: parseInt(newTime) || 0,
                type: 'goal',
                team: isHome ? 'home' : 'away',
                player: { name: isHome ? 'Joueur H' : 'Joueur A', photo: getPlayerPhoto(Date.now()) },
                detail: detail
            }];
        }
      }

      return {
        ...match,
        time: newTime,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        events: newEvents
      };
    });

    if (hasChanges) {
      this.notifyListeners();
    }
  }

  notifyListeners() {
    listeners.forEach(callback => callback([...matchesState]));
  }
}

const socketEngine = new MockSocket();

// --- Initialization ---

const generateEvents = (homeScore: number, awayScore: number, sport: string): MatchEvent[] => {
  const events: MatchEvent[] = [];
  const totalScore = homeScore + awayScore;
  const limit = sport === 'basketball' ? 5 : totalScore; 

  for(let i=0; i<limit; i++) {
    const isHome = Math.random() > 0.5;
    let type: any = 'goal';
    let detail = 'But';

    if (sport === 'basketball') { detail = "3 Points"; }
    else if (sport === 'tennis') { detail = "Ace"; }
    else if (sport === 'rugby') { detail = "Essai"; }

    events.push({
      id: `e_init_${i}`, 
      minute: Math.floor(Math.random() * 90) + 1, 
      type, 
      team: isHome ? 'home' : 'away',
      player: { name: `Joueur ${isHome ? 'H' : 'A'}`, photo: getPlayerPhoto(i) },
      detail
    });
  }
  return events;
};

const getStatsBySport = (sport: string): MatchStats => {
    if (sport === 'basketball') {
        return { 
            possession: {home: 50, away: 50}, 
            shots: {home: Math.floor(Math.random()*40)+80, away: Math.floor(Math.random()*40)+80}, 
            shotsOnTarget: {home: Math.floor(Math.random()*10)+5, away: Math.floor(Math.random()*10)+5}, 
            corners: {home: Math.floor(Math.random()*20)+10, away: Math.floor(Math.random()*20)+10}
        };
    } else if (sport === 'tennis') {
        return {
            possession: {home: Math.floor(Math.random()*40)+40, away: Math.floor(Math.random()*40)+40}, 
            shots: {home: Math.floor(Math.random()*10), away: Math.floor(Math.random()*10)}, 
            shotsOnTarget: {home: Math.floor(Math.random()*5), away: Math.floor(Math.random()*5)}, 
            corners: {home: Math.floor(Math.random()*10), away: Math.floor(Math.random()*10)}
        };
    }
    return { 
        possession: {home: 50, away: 50}, 
        shots: {home: 12, away: 8}, 
        shotsOnTarget: {home: 5, away: 3}, 
        corners: {home: 6, away: 4} 
    };
};

const initializeMatches = (): Match[] => {
  const matches: Match[] = [];
  let idCounter = 1;

  // --- SPECIAL MATCH INSERTION: MAROC VS SENEGAL ---
  const today = new Date();
  today.setHours(20, 0, 0, 0); // Tonight at 20:00

  const homeCode = TEAM_DATA['Maroc']?.code || 'ma';
  const awayCode = TEAM_DATA['Sénégal']?.code || 'sn';

  matches.push({
    id: `m_special_afcon_1`,
    sport: 'football',
    league: 'Africa Cup of Nations',
    category: 'africa',
    countryCode: 'africa',
    homeCountryCode: homeCode,
    awayCountryCode: awayCode,
    homeTeam: 'Maroc',
    awayTeam: 'Sénégal',
    homeScore: 0,
    awayScore: 0,
    time: '20:00',
    startDate: today,
    status: 'upcoming',
    isFavorite: true,
    odds: { home: 2.10, draw: 3.10, away: 2.80 },
    aiProbabilities: { home: 45, draw: 30, away: 25 },
    homeLogo: getLogo('Maroc', homeCode),
    awayLogo: getLogo('Sénégal', awayCode),
    events: [],
    highlights: [],
    stats: getStatsBySport('football')
  });
  // ------------------------------------------------

  // Generate 7 days of data
  const datesToGenerate = [-1, 0, 1, 2, 3, 4, 5];

  datesToGenerate.forEach(dayOffset => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + dayOffset);
    
    Object.values(LEAGUES).forEach(leagueData => {
        // Generate matches
        const matchCount = 4 + Math.floor(Math.random() * 3); 
        
        for(let i=0; i<matchCount; i++) {
            const homeIdx = Math.floor(Math.random() * leagueData.teams.length);
            let awayIdx = Math.floor(Math.random() * leagueData.teams.length);
            while (awayIdx === homeIdx) awayIdx = Math.floor(Math.random() * leagueData.teams.length);

            // Determine status
            let status: 'live' | 'upcoming' | 'finished' = 'upcoming';
            let time = "";
            
            if (dayOffset < 0) {
                status = 'finished';
                time = "FT";
            } else if (dayOffset === 0) {
                 const rand = Math.random();
                 if (rand < 0.25) { 
                     status = 'live'; 
                     if (leagueData.sport === 'football' || leagueData.sport === 'rugby') time = `${Math.floor(Math.random()*80)+1}'`;
                     else if (leagueData.sport === 'basketball') time = `Q${Math.floor(Math.random()*3)+1}`;
                     else time = `Set ${Math.floor(Math.random()*2)+1}`;
                 }
                 else if (rand < 0.5) { status = 'finished'; time = "FT"; }
                 else { status = 'upcoming'; }
            }

            // Generate Scores based on sport
            let hScore = 0, aScore = 0;
            if (status !== 'upcoming') {
                if (leagueData.sport === 'football') {
                    hScore = Math.floor(Math.random() * 5);
                    aScore = Math.floor(Math.random() * 3);
                } else if (leagueData.sport === 'basketball') {
                    hScore = Math.floor(Math.random() * 40) + 80;
                    aScore = Math.floor(Math.random() * 40) + 80;
                } else if (leagueData.sport === 'rugby') {
                    hScore = Math.floor(Math.random() * 30) + 10;
                    aScore = Math.floor(Math.random() * 30) + 10;
                } else if (leagueData.sport === 'tennis') {
                    hScore = Math.floor(Math.random() * 3); // Sets
                    aScore = Math.floor(Math.random() * 3);
                    if (hScore === aScore && status === 'finished') hScore++; 
                }
            }
            
            const hours = 12 + Math.floor(Math.random() * 11); // 12h to 23h
            const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
            const matchDate = new Date(baseDate);
            matchDate.setHours(hours, minutes, 0, 0);

            if (status === 'upcoming') {
                time = `${hours}:${minutes.toString().padStart(2, '0')}`;
            }

            const homeStrength = Math.random();
            const awayStrength = Math.random();
            const total = homeStrength + awayStrength + 0.5;
            const aiHome = Math.floor((homeStrength / total) * 100);
            const aiAway = Math.floor((awayStrength / total) * 100);
            const aiDraw = 100 - aiHome - aiAway;

            const homeTeamName = leagueData.teams[homeIdx];
            const awayTeamName = leagueData.teams[awayIdx];
            const homeCode = TEAM_DATA[homeTeamName]?.code || leagueData.code;
            const awayCode = TEAM_DATA[awayTeamName]?.code || leagueData.code;

            matches.push({
                id: `m_${leagueData.code}_${idCounter++}`,
                sport: leagueData.sport as SportType,
                league: leagueData.name,
                category: leagueData.category as any,
                countryCode: leagueData.code,
                homeCountryCode: homeCode,
                awayCountryCode: awayCode,
                homeTeam: homeTeamName,
                awayTeam: awayTeamName,
                homeScore: hScore,
                awayScore: aScore,
                time: time,
                startDate: matchDate,
                status: status,
                isFavorite: false,
                odds: {
                    home: parseFloat((Math.random() * 2 + 1.2).toFixed(2)),
                    draw: leagueData.sport === 'tennis' ? 0 : parseFloat((Math.random() * 3 + 2.5).toFixed(2)),
                    away: parseFloat((Math.random() * 4 + 1.5).toFixed(2))
                },
                aiProbabilities: {
                    home: aiHome,
                    draw: leagueData.sport === 'tennis' ? 0 : aiDraw,
                    away: aiAway
                },
                homeLogo: getLogo(homeTeamName, homeCode),
                awayLogo: getLogo(awayTeamName, awayCode),
                videoUrl: status === 'live' ? "https://www.youtube.com/embed/h8b98_c_g50" : undefined,
                events: generateEvents(hScore, aScore, leagueData.sport),
                highlights: [],
                stats: getStatsBySport(leagueData.sport)
            });
        }
    });
  });

  return matches;
};

// --- API Methods ---

export const fetchMatchesFromApi = async (): Promise<Match[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/fixtures?live=all`, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });
        const data = await response.json();
        
        if (data.response && data.response.length > 0) {
            return data.response.map((item: any) => ({
                id: item.fixture.id.toString(),
                sport: 'football',
                league: item.league.name,
                category: 'world',
                homeTeam: item.teams.home.name,
                awayTeam: item.teams.away.name,
                homeScore: item.goals.home || 0,
                awayScore: item.goals.away || 0,
                time: item.fixture.status.elapsed ? `${item.fixture.status.elapsed}'` : item.fixture.status.short,
                startDate: new Date(item.fixture.date),
                status: item.fixture.status.short === 'FT' ? 'finished' : (['1H', '2H', 'HT'].includes(item.fixture.status.short) ? 'live' : 'upcoming'),
                odds: {
                    home: 1.5 + Math.random(),
                    draw: 2.5 + Math.random(),
                    away: 2.0 + Math.random()
                },
                homeLogo: item.teams.home.logo,
                awayLogo: item.teams.away.logo
            }));
        }
    } catch (error) {
        console.error("API Error:", error);
    }
    return [];
};

export const fetchMatches = async (): Promise<Match[]> => {
  if (matchesState.length === 0) {
    matchesState = initializeMatches();
    socketEngine.start(); // Start live updates
    
    // Try to merge with real API data if available
    const apiMatches = await fetchMatchesFromApi();
    if (apiMatches.length > 0) {
        matchesState = [...apiMatches, ...matchesState];
    }
  }
  
  const sorted = [...matchesState].sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;
      return a.startDate.getTime() - b.startDate.getTime();
  });
  
  return sorted;
};

// Logic to check bet results
export const checkBetResults = async () => {
    const bets = db.getBets();
    const pendingBets = bets.filter(b => b.status === 'pending');
    
    if (pendingBets.length === 0) return;

    const allMatches = await fetchMatches();
    
    pendingBets.forEach(bet => {
        let allFinished = true;
        let won = true;
        
        bet.items.forEach(item => {
            const match = allMatches.find(m => m.id === item.matchId);
            if (!match || match.status !== 'finished') {
                allFinished = false;
                return;
            }
            
            const result = match.homeScore > match.awayScore ? 'home' : (match.homeScore < match.awayScore ? 'away' : 'draw');
            if (result !== item.selection) {
                won = false;
            }
        });
        
        if (allFinished) {
            db.updateBetStatus(bet.id, won ? 'won' : 'lost', won ? bet.potentialWin : 0);
            if (won) {
                alert(`Félicitations ! Votre pari ${bet.id} est GAGNANT ! Gain: ${bet.potentialWin.toLocaleString()} F`);
            } else {
                alert(`Désolé, votre pari ${bet.id} est PERDU.`);
            }
        }
    });
};

export const fetchMatchesByDate = async (date: Date): Promise<Match[]> => {
    const all = await fetchMatches();
    return all.filter(m => {
        const d1 = new Date(m.startDate);
        const d2 = new Date(date);
        return d1.getDate() === d2.getDate() && 
               d1.getMonth() === d2.getMonth();
    });
};

// --- Standings & Lineups (New Features) ---

export const fetchStandings = async (leagueName: string): Promise<Standing[]> => {
    // Generate mock standings based on league teams
    const league = Object.values(LEAGUES).find(l => l.name === leagueName) || LEAGUES.PL;
    const teams = league.teams;
    
    const standings: Standing[] = teams.map((teamName, i) => {
        const played = 25;
        const win = Math.floor(Math.random() * 20);
        const lose = Math.floor(Math.random() * (played - win));
        const draw = played - win - lose;
        const points = (win * 3) + draw;
        
        // Resolve code for team if it exists in TEAM_DATA, otherwise use league code
        const teamCode = TEAM_DATA[teamName]?.code || league.code;
        
        return {
            rank: 0, // Assigned after sort
            team: { id: i, name: teamName, logo: getLogo(teamName, teamCode) },
            points,
            goalsDiff: Math.floor(Math.random() * 40) - 10,
            form: "WWLDL".split('').sort(() => 0.5 - Math.random()).join(''),
            played,
            win,
            draw,
            lose
        };
    }).sort((a, b) => b.points - a.points);

    return standings.map((s, i) => ({ ...s, rank: i + 1 }));
};

const generateLineup = (teamName: string, code?: string): Lineup => {
    const formation = "4-3-3";
    const startXI: LineupPlayer[] = [];
    const substitutes: LineupPlayer[] = [];
    
    // Goalkeeper
    startXI.push({ id: 1, name: "Gardien", number: 1, pos: "G" });
    
    // Defenders
    for(let i=0; i<4; i++) startXI.push({ id: 2+i, name: `Def ${i+1}`, number: 2+i, pos: "D" });
    
    // Midfielders
    for(let i=0; i<3; i++) startXI.push({ id: 6+i, name: `Mil ${i+1}`, number: 6+i, pos: "M" });
    
    // Forwards
    for(let i=0; i<3; i++) startXI.push({ id: 9+i, name: `Att ${i+1}`, number: 9+i, pos: "F" });

    // Subs
    for(let i=0; i<5; i++) substitutes.push({ id: 20+i, name: `Sub ${i+1}`, number: 12+i, pos: "Sub" });

    return {
        team: { id: 0, name: teamName, logo: getLogo(teamName, code) },
        coach: { name: "Coach Pro" },
        formation,
        startXI,
        substitutes
    };
};

export const fetchLineups = async (matchId: string): Promise<{ home: Lineup; away: Lineup } | null> => {
    const match = matchesState.find(m => m.id === matchId);
    if (!match) return null;
    return {
        home: generateLineup(match.homeTeam, match.homeCountryCode),
        away: generateLineup(match.awayTeam, match.awayCountryCode)
    };
};

export const fetchH2H = async (matchId: string): Promise<Match[]> => {
    const match = matchesState.find(m => m.id === matchId);
    if (!match) return [];
    
    // Generate 5 previous matches
    const history: Match[] = [];
    for(let i=0; i<5; i++) {
        history.push({
            ...match,
            id: `h2h_${i}`,
            startDate: new Date(Date.now() - (1000 * 60 * 60 * 24 * (30 * (i+1)))), // Months ago
            homeScore: Math.floor(Math.random() * 3),
            awayScore: Math.floor(Math.random() * 3),
            status: 'finished',
            time: "FT"
        });
    }
    return history;
};

// --- Real-time Subscription ---
export const subscribeToMatchUpdates = (callback: (matches: Match[]) => void) => {
  listeners.push(callback);
  // Return cleanup function
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

export const toggleMatchFavorite = (matchId: string) => {
    matchesState = matchesState.map(m => 
        m.id === matchId ? { ...m, isFavorite: !m.isFavorite } : m
    );
    socketEngine.notifyListeners();
};