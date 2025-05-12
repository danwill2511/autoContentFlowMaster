import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

type WorkflowStackParamList = {
  WorkflowsList: undefined;
  WorkflowDetail: { id: number };
  CreateWorkflow: undefined;
};

type Props = NativeStackScreenProps<WorkflowStackParamList, 'WorkflowsList'>;

type Workflow = {
  id: number;
  name: string;
  description: string;
  status: string;
  schedule: string;
  nextPostDate: string;
  platformCount: number;
  createdAt: string;
};

export default function WorkflowsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      // Simulating workflow data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWorkflows([
        {
          id: 1,
          name: 'Weekly Blog Post',
          description: 'AI-generated blog posts for our company website',
          status: 'active',
          schedule: 'Weekly',
          nextPostDate: '2025-05-19',
          platformCount: 3,
          createdAt: '2025-04-01'
        },
        {
          id: 2,
          name: 'Social Media Updates',
          description: 'Daily content for Twitter, LinkedIn, and Instagram',
          status: 'active',
          schedule: 'Daily',
          nextPostDate: '2025-05-13',
          platformCount: 4,
          createdAt: '2025-04-15'
        },
        {
          id: 3,
          name: 'Monthly Newsletter',
          description: 'Email newsletter for our subscribers',
          status: 'paused',
          schedule: 'Monthly',
          nextPostDate: '2025-06-01',
          platformCount: 1,
          createdAt: '2025-03-10'
        }
      ]);
    } catch (error) {
      console.error('Failed to load workflows', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkflows();
  };

  const navigateToWorkflowDetail = (id: number) => {
    navigation.navigate('WorkflowDetail', { id });
  };

  const renderWorkflowItem = ({ item }: { item: Workflow }) => (
    <TouchableOpacity 
      style={styles.workflowCard}
      onPress={() => navigateToWorkflowDetail(item.id)}
    >
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
      
      <Text style={styles.workflowDescription}>{item.description}</Text>
      
      <View style={styles.workflowDetailsContainer}>
        <View style={styles.workflowDetail}>
          <Ionicons name="calendar-outline" size={16} color="#64748b" />
          <Text style={styles.workflowDetailText}>{item.schedule}</Text>
        </View>
        
        <View style={styles.workflowDetail}>
          <Ionicons name="time-outline" size={16} color="#64748b" />
          <Text style={styles.workflowDetailText}>Next: {item.nextPostDate}</Text>
        </View>
        
        <View style={styles.workflowDetail}>
          <Ionicons name="share-social-outline" size={16} color="#64748b" />
          <Text style={styles.workflowDetailText}>{item.platformCount} platforms</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading workflows...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={workflows}
        renderItem={renderWorkflowItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Your Content Workflows</Text>
            <Text style={styles.subHeaderText}>
              Manage and monitor your automated content creation flows
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No workflows yet</Text>
            <Text style={styles.emptyText}>
              Create your first workflow to start automating your content
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

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
  listContainer: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#64748b',
  },
  workflowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 8,
  },
  workflowName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
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
  workflowDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  workflowDetailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  workflowDetail: {
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});