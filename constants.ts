import { Match, PlacedBet, CasinoGame } from './types';

export const CAROUSEL_IMAGES = [
  "https://picsum.photos/800/400?random=1",
  "https://picsum.photos/800/400?random=2",
  "https://picsum.photos/800/400?random=3",
  "https://picsum.photos/800/400?random=4",
  "https://picsum.photos/800/400?random=5",
  "https://picsum.photos/800/400?random=6",
];

// Génération de 70 jeux pour la section Casino
const generateGames = (): CasinoGame[] => {
  const games: CasinoGame[] = [];
  
  // JEU SPECIAL 1 : COSMIC ROULETTE
  games.push({ 
    id: 'cosmic-roulette', 
    title: 'Cosmic Roulette', 
    provider: 'SportBet Originals', 
    category: 'table', 
    image: 'https://images.unsplash.com/photo-1534234828569-1f942bc30479?auto=format&fit=crop&q=80&w=500', 
    isHot: true 
  });

  // JEU SPECIAL 2 : AVIATOR CRASH (Nouveau)
  games.push({ 
    id: 'aviator-crash', 
    title: 'Aviator Pro', 
    provider: 'Spribe UI', 
    category: 'crash', 
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=500', 
    isHot: true 
  });

  // 1. Crash Games (Autres)
  games.push({ id: 'av-2', title: 'JetX', provider: 'SmartSoft', category: 'crash', image: 'https://images.unsplash.com/photo-1559650656-5d1d361e5030?auto=format&fit=crop&q=80&w=300' });
  games.push({ id: 'av-3', title: 'Zeppelin', provider: 'Betsolutions', category: 'crash', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=300' });

  // 2. Slots (x40)
  const slotNames = ["Book of Ra", "Sweet Bonanza", "Gates of Olympus", "Fruit Party", "Wolf Gold", "Big Bass Bonanza", "Starburst", "Gonzo's Quest", "Buffalo King", "The Dog House"];
  for (let i = 0; i < 40; i++) {
    games.push({
      id: `slot-${i}`,
      title: slotNames[i % slotNames.length] + (Math.floor(i/10) > 0 ? ` ${i}` : ''),
      provider: i % 2 === 0 ? 'Pragmatic Play' : 'EGT',
      category: 'slots',
      image: `https://picsum.photos/300/200?random=${100+i}`,
      isHot: Math.random() < 0.2
    });
  }

  // 3. Live Casino (x15)
  const liveNames = ["Crazy Time", "Lightning Roulette", "Monopoly Live", "Blackjack VIP", "Baccarat Speed", "Dream Catcher"];
  for (let i = 0; i < 15; i++) {
    games.push({
      id: `live-${i}`,
      title: liveNames[i % liveNames.length],
      provider: 'Evolution Gaming',
      category: 'live',
      image: `https://images.unsplash.com/photo-1511193311914-0346f1914d72?auto=format&fit=crop&q=80&w=300&random=${i}`,
      isHot: Math.random() < 0.3
    });
  }

  // 4. Table Games (x15)
  for (let i = 0; i < 15; i++) {
    games.push({
      id: `table-${i}`,
      title: `Poker Texas Hold'em ${i+1}`,
      provider: '1xGames',
      category: 'table',
      image: `https://images.unsplash.com/photo-1544552866-d3ed42536cfd?auto=format&fit=crop&q=80&w=300&random=${i}`
    });
  }

  return games;
};

export const MOCK_CASINO_GAMES = generateGames();

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    sport: 'football',
    league: 'Premier League',
    category: 'europe',
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    homeScore: 2,
    awayScore: 1,
    time: "72'",
    status: 'live',
    odds: { home: 1.45, draw: 4.20, away: 6.50 },
    homeLogo: "https://picsum.photos/100/100?random=10",
    awayLogo: "https://picsum.photos/100/100?random=101",
    startDate: new Date()
  },
  {
    id: 'm2',
    sport: 'football',
    league: 'La Liga',
    category: 'europe',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeScore: 0,
    awayScore: 0,
    time: "15'",
    status: 'live',
    odds: { home: 2.10, draw: 3.50, away: 3.10 },
    homeLogo: "https://picsum.photos/100/100?random=11",
    awayLogo: "https://picsum.photos/100/100?random=111",
    startDate: new Date()
  },
  {
    id: 'm3',
    sport: 'football',
    league: 'Serie A',
    category: 'europe',
    homeTeam: 'Juventus',
    awayTeam: 'AC Milan',
    homeScore: 1,
    awayScore: 1,
    time: "HT",
    status: 'live',
    odds: { home: 2.80, draw: 3.00, away: 2.60 },
    homeLogo: "https://picsum.photos/100/100?random=12",
    awayLogo: "https://picsum.photos/100/100?random=121",
    startDate: new Date()
  },
  {
    id: 'm4',
    sport: 'basketball',
    league: 'NBA',
    category: 'world',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    homeScore: 102,
    awayScore: 98,
    time: "Q4 5:00",
    status: 'live',
    odds: { home: 1.50, draw: 15.00, away: 2.50 },
    homeLogo: "https://picsum.photos/100/100?random=13",
    awayLogo: "https://picsum.photos/100/100?random=131",
    startDate: new Date()
  },
   {
    id: 'm5',
    sport: 'tennis',
    league: 'Roland Garros',
    category: 'europe',
    homeTeam: 'Alcaraz',
    awayTeam: 'Djokovic',
    homeScore: 2,
    awayScore: 1,
    time: "Set 4",
    status: 'live',
    odds: { home: 1.80, draw: 0, away: 1.95 },
    homeLogo: "https://picsum.photos/100/100?random=14",
    awayLogo: "https://picsum.photos/100/100?random=141",
    startDate: new Date()
  },
  {
    id: 'm6',
    sport: 'football',
    league: 'Bundesliga',
    category: 'europe',
    homeTeam: 'Bayern',
    awayTeam: 'Dortmund',
    homeScore: 0,
    awayScore: 0,
    time: "20:00",
    status: 'upcoming',
    odds: { home: 1.55, draw: 4.00, away: 5.20 },
    homeLogo: "https://picsum.photos/100/100?random=15",
    awayLogo: "https://picsum.photos/100/100?random=151",
    startDate: new Date(Date.now() + 86400000)
  }
];

export const MOCK_HISTORY: PlacedBet[] = [
  {
    id: 'b123',
    date: '2023-10-24 14:30',
    items: [
      { matchId: 'm99', selection: 'home', odds: 1.5, matchInfo: 'Arsenal vs Chelsea', sport: 'football' },
      { matchId: 'm98', selection: 'away', odds: 2.1, matchInfo: 'PSG vs Lille', sport: 'football' }
    ],
    stake: 2000,
    totalOdds: 3.15,
    potentialWin: 6300,
    status: 'won'
  },
  {
    id: 'b124',
    date: '2023-10-25 09:15',
    items: [
      { matchId: 'm97', selection: 'home', odds: 1.8, matchInfo: 'Lakers vs Suns', sport: 'basketball' }
    ],
    stake: 1000,
    totalOdds: 1.8,
    potentialWin: 1800,
    status: 'lost'
  }
];