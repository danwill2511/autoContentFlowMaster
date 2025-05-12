import Constants from 'expo-constants';

// Use API_URL from Constants or default to localhost
const API_URL = 'http://localhost:3000';

// Default headers for API requests
const DEFAULT_HEADERS = {
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

        return await response.json();
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

        return await response.json();
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
        const response = await fetch(`${API_URL}/api/logout`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Logout failed');
        }
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
        const response = await fetch(`${API_URL}/api/user`, {
          method: 'GET',
          headers: DEFAULT_HEADERS,
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch user data');
        }

        return await response.json();
      } catch (error) {
        console.error('Get user error:', error);
        return null;
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
        const response = await fetch(`${API_URL}/api/workflows`, {
          method: 'GET',
          headers: DEFAULT_HEADERS,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }

        return await response.json();
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
        const response = await fetch(`${API_URL}/api/workflows/${id}`, {
          method: 'GET',
          headers: DEFAULT_HEADERS,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch workflow');
        }

        return await response.json();
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
        const response = await fetch(`${API_URL}/api/workflows`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(workflowData),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to create workflow');
        }

        return await response.json();
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
        const response = await fetch(`${API_URL}/api/workflows/${id}`, {
          method: 'PATCH',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(workflowData),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to update workflow');
        }

        return await response.json();
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
        const response = await fetch(`${API_URL}/api/platforms`, {
          method: 'GET',
          headers: DEFAULT_HEADERS,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch platforms');
        }

        return await response.json();
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
        const response = await fetch(`${API_URL}/api/platforms`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(platformData),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to create platform');
        }

        return await response.json();
      } catch (error) {
        console.error('Create platform error:', error);
        throw error;
      }
    },
  },
};

export default api;