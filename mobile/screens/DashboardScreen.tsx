
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { StatsCard } from '../components/StatsCard';
import { WorkflowCard } from '../components/WorkflowCard';
import { useQuery } from '@tanstack/react-query';

export default function DashboardScreen() {
  const { data: stats } = useQuery(['stats'], () => 
    fetch('http://0.0.0.0:5000/api/stats').then(res => res.json())
  );

  const { data: workflows } = useQuery(['workflows'], () =>
    fetch('http://0.0.0.0:5000/api/workflows').then(res => res.json())
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <StatsCard title="Active Workflows" value={stats?.activeWorkflows || 0} />
        <StatsCard title="Posts Created" value={stats?.postsCreated || 0} />
      </View>
      <View style={styles.workflowsContainer}>
        {workflows?.map(workflow => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  workflowsContainer: {
    padding: 16,
    gap: 16,
  },
});
