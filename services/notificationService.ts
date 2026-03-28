import { db } from './database';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'bet_won' | 'bet_lost' | 'deposit' | 'withdrawal' | 'bonus' | 'system';
  timestamp: string;
  read: boolean;
}

class NotificationService {
  private listeners: ((notifications: AppNotification[]) => void)[] = [];
  private notifications: AppNotification[] = [];

  constructor() {
    this.loadNotifications();
  }

  private async loadNotifications() {
    const saved = await db.getUserPreference('app_notifications');
    if (saved) {
      this.notifications = saved;
      this.notifyListeners();
    }
  }

  private async saveNotifications() {
    await db.saveUserPreference('app_notifications', this.notifications);
  }

  subscribe(listener: (notifications: AppNotification[]) => void) {
    this.listeners.push(listener);
    listener(this.notifications);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.notifications));
  }

  addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      read: false
    };
    this.notifications = [newNotification, ...this.notifications].slice(0, 50);
    this.saveNotifications();
    this.notifyListeners();
    
    // Also trigger a system notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/icon-192x192.png'
      });
    }
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications();
    this.notifyListeners();
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications();
    this.notifyListeners();
  }

  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }
}

export const notificationService = new NotificationService();
