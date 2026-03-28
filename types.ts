
export type SportType = 'football' | 'basketball' | 'tennis' | 'rugby';

export interface User {
  phone: string;
  name: string;
  email?: string;
  balance: number;
  isBiometricEnabled: boolean;
  notifications?: {
    push: boolean;
    sms: boolean;
    email: boolean;
  };
  lastDailyBonus?: string; // Date string ISO
  hasReceivedFirstDepositBonus?: boolean;
  hasDownloadedApp?: boolean;
}

export interface Player {
  name: string;
  photo: string;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'card_yellow' | 'card_red' | 'sub';
  player: Player;
  detail?: string; // "Penalty", "Own Goal", etc.
  team: 'home' | 'away';
}

export interface MatchHighlight {
  id: string;
  image: string;
  title: string;
  time: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
}

export interface Standing {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  form: string; // "WWLDL"
  played: number;
  win: number;
  draw: number;
  lose: number;
}

export interface LineupPlayer {
  id: number;
  name: string;
  number: number;
  pos: string; // G, D, M, F
  grid?: string; // "1:1"
}

export interface Lineup {
  team: { id: number; name: string; logo: string };
  coach: { name: string };
  formation: string; // "4-3-3"
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface Match {
  id: string;
  sport: SportType;
  league: string;
  category: 'world' | 'europe' | 'africa' | 'local';
  countryCode?: string; // Pour les drapeaux (ex: 'gb', 'es')
  homeCountryCode?: string;
  awayCountryCode?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  time: string;
  startDate: Date; // Nouvelle propriété pour le tri par date
  status: 'live' | 'upcoming' | 'finished';
  isFavorite?: boolean; // New field
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  doubleChance?: {
    homeDraw: number;
    homeAway: number;
    drawAway: number;
  };
  overUnder25?: {
    over: number;
    under: number;
  };
  extraOdds?: {
    'injuriesOver1.5'?: number;
    'injuriesUnder1.5'?: number;
    'cardsOver3.5'?: number;
    'cardsUnder3.5'?: number;
    'yellowCardsOver2.5'?: number;
    'redCardYes'?: number;
  };
  aiProbabilities?: {
    home: number;
    draw: number;
    away: number;
  };
  homeLogo?: string;
  awayLogo?: string;
  videoUrl?: string;
  events?: MatchEvent[];
  highlights?: MatchHighlight[];
  stats?: MatchStats;
  liveAction?: {
    type: 'attack' | 'danger' | 'goal' | 'corner' | 'freekick' | 'penalty' | 'normal';
    team: 'home' | 'away' | 'none';
    x: number; // 0-100
    y: number; // 0-100
    message: string;
  };
  standings?: Standing[]; // Optional linked data
  lineups?: { home: Lineup; away: Lineup };
  h2h?: Match[];
}

export interface CasinoGame {
  id: string;
  title: string;
  provider: string;
  category: 'slots' | 'crash' | 'live' | 'table';
  image: string;
  isHot?: boolean;
}

export interface BetSlipItem {
  matchId: string;
  selection: 'home' | 'draw' | 'away' | 'homeDraw' | 'homeAway' | 'drawAway' | 'over2.5' | 'under2.5' | 'injuriesOver1.5' | 'injuriesUnder1.5' | 'cardsOver3.5' | 'cardsUnder3.5' | 'yellowCardsOver2.5' | 'redCardYes';
  odds: number;
  matchInfo: string;
  league?: string;
  sport: SportType;
  countryCode?: string;
  homeCountryCode?: string;
  awayCountryCode?: string;
  homeLogo?: string;
  awayLogo?: string;
}

export interface PlacedBet {
  id: string;
  date: string;
  items: BetSlipItem[];
  stake: number;
  totalOdds: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost' | 'cashed_out';
  promoCode?: string; // New field from image request
}

export interface SavedCoupon {
  code: string;
  items: BetSlipItem[];
  date: string;
  totalOdds: number;
}

export interface ChatMessage {
  id: string;
  user: string;
  phone?: string; // Added phone number
  avatar?: string;
  text: string;
  time: string;
  isUser: boolean;
  isSystem?: boolean;
  attachment?: {
    type: 'image' | 'video' | 'pdf' | 'file';
    url: string;
    name: string;
  };
}

export enum AppSection {
  AUTH = 'AUTH',
  HOME = 'HOME',
  LIVE = 'LIVE',
  UPCOMING = 'UPCOMING', // New section
  VIDEO = 'VIDEO',
  CASINO = 'CASINO',
  WALLET = 'WALLET',
  REFERRAL = 'REFERRAL',
  HISTORY = 'HISTORY',
  COUPONS = 'COUPONS', // Added COUPONS
  RESULTS = 'RESULTS',
  FAVORITES = 'FAVORITES',
  TRANSACTIONS = 'TRANSACTIONS', // Added TRANSACTIONS
  PROMOTIONS = 'PROMOTIONS',
  VIP_CLUB = 'VIP_CLUB',
  STATISTICS = 'STATISTICS',
  RESPONSIBLE_GAMING = 'RESPONSIBLE_GAMING',
  NEWS = 'NEWS',
  LEADERBOARD = 'LEADERBOARD',
  ASSISTANT = 'ASSISTANT'
}
