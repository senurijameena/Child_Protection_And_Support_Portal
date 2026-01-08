
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export const notificationService: {
  getNotifications: () => Promise<{ data: Notification[] }>;
  getUnreadNotifications: () => Promise<{ data: Notification[] }>;
  getUnreadCount: () => Promise<{ data: number }>;
  markAsRead: (notificationId: string) => Promise<{ data: Notification }>;
  markAllAsRead: () => Promise<{ data: string }>;
  testApprovalNotification: (userId?: string) => Promise<{ data: string }>;
};

