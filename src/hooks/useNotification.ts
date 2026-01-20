import { useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationState {
  id: number;
  message: string;
  type: NotificationType;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ id: Date.now(), message, type });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return { notification, showNotification, hideNotification };
}

export type { NotificationType };