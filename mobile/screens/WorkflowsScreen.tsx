import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, List, ActivityIndicator, FAB } from 'react-native-paper';
import { useNotifications } from '../context/NotificationContext';

// Mock data for workflows, in a real app this would be fetched from an API
const workflows = [
  { 
    id: 1, 
    name: 'Weekly Blog Posts', 
    description: 'Auto-generate blog content weekly for LinkedIn and Medium',
    status: 'active'
  },
  { 
    id: 2, 
    name: 'Daily Social Updates', 
    description: 'Create daily social media updates for Twitter and Instagram',
    status: 'active'
  },
  { 
    id: 3, 
    name: 'Monthly Newsletter', 
    description: 'Generate monthly newsletter content from blog highlights',
    status: 'scheduled'
  }
];

export default function WorkflowsScreen({ navigation }: { navigation: any }) {
  const { sendNotification } = useNotifications();
  const [loading, setLoading] = React.useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = React.useState<number | null>(null);

  const handleRunWorkflow = async (workflowId: number, workflowName: string) => {
    setLoading(true);
    setSelectedWorkflowId(workflowId);
    
    // Simulate running a workflow
    setTimeout(async () => {
      await sendNotification(
        'Workflow Running',
        `${workflowName} workflow has started running`
      );
      setLoading(false);
      setSelectedWorkflowId(null);
    }, 2000);
  };
  
  const handleWorkflowPress = (workflowId: number) => {
    navigation.navigate('WorkflowDetail', { workflowId });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {workflows.map(workflow => (
          <Card 
            key={workflow.id} 
            style={styles.card}
            onPress={() => handleWorkflowPress(workflow.id)}
          >
            <Card.Content>
              <Text style={styles.title}>{workflow.name}</Text>
              <Text style={styles.description}>{workflow.description}</Text>
              
              <View style={styles.statusContainer}>
                <List.Icon 
                  icon={workflow.status === 'active' ? 'check-circle' : 'clock-outline'} 
                  color={workflow.status === 'active' ? '#4CAF50' : '#FF9800'} 
                />
                <Text style={{
                  color: workflow.status === 'active' ? '#4CAF50' : '#FF9800',
                  textTransform: 'capitalize'
                }}>
                  {workflow.status}
                </Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button 
                onPress={(e) => {
                  e.stopPropagation();
                  handleRunWorkflow(workflow.id, workflow.name);
                }}
                loading={loading && selectedWorkflowId === workflow.id}
                disabled={loading}
              >
                Run Now
              </Button>
              <Button 
                onPress={(e) => {
                  e.stopPropagation();
                  handleWorkflowPress(workflow.id);
                }}
              >
                Details
              </Button>
              <Button 
                onPress={(e) => {
                  e.stopPropagation();
                }} 
                textColor="#F44336"
              >
                Delete
              </Button>
            </Card.Actions>
          </Card>
        ))}

        {workflows.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workflows found</Text>
            <Text style={styles.emptySubtext}>Create a new workflow to get started</Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('CreateWorkflow')}
              style={styles.createButton}
            >
              Create Workflow
            </Button>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateWorkflow')}
        label="New Workflow"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Add padding to avoid FAB overlap
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newButton: {
    borderRadius: 20,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loader: {
    marginVertical: 24,
  }
});