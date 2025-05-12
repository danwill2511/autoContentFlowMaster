// Push Notification Utils
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import API configuration
import { API_URL, DEFAULT_HEADERS } from './api';

// Configuration for how notifications are presented
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;
  
  // Check if device is physical (not simulator or emulator)
  if (Device.isDevice) {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // If no existing permission, request it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // If permission not granted, exit
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Get push token from Expo notification service
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId ?? 'autocontentflow',
    })).data;
    
    // Store token for later use
    await AsyncStorage.setItem('pushToken', token);
    
    // Register token with server
    await registerPushTokenWithServer(token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  // Special handling for Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// Send token to server
async function registerPushTokenWithServer(token: string) {
  try {
    const response = await fetch(`${API_URL}/api/register-push-token`, {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      console.error('Failed to register push token with server');
    }
  } catch (error) {
    console.error('Error registering push token:', error);
  }
}

// Schedule a local notification
export async function scheduleNotification({ 
  title, 
  body, 
  data = {}, 
  trigger = null 
}: NotificationData & { trigger?: Notifications.NotificationTriggerInput }) {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: trigger || null,
  });
}

// Add notification listener
export function addNotificationListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

// Add notification response listener
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Get all scheduled notifications
export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Cancel a specific notification
export async function cancelScheduledNotification(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Initialize notifications system
export async function initializeNotifications() {
  // Register for push notifications
  await registerForPushNotificationsAsync();
  
  // Set up background notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}