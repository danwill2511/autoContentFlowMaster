# AutoContentFlow Mobile App

This is the React Native mobile app for AutoContentFlow, allowing users to manage their content workflows on the go.

## Project Overview

The AutoContentFlow mobile app is built with React Native and Expo, providing a cross-platform solution for iOS and Android. The app offers a seamless experience for managing content workflows, viewing analytics, and receiving notifications about content creation and publishing.

## Features

- **User Authentication**: Secure login and registration
- **Workflow Management**: Create, view, and manage content workflows
- **Platform Integration**: Connect and manage social media platforms
- **Content Preview**: View and approve generated content
- **Push Notifications**: Get notified about important workflow events
- **Analytics Dashboard**: View performance metrics and insights
- **Offline Support**: Basic functionality works without internet connection

## Technology Stack

- **React Native**: Core framework for mobile development
- **Expo**: Development toolkit for React Native
- **React Navigation**: Navigation library for screen management
- **React Native Paper**: Material Design component library
- **React Query**: Data fetching and caching
- **Expo Notifications**: Push notification system
- **AsyncStorage**: Local data persistence

## Installation

1. Make sure you have Node.js (v14 or newer) installed
2. Install Expo CLI: `npm install -g expo-cli`
3. Clone the repository
4. Navigate to the project directory
5. Install dependencies: `npm install`
6. Start the development server: `npm start`

## Development

The app follows a structured organization:

- `/src/screens`: Screen components for each app view
- `/src/components`: Reusable UI components
- `/src/navigation`: Navigation configuration
- `/src/context`: React Context providers
- `/src/utils`: Utility functions
- `/src/hooks`: Custom React hooks
- `/src/assets`: Images, fonts, and other static assets

## API Integration

The mobile app communicates with the AutoContentFlow backend API to perform operations such as:

- User authentication
- Workflow management
- Content generation
- Analytics data retrieval

All API calls are handled through the centralized api.ts utility file, which manages authentication, error handling, and request formatting.

## Push Notifications

The app uses Expo Notifications to provide push notifications for various events:

1. Workflow completion notifications
2. Content generation alerts
3. Publishing success/failure notifications
4. Scheduled reminders

See the [push notifications documentation](../docs/push-notifications.md) for more details.

## Version Compatibility

This app uses React Native 0.72.6 with React 18.2.0, which is compatible with the latest Expo SDK. Note that there was a version conflict with the web application that uses React 18.3.1, which required creating this separate project.

## Troubleshooting

- If you encounter missing dependencies, run `npm install`
- For issues with Expo, try clearing the cache: `expo start -c`
- If you experience issues with push notifications, make sure to configure your device properly as outlined in the Expo documentation

## License

This project is copyright AutoContentFlow, all rights reserved.