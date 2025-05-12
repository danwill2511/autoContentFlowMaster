import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Chip, Divider, IconButton } from 'react-native-paper';
import { workflowsApi } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';

export default function WorkflowDetailScreen({ route, navigation }: { route: any, navigation: any }) {
  const { workflowId } = route.params;
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningWorkflow, setRunningWorkflow] = useState(false);
  const { sendNotification } = useNotifications();

  useEffect(() => {
    loadWorkflowData();
  }, [workflowId]);

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch real data from the API
      // For now, we're using a timeout to simulate API call
      setTimeout(() => {
        setWorkflow({
          id: workflowId,
          name: 'Weekly Blog Posts',
          description: 'Auto-generate blog content weekly for LinkedIn and Medium',
          status: 'active',
          frequency: 'weekly',
          lastRun: '2025-05-01T10:00:00Z',
          nextRun: '2025-05-08T10:00:00Z',
          platforms: [
            { id: 1, name: 'LinkedIn', icon: 'linkedin' },
            { id: 2, name: 'Medium', icon: 'file-document' }
          ],
          contentType: 'Marketing',
          theme: 'Industry Trends'
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load workflow', error);
      setLoading(false);
    }
  };

  const handleRunWorkflow = async () => {
    try {
      setRunningWorkflow(true);
      
      // Simulate API call
      setTimeout(async () => {
        await sendNotification(
          'Workflow Started',
          `${workflow.name} has started running`
        );
        
        // Update workflow after running
        setWorkflow({
          ...workflow,
          lastRun: new Date().toISOString(),
        });
        
        setRunningWorkflow(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to run workflow', error);
      setRunningWorkflow(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading workflow details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title 
          title={workflow.name}
          subtitle={`Status: ${workflow.status}`}
          right={(props) => (
            <Chip icon="clock-outline" mode="outlined">
              {workflow.frequency}
            </Chip>
          )}
        />
        
        <Card.Content>
          <Text style={styles.description}>{workflow.description}</Text>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Schedule Information</Text>
          <View style={styles.scheduleRow}>
            <Text style={styles.scheduleLabel}>Last Run:</Text>
            <Text>{new Date(workflow.lastRun).toLocaleString()}</Text>
          </View>
          <View style={styles.scheduleRow}>
            <Text style={styles.scheduleLabel}>Next Run:</Text>
            <Text>{new Date(workflow.nextRun).toLocaleString()}</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Content Settings</Text>
          <View style={styles.contentRow}>
            <Chip icon="tag" style={styles.chip}>{workflow.contentType}</Chip>
            <Chip icon="palette" style={styles.chip}>{workflow.theme}</Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Platforms</Text>
          <View style={styles.platformsContainer}>
            {workflow.platforms.map((platform: any) => (
              <Chip 
                key={platform.id}
                icon={platform.icon}
                style={styles.platformChip}
              >
                {platform.name}
              </Chip>
            ))}
          </View>
        </Card.Content>
        
        <Card.Actions style={styles.actions}>
          <Button 
            mode="contained"
            onPress={handleRunWorkflow}
            loading={runningWorkflow}
            disabled={runningWorkflow}
          >
            Run Now
          </Button>
          <Button 
            mode="outlined"
            onPress={() => {/* Would navigate to edit screen */}}
          >
            Edit
          </Button>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Title title="Recent Posts" />
        <Card.Content>
          <Text style={styles.emptyText}>No recent posts from this workflow</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleLabel: {
    width: 80,
    fontWeight: 'bold',
    color: '#666',
  },
  contentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
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
  actions: {
    justifyContent: 'space-between',
    padding: 16,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
});