import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { API_URL, DEFAULT_HEADERS } from './api';

// Interface for pending actions
interface PendingAction {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data: any;
  timestamp: number;
}

// Keys for AsyncStorage
const KEYS = {
  PENDING_ACTIONS: 'offlineSync.pendingActions',
  CACHED_DATA: 'offlineSync.cachedData',
  LAST_SYNC: 'offlineSync.lastSync',
};

// Check if device is online
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return !!state.isConnected;
}

// Save data to local cache
export async function cacheData(key: string, data: any): Promise<void> {
  try {
    const cacheKey = `${KEYS.CACHED_DATA}.${key}`;
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

// Get data from local cache
export async function getCachedData(key: string): Promise<any> {
  try {
    const cacheKey = `${KEYS.CACHED_DATA}.${key}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    return JSON.parse(cached).data;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
}

// Clear a specific cached item
export async function clearCachedItem(key: string): Promise<void> {
  try {
    const cacheKey = `${KEYS.CACHED_DATA}.${key}`;
    await AsyncStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Error clearing cached item:', error);
  }
}

// Add an action to the pending queue
export async function queueAction(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  data: any
): Promise<string> {
  try {
    // Generate a unique ID for this action
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create action object
    const action: PendingAction = {
      id,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
    };
    
    // Get existing actions
    const actionsJson = await AsyncStorage.getItem(KEYS.PENDING_ACTIONS);
    const actions: PendingAction[] = actionsJson ? JSON.parse(actionsJson) : [];
    
    // Add new action
    actions.push(action);
    
    // Save updated actions
    await AsyncStorage.setItem(KEYS.PENDING_ACTIONS, JSON.stringify(actions));
    
    // Try to sync immediately if we're online
    const online = await isOnline();
    if (online) {
      processPendingActions();
    }
    
    return id;
  } catch (error) {
    console.error('Error queuing action:', error);
    throw error;
  }
}

// Process all pending actions
export async function processPendingActions(): Promise<boolean> {
  try {
    // Check if we're online
    const online = await isOnline();
    if (!online) return false;
    
    // Get pending actions
    const actionsJson = await AsyncStorage.getItem(KEYS.PENDING_ACTIONS);
    if (!actionsJson) return true; // No actions to process
    
    const actions: PendingAction[] = JSON.parse(actionsJson);
    if (actions.length === 0) return true;
    
    // Process actions in order
    const remainingActions: PendingAction[] = [];
    
    for (const action of actions) {
      try {
        // Send the request
        const response = await fetch(`${API_URL}${action.endpoint}`, {
          method: action.method,
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(action.data),
        });
        
        if (!response.ok) {
          // Failed, keep for retry
          remainingActions.push(action);
        }
      } catch (error) {
        // Network error, keep for retry
        remainingActions.push(action);
      }
    }
    
    // Save remaining actions
    await AsyncStorage.setItem(
      KEYS.PENDING_ACTIONS,
      JSON.stringify(remainingActions)
    );
    
    // Update last sync time
    await AsyncStorage.setItem(KEYS.LAST_SYNC, Date.now().toString());
    
    return remainingActions.length === 0;
  } catch (error) {
    console.error('Error processing pending actions:', error);
    return false;
  }
}

// Get number of pending actions
export async function getPendingActionsCount(): Promise<number> {
  try {
    const actionsJson = await AsyncStorage.getItem(KEYS.PENDING_ACTIONS);
    if (!actionsJson) return 0;
    
    const actions: PendingAction[] = JSON.parse(actionsJson);
    return actions.length;
  } catch (error) {
    console.error('Error getting pending actions count:', error);
    return 0;
  }
}

// Get last sync time
export async function getLastSyncTime(): Promise<Date | null> {
  try {
    const lastSync = await AsyncStorage.getItem(KEYS.LAST_SYNC);
    if (!lastSync) return null;
    
    return new Date(parseInt(lastSync, 10));
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
}

// Clear all cached data
export async function clearAllCachedData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(KEYS.CACHED_DATA));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.error('Error clearing all cached data:', error);
  }
}

// Initialize offline sync system
export async function initializeOfflineSync(): Promise<void> {
  try {
    // Check for and process any pending actions
    const online = await isOnline();
    if (online) {
      await processPendingActions();
    }
    
    // Set up network state change listener
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        processPendingActions();
      }
    });
  } catch (error) {
    console.error('Error initializing offline sync:', error);
  }
}

// Fetch data with offline support
export async function fetchWithOfflineSupport<T>(
  endpoint: string,
  cacheKey?: string,
  maxCacheAge: number = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
): Promise<T> {
  try {
    // Use provided cache key or endpoint path
    const key = cacheKey || endpoint;
    
    // Check if we're online
    const online = await isOnline();
    
    if (online) {
      // Online: Fetch fresh data
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      await cacheData(key, data);
      
      return data;
    } else {
      // Offline: Return cached data
      const cachedKey = `${KEYS.CACHED_DATA}.${key}`;
      const cachedJson = await AsyncStorage.getItem(cachedKey);
      
      if (!cachedJson) {
        throw new Error('No cached data available');
      }
      
      const cached = JSON.parse(cachedJson);
      
      // Check cache age
      const now = Date.now();
      if (maxCacheAge > 0 && (now - cached.timestamp > maxCacheAge)) {
        console.warn('Cached data is older than maxCacheAge');
      }
      
      return cached.data;
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}