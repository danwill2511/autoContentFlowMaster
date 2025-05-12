import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { getPendingActionsCount, processPendingActions } from '../utils/offlineSync';

interface OfflineIndicatorProps {
  style?: any;
}

const OfflineIndicator = ({ style }: OfflineIndicatorProps) => {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Animation values
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(0);
  const expandHeight = new Animated.Value(0);
  
  // Effect to monitor connection status
  useEffect(() => {
    // Initial check
    checkConnection();
    
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
      
      // If we just came back online, check for pending actions
      if (state.isConnected) {
        checkPendingActions();
      }
    });
    
    // Set up polling for pending actions
    const interval = setInterval(checkPendingActions, 30000); // Check every 30 seconds
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);
  
  // Effect to animate in/out
  useEffect(() => {
    if (isOffline || pendingCount > 0) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 100,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOffline, pendingCount]);
  
  // Effect to animate expand/collapse
  useEffect(() => {
    Animated.timing(expandHeight, {
      toValue: expanded ? 120 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [expanded]);
  
  // Check connection status
  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setIsOffline(!state.isConnected);
  };
  
  // Check for pending actions
  const checkPendingActions = async () => {
    const count = await getPendingActionsCount();
    setPendingCount(count);
  };
  
  // Manually sync pending actions
  const syncNow = async () => {
    if (isSyncing || isOffline) return;
    
    setIsSyncing(true);
    
    try {
      await processPendingActions();
      // Recheck after sync attempt
      await checkPendingActions();
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Don't render anything if online and no pending actions
  if (!isOffline && pendingCount === 0) {
    return null;
  }
  
  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.banner,
          isOffline ? styles.offlineBanner : styles.syncBanner,
        ]}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={isOffline ? 'cloud-offline' : 'sync'}
            size={20}
            color="#FFF"
          />
        </View>
        
        <Text style={styles.bannerText}>
          {isOffline
            ? 'You are offline. Changes will sync when connection is restored.'
            : `${pendingCount} ${pendingCount === 1 ? 'change' : 'changes'} pending sync`}
        </Text>
        
        <Ionicons
          name={expanded ? 'chevron-down' : 'chevron-up'}
          size={20}
          color="#FFF"
        />
      </TouchableOpacity>
      
      <Animated.View
        style={[
          styles.expandedContent,
          { height: expandHeight },
        ]}
      >
        <View style={styles.expandedInner}>
          {isOffline ? (
            <View style={styles.offlineContent}>
              <Text style={styles.expandedText}>
                You're working in offline mode. Your changes are being saved locally
                and will automatically sync when your connection is restored.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={checkConnection}
              >
                <Text style={styles.buttonText}>Check Connection</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.syncContent}>
              <Text style={styles.expandedText}>
                {pendingCount} {pendingCount === 1 ? 'item is' : 'items are'} waiting
                to be synchronized with the server.
              </Text>
              <TouchableOpacity
                style={styles.syncButton}
                onPress={syncNow}
                disabled={isSyncing}
              >
                <Text style={styles.buttonText}>
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70, // Account for tab bar
    left: 0,
    right: 0,
    zIndex: 999,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  offlineBanner: {
    backgroundColor: '#E74C3C',
  },
  syncBanner: {
    backgroundColor: '#3498DB',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bannerText: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  expandedContent: {
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  expandedInner: {
    padding: 16,
  },
  expandedText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    lineHeight: 20,
  },
  offlineContent: {
    alignItems: 'center',
  },
  syncContent: {
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default OfflineIndicator;