import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Card, Chip, SegmentedButtons, Divider } from 'react-native-paper';
import ContentGenerationService, { ContentGenerationOptions, GeneratedContent } from '../services/ContentGenerationService';
import { isOnline } from '../utils/offlineSync';
import OfflineIndicator from '../components/OfflineIndicator';

const ContentGenerationScreen = ({ navigation }) => {
  // Content generation form state
  const [contentType, setContentType] = useState('social');
  const [contentTone, setContentTone] = useState('professional');
  const [topics, setTopics] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [contentLength, setContentLength] = useState<'short' | 'medium' | 'long'>('medium');
  
  // Generated content state
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('general');
  const [offline, setOffline] = useState(false);
  
  // Platform options
  const platformOptions = [
    { name: 'Twitter', value: 'twitter' },
    { name: 'Instagram', value: 'instagram' },
    { name: 'LinkedIn', value: 'linkedin' },
    { name: 'Facebook', value: 'facebook' },
    { name: 'Pinterest', value: 'pinterest' },
  ];
  
  // Check if device is online and load trending topics
  useEffect(() => {
    const checkConnection = async () => {
      const online = await isOnline();
      setOffline(!online);
      
      if (online) {
        loadTrendingTopics();
      }
    };
    
    checkConnection();
  }, []);
  
  // Load trending topics
  const loadTrendingTopics = async () => {
    try {
      setIsLoadingTrends(true);
      const category = 'digital marketing'; // Default category
      const result = await ContentGenerationService.getTrendingTopics(category);
      setTrendingTopics(result.topics);
    } catch (error) {
      console.error('Failed to load trending topics:', error);
    } finally {
      setIsLoadingTrends(false);
    }
  };
  
  // Handle platform selection
  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };
  
  // Handle topic chip selection
  const addTrendingTopic = (topic: string) => {
    if (topics) {
      setTopics(topics + ', ' + topic);
    } else {
      setTopics(topic);
    }
  };
  
  // Generate content
  const handleGenerateContent = async () => {
    if (!topics) {
      Alert.alert('Missing Topics', 'Please enter at least one topic');
      return;
    }
    
    if (selectedPlatforms.length === 0) {
      Alert.alert('No Platforms', 'Please select at least one platform');
      return;
    }
    
    try {
      setIsGenerating(true);
      
      const options: ContentGenerationOptions = {
        contentType,
        contentTone,
        topics: topics.split(',').map(t => t.trim()),
        platforms: selectedPlatforms,
        length: contentLength,
      };
      
      const content = await ContentGenerationService.getOrGenerateContent(options);
      setGeneratedContent(content);
      setActiveTab('general');
      
      // If content was generated offline, show notification
      if (content.offline) {
        Alert.alert(
          'Offline Mode',
          'Content was generated from cached data. Some features may be limited.'
        );
      }
    } catch (error) {
      Alert.alert('Generation Failed', error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save content to a workflow or schedule it
  const handleSaveContent = () => {
    // This would save the content to a workflow or schedule it for posting
    // For now, just show a success message
    Alert.alert(
      'Content Saved',
      'Your content has been saved successfully.',
      [
        { 
          text: 'OK',
          onPress: () => navigation.navigate('Workflows')
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      {offline && <OfflineIndicator />}
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Title title="Generate Content" subtitle="Configure your content parameters" />
          <Card.Content>
            <Text style={styles.label}>Content Type</Text>
            <SegmentedButtons
              value={contentType}
              onValueChange={setContentType}
              buttons={[
                { value: 'social', label: 'Social' },
                { value: 'blog', label: 'Blog' },
                { value: 'article', label: 'Article' },
              ]}
              style={styles.segmentedButton}
            />
            
            <Text style={styles.label}>Content Tone</Text>
            <SegmentedButtons
              value={contentTone}
              onValueChange={setContentTone}
              buttons={[
                { value: 'professional', label: 'Professional' },
                { value: 'casual', label: 'Casual' },
                { value: 'humorous', label: 'Humorous' },
              ]}
              style={styles.segmentedButton}
            />
            
            <Text style={styles.label}>Content Length</Text>
            <SegmentedButtons
              value={contentLength}
              onValueChange={setContentLength}
              buttons={[
                { value: 'short', label: 'Short' },
                { value: 'medium', label: 'Medium' },
                { value: 'long', label: 'Long' },
              ]}
              style={styles.segmentedButton}
            />
            
            <Text style={styles.label}>Topics</Text>
            <TextInput
              mode="outlined"
              value={topics}
              onChangeText={setTopics}
              placeholder="Enter topics separated by commas"
              style={styles.input}
            />
            
            {isLoadingTrends ? (
              <ActivityIndicator style={styles.topicsLoader} />
            ) : (
              <View style={styles.trendingTopicsContainer}>
                <Text style={styles.trendingTopicsTitle}>Trending Topics:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicsScroll}>
                  {trendingTopics.map((topic, index) => (
                    <Chip
                      key={index}
                      onPress={() => addTrendingTopic(topic)}
                      style={styles.topicChip}
                      mode="outlined"
                    >
                      {topic}
                    </Chip>
                  ))}
                  {trendingTopics.length === 0 && (
                    <Text style={styles.noTopicsText}>
                      {offline ? 'Trending topics unavailable offline' : 'No trending topics available'}
                    </Text>
                  )}
                </ScrollView>
              </View>
            )}
            
            <Text style={styles.label}>Platforms</Text>
            <View style={styles.platformsContainer}>
              {platformOptions.map((platform) => (
                <Chip
                  key={platform.value}
                  selected={selectedPlatforms.includes(platform.value)}
                  onPress={() => togglePlatform(platform.value)}
                  style={styles.platformChip}
                  mode="outlined"
                >
                  {platform.name}
                </Chip>
              ))}
            </View>
            
            <Button
              mode="contained"
              onPress={handleGenerateContent}
              loading={isGenerating}
              disabled={isGenerating || (!topics && !offline)}
              style={styles.generateButton}
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </Button>
          </Card.Content>
        </Card>
        
        {generatedContent && (
          <Card style={styles.previewCard}>
            <Card.Title title="Content Preview" />
            <Card.Content>
              <SegmentedButtons
                value={activeTab}
                onValueChange={setActiveTab}
                buttons={[
                  { value: 'general', label: 'General' },
                  { value: 'platforms', label: 'Platforms' },
                ]}
                style={styles.segmentedButton}
              />
              
              {activeTab === 'general' ? (
                <View style={styles.contentPreview}>
                  <Text style={styles.generatedContent}>{generatedContent.general}</Text>
                  <Text style={styles.timestamp}>
                    Generated: {new Date(generatedContent.timestamp).toLocaleString()}
                    {generatedContent.offline && ' (from cache)'}
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.platformsPreview}>
                  {Object.entries(generatedContent.platformVersions).map(([platform, content]) => (
                    <View key={platform} style={styles.platformContent}>
                      <Text style={styles.platformTitle}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
                      <Text style={styles.platformText}>{content}</Text>
                      <Divider style={styles.divider} />
                    </View>
                  ))}
                </ScrollView>
              )}
              
              <Button
                mode="contained"
                onPress={handleSaveContent}
                style={styles.saveButton}
              >
                Save Content
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  previewCard: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  segmentedButton: {
    marginBottom: 8,
  },
  generateButton: {
    marginTop: 16,
  },
  trendingTopicsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  trendingTopicsTitle: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  topicsScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  topicChip: {
    marginRight: 8,
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
  contentPreview: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  generatedContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  timestamp: {
    marginTop: 16,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  platformsPreview: {
    marginVertical: 16,
    maxHeight: 400,
  },
  platformContent: {
    marginBottom: 16,
  },
  platformTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  platformText: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    marginTop: 16,
  },
  saveButton: {
    marginTop: 16,
  },
  topicsLoader: {
    marginVertical: 16,
  },
  noTopicsText: {
    fontStyle: 'italic',
    color: '#888',
    padding: 8,
  },
});

export default ContentGenerationScreen;