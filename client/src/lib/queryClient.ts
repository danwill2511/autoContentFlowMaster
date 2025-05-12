
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

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
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
