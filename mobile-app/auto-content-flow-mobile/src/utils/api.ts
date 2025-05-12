import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const API_BASE_URL = 'https://auto-content-flow.replit.app';

// API request interface
interface ApiOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  data?: any;
  token?: string;
}

/**
 * Base API request function that handles all API calls
 */
export async function apiRequest<T>({ method, path, data, token }: ApiOptions): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Request failed with status ${response.status}`
      );
    }
    
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Authentication API functions
 */
export const authApi = {
  async login(username: string, password: string) {
    return apiRequest<{ user: any }>({
      method: 'POST',
      path: '/api/login',
      data: { username, password },
    });
  },
  
  async register(userData: { username: string; email: string; password: string }) {
    return apiRequest<{ user: any }>({
      method: 'POST',
      path: '/api/register',
      data: userData,
    });
  },
  
  async logout() {
    return apiRequest<void>({
      method: 'POST',
      path: '/api/logout',
    });
  },
  
  async getCurrentUser() {
    return apiRequest<{ user: any }>({
      method: 'GET',
      path: '/api/user',
    });
  },
};

/**
 * Workflows API functions
 */
export const workflowsApi = {
  async getWorkflows() {
    return apiRequest<{ workflows: any[] }>({
      method: 'GET',
      path: '/api/workflows',
    });
  },
  
  async getWorkflowById(id: number) {
    return apiRequest<{ workflow: any }>({
      method: 'GET',
      path: `/api/workflows/${id}`,
    });
  },
  
  async createWorkflow(workflowData: any) {
    return apiRequest<{ workflow: any }>({
      method: 'POST',
      path: '/api/workflows',
      data: workflowData,
    });
  },
  
  async updateWorkflow(id: number, workflowData: any) {
    return apiRequest<{ workflow: any }>({
      method: 'PATCH',
      path: `/api/workflows/${id}`,
      data: workflowData,
    });
  },
  
  async runWorkflow(id: number) {
    return apiRequest<{ success: boolean }>({
      method: 'POST',
      path: `/api/workflows/${id}/run`,
    });
  },
};

/**
 * Platforms API functions
 */
export const platformsApi = {
  async getPlatforms() {
    return apiRequest<{ platforms: any[] }>({
      method: 'GET',
      path: '/api/platforms',
    });
  },
  
  async getPlatformById(id: number) {
    return apiRequest<{ platform: any }>({
      method: 'GET',
      path: `/api/platforms/${id}`,
    });
  },
  
  async createPlatform(platformData: any) {
    return apiRequest<{ platform: any }>({
      method: 'POST',
      path: '/api/platforms',
      data: platformData,
    });
  },
  
  async updatePlatform(id: number, platformData: any) {
    return apiRequest<{ platform: any }>({
      method: 'PATCH',
      path: `/api/platforms/${id}`,
      data: platformData,
    });
  },
};

/**
 * Posts API functions
 */
export const postsApi = {
  async getPosts() {
    return apiRequest<{ posts: any[] }>({
      method: 'GET',
      path: '/api/posts',
    });
  },
  
  async getPostsByWorkflow(workflowId: number) {
    return apiRequest<{ posts: any[] }>({
      method: 'GET',
      path: `/api/workflows/${workflowId}/posts`,
    });
  },
};

/**
 * Analytics API functions
 */
export const analyticsApi = {
  async getWorkflowStats() {
    return apiRequest<{ stats: any }>({
      method: 'GET',
      path: '/api/analytics/workflows',
    });
  },
  
  async getContentStats() {
    return apiRequest<{ stats: any }>({
      method: 'GET',
      path: '/api/analytics/content',
    });
  },
};