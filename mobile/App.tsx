
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import DashboardScreen from './screens/DashboardScreen';
import WorkflowsScreen from './screens/WorkflowsScreen';
import AuthScreen from './screens/AuthScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import { NotificationProvider } from './context/NotificationContext';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <NotificationProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Auth">
              <Stack.Screen name="Auth" component={AuthScreen} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Workflows" component={WorkflowsScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </NotificationProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
