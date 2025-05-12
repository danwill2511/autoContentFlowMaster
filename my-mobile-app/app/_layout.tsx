import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import OfflineIndicator from '../components/OfflineIndicator';
import { initializeOfflineSync } from '../utils/offlineSync';

// This layout component handles authentication state and protected routes
function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  // Initialize offline sync on component mount
  useEffect(() => {
    // Initialize offline sync system
    initializeOfflineSync();
  }, []);
  
  // Auth state effect
  useEffect(() => {
    if (isLoading) return;
    
    const inAuthGroup = segments[0] === 'auth';

    // If user is authenticated and trying to access auth screens, redirect to home
    if (user && inAuthGroup) {
      router.replace('/');
    }
    
    // If user is not authenticated and not on an auth screen, redirect to login
    else if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    }
  }, [user, segments, isLoading, router]);

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Slot />
        <StatusBar style="auto" />
        <OfflineIndicator />
      </View>
    </ThemeProvider>
  );
}

// Root layout with font loading and auth provider
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
