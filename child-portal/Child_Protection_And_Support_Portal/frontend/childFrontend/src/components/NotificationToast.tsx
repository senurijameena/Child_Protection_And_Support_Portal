
import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

interface Notification {
  id: string;
  type: 'error' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const NotificationToast: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleShowNotification = (event: CustomEvent) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: event.detail.type || 'info',
        title: event.detail.title || 'Notification',
        message: event.detail.message || '',
        duration: event.detail.duration || 5000
      };

      setNotifications(prev => [...prev, notification]);

      if (notification.duration) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, notification.duration);
      }
    };

    window.addEventListener('showNotification', handleShowNotification as EventListener);

    return () => {
      window.removeEventListener('showNotification', handleShowNotification as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getVariant = (type: string): 'danger' | 'success' | 'warning' | 'info' => {
    switch (type) {
      case 'error': return 'danger';
      case 'success': return 'success';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getIcon = (type: string): string => {
    switch (type) {
      case 'error': return 'bi-exclamation-triangle-fill';
      case 'success': return 'bi-check-circle-fill';
      case 'warning': return 'bi-exclamation-circle-fill';
      default: return 'bi-info-circle-fill';
    }
  };

  return (
    <ToastContainer 
      position="top-end" 
      className="p-3"
      style={{ zIndex: 9999 }}
    >
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          bg={getVariant(notification.type)}
          onClose={() => removeNotification(notification.id)}
          show={true}
          delay={notification.duration || 5000}
          autohide
        >
          <Toast.Header>
            <i className={`bi ${getIcon(notification.type)} me-2`}></i>
            <strong className="me-auto">{notification.title}</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {notification.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default NotificationToast;

