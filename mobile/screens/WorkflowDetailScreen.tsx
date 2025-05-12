import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../utils/api';

type WorkflowStackParamList = {
  WorkflowsList: undefined;
  WorkflowDetail: { id: number };
  CreateWorkflow: undefined;
};

type Props = NativeStackScreenProps<WorkflowStackParamList, 'WorkflowDetail'>;

type Post = {
  id: number;
  content: string;
  status: string;
  scheduledFor: string;
  createdAt: string;
  postedAt: string | null;
  platforms: string[];
};

type Workflow = {
  id: number;
  name: string;
  description: string;
  status: string;
  schedule: string;
  topic: string;
  tone: string;
  platforms: {
    id: number;
    name: string;
    type: string;
  }[];
  posts: Post[];
};

export default function WorkflowDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadWorkflowDetails();
  }, [id]);
  
  const loadWorkflowDetails = async () => {
    setIsLoading(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulated data
      setWorkflow({
        id,
        name: 'Weekly Blog Post',
        description: 'AI-generated blog posts for our company website',
        status: 'active',
        schedule: 'Weekly',
        topic: 'Industry trends and technology insights',
        tone: 'Professional',
        platforms: [
          { id: 1, name: 'Corporate Website', type: 'website' },
          { id: 2, name: 'LinkedIn', type: 'linkedin' },
          { id: 3, name: 'Medium', type: 'medium' }
        ],
        posts: [
          {
            id: 101,
            content: 'The Future of AI in Content Creation: 5 Trends to Watch...',
            status: 'published',
            scheduledFor: '2025-05-05T09:00:00Z',
            createdAt: '2025-05-04T14:30:00Z',
            postedAt: '2025-05-05T09:00:00Z',
            platforms: ['Corporate Website', 'LinkedIn', 'Medium']
          },
          {
            id: 102,
            content: 'How Automation is Reshaping Digital Marketing Strategies...',
            status: 'published',
            scheduledFor: '2025-04-29T09:00:00Z',
            createdAt: '2025-04-28T16:45:00Z',
            postedAt: '2025-04-29T09:00:00Z',
            platforms: ['Corporate Website', 'LinkedIn']
          },
          {
            id: 103,
            content: 'The Impact of Machine Learning on Content Personalization...',
            status: 'scheduled',
            scheduledFor: '2025-05-12T09:00:00Z',
            createdAt: '2025-05-11T11:20:00Z',
            postedAt: null,
            platforms: ['Corporate Website', 'LinkedIn', 'Medium']
          }
        ]
      });
    } catch (error) {
      console.error('Failed to load workflow details', error);
      Alert.alert('Error', 'Failed to load workflow details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleWorkflowStatus = () => {
    if (!workflow) return;
    
    // In a real app, this would call the API to update the status
    Alert.alert(
      'Confirm Status Change',
      `Are you sure you want to ${workflow.status === 'active' ? 'pause' : 'activate'} this workflow?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Confirm',
          onPress: () => {
            setWorkflow({
              ...workflow,
              status: workflow.status === 'active' ? 'paused' : 'active'
            });
          }
        }
      ]
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading workflow details...</Text>
      </View>
    );
  }
  
  if (!workflow) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Error Loading Workflow</Text>
        <Text style={styles.errorText}>We couldn't load the workflow details. Please try again.</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadWorkflowDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Header with workflow details */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.workflowName}>{workflow.name}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: workflow.status === 'active' ? '#dcfce7' : '#fee2e2' }
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: workflow.status === 'active' ? '#10b981' : '#ef4444' }
                ]}
              >
                {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.statusToggle}
              onPress={toggleWorkflowStatus}
            >
              <Text style={styles.statusToggleText}>
                {workflow.status === 'active' ? 'Pause' : 'Activate'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.workflowDescription}>{workflow.description}</Text>
      </View>
      
      {/* Workflow configuration details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <View style={styles.configItem}>
          <View style={styles.configLabel}>
            <Ionicons name="calendar-outline" size={18} color="#64748b" />
            <Text style={styles.configLabelText}>Schedule</Text>
          </View>
          <Text style={styles.configValue}>{workflow.schedule}</Text>
        </View>
        
        <View style={styles.configItem}>
          <View style={styles.configLabel}>
            <Ionicons name="chatbox-ellipses-outline" size={18} color="#64748b" />
            <Text style={styles.configLabelText}>Topic</Text>
          </View>
          <Text style={styles.configValue}>{workflow.topic}</Text>
        </View>
        
        <View style={styles.configItem}>
          <View style={styles.configLabel}>
            <Ionicons name="text-outline" size={18} color="#64748b" />
            <Text style={styles.configLabelText}>Tone</Text>
          </View>
          <Text style={styles.configValue}>{workflow.tone}</Text>
        </View>
      </View>
      
      {/* Connected platforms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Platforms</Text>
        <View style={styles.platformsContainer}>
          {workflow.platforms.map(platform => (
            <View key={platform.id} style={styles.platformItem}>
              <View style={styles.platformIcon}>
                <Ionicons 
                  name={
                    platform.type === 'website' ? 'globe-outline' :
                    platform.type === 'linkedin' ? 'logo-linkedin' :
                    platform.type === 'twitter' ? 'logo-twitter' :
                    platform.type === 'instagram' ? 'logo-instagram' :
                    platform.type === 'facebook' ? 'logo-facebook' :
                    platform.type === 'medium' ? 'book-outline' :
                    'share-social-outline'
                  } 
                  size={24} 
                  color="#6366f1" 
                />
              </View>
              <Text style={styles.platformName}>{platform.name}</Text>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addPlatformButton}>
            <Ionicons name="add-circle-outline" size={24} color="#6366f1" />
            <Text style={styles.addPlatformText}>Add Platform</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Recent posts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {workflow.posts.map(post => (
          <View key={post.id} style={styles.postItem}>
            <View style={styles.postHeader}>
              <View
                style={[
                  styles.postStatusBadge,
                  { 
                    backgroundColor: 
                      post.status === 'published' ? '#dcfce7' : 
                      post.status === 'scheduled' ? '#e0e7ff' : 
                      '#fee2e2'
                  }
                ]}
              >
                <Text
                  style={[
                    styles.postStatusText,
                    { 
                      color: 
                        post.status === 'published' ? '#10b981' : 
                        post.status === 'scheduled' ? '#6366f1' : 
                        '#ef4444'
                    }
                  ]}
                >
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </Text>
              </View>
              <Text style={styles.postDate}>
                {post.status === 'published' 
                  ? `Posted: ${new Date(post.postedAt!).toLocaleDateString()}`
                  : `Scheduled: ${new Date(post.scheduledFor).toLocaleDateString()}`
                }
              </Text>
            </View>
            
            <Text style={styles.postContent} numberOfLines={2}>
              {post.content}
            </Text>
            
            <View style={styles.postPlatforms}>
              {post.platforms.map((platform, index) => (
                <View key={index} style={styles.postPlatformBadge}>
                  <Text style={styles.postPlatformText}>{platform}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
      
      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Edit Workflow</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.generateButton]}
          onPress={() => Alert.alert('Info', 'This will generate a new post with AI')}
        >
          <Ionicons name="flash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Generate New Post</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
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
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workflowName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusToggle: {
    padding: 6,
  },
  statusToggleText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  workflowDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
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
    marginBottom: 16,
  },
  viewAllText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  configLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  configLabelText: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 8,
  },
  configValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
    marginBottom: 16,
    width: '45%',
  },
  platformIcon: {
    marginRight: 8,
  },
  platformName: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  addPlatformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
    marginBottom: 16,
    width: '45%',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  addPlatformText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 4,
  },
  postItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  postStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  postDate: {
    fontSize: 12,
    color: '#64748b',
  },
  postContent: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 20,
  },
  postPlatforms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  postPlatformBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  postPlatformText: {
    fontSize: 12,
    color: '#6366f1',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
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
  generateButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});