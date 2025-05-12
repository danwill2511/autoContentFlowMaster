import Constants from 'expo-constants';

// Get the API URL from the environment or use a fallback
const API_URL = Constants?.manifest?.extra?.apiUrl || 'https://autocontentflow.repl.app';

// Default headers for API requests
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Generic API request function
 * @param endpoint - API endpoint path
 * @param method - HTTP method
 * @param data - Request body data
 * @param customHeaders - Additional headers
 * @returns Promise with response data
 */
async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  customHeaders = {}
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const options: RequestInit = {
    method,
    headers: {
      ...DEFAULT_HEADERS,
      ...customHeaders,
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  // Handle HTTP errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
  }
  
  // Check content type to determine parsing strategy
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text() as unknown as T;
}

// Auth API interfaces
interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  email: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  subscription: string | null;
}

// API service methods
const api = {
  // Auth endpoints
  auth: {
    login: (credentials: LoginCredentials) => 
      request<UserProfile>('/api/login', 'POST', credentials),
    
    register: (data: RegisterData) => 
      request<UserProfile>('/api/register', 'POST', data),
    
    logout: () => 
      request<void>('/api/logout', 'POST'),
    
    getCurrentUser: () => 
      request<UserProfile>('/api/user')
      .catch(() => null),
  },

  // Workflow endpoints
  workflows: {
    getAll: () => 
      request<any[]>('/api/workflows'),
    
    getById: (id: number) => 
      request<any>(`/api/workflows/${id}`),
    
    create: (data: any) => 
      request<any>('/api/workflows', 'POST', data),
    
    update: (id: number, data: any) => 
      request<any>(`/api/workflows/${id}`, 'PUT', data),
    
    delete: (id: number) => 
      request<void>(`/api/workflows/${id}`, 'DELETE'),
  },
  
  // Platform endpoints
  platforms: {
    getAll: () => 
      request<any[]>('/api/platforms'),
    
    getById: (id: number) => 
      request<any>(`/api/platforms/${id}`),
    
    create: (data: any) => 
      request<any>('/api/platforms', 'POST', data),
    
    update: (id: number, data: any) => 
      request<any>(`/api/platforms/${id}`, 'PUT', data),
    
    delete: (id: number) => 
      request<void>(`/api/platforms/${id}`, 'DELETE'),
  },
  
  // Post endpoints
  posts: {
    getAll: () => 
      request<any[]>('/api/posts'),
    
    getByWorkflow: (workflowId: number) => 
      request<any[]>(`/api/workflows/${workflowId}/posts`),
    
    getById: (id: number) => 
      request<any>(`/api/posts/${id}`),
  },
  
  // Subscription endpoints
  subscriptions: {
    getCurrentPlan: () => 
      request<any>('/api/subscription'),
    
    upgradePlan: (plan: string) => 
      request<any>('/api/subscription/upgrade', 'POST', { plan }),
  }
};

export default api;