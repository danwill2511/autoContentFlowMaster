import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Text, 
  Chip, 
  Switch, 
  SegmentedButtons,
  Divider
} from 'react-native-paper';
import { useNotifications } from '../context/NotificationContext';
import { workflowsApi } from '../utils/api';

const CONTENT_TYPES = [
  { label: 'Marketing', value: 'marketing' },
  { label: 'Educational', value: 'educational' },
  { label: 'Promotional', value: 'promotional' },
  { label: 'Informational', value: 'informational' }
];

const FREQUENCIES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
];

const PLATFORMS = [
  { id: 1, name: 'Twitter', icon: 'twitter', selected: false },
  { id: 2, name: 'LinkedIn', icon: 'linkedin', selected: false },
  { id: 3, name: 'Instagram', icon: 'instagram', selected: false },
  { id: 4, name: 'Facebook', icon: 'facebook', selected: false },
  { id: 5, name: 'Medium', icon: 'file-document', selected: false }
];

export default function CreateWorkflowScreen({ navigation }: { navigation: any }) {
  const { sendNotification } = useNotifications();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('marketing');
  const [frequency, setFrequency] = useState('weekly');
  const [platforms, setPlatforms] = useState(PLATFORMS);
  const [usesAI, setUsesAI] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const togglePlatform = (platformId: number) => {
    setPlatforms(platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, selected: !platform.selected } 
        : platform
    ));
  };

  const selectedPlatformCount = platforms.filter(p => p.selected).length;

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // In a real app, this would be an API call to create the workflow
      // For now, simulate a delay
      setTimeout(async () => {
        await sendNotification(
          'Workflow Created',
          `${name} workflow has been created successfully`
        );
        setSubmitting(false);
        navigation.navigate('Workflows');
      }, 1500);
    } catch (error) {
      console.error('Failed to create workflow', error);
      Alert.alert(
        'Error',
        'Failed to create workflow. Please try again.'
      );
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a workflow name');
      return false;
    }
    
    if (selectedPlatformCount === 0) {
      Alert.alert('Error', 'Please select at least one platform');
      return false;
    }
    
    return true;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Create New Workflow" />
          <Card.Content>
            <TextInput
              label="Workflow Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.sectionTitle}>Content Type</Text>
            <SegmentedButtons
              value={contentType}
              onValueChange={setContentType}
              buttons={CONTENT_TYPES}
              style={styles.segmentedButtons}
            />
            
            <Text style={styles.sectionTitle}>Posting Frequency</Text>
            <SegmentedButtons
              value={frequency}
              onValueChange={setFrequency}
              buttons={FREQUENCIES}
              style={styles.segmentedButtons}
            />
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Platforms</Text>
            <Text style={styles.helper}>Select platforms to post to</Text>
            
            <View style={styles.platformsContainer}>
              {platforms.map(platform => (
                <Chip
                  key={platform.id}
                  icon={platform.icon}
                  selected={platform.selected}
                  onPress={() => togglePlatform(platform.id)}
                  style={styles.platformChip}
                  mode={platform.selected ? 'flat' : 'outlined'}
                >
                  {platform.name}
                </Chip>
              ))}
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.switchContainer}>
              <Text>Use AI for content generation</Text>
              <Switch
                value={usesAI}
                onValueChange={setUsesAI}
              />
            </View>
            
            {usesAI && (
              <Card style={styles.aiCard}>
                <Card.Content>
                  <Text>AI will generate content based on your preferences</Text>
                  <Text style={styles.aiHelper}>
                    Content will be tailored to each platform's requirements
                  </Text>
                </Card.Content>
              </Card>
            )}
          </Card.Content>
          
          <Card.Actions style={styles.actions}>
            <Button 
              mode="outlined" 
              onPress={() => navigation.goBack()}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
            >
              Create Workflow
            </Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  helper: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  platformChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  divider: {
    marginVertical: 16,
  },
  aiCard: {
    backgroundColor: '#f0f8ff',
    marginBottom: 16,
  },
  aiHelper: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  actions: {
    justifyContent: 'flex-end',
    padding: 16,
  },
});