import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Register for push notifications and get the token
 * @returns The Expo push token
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
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
    
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
  } catch (error) {
    console.error('Error getting push token:', error);
  }

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

/**
 * Set up notification handlers
 */
export function setupNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Schedule a local notification
 * @param title The notification title
 * @param body The notification body
 * @param data Optional data to include with the notification
 */
export async function sendLocalNotification(title: string, body: string, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // null means show immediately
  });
}

/**
 * Send a delayed notification
 * @param title The notification title
 * @param body The notification body
 * @param seconds Number of seconds to delay the notification
 * @param data Optional data to include with the notification
 */
export async function sendDelayedNotification(title: string, body: string, seconds: number, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: {
      seconds,
    },
  });
}

/**
 * Send a workflow notification
 * @param title The notification title
 * @param body The notification body
 */
export async function sendWorkflowNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'workflow' },
    },
    trigger: null, // null means show immediately
  });
}

/**
 * Send a content notification
 * @param title The notification title
 * @param body The notification body
 */
export async function sendContentNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'content' },
    },
    trigger: null, // null means show immediately
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}