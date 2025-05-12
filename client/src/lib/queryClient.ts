
import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Helper function to get the auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Helper function to set the auth token in localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

// Helper function to remove the auth token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem('authToken');
}

// Helper function for API requests
export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options?: RequestInit
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  // Add auth token to headers if available
  const token = getAuthToken();
  if (token) {
    // Using Record to fix TypeScript error with headers
    const authHeaders = { Authorization: `Bearer ${token}` };
    Object.assign(headers, authHeaders);
  }

  const config: RequestInit = {
    method,
    headers,
    ...options,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    // Attempt to parse the error message from the response
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || `Request failed with status ${response.status}`;
    } catch (error) {
      errorMessage = `Request failed with status ${response.status}`;
    }

    throw new Error(errorMessage);
  }

  return response;
}
