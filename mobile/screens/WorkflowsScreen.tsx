import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, List, ActivityIndicator } from 'react-native-paper';
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

export default function WorkflowsScreen() {
  const { sendNotification } = useNotifications();
  const [loading, setLoading] = React.useState(false);

  const handleRunWorkflow = async (workflowId: number, workflowName: string) => {
    setLoading(true);
    
    // Simulate running a workflow
    setTimeout(async () => {
      await sendNotification(
        'Workflow Running',
        `${workflowName} workflow has started running`
      );
      setLoading(false);
    }, 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Workflows</Text>
        <Button 
          mode="contained" 
          onPress={() => {}}
          style={styles.newButton}
        >
          Create New
        </Button>
      </View>

      {workflows.map(workflow => (
        <Card key={workflow.id} style={styles.card}>
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
              onPress={() => handleRunWorkflow(workflow.id, workflow.name)}
              loading={loading}
              disabled={loading}
            >
              Run Now
            </Button>
            <Button onPress={() => {}}>Edit</Button>
            <Button onPress={() => {}} textColor="#F44336">Delete</Button>
          </Card.Actions>
        </Card>
      ))}

      {loading && (
        <ActivityIndicator 
          animating={true} 
          size="large" 
          style={styles.loader}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
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