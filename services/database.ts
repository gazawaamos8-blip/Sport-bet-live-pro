import { User, PlacedBet, SavedCoupon, BetSlipItem } from '../types';
import { MOCK_HISTORY } from '../constants';

// Keys for localStorage
const DB_KEYS = {
  USER: 'db_user_v1',
  BETS: 'db_bets_v1',
  TRANSACTIONS: 'db_transactions_v1',
  SETTINGS: 'db_settings_v1',
  COUPONS: 'db_coupons_v1'
};

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet_stake' | 'bet_win';
  amount: number;
  date: string;
  status: 'success' | 'failed' | 'pending';
  provider?: string;
}

type BalanceListener = (newBalance: number) => void;

// Centralized Database Service with Real-time Subscriptions
class Database {
  private balanceListeners: BalanceListener[] = [];
  
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(DB_KEYS.BETS)) {
      localStorage.setItem(DB_KEYS.BETS, JSON.stringify(MOCK_HISTORY));
    }
    if (!localStorage.getItem(DB_KEYS.TRANSACTIONS)) {
      localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    // Init Coupons with example
    if (!localStorage.getItem(DB_KEYS.COUPONS)) {
        const demoCoupon: SavedCoupon = {
            code: 'AMOZ23',
            date: new Date().toISOString(),
            totalOdds: 12.5,
            items: [
                { matchId: 'm1', selection: 'home', odds: 1.45, matchInfo: 'Man City vs Liverpool', sport: 'football' },
                { matchId: 'm2', selection: 'home', odds: 2.10, matchInfo: 'Real Madrid vs Barcelona', sport: 'football' }
            ]
        };
        localStorage.setItem(DB_KEYS.COUPONS, JSON.stringify([demoCoupon]));
    }
  }

  // --- REAL-TIME BALANCE SYSTEM ---
  
  // Components call this to listen for balance changes
  subscribeToBalance(listener: BalanceListener) {
      this.balanceListeners.push(listener);
      // Fire immediately with current balance
      listener(this.getBalance());
      
      // Return unsubscribe function
      return () => {
          this.balanceListeners = this.balanceListeners.filter(l => l !== listener);
      };
  }

  private notifyBalanceChange() {
      const bal = this.getBalance();
      this.balanceListeners.forEach(l => l(bal));
  }

  // --- SERVER SYNC SIMULATION ---
  async syncWithServer(): Promise<boolean> {
      return new Promise((resolve) => {
          setTimeout(() => {
              console.log("DB: Synced with remote server.");
              resolve(true);
          }, 1500);
      });
  }

  // --- USER & BALANCE ---

  getUser(): User | null {
    const data = localStorage.getItem(DB_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  saveUser(user: User): User {
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
    this.notifyBalanceChange(); // Update entire app
    return user;
  }

  getBalance(): number {
    const user = this.getUser();
    return user ? user.balance : 0;
  }

  // Universal method to change balance (Used by Casino, Bets, Wallet)
  updateBalance(amount: number, type: 'add' | 'subtract'): number {
      const user = this.getUser();
      if (!user) return 0;

      const newBalance = type === 'add' ? user.balance + amount : user.balance - amount;
      user.balance = newBalance;
      this.saveUser(user); // Triggers notification
      return newBalance;
  }

  // --- TRANSACTIONS (Wallet) ---

  async addTransaction(tx: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    const newTx: Transaction = {
      ...tx,
      id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString()
    };

    const history = this.getTransactions();
    localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify([newTx, ...history]));

    // Auto-update balance based on transaction type
    if (tx.status === 'success') {
      if (tx.type === 'deposit') {
        const user = this.getUser();
        if (user && !user.hasReceivedFirstDepositBonus) {
          // Grant 100% bonus on first deposit
          const bonusAmount = tx.amount;
          user.hasReceivedFirstDepositBonus = true;
          this.saveUser(user);
          
          // Add bonus transaction
          setTimeout(() => {
            this.addTransaction({
              type: 'deposit',
              amount: bonusAmount,
              status: 'success',
              provider: 'BONUS PREMIER DEPOT (100%)'
            });
            alert(`Félicitations ! Vous avez reçu un bonus de premier dépôt de ${bonusAmount.toLocaleString()} F (100%) !`);
          }, 1000);
        }
        this.updateBalance(tx.amount, 'add');
      } else if (tx.type === 'bet_win') {
        this.updateBalance(tx.amount, 'add');
      } else if (tx.type === 'withdraw' || tx.type === 'bet_stake') {
        this.updateBalance(tx.amount, 'subtract');
      }
    }

    return newTx;
  }

  getTransactions(): Transaction[] {
    const data = localStorage.getItem(DB_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  // --- BETS (Sports) ---

  async placeBet(bet: PlacedBet): Promise<PlacedBet> {
    // 1. Deduct Stake via Transaction (Logs it + Updates Balance)
    await this.addTransaction({
      type: 'bet_stake',
      amount: bet.stake,
      status: 'success',
      provider: 'SportBot System'
    });

    // 2. Save Bet Slip
    const bets = this.getBets();
    const newBets = [bet, ...bets];
    localStorage.setItem(DB_KEYS.BETS, JSON.stringify(newBets));
    
    return bet;
  }

  getBets(): PlacedBet[] {
    const data = localStorage.getItem(DB_KEYS.BETS);
    return data ? JSON.parse(data) : [];
  }

  updateBetStatus(betId: string, status: 'won' | 'lost', winningAmount: number = 0) {
    const bets = this.getBets();
    let updated = false;
    const updatedBets = bets.map(b => {
      if (b.id === betId && b.status === 'pending') {
        updated = true;
        return { ...b, status };
      }
      return b;
    });

    if(updated) {
        localStorage.setItem(DB_KEYS.BETS, JSON.stringify(updatedBets));

        if (status === 'won' && winningAmount > 0) {
        this.addTransaction({
            type: 'bet_win',
            amount: winningAmount,
            status: 'success',
            provider: 'SportBot Payout'
        });
        }
    }
  }

  // --- COUPONS ---

  saveCoupon(items: BetSlipItem[]): SavedCoupon {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const totalOdds = items.reduce((acc, item) => acc * item.odds, 1);
      
      const newCoupon: SavedCoupon = {
          code,
          items,
          date: new Date().toISOString(),
          totalOdds
      };

      const coupons = this.getCoupons();
      localStorage.setItem(DB_KEYS.COUPONS, JSON.stringify([...coupons, newCoupon]));
      return newCoupon;
  }

  getCoupon(code: string): SavedCoupon | undefined {
      const coupons = this.getCoupons();
      return coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  }

  getCoupons(): SavedCoupon[] {
      const data = localStorage.getItem(DB_KEYS.COUPONS);
      return data ? JSON.parse(data) : [];
  }

  logout() {
    localStorage.removeItem(DB_KEYS.USER);
  }
}

export const db = new Database();