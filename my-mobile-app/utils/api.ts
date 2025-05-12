import Constants from 'expo-constants';
import { 
  isOnline, 
  queueAction, 
  fetchWithOfflineSupport, 
  cacheData 
} from './offlineSync';

// Use API_URL from Constants or default to localhost
export const API_URL = 'http://localhost:3000';

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * API service for interacting with the backend
 */
const api = {
  // Auth endpoints
  auth: {
    /**
     * Login user
     * @param credentials User credentials (username, password)
     * @returns User data
     */
    async login({ username, password }: { username: string; password: string }) {
      try {
        // Always require an online connection for login
        const online = await isOnline();
        
        if (!online) {
          throw new Error('You need an internet connection to log in');
        }
        
        const response = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ username, password }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Login failed');
        }

        const userData = await response.json();
        
        // Cache the user data for offline use
        await cacheData('current-user', userData);
        
        return userData;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    /**
     * Register a new user
     * @param userData User registration data
     * @returns User data
     */
    async register({ username, email, password }: { username: string; email: string; password: string }) {
      try {
        // Always require an online connection for registration
        const online = await isOnline();
        
        if (!online) {
          throw new Error('You need an internet connection to register');
        }
        
        const response = await fetch(`${API_URL}/api/register`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ username, email, password }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Registration failed');
        }

        const userData = await response.json();
        
        // Cache the user data for offline use
        await cacheData('current-user', userData);
        
        return userData;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },

    /**
     * Logout user
     */
    async logout() {
      try {
        const online = await isOnline();
        
        if (online) {
          // If online, perform the actual logout
          const response = await fetch(`${API_URL}/api/logout`, {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            credentials: 'include',
          });
  
          if (!response.ok) {
            throw new Error('Logout failed');
          }
        } else {
          // If offline, queue the logout for when back online
          await queueAction('/api/logout', 'POST', {});
        }
        
        // Always clear the cached user regardless of connection state
        await cacheData('current-user', null);
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },

    /**
     * Get current user data
     * @returns User data
     */
    async getCurrentUser() {
      try {
        const online = await isOnline();
        
        if (online) {
          // If online, get the latest user data
          const response = await fetch(`${API_URL}/api/user`, {
            method: 'GET',
            headers: DEFAULT_HEADERS,
            credentials: 'include',
          });
  
          if (!response.ok) {
            if (response.status === 401) {
              // Clear cached data if unauthorized
              await cacheData('current-user', null);
              return null;
            }
            throw new Error('Failed to fetch user data');
          }
  
          const userData = await response.json();
          
          // Update the cache
          await cacheData('current-user', userData);
          
          return userData;
        } else {
          // If offline, use the cached user data
          const cachedUser = await fetchWithOfflineSupport<any>(
            '/api/user',
            'current-user',
            Infinity // No expiration for user data
          ).catch(() => null);
          
          return cachedUser;
        }
      } catch (error) {
        console.error('Get user error:', error);
        
        // Try to get cached user on error
        try {
          const cachedUser = await fetchWithOfflineSupport<any>(
            '/api/user',
            'current-user',
            Infinity // No expiration for user data
          ).catch(() => null);
          
          return cachedUser;
        } catch {
          return null;
        }
      }
    },
  },

  // Workflows endpoints
  workflows: {
    /**
     * Get all workflows for the current user
     * @returns Array of workflows
     */
    async getAll() {
      try {
        // Use offline-capable fetch function
        return await fetchWithOfflineSupport<any[]>(
          '/api/workflows',
          'workflows-list',
          12 * 60 * 60 * 1000 // 12 hours cache
        );
      } catch (error) {
        console.error('Get workflows error:', error);
        throw error;
      }
    },

    /**
     * Get a specific workflow by ID
     * @param id Workflow ID
     * @returns Workflow data
     */
    async getById(id: number) {
      try {
        // Use offline-capable fetch function
        return await fetchWithOfflineSupport<any>(
          `/api/workflows/${id}`,
          `workflow-${id}`,
          12 * 60 * 60 * 1000 // 12 hours cache
        );
      } catch (error) {
        console.error('Get workflow error:', error);
        throw error;
      }
    },

    /**
     * Create a new workflow
     * @param workflowData Workflow data
     * @returns Created workflow
     */
    async create(workflowData: any) {
      try {
        // Check if online
        const online = await isOnline();
        
        if (online) {
          // If online, proceed with normal API call
          const response = await fetch(`${API_URL}/api/workflows`, {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(workflowData),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to create workflow');
          }

          const result = await response.json();
          
          // Update cache
          const cachedWorkflows = await fetchWithOfflineSupport<any[]>(
            '/api/workflows',
            'workflows-list',
            0, // Don't check cache age, we just want whatever is there
          ).catch(() => []);
          
          if (Array.isArray(cachedWorkflows)) {
            await cacheData('workflows-list', [...cachedWorkflows, result]);
          }
          
          return result;
        } else {
          // If offline, queue the action for later processing
          // Generate a temporary ID for offline workflow
          const tempId = `temp-${Date.now()}`;
          
          // Queue the creation action
          await queueAction('/api/workflows', 'POST', workflowData);
          
          // Create a temporary object with the temp ID
          const tempWorkflow = {
            ...workflowData,
            id: tempId,
            _offline: true, // Mark as offline
            _pendingCreation: true, // Mark as pending creation
            createdAt: new Date().toISOString(),
          };
          
          // Update the cache to include this temp workflow
          const cachedWorkflows = await fetchWithOfflineSupport<any[]>(
            '/api/workflows',
            'workflows-list',
            0, // Don't check cache age
          ).catch(() => []);
          
          if (Array.isArray(cachedWorkflows)) {
            await cacheData('workflows-list', [...cachedWorkflows, tempWorkflow]);
          }
          
          // Also cache the individual workflow
          await cacheData(`workflow-${tempId}`, tempWorkflow);
          
          return tempWorkflow;
        }
      } catch (error) {
        console.error('Create workflow error:', error);
        throw error;
      }
    },

    /**
     * Update a workflow
     * @param id Workflow ID
     * @param workflowData Updated workflow data
     * @returns Updated workflow
     */
    async update(id: number, workflowData: any) {
      try {
        // Check if online
        const online = await isOnline();
        
        if (online) {
          // If online, proceed with normal API call
          const response = await fetch(`${API_URL}/api/workflows/${id}`, {
            method: 'PATCH',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(workflowData),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to update workflow');
          }

          const result = await response.json();
          
          // Update caches
          await cacheData(`workflow-${id}`, result);
          
          // Update in the workflows list too
          const cachedWorkflows = await fetchWithOfflineSupport<any[]>(
            '/api/workflows',
            'workflows-list',
            0, // Don't check cache age
          ).catch(() => []);
          
          if (Array.isArray(cachedWorkflows)) {
            const updatedWorkflows = cachedWorkflows.map(wf => 
              wf.id === id ? result : wf
            );
            await cacheData('workflows-list', updatedWorkflows);
          }
          
          return result;
        } else {
          // If offline, queue the action for later
          await queueAction(`/api/workflows/${id}`, 'PATCH', workflowData);
          
          // Get the current workflow from cache
          const cachedWorkflow = await fetchWithOfflineSupport<any>(
            `/api/workflows/${id}`,
            `workflow-${id}`,
            0, // Don't check age
          ).catch(() => null);
          
          if (!cachedWorkflow) {
            throw new Error('Cannot update workflow offline: not found in cache');
          }
          
          // Create updated workflow object
          const updatedWorkflow = {
            ...cachedWorkflow,
            ...workflowData,
            _offline: true, // Mark as offline
            _pendingUpdate: true, // Mark as pending update
          };
          
          // Update cache for this workflow
          await cacheData(`workflow-${id}`, updatedWorkflow);
          
          // Also update in the workflows list
          const cachedWorkflows = await fetchWithOfflineSupport<any[]>(
            '/api/workflows',
            'workflows-list',
            0, // Don't check cache age
          ).catch(() => []);
          
          if (Array.isArray(cachedWorkflows)) {
            const updatedWorkflows = cachedWorkflows.map(wf => 
              wf.id === id ? updatedWorkflow : wf
            );
            await cacheData('workflows-list', updatedWorkflows);
          }
          
          return updatedWorkflow;
        }
      } catch (error) {
        console.error('Update workflow error:', error);
        throw error;
      }
    },
  },

  // Platforms endpoints
  platforms: {
    /**
     * Get all platforms for the current user
     * @returns Array of platforms
     */
    async getAll() {
      try {
        // Use offline-capable fetch function
        return await fetchWithOfflineSupport<any[]>(
          '/api/platforms',
          'platforms-list',
          12 * 60 * 60 * 1000 // 12 hours cache
        );
      } catch (error) {
        console.error('Get platforms error:', error);
        throw error;
      }
    },

    /**
     * Create a new platform
     * @param platformData Platform data
     * @returns Created platform
     */
    async create(platformData: any) {
      try {
        // Check if online
        const online = await isOnline();
        
        if (online) {
          // If online, proceed with normal API call
          const response = await fetch(`${API_URL}/api/platforms`, {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(platformData),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to create platform');
          }

          const result = await response.json();
          
          // Update cache
          const cachedPlatforms = await fetchWithOfflineSupport<any[]>(
            '/api/platforms',
            'platforms-list',
            0 // Don't check cache age, we just want whatever is there
          ).catch(() => []);
          
          if (Array.isArray(cachedPlatforms)) {
            await cacheData('platforms-list', [...cachedPlatforms, result]);
          }
          
          return result;
        } else {
          // If offline, queue the action for later processing
          // Generate a temporary ID for offline platform
          const tempId = `temp-${Date.now()}`;
          
          // Queue the creation action
          await queueAction('/api/platforms', 'POST', platformData);
          
          // Create a temporary object with the temp ID
          const tempPlatform = {
            ...platformData,
            id: tempId,
            _offline: true,
            _pendingCreation: true,
            createdAt: new Date().toISOString(),
          };
          
          // Update the cache to include this temp platform
          const cachedPlatforms = await fetchWithOfflineSupport<any[]>(
            '/api/platforms',
            'platforms-list',
            0 // Don't check cache age
          ).catch(() => []);
          
          if (Array.isArray(cachedPlatforms)) {
            await cacheData('platforms-list', [...cachedPlatforms, tempPlatform]);
          }
          
          return tempPlatform;
        }
      } catch (error) {
        console.error('Create platform error:', error);
        throw error;
      }
    },
  },
};

export default api;