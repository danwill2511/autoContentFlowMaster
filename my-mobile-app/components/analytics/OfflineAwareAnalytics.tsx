import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Button, ProgressBar, List, Divider } from 'react-native-paper';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { isOnline, getCachedData, cacheData } from '../../utils/offlineSync';
import OfflineIndicator from '../OfflineIndicator';

const screenWidth = Dimensions.get('window').width;

interface AnalyticsProps {
  timeRange: 'day' | 'week' | 'month' | 'year';
  refreshData: () => void;
}

const OfflineAwareAnalytics: React.FC<AnalyticsProps> = ({ timeRange, refreshData }) => {
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [engagementData, setEngagementData] = useState<any>(null);
  const [platformData, setPlatformData] = useState<any>(null);
  const [topPerforming, setTopPerforming] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  // Load analytics data with offline support
  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // Check if we're online
    const online = await isOnline();
    setOffline(!online);
    
    try {
      if (online) {
        // When online, fetch fresh data from API
        await fetchEngagementData();
        await fetchPlatformData();
        await fetchTopPerforming();
        
        // Cache timestamp of last successful update
        setLastUpdated(new Date());
        await cacheData('analytics_last_updated', new Date().toISOString());
      } else {
        // When offline, load from cache
        await loadFromCache();
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      // If we encounter an error (even online), try to load from cache
      await loadFromCache();
    } finally {
      setLoading(false);
    }
  };

  // Load all analytics data from cache
  const loadFromCache = async () => {
    try {
      // Load engagement data
      const cachedEngagement = await getCachedData(`analytics_engagement_${timeRange}`);
      if (cachedEngagement) {
        setEngagementData(cachedEngagement);
      }
      
      // Load platform data
      const cachedPlatform = await getCachedData(`analytics_platform_${timeRange}`);
      if (cachedPlatform) {
        setPlatformData(cachedPlatform);
      }
      
      // Load top performing content
      const cachedTop = await getCachedData(`analytics_top_${timeRange}`);
      if (cachedTop) {
        setTopPerforming(cachedTop);
      }
      
      // Load last updated timestamp
      const cachedLastUpdated = await getCachedData('analytics_last_updated');
      if (cachedLastUpdated) {
        setLastUpdated(new Date(cachedLastUpdated));
      }
    } catch (error) {
      console.error('Failed to load cached analytics:', error);
    }
  };

  // Fetch engagement data from API
  const fetchEngagementData = async () => {
    try {
      // This would normally fetch from your API
      // For example: const response = await fetch(`${API_URL}/api/analytics/engagement?timeRange=${timeRange}`);
      
      // Sample data structure
      const sampleData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            data: [20, 45, 28, 80, 99, 43, 50],
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          }
        ],
        legend: ['Engagement']
      };
      
      setEngagementData(sampleData);
      
      // Cache the data
      await cacheData(`analytics_engagement_${timeRange}`, sampleData);
    } catch (error) {
      console.error('Failed to fetch engagement data:', error);
      throw error;
    }
  };

  // Fetch platform breakdown data from API
  const fetchPlatformData = async () => {
    try {
      // This would normally fetch from your API
      // For example: const response = await fetch(`${API_URL}/api/analytics/platforms?timeRange=${timeRange}`);
      
      // Sample data structure
      const sampleData = {
        labels: ['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'Pinterest'],
        datasets: [
          {
            data: [35, 28, 15, 18, 4],
            colors: [
              (opacity = 1) => `rgba(0, 172, 238, ${opacity})`,     // Twitter blue
              (opacity = 1) => `rgba(225, 48, 108, ${opacity})`,    // Instagram pink
              (opacity = 1) => `rgba(10, 102, 194, ${opacity})`,    // LinkedIn blue
              (opacity = 1) => `rgba(66, 103, 178, ${opacity})`,    // Facebook blue
              (opacity = 1) => `rgba(230, 0, 35, ${opacity})`,      // Pinterest red
            ]
          }
        ]
      };
      
      setPlatformData(sampleData);
      
      // Cache the data
      await cacheData(`analytics_platform_${timeRange}`, sampleData);
    } catch (error) {
      console.error('Failed to fetch platform data:', error);
      throw error;
    }
  };

  // Fetch top performing content
  const fetchTopPerforming = async () => {
    try {
      // This would normally fetch from your API
      // For example: const response = await fetch(`${API_URL}/api/analytics/top-content?timeRange=${timeRange}`);
      
      // Sample data structure
      const sampleData = [
        { id: 1, title: '10 Tips for Social Media Success', platform: 'LinkedIn', engagement: 1258 },
        { id: 2, title: 'How to Grow Your Following Fast', platform: 'Instagram', engagement: 843 },
        { id: 3, title: 'The Future of Content Marketing', platform: 'Twitter', engagement: 725 },
        { id: 4, title: 'Best Practices for Professional Content', platform: 'Facebook', engagement: 512 },
      ];
      
      setTopPerforming(sampleData);
      
      // Cache the data
      await cacheData(`analytics_top_${timeRange}`, sampleData);
    } catch (error) {
      console.error('Failed to fetch top performing content:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading analytics data...</Text>
      </View>
    );
  }

  // Check if we have any data to display
  const hasData = engagementData || platformData || topPerforming.length > 0;

  return (
    <View style={styles.container}>
      {offline && <OfflineIndicator />}
      
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <Button 
          mode="outlined" 
          onPress={refreshData}
          disabled={offline}
        >
          Refresh
        </Button>
      </View>
      
      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          Last updated: {lastUpdated.toLocaleString()}
          {offline ? ' (Offline Mode)' : ''}
        </Text>
      )}
      
      {!hasData && (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            {offline 
              ? 'No cached analytics data available. Connect to the internet to fetch data.' 
              : 'No analytics data available for the selected time range.'
            }
          </Text>
        </View>
      )}
      
      <ScrollView style={styles.scrollView}>
        {engagementData && (
          <Card style={styles.card}>
            <Card.Title title="Engagement Over Time" />
            <Card.Content>
              <LineChart
                data={engagementData}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        )}
        
        {platformData && (
          <Card style={styles.card}>
            <Card.Title title="Engagement by Platform" />
            <Card.Content>
              <BarChart
                data={platformData}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                style={styles.chart}
                fromZero
              />
              
              <View style={styles.platformBreakdown}>
                {platformData.labels.map((platform, index) => (
                  <View key={platform} style={styles.platformItem}>
                    <View style={[styles.platformDot, { backgroundColor: platformData.datasets[0].colors[index](1) }]} />
                    <Text style={styles.platformLabel}>{platform}: </Text>
                    <Text style={styles.platformValue}>{platformData.datasets[0].data[index]}%</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}
        
        {topPerforming.length > 0 && (
          <Card style={styles.card}>
            <Card.Title title="Top Performing Content" />
            <Card.Content>
              <List.Section>
                {topPerforming.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <List.Item
                      title={item.title}
                      description={`${item.platform} - ${item.engagement} engagements`}
                      left={props => <List.Icon {...props} icon="star" />}
                    />
                    {index < topPerforming.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List.Section>
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
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  platformBreakdown: {
    marginTop: 16,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  platformLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  platformValue: {
    fontSize: 14,
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
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default OfflineAwareAnalytics;