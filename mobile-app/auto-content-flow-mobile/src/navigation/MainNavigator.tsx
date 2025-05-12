import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Stack Navigators
import AuthScreen from '@/screens/AuthScreen';
import TabNavigator from './TabNavigator';
import WorkflowDetailScreen from '@/screens/WorkflowDetailScreen';
import CreateWorkflowScreen from '@/screens/CreateWorkflowScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  WorkflowDetail: { id: number };
  CreateWorkflow: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen 
            name="WorkflowDetail" 
            component={WorkflowDetailScreen}
            options={{ 
              headerShown: true, 
              title: 'Workflow Details',
              headerTintColor: '#4F46E5',
            }} 
          />
          <Stack.Screen 
            name="CreateWorkflow" 
            component={CreateWorkflowScreen}
            options={{ 
              headerShown: true, 
              title: 'Create Workflow',
              headerTintColor: '#4F46E5',
            }} 
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}