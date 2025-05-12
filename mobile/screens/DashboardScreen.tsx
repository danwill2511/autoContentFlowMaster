
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { StatsCard } from '../components/StatsCard';
import { useNotifications } from '../context/NotificationContext';

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { sendNotification } = useNotifications();

  const handleWorkflowPress = async () => {
    await sendNotification(
      'Workflow Started',
      'Your content generation workflow has begun'
    );
    navigation.navigate('Workflows');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <StatsCard title="Active Workflows" value={5} />
        <StatsCard title="Posts Generated" value={128} />
        <StatsCard title="Engagement Rate" value={24} />
      </View>

      <Card style={styles.actionCard}>
        <Card.Title title="Quick Actions" />
        <Card.Content>
          <Button 
            mode="contained"
            onPress={handleWorkflowPress}
            style={styles.button}
          >
            New Workflow
          </Button>
          <Button 
            mode="outlined"
            onPress={() => navigation.navigate('Notifications')}
            style={styles.button}
          >
            View Notifications
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  actionCard: {
    margin: 16,
  },
  button: {
    marginVertical: 8,
  },
});
