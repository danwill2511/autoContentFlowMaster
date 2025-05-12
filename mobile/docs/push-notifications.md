# Push Notifications Implementation Guide

This document describes how push notifications are implemented in the AutoContentFlow mobile app.

## Architecture

The push notification system consists of:

1. **Client-side Registration**: Using Expo Notifications to register the device for push notifications
2. **Notification Context**: React Context for sending and managing notifications 
3. **Notification Handlers**: Functions that process incoming notifications
4. **User Preferences**: Settings for notification opt-in/opt-out

## Setup Steps

### 1. Install Required Packages

```bash
npm install expo-notifications expo-device expo-constants @react-native-async-storage/async-storage
```

### 2. Request Notification Permissions

The `registerForPushNotificationsAsync` function in `mobile/utils/pushNotifications.ts` handles requesting permissions and obtaining an Expo push token:

```typescript
export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return;
    }
    
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
  }

  return token;
}
```

### 3. Set Up Notification Handlers

The `setupNotifications` function configures how the app handles incoming notifications:

```typescript
export function setupNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}
```

### 4. Send Local Notifications

For testing and immediate feedback, the app can send local notifications:

```typescript
export async function sendWorkflowNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null, // null means show immediately
  });
}
```

### 5. Integrate with Server-Side Push Notifications

For production use, the server should send push notifications:

```typescript
// On the server
async function sendPushNotification(expoPushToken, title, body, data = {}) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}
```

## Notification Triggers

The app sends notifications for the following events:

1. **Workflow Started**: When a user manually starts a workflow
2. **Workflow Completed**: When a scheduled workflow finishes processing
3. **New Posts Generated**: When content is successfully created 
4. **Post Publishing Success**: When a post is published to platforms
5. **Errors or Failures**: When any workflow step fails

## User Preferences

Users can control notification preferences in the Profile screen:

```typescript
// In ProfileScreen.tsx
const [pushEnabled, setPushEnabled] = useState(true);

const togglePushNotifications = () => {
  const newState = !pushEnabled;
  setPushEnabled(newState);
  
  // Save preference to AsyncStorage
  AsyncStorage.setItem('notificationsEnabled', JSON.stringify(newState));
  
  // Notify user of change
  sendNotification(
    'Notifications ' + (newState ? 'Enabled' : 'Disabled'),
    'You have ' + (newState ? 'enabled' : 'disabled') + ' push notifications'
  );
};
```

## Testing Notifications

For testing, you can use the Expo notifications tool or the Expo Go app. The Expo CLI provides a way to send test notifications:

```bash
expo notifications:tool
```

## Troubleshooting

Common notification issues:

1. **Permissions Denied**: Request permissions again or guide users to app settings
2. **Token Registration Failed**: Check internet connection and Expo configuration
3. **Notifications Not Appearing**: Verify notification handler is properly set up
4. **iOS Background Notifications**: Ensure app has proper entitlements configured

## Production Considerations

When moving to production:

1. Generate an APNS certificate for iOS
2. Set up Firebase Cloud Messaging (FCM) for Android
3. Configure your Expo project with the appropriate credentials
4. Store device tokens in your backend database associated with user accounts
5. Implement server-side notification scheduling for automated workflows