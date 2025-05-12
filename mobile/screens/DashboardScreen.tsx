import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { scheduleLocalNotification } from '../utils/pushNotifications';

type WorkflowSummary = {
  id: number;
  name: string;
  status: string;
  schedule: string;
  nextPostDate: string;
  platformCount: number;
};

type ContentStat = {
  id: number;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [stats, setStats] = useState<ContentStat[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // In a real app, we'd fetch this data from the API
      // For now, we'll use mock data for display purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulating workflows data
      setWorkflows([
        {
          id: 1,
          name: 'Weekly Blog Post',
          status: 'active',
          schedule: 'Weekly',
          nextPostDate: '2025-05-19',
          platformCount: 3
        },
        {
          id: 2,
          name: 'Social Media Updates',
          status: 'active',
          schedule: 'Daily',
          nextPostDate: '2025-05-13',
          platformCount: 4
        },
        {
          id: 3,
          name: 'Monthly Newsletter',
          status: 'paused',
          schedule: 'Monthly',
          nextPostDate: '2025-06-01',
          platformCount: 1
        }
      ]);
      
      // Simulating stats data
      setStats([
        {
          id: 1,
          label: 'Posts Created',
          value: 24,
          change: 8,
          trend: 'up'
        },
        {
          id: 2,
          label: 'Platforms Connected',
          value: 5,
          change: 1,
          trend: 'up'
        },
        {
          id: 3,
          label: 'Active Workflows',
          value: 2,
          change: 0,
          trend: 'neutral'
        },
        {
          id: 4,
          label: 'AI Suggestions Used',
          value: 16,
          change: -2,
          trend: 'down'
        }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleShowNotification = () => {
    scheduleLocalNotification(
      'Content Creation Reminder',
      'You have a post scheduled for tomorrow!',
      2
    );
  };

  // Render stat card
  const renderStatCard = ({ item }: { item: ContentStat }) => (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{item.label}</Text>
      <Text style={styles.statValue}>{item.value}</Text>
      <View style={styles.statTrend}>
        <Ionicons
          name={
            item.trend === 'up'
              ? 'arrow-up'
              : item.trend === 'down'
              ? 'arrow-down'
              : 'remove'
          }
          size={14}
          color={
            item.trend === 'up'
              ? '#10b981'
              : item.trend === 'down'
              ? '#ef4444'
              : '#64748b'
          }
        />
        <Text
          style={[
            styles.statChange,
            {
              color:
                item.trend === 'up'
                  ? '#10b981'
                  : item.trend === 'down'
                  ? '#ef4444'
                  : '#64748b',
            },
          ]}
        >
          {item.change !== 0 ? Math.abs(item.change) : 'No change'}
        </Text>
      </View>
    </View>
  );

  // Render workflow item
  const renderWorkflowItem = ({ item }: { item: WorkflowSummary }) => (
    <TouchableOpacity style={styles.workflowItem}>
      <View style={styles.workflowHeader}>
        <Text style={styles.workflowName}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'active' ? '#dcfce7' : '#fee2e2' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.status === 'active' ? '#10b981' : '#ef4444' },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.workflowDetails}>
        <View style={styles.workflowDetailItem}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={styles.workflowDetailText}>{item.schedule}</Text>
        </View>
        
        <View style={styles.workflowDetailItem}>
          <Ionicons name="time-outline" size={14} color="#64748b" />
          <Text style={styles.workflowDetailText}>Next: {item.nextPostDate}</Text>
        </View>
        
        <View style={styles.workflowDetailItem}>
          <Ionicons name="share-social-outline" size={14} color="#64748b" />
          <Text style={styles.workflowDetailText}>{item.platformCount} platforms</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome message */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.username || 'User'}
          </Text>
          <Text style={styles.subtitleText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleShowNotification}
        >
          <Ionicons name="notifications-outline" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Content stats */}
      <Text style={styles.sectionTitle}>Content Stats</Text>
      <FlatList
        data={stats}
        renderItem={renderStatCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      />

      {/* Recent workflows */}
      <View style={styles.workflowsHeader}>
        <Text style={styles.sectionTitle}>Recent Workflows</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {workflows.length > 0 ? (
        workflows.map((workflow) => (
          <View key={workflow.id.toString()}>
            {renderWorkflowItem({ item: workflow })}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyStateTitle}>No workflows yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first workflow to start automating your content
          </Text>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>Create Workflow</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>New Workflow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10b981' }]}>
          <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Connect Platform</Text>
        </TouchableOpacity>
      </View>

      {/* Subscription card */}
      <View style={styles.subscriptionCard}>
        <View>
          <Text style={styles.subscriptionTitle}>
            {user?.subscription || 'Free'} Plan
          </Text>
          <Text style={styles.subscriptionText}>
            {user?.subscription ? 'Your premium features are active' : 'Upgrade for more features'}
          </Text>
        </View>
        <TouchableOpacity style={styles.subscriptionButton}>
          <Text style={styles.subscriptionButtonText}>
            {user?.subscription ? 'Manage' : 'Upgrade'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Spacer at the bottom */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');
const statCardWidth = width * 0.4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748b',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  statsContainer: {
    paddingHorizontal: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    width: statCardWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChange: {
    fontSize: 12,
    marginLeft: 4,
  },
  workflowsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  viewAllText: {
    color: '#6366f1',
    fontSize: 14,
  },
  workflowItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  workflowDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  workflowDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  workflowDetailText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  subscriptionCard: {
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subscriptionText: {
    color: '#e0e7ff',
    fontSize: 14,
  },
  subscriptionButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  subscriptionButtonText: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
});