
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { AnimatedCounter } from './AnimatedCounter';

export function StatsCard({ title, value }: { title: string; value: number }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{title}</Text>
        <AnimatedCounter value={value} style={styles.value} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
});
