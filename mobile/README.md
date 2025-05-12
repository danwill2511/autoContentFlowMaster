# AutoContentFlow Mobile App

This directory contains the React Native implementation of AutoContentFlow, a mobile app version of the web application.

## Current Implementation Status

### ✅ Completed
- Basic React Native project structure
- Screen hierarchy and navigation flow
- Mobile-specific UI components
- Push notification system setup using Expo Notifications
- Authentication flow (login/logout)
- Workflow management screens (list, details, creation)
- Tab-based navigation for main app screens
- Floating Action Button (FAB) for quick access to create workflows
- Interactive workflow cards with detail view

### 🛠️ Needs Setup
- React Native project initialization with proper dependencies
- Connection to real API endpoints
- Integration testing

## Required Dependencies

The following dependencies need to be installed for the mobile app to function:

```json
{
  "dependencies": {
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@tanstack/react-query": "^5.60.5",
    "expo": "^51.0.0",
    "expo-device": "~5.9.0",
    "expo-notifications": "~0.25.0",
    "expo-constants": "~15.4.2",
    "react": "18.2.0",  // Note: Must match React version compatible with React Native
    "react-native": "0.73.0",
    "react-native-paper": "^5.11.7",
    "react-native-safe-area-context": "4.9.0",
    "react-native-screens": "~3.29.0",
    "react-native-vector-icons": "^10.0.3",
    "react-native-web": "~0.19.10"
  }
}
```

## Setup Instructions

To properly set up the React Native project:

1. Create a separate React Native project using Expo or React Native CLI
2. Copy the files from this directory to your React Native project
3. Install the dependencies listed above
4. Update the API endpoint in `utils/api.ts` to point to your deployed backend
5. Run the app using `expo start` or `npm run ios`/`npm run android`

## Push Notifications

The push notification system is set up using Expo Notifications. Key features:

- User can enable/disable notifications in the profile screen
- Workflow status notifications are sent when a workflow completes
- Notifications can be viewed in the dedicated Notifications tab

## Authentication

The authentication system uses:
- AsyncStorage for persisting login state
- React Context for user state management
- API integration for login, registration, and logout

## Navigation Structure

The app uses a combination of stack and tab navigation:
- Stack Navigator for authentication and detailed screens
- Tab Navigator for the main app screens (Dashboard, Workflows, Notifications, Profile)

## Offline Support

The current implementation does not include offline support. To add offline capabilities:

1. Implement data caching with AsyncStorage
2. Add offline detection
3. Queue operations when offline for later execution

## API Integration

The `utils/api.ts` file provides the structure for API integration. Replace the mock data with real API calls when the backend is deployed.

## Known Issues

- Type definitions are missing or incomplete for React Native components
- Dependency conflicts between the current React version (18.3.1) and React Native's requirements (React 19.0.0)