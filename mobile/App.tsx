
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from '@tanstack/react-query';
import { queryClient } from '../client/src/lib/queryClient';
import DashboardScreen from './screens/DashboardScreen';
import WorkflowsScreen from './screens/WorkflowsScreen';
import AuthScreen from './screens/AuthScreen';
import { AuthProvider } from './hooks/useAuth';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Auth">
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Workflows" component={WorkflowsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  );
}
