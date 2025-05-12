
import * as Notifications from 'expo-notifications';

export async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function sendWorkflowNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'workflow' },
    },
    trigger: null,
  });
}
