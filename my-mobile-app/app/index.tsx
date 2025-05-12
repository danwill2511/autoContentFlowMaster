import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import api from '../utils/api';

// Simplified Dashboard Screen
export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activePosts: 0,
    totalPlatforms: 0,
    scheduledPosts: 0,
  });

  // Load dashboard data
  const loadData = async () => {
    setLoading(true);
    try {
      // In a real app, we would load data from API
      // For now, just simulate loading delay
      setTimeout(() => {
        setWorkflows([
          { id: 1, name: 'Weekly Blog', status: 'active', frequency: 'Weekly', platforms: ['Twitter', 'LinkedIn'] },
          { id: 2, name: 'Product Updates', status: 'active', frequency: 'Monthly', platforms: ['Facebook', 'Instagram'] },
        ]);
        
        setPlatforms([
          { id: 1, name: 'Twitter', type: 'twitter', lastPost: '2025-05-10' },
          { id: 2, name: 'LinkedIn', type: 'linkedin', lastPost: '2025-05-08' },
          { id: 3, name: 'Facebook', type: 'facebook', lastPost: '2025-05-05' },
        ]);
        
        setStats({
          totalWorkflows: 2,
          activePosts: 3,
          totalPlatforms: 3,
          scheduledPosts: 5,
        });
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.username || 'User'}</Text>
          <Text style={styles.subtitle}>Welcome to your dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalWorkflows}</Text>
              <Text style={styles.statLabel}>Workflows</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.activePosts}</Text>
              <Text style={styles.statLabel}>Active Posts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalPlatforms}</Text>
              <Text style={styles.statLabel}>Platforms</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.scheduledPosts}</Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </View>
          </View>

          {/* Recent Workflows Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Workflows</Text>
              <TouchableOpacity onPress={() => console.log('View all workflows')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {workflows.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No workflows yet</Text>
                <TouchableOpacity style={styles.createButton}>
                  <Text style={styles.createButtonText}>Create Workflow</Text>
                </TouchableOpacity>
              </View>
            ) : (
              workflows.map((workflow: any) => (
                <TouchableOpacity 
                  key={workflow.id} 
                  style={styles.workflowCard}
                  onPress={() => console.log(`Navigate to workflow ${workflow.id}`)}
                >
                  <View style={styles.workflowCardContent}>
                    <View>
                      <Text style={styles.workflowName}>{workflow.name}</Text>
                      <Text style={styles.workflowFrequency}>{workflow.frequency} • {workflow.platforms.join(', ')}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: workflow.status === 'active' ? '#dcfce7' : '#f3f4f6' }
                    ]}>
                      <Text 
                        style={[
                          styles.statusText, 
                          { color: workflow.status === 'active' ? '#166534' : '#6b7280' }
                        ]}
                      >
                        {workflow.status === 'active' ? 'Active' : 'Paused'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Connected Platforms Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Connected Platforms</Text>
              <TouchableOpacity onPress={() => console.log('Add platform')}>
                <Text style={styles.viewAllText}>Add New</Text>
              </TouchableOpacity>
            </View>
            
            {platforms.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No platforms connected</Text>
                <TouchableOpacity style={styles.createButton}>
                  <Text style={styles.createButtonText}>Connect Platform</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformsScroll}>
                {platforms.map((platform: any) => (
                  <TouchableOpacity 
                    key={platform.id} 
                    style={styles.platformCard}
                    onPress={() => console.log(`Navigate to platform ${platform.id}`)}
                  >
                    <View style={styles.platformIcon}>
                      <Text style={styles.platformIconText}>
                        {platform.type.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.platformName}>{platform.name}</Text>
                    <Text style={styles.platformLastPost}>Last post: {platform.lastPost}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statCard: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  workflowCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  workflowCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  workflowFrequency: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  platformsScroll: {
    flexDirection: 'row',
  },
  platformCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  platformLastPost: {
    fontSize: 12,
    color: '#64748b',
  },
});