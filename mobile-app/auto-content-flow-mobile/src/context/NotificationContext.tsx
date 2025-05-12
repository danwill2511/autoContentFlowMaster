import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Notification interface
interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: number;
  data?: any;
}

// Notification context interface
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  pushToken: string | null;
  showNotification: (title: string, body: string, data?: any) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  togglePushNotifications: (enabled: boolean) => Promise<void>;
  isPushEnabled: boolean;
}

// Create the context
const NotificationContext = createContext<NotificationContextType | null>(null);

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Provider component
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(true);

  // Load saved notifications and push preferences on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load notifications
        const savedNotifications = await AsyncStorage.getItem('notifications');
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }

        // Load push notification settings
        const pushEnabled = await AsyncStorage.getItem('pushNotificationsEnabled');
        setIsPushEnabled(pushEnabled !== 'false'); // Default to true if not set
        
        // Get push token if enabled
        if (pushEnabled !== 'false') {
          registerForPushNotifications();
        }
      } catch (error) {
        console.error('Failed to load notification data:', error);
      }
    };

    loadData();
  }, []);

  // Register for push notifications
  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      // Get the token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      setPushToken(token.data);
      
      // Set up for Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  };

  // Save notifications to AsyncStorage
  const saveNotifications = async (updatedNotifications: Notification[]) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  // Toggle push notifications
  const togglePushNotifications = async (enabled: boolean) => {
    setIsPushEnabled(enabled);
    await AsyncStorage.setItem('pushNotificationsEnabled', String(enabled));
    
    if (enabled) {
      registerForPushNotifications();
    } else {
      setPushToken(null);
    }
  };

  // Show a notification
  const showNotification = async (title: string, body: string, data?: any) => {
    // Create a notification object
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      body,
      read: false,
      timestamp: Date.now(),
      data,
    };

    // Add to state
    const updatedNotifications = [...notifications, newNotification];
    setNotifications(updatedNotifications);
    
    // Save to storage
    saveNotifications(updatedNotifications);

    // Show the notification using Expo Notifications if enabled
    if (isPushEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // null means show immediately
      });
    }
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
    }));
    
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        pushToken,
        showNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        togglePushNotifications,
        isPushEnabled,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};