# API Integration Guide for Mobile App

This document outlines the API integration approach for connecting the AutoContentFlow mobile app with the backend server.

## API Client Structure

The mobile app uses a centralized API client located in `mobile/utils/api.ts`. This file provides:

1. A base `apiRequest` function that handles all HTTP requests
2. Domain-specific API modules (auth, workflows, platforms)
3. Error handling and authentication token management

## Base API Request Function

```typescript
interface ApiOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  data?: any;
  token?: string;
}

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
```

## Authentication API

The authentication API module handles user authentication:

```typescript
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
```

## Workflows API

The workflows API module interacts with workflow-related endpoints:

```typescript
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
```

## Connecting API with UI Components

The API client is used in the UI components through React Query or directly in component event handlers:

### Using React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { workflowsApi } from '../utils/api';

function WorkflowsScreen() {
  const { 
    data: workflowsData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsApi.getWorkflows()
  });

  const runWorkflowMutation = useMutation({
    mutationFn: (workflowId: number) => workflowsApi.runWorkflow(workflowId),
    onSuccess: () => {
      // Handle success (show notification, update UI)
    },
    onError: (error) => {
      // Handle error
    }
  });

  return (
    // Component JSX
  );
}
```

### Direct API Calls

```typescript
import { useState } from 'react';
import { createWorkflow } from '../utils/api';

function CreateWorkflowScreen({ navigation }) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const result = await workflowsApi.createWorkflow(formData);
      // Handle success
      navigation.navigate('Workflows');
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Component JSX
  );
}
```

## Error Handling Strategy

API errors are handled at multiple levels:

1. **API Client Level**: Basic error formatting and logging
2. **Component Level**: User-friendly error messages and UI updates
3. **Global Error Handler**: Centralized error reporting for analytics

```typescript
// Global error handler
export function handleApiError(error: Error) {
  // Log to monitoring service
  console.error('API Error:', error);
  
  // Format user-friendly message
  const message = error.message || 'Something went wrong';
  
  // Show toast or alert
  Alert.alert('Error', message);
  
  // Track error for analytics
  trackError('api_error', { message: error.message });
}
```

## Authentication Flow

The app uses session-based authentication with the following flow:

1. User logs in with username/password
2. Server returns user data and sets HTTP-only cookies
3. Subsequent requests include these cookies for authentication
4. Protected routes check authentication status

## Offline Support

For offline support, the app implements:

1. Data caching using AsyncStorage
2. Request queuing for offline operations
3. Synchronization when connectivity is restored

## API Response Caching

API responses are cached using React Query's built-in caching:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    },
  },
});
```

## Testing the API

For testing API integration:

1. Use mocks during development
2. Test against staging server for integration testing
3. Implement comprehensive error handling tests

## Security Considerations

API security measures:

1. Use HTTPS for all API requests
2. Implement token refresh mechanisms
3. Sanitize all user inputs before sending to API
4. Don't store sensitive data in client-side storage