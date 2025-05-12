
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCounter } from './AnimatedCounter';

export function StatsCard({ title, value }: { title: string; value: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <AnimatedCounter value={value} style={styles.value} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
});
