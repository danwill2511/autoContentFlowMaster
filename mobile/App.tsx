import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, savePushTokenToServer } from './utils/pushNotifications';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import WorkflowsScreen from './screens/WorkflowsScreen';
import WorkflowDetailScreen from './screens/WorkflowDetailScreen';
import PlatformsScreen from './screens/PlatformsScreen';
import PlatformDetailScreen from './screens/PlatformDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';

// Define navigation types
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type MainTabParamList = {
  Dashboard: undefined;
  Workflows: undefined;
  Platforms: undefined;
  Settings: undefined;
};

type WorkflowStackParamList = {
  WorkflowsList: undefined;
  WorkflowDetail: { id: number };
  CreateWorkflow: undefined;
};

type PlatformStackParamList = {
  PlatformsList: undefined;
  PlatformDetail: { id: number };
  AddPlatform: undefined;
};

type SettingsStackParamList = {
  SettingsMain: undefined;
  Subscription: undefined;
  Account: undefined;
  Notifications: undefined;
};

// Create navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const WorkflowStack = createNativeStackNavigator<WorkflowStackParamList>();
const PlatformStack = createNativeStackNavigator<PlatformStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

// Auth navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Workflows stack navigator
function WorkflowsNavigator() {
  return (
    <WorkflowStack.Navigator>
      <WorkflowStack.Screen
        name="WorkflowsList"
        component={WorkflowsScreen}
        options={{ title: 'My Workflows' }}
      />
      <WorkflowStack.Screen
        name="WorkflowDetail"
        component={WorkflowDetailScreen}
        options={({ route }) => ({ title: `Workflow #${route.params.id}` })}
      />
    </WorkflowStack.Navigator>
  );
}

// Platforms stack navigator
function PlatformsNavigator() {
  return (
    <PlatformStack.Navigator>
      <PlatformStack.Screen
        name="PlatformsList"
        component={PlatformsScreen}
        options={{ title: 'My Platforms' }}
      />
      <PlatformStack.Screen
        name="PlatformDetail"
        component={PlatformDetailScreen}
        options={({ route }) => ({ title: `Platform #${route.params.id}` })}
      />
    </PlatformStack.Navigator>
  );
}

// Settings stack navigator
function SettingsNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <SettingsStack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Subscription' }}
      />
    </SettingsStack.Navigator>
  );
}

// Main tab navigator
function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ios-home';
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'ios-home' : 'ios-home-outline';
          } else if (route.name === 'Workflows') {
            iconName = focused ? 'ios-git-network' : 'ios-git-network-outline';
          } else if (route.name === 'Platforms') {
            iconName = focused ? 'ios-share-social' : 'ios-share-social-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'ios-settings' : 'ios-settings-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: route.name === 'Dashboard',
      })}
    >
      <MainTab.Screen name="Dashboard" component={DashboardScreen} />
      <MainTab.Screen
        name="Workflows"
        component={WorkflowsNavigator}
        options={{ headerShown: false }}
      />
      <MainTab.Screen
        name="Platforms"
        component={PlatformsNavigator}
        options={{ headerShown: false }}
      />
      <MainTab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{ headerShown: false }}
      />
    </MainTab.Navigator>
  );
}

// Root navigator that handles auth state
function RootNavigator() {
  const { user, isLoading } = useAuth();
  const [pushToken, setPushToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Register for push notifications when user logs in
    if (user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          setPushToken(token);
          savePushTokenToServer(token);
        }
      });
    }
  }, [user]);

  if (isLoading) {
    // TODO: Replace with a proper loading screen
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// Main App component
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}