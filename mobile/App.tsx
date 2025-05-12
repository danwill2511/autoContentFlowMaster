
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import TabNavigator from './navigation/TabNavigator';
import WorkflowDetailScreen from './screens/WorkflowDetailScreen';
import AuthScreen from './screens/AuthScreen';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

function MainNavigator() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {user ? (
        // Logged in routes with TabNavigator for main screens
        <>
          <Stack.Screen 
            name="Main" 
            component={TabNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="WorkflowDetail" 
            component={WorkflowDetailScreen} 
            options={{ title: 'Workflow Details' }}
          />
        </>
      ) : (
        // Authentication route
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <AuthProvider>
          <NotificationProvider>
            <NavigationContainer>
              <MainNavigator />
            </NavigationContainer>
          </NotificationProvider>
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
