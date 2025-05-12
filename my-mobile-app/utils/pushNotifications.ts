import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_URL, DEFAULT_HEADERS } from './api';

// Configure how notifications appear when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and return the token
 * @returns {Promise<string|null>} Push notification token or null if unavailable
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Check if device is physical (not a simulator/emulator)
  if (!Device.isDevice) {
    console.log('Push notifications are not available on simulator/emulator');
    return null;
  }

  // Check permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // If permission not determined, ask user for permission
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // If permission not granted, can't proceed
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token: permission not granted');
    return null;
  }

  // Get push token
  try {
    // Get the Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || 'f4f327b3-ec8a-453f-b0f1-453396821379';
    
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    
    // Handle platform-specific requirements
    if (Platform.OS === 'android') {
      await configureAndroidNotificationChannel();
    }
    
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Configure notification channels for Android
 */
async function configureAndroidNotificationChannel() {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6366f1', // Indigo color matching app theme
  });
  
  await Notifications.setNotificationChannelAsync('content-notifications', {
    name: 'Content Updates',
    description: 'Notifications about your scheduled content',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6366f1',
  });
  
  await Notifications.setNotificationChannelAsync('workflow-alerts', {
    name: 'Workflow Alerts',
    description: 'Important alerts about your content workflows',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#ef4444', // Red color for alerts
  });
}

/**
 * Save push notification token to server
 * @param {string} token Push notification token
 * @returns {Promise<boolean>} Whether token was saved successfully
 */
export async function savePushTokenToServer(token: string): Promise<boolean> {
  try {
    // Replace with actual endpoint when available
    await fetch(`${API_URL}/api/users/push-token`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ token }),
      credentials: 'include'
    });
    return true;
  } catch (error) {
    console.error('Failed to save push token to server:', error);
    return false;
  }
}

/**
 * Schedule a local notification
 * @param {string} title Notification title
 * @param {string} body Notification body
 * @param {number} seconds Seconds until notification triggers
 * @param {Object} data Additional data to include with notification
 * @returns {Promise<string>} Notification identifier
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  seconds: number = 5,
  data: Record<string, any> = {}
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: { seconds },
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Add a notification response handler
 * @param {Function} handler Function to call when notification is received
 * @returns {Subscription} Subscription object that should be cleaned up
 */
export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

export default {
  registerForPushNotificationsAsync,
  savePushTokenToServer,
  scheduleLocalNotification,
  cancelAllNotifications,
  addNotificationResponseListener,
};