
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Notification as NotificationType } from '../types';

const notificationColors: { [key in NotificationType['type']]: string } = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

export const NotificationArea: React.FC = () => {
  const { notifications } = useAuth();

  return (
    <div className="fixed top-5 right-5 z-[100] space-y-3 w-80">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`px-4 py-3 rounded-md shadow-lg text-white ${notificationColors[notification.type]} animate-fade-in-right`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};
