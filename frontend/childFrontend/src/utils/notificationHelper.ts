export interface NotificationMessage {
  type: 'error' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export const notificationHelper = {
  showError(title: string, message: string): void {
    const notification: NotificationMessage = {
      type: 'error',
      title,
      message,
      duration: 5000
    };
    
    const notifications = this.getStoredNotifications();
    notifications.push({
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('appNotifications', JSON.stringify(notifications));
    
    window.dispatchEvent(new CustomEvent('showNotification', { 
      detail: notification 
    }));
  },

  showSuccess(title: string, message: string): void {
    const notification: NotificationMessage = {
      type: 'success',
      title,
      message,
      duration: 3000
    };
    
    const notifications = this.getStoredNotifications();
    notifications.push({
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('appNotifications', JSON.stringify(notifications));
    
    window.dispatchEvent(new CustomEvent('showNotification', { 
      detail: notification 
    }));
  },

  getStoredNotifications(): any[] {
    try {
      const stored = localStorage.getItem('appNotifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  clearNotifications(): void {
    localStorage.removeItem('appNotifications');
  },

  clearNotification(id: string): void {
    const notifications = this.getStoredNotifications();
    const filtered = notifications.filter(n => n.id !== id);
    localStorage.setItem('appNotifications', JSON.stringify(filtered));
  }
};

