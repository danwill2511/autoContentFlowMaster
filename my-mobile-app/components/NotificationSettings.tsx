import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

// Notification categories
interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Default notification categories
const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    id: 'content_scheduled',
    title: 'Content Scheduled',
    description: 'Notifications when content is scheduled for publishing',
    icon: 'calendar-outline',
  },
  {
    id: 'content_published',
    title: 'Content Published',
    description: 'Notifications when content is published to platforms',
    icon: 'paper-plane-outline',
  },
  {
    id: 'engagement_updates',
    title: 'Engagement Updates',
    description: 'Notifications about engagement with your content',
    icon: 'analytics-outline',
  },
  {
    id: 'workflow_updates',
    title: 'Workflow Updates',
    description: 'Notifications about changes to your workflows',
    icon: 'git-branch-outline',
  },
  {
    id: 'platform_alerts',
    title: 'Platform Alerts',
    description: 'Important alerts related to connected platforms',
    icon: 'warning-outline',
  },
];

const NotificationSettings = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [masterEnabled, setMasterEnabled] = useState<boolean>(false);
  const [categorySettings, setCategorySettings] = useState<Record<string, boolean>>({});
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);

  // Load notification settings
  useEffect(() => {
    loadSettings();
  }, []);

  // Load notification settings from storage
  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Check notification permission
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus({ status } as Notifications.PermissionStatus);
      
      // Load master toggle
      const masterSetting = await AsyncStorage.getItem('notifications_master_enabled');
      setMasterEnabled(masterSetting === 'true');
      
      // Load category settings
      const settings: Record<string, boolean> = {};
      
      for (const category of NOTIFICATION_CATEGORIES) {
        const value = await AsyncStorage.getItem(`notifications_${category.id}`);
        settings[category.id] = value === 'true';
      }
      
      setCategorySettings(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save a notification setting
  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  };

  // Toggle master notifications
  const toggleMasterNotifications = async (value: boolean) => {
    setMasterEnabled(value);
    await saveSetting('notifications_master_enabled', value);
    
    // If turning on and we don't have permission, request it
    if (value && permissionStatus?.status !== 'granted') {
      requestPermission();
    }
  };

  // Toggle category notifications
  const toggleCategoryNotifications = async (categoryId: string, value: boolean) => {
    const newSettings = { ...categorySettings, [categoryId]: value };
    setCategorySettings(newSettings);
    await saveSetting(`notifications_${categoryId}`, value);
  };

  // Request notification permission
  const requestPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus({ status } as Notifications.PermissionStatus);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'To receive notifications, you need to enable them in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                // This would open device settings on a real device
                Alert.alert('Open Settings', 'This would open device settings on a real device');
              } 
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading notification settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
        <Text style={styles.subtitle}>
          Choose which notifications you want to receive
        </Text>
      </View>

      {/* Permission status message */}
      {permissionStatus?.status !== 'granted' && (
        <View style={styles.permissionWarning}>
          <Ionicons name="warning" size={24} color="#F5A623" />
          <Text style={styles.permissionWarningText}>
            Notifications are currently disabled. Please enable them in your device settings.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Master toggle */}
      <View style={styles.masterToggleContainer}>
        <View style={styles.masterToggleContent}>
          <Ionicons name="notifications" size={24} color={masterEnabled ? '#007AFF' : '#999'} />
          <Text style={styles.masterToggleText}>Enable All Notifications</Text>
        </View>
        <Switch
          value={masterEnabled}
          onValueChange={toggleMasterNotifications}
          trackColor={{ false: '#ccc', true: '#acccf1' }}
          thumbColor={masterEnabled ? '#007AFF' : '#f4f3f4'}
          ios_backgroundColor="#ccc"
        />
      </View>

      {/* Category toggles */}
      {masterEnabled && (
        <View style={styles.categoriesContainer}>
          {NOTIFICATION_CATEGORIES.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Ionicons 
                  name={category.icon as any} 
                  size={20} 
                  color={categorySettings[category.id] ? '#007AFF' : '#999'} 
                />
                <View style={styles.categoryText}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
              </View>
              <Switch
                value={categorySettings[category.id] || false}
                onValueChange={(value) => toggleCategoryNotifications(category.id, value)}
                trackColor={{ false: '#ccc', true: '#acccf1' }}
                thumbColor={categorySettings[category.id] ? '#007AFF' : '#f4f3f4'}
                ios_backgroundColor="#ccc"
              />
            </View>
          ))}
        </View>
      )}

      {/* Info about notification behavior */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>About Notifications</Text>
        <Text style={styles.infoText}>
          Notifications help you stay updated on your content performance and workflow status.
          You can customize which notifications you receive or turn them off completely.
        </Text>
        <Text style={styles.infoText}>
          Some notifications are critical for your workflow management and will still
          be delivered even if categories are disabled.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    margin: 16,
    flexWrap: 'wrap',
  },
  permissionWarningText: {
    flex: 1,
    fontSize: 14,
    color: '#8A6D3B',
    marginHorizontal: 8,
  },
  permissionButton: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: Platform.OS === 'ios' ? 0 : 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  masterToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f8f8',
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  masterToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterToggleText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  categoriesContainer: {
    marginHorizontal: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  categoryText: {
    marginLeft: 12,
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default NotificationSettings;