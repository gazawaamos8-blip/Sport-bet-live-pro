import { User, PlacedBet } from '../types';
import { MOCK_HISTORY } from '../constants';

const KEYS = {
  USER: 'sportbot_user',
  HISTORY: 'sportbot_history',
  BALANCE: 'sportbot_balance'
};

export const storageService = {
  // Gestion Utilisateur
  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    // Initialiser le solde si nouveau user
    if (!localStorage.getItem(KEYS.BALANCE)) {
      localStorage.setItem(KEYS.BALANCE, user.balance.toString());
    }
  },

  logout: () => {
    localStorage.removeItem(KEYS.USER);
  },

  // Gestion Solde (Database Balance)
  getBalance: (): number => {
    const bal = localStorage.getItem(KEYS.BALANCE);
    return bal ? parseFloat(bal) : 0;
  },

  updateBalance: (amount: number, type: 'add' | 'subtract') => {
    const current = storageService.getBalance();
    const newBalance = type === 'add' ? current + amount : current - amount;
    localStorage.setItem(KEYS.BALANCE, newBalance.toString());
    
    // Mettre à jour l'objet user aussi pour la cohérence
    const user = storageService.getUser();
    if (user) {
      user.balance = newBalance;
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    }
    return newBalance;
  },

  // Gestion Historique Paris (Database History)
  getHistory: (): PlacedBet[] => {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : MOCK_HISTORY;
  },

  addBet: (bet: PlacedBet) => {
    const history = storageService.getHistory();
    const newHistory = [bet, ...history];
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(newHistory));
    return newHistory;
  }
};