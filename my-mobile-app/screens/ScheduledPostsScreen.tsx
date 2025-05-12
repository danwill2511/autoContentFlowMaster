import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, Button, Chip, IconButton, Menu, Divider, FAB } from 'react-native-paper';
import SchedulerService, { ScheduledPost } from '../services/SchedulerService';
import { isOnline } from '../utils/offlineSync';
import OfflineIndicator from '../components/OfflineIndicator';
import { useIsFocused } from '@react-navigation/native';

const ScheduledPostsScreen = ({ navigation }) => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [offlinePosts, setOfflinePosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);
  const [menuVisible, setMenuVisible] = useState<{[key: string]: boolean}>({});
  
  const isFocused = useIsFocused();
  
  // Load posts when screen is focused
  useEffect(() => {
    if (isFocused) {
      loadPosts();
    }
  }, [isFocused]);
  
  // Load all posts with offline support
  const loadPosts = async () => {
    try {
      setLoading(true);
      
      // Check if we're online
      const online = await isOnline();
      setOffline(!online);
      
      // Get scheduled posts (this handles online/offline automatically)
      const scheduledPosts = await SchedulerService.getScheduledPosts();
      
      // Get offline posts (only created while offline)
      const localOfflinePosts = await SchedulerService.getOfflinePosts();
      
      setPosts(scheduledPosts);
      setOfflinePosts(localOfflinePosts);
      
      // If we're online and have offline posts, prompt for sync
      if (online && localOfflinePosts.length > 0) {
        promptSyncOfflinePosts();
      }
    } catch (error) {
      console.error('Failed to load scheduled posts:', error);
      Alert.alert('Error', 'Failed to load scheduled posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };
  
  // Prompt user to sync offline posts
  const promptSyncOfflinePosts = () => {
    if (offlinePosts.length === 0) return;
    
    Alert.alert(
      'Offline Posts Detected',
      `You have ${offlinePosts.length} posts created while offline. Would you like to sync them now?`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
        },
        {
          text: 'Sync Now',
          onPress: syncOfflinePosts,
        },
      ]
    );
  };
  
  // Sync offline posts with the server
  const syncOfflinePosts = async () => {
    try {
      setSyncProgress(0);
      
      const result = await SchedulerService.syncOfflinePosts();
      
      setSyncProgress(100);
      
      // Reload posts after sync
      await loadPosts();
      
      Alert.alert(
        'Sync Complete',
        `Successfully synced ${result} offline posts.`,
        [{ text: 'OK', onPress: () => setSyncProgress(null) }]
      );
    } catch (error) {
      console.error('Failed to sync offline posts:', error);
      Alert.alert('Sync Failed', 'Failed to sync offline posts. Please try again.');
      setSyncProgress(null);
    }
  };
  
  // Cancel a scheduled post
  const cancelPost = async (post: ScheduledPost) => {
    try {
      const id = post.id || post.offlineId;
      if (!id) {
        throw new Error('Invalid post ID');
      }
      
      const confirmed = await new Promise((resolve) => {
        Alert.alert(
          'Cancel Post',
          'Are you sure you want to cancel this scheduled post?',
          [
            { text: 'No', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Yes', onPress: () => resolve(true) },
          ]
        );
      });
      
      if (!confirmed) return;
      
      const success = await SchedulerService.cancelScheduledPost(id);
      
      if (success) {
        // Reload posts
        loadPosts();
        
        Alert.alert('Success', 'Post has been cancelled successfully.');
      } else {
        if (offline) {
          Alert.alert(
            'Offline Mode',
            'The cancellation will be processed when you are back online.'
          );
          // Optimistic update
          if (post.offlineId) {
            setOfflinePosts(offlinePosts.filter(p => p.offlineId !== post.offlineId));
          } else {
            setPosts(posts.map(p => p.id === post.id ? { ...p, status: 'failed' } : p));
          }
        } else {
          throw new Error('Failed to cancel post');
        }
      }
    } catch (error) {
      console.error('Error cancelling post:', error);
      Alert.alert('Error', 'Failed to cancel the post. Please try again.');
    }
  };
  
  // Reschedule a post
  const reschedulePost = (post: ScheduledPost) => {
    // In a real app, this would open a date/time picker
    Alert.alert(
      'Reschedule Post',
      'This would typically open a date/time picker to reschedule the post.',
      [{ text: 'OK' }]
    );
  };
  
  // Create a new post
  const createNewPost = () => {
    navigation.navigate('ContentGeneration');
  };
  
  // Toggle menu for a post
  const toggleMenu = (id: string) => {
    setMenuVisible({
      ...menuVisible,
      [id]: !menuVisible[id],
    });
  };
  
  // Format date for display
  const formatDate = (date: Date | string) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleString();
  };
  
  // Get status chip color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f57c00'; // Orange
      case 'published': return '#4caf50'; // Green
      case 'failed': return '#f44336'; // Red
      default: return '#9e9e9e'; // Grey
    }
  };
  
  // Render a post item
  const renderPostItem = ({ item }: { item: ScheduledPost }) => {
    const id = item.id?.toString() || item.offlineId || '';
    const isOfflineCreated = !!item.offlineId;
    
    return (
      <Card style={styles.postCard} mode="outlined">
        <Card.Content>
          <View style={styles.postHeader}>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={{ color: 'white' }}
            >
              {item.status.toUpperCase()}
              {isOfflineCreated && ' (OFFLINE)'}
            </Chip>
            
            <Menu
              visible={menuVisible[id] || false}
              onDismiss={() => toggleMenu(id)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  onPress={() => toggleMenu(id)}
                />
              }
            >
              <Menu.Item
                title="Reschedule"
                onPress={() => {
                  toggleMenu(id);
                  reschedulePost(item);
                }}
                disabled={offline && !isOfflineCreated}
              />
              <Menu.Item
                title="Cancel"
                onPress={() => {
                  toggleMenu(id);
                  cancelPost(item);
                }}
              />
            </Menu>
          </View>
          
          <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>
          
          <View style={styles.postDetails}>
            <Text style={styles.scheduledTime}>
              Scheduled for: {formatDate(item.scheduledFor)}
            </Text>
            
            <View style={styles.platformsContainer}>
              {item.platforms.map((platform, index) => (
                <Chip key={index} style={styles.platformChip} small mode="outlined">
                  {platform}
                </Chip>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  // Show combined list of regular and offline posts
  const allPosts = [...posts, ...offlinePosts];
  const sortedPosts = allPosts.sort((a, b) => {
    const dateA = new Date(a.scheduledFor);
    const dateB = new Date(b.scheduledFor);
    return dateA.getTime() - dateB.getTime();
  });
  
  return (
    <View style={styles.container}>
      {offline && <OfflineIndicator />}
      
      {syncProgress !== null && (
        <View style={styles.syncProgressContainer}>
          <Text style={styles.syncProgressText}>Syncing offline posts: {syncProgress}%</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${syncProgress}%` }]} />
          </View>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.title}>Scheduled Posts</Text>
        {offlinePosts.length > 0 && !offline && (
          <Button mode="outlined" onPress={syncOfflinePosts}>
            Sync ({offlinePosts.length})
          </Button>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading scheduled posts...</Text>
        </View>
      ) : (
        <>
          {sortedPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No scheduled posts found.</Text>
              <Button 
                mode="contained" 
                onPress={createNewPost}
                style={styles.createButton}
              >
                Create New Post
              </Button>
            </View>
          ) : (
            <FlatList
              data={sortedPosts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id?.toString() || item.offlineId || Math.random().toString()}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
            />
          )}
          
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={createNewPost}
            label="New Post"
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
  },
  postCard: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    height: 24,
  },
  postContent: {
    fontSize: 16,
    marginBottom: 16,
  },
  postDetails: {
    marginTop: 8,
  },
  scheduledTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  platformChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  createButton: {
    marginTop: 16,
  },
  syncProgressContainer: {
    backgroundColor: '#e3f2fd',
    padding: 8,
  },
  syncProgressText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#bbdefb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1976d2',
  },
});

export default ScheduledPostsScreen;