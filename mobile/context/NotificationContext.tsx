
import React, { createContext, useContext, useEffect } from 'react';
import { registerForPushNotificationsAsync, setupNotifications } from '../utils/pushNotifications';

const NotificationContext = createContext<{
  sendNotification: (title: string, body: string) => Promise<void>;
}>({
  sendNotification: async () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    setupNotifications();
    registerForPushNotificationsAsync();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        sendNotification: async (title, body) => {
          await sendWorkflowNotification(title, body);
        },
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
