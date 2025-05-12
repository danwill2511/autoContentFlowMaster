import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Contexts
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';

// Screens
import MainNavigator from '@/navigation/MainNavigator';

// Theme
const theme = {
  colors: {
    primary: '#4F46E5',
    accent: '#10B981',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    error: '#EF4444',
    text: '#111827',
    onSurface: '#1F2937',
    disabled: '#D1D5DB',
    placeholder: '#9CA3AF',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#4F46E5',
  },
};

// Create the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <AuthProvider>
            <NotificationProvider>
              <NavigationContainer>
                <MainNavigator />
              </NavigationContainer>
              <StatusBar style="auto" />
            </NotificationProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}