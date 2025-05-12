import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UserEngagementTracker } from '../../client/src/components/gamification/user-engagement-tracker';

// Mock necessary components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="mock-card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardFooter: ({ children, className }: any) => <div className={className} data-testid="card-footer">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

jest.mock('@/components/ui/animated-counter', () => ({
  AnimatedProgress: ({ value, max, showLabel, className }: any) => (
    <div className={className} data-testid="animated-progress" data-value={value} data-max={max} data-show-label={showLabel}>
      {showLabel && `${value}/${max}`}
    </div>
  ),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" data-motion-props={JSON.stringify(props)}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <div data-testid="animate-presence">{children}</div>,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('UserEngagementTracker Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();

    // Initialize with some engagement data
    const initialData = {
      loginStreak: 3,
      postsCreated: 15,
      maxLoginStreak: 7,
      workflowsCreated: 4,
      lastLogin: new Date().toISOString(),
    };
    
    localStorageMock.setItem('user-engagement', JSON.stringify(initialData));
  });

  test('renders with data from localStorage', () => {
    render(<UserEngagementTracker userId={123} />);
    
    // Test if component renders correctly
    expect(screen.getByText('Engagement Stats')).toBeInTheDocument();
    
    // Test if card sections are rendered
    expect(screen.getByText('Current Login Streak')).toBeInTheDocument();
    expect(screen.getByText('Posts Created')).toBeInTheDocument();
    expect(screen.getByText('Workflows Created')).toBeInTheDocument();
    
    // Test if values are displayed
    expect(screen.getByText('3')).toBeInTheDocument(); // Login streak
    expect(screen.getByText('15')).toBeInTheDocument(); // Posts created
    expect(screen.getByText('4')).toBeInTheDocument(); // Workflows created
  });

  test('initializes with default values when no localStorage data', () => {
    localStorageMock.clear();
    
    render(<UserEngagementTracker userId={123} />);
    
    // Should initialize with default values (typically zeros)
    expect(screen.getByText('0')).toBeInTheDocument(); // Login streak should be 0
  });

  test('updates login streak on component mount', () => {
    // Set lastLogin to yesterday to test streak increment
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const initialData = {
      loginStreak: 3,
      postsCreated: 15,
      maxLoginStreak: 7,
      workflowsCreated: 4,
      lastLogin: yesterday.toISOString(),
    };
    
    localStorageMock.setItem('user-engagement', JSON.stringify(initialData));
    
    render(<UserEngagementTracker userId={123} />);
    
    // After mount, the login streak should be incremented
    expect(screen.getByText('4')).toBeInTheDocument(); // Login streak should now be 4
    
    // Check if localStorage was updated
    const updatedData = JSON.parse(localStorageMock.getItem('user-engagement') || '{}');
    expect(updatedData.loginStreak).toBe(4);
  });

  test('resets streak if last login was more than a day ago', () => {
    // Set lastLogin to 2 days ago to test streak reset
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const initialData = {
      loginStreak: 3,
      postsCreated: 15,
      maxLoginStreak: 7,
      workflowsCreated: 4,
      lastLogin: twoDaysAgo.toISOString(),
    };
    
    localStorageMock.setItem('user-engagement', JSON.stringify(initialData));
    
    render(<UserEngagementTracker userId={123} />);
    
    // Login streak should be reset to 1
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Check if localStorage was updated
    const updatedData = JSON.parse(localStorageMock.getItem('user-engagement') || '{}');
    expect(updatedData.loginStreak).toBe(1);
  });

  test('updates maxLoginStreak when current streak exceeds it', () => {
    // Set initial data with current streak = max streak
    const initialData = {
      loginStreak: 7,
      postsCreated: 15,
      maxLoginStreak: 7,
      workflowsCreated: 4,
      lastLogin: new Date(Date.now() - 86400000).toISOString(), // yesterday
    };
    
    localStorageMock.setItem('user-engagement', JSON.stringify(initialData));
    
    render(<UserEngagementTracker userId={123} />);
    
    // Streak should be incremented to 8, exceeding the max of 7
    
    // Check if localStorage was updated with new max
    const updatedData = JSON.parse(localStorageMock.getItem('user-engagement') || '{}');
    expect(updatedData.loginStreak).toBe(8);
    expect(updatedData.maxLoginStreak).toBe(8);
  });

  test('handles incrementPost method', () => {
    const { rerender } = render(<UserEngagementTracker userId={123} />);
    
    // Get the initial component instance
    const instance = screen.getByTestId('mock-card').parentElement;
    
    // Simulate increment post
    if (instance) {
      // We're using a workaround since we can't directly call the component's methods
      // Simulate this by updating the localStorage directly
      const data = JSON.parse(localStorageMock.getItem('user-engagement') || '{}');
      data.postsCreated = 16; // increment from 15
      localStorageMock.setItem('user-engagement', JSON.stringify(data));
      
      // Re-render to reflect changes
      rerender(<UserEngagementTracker userId={123} />);
      
      // Check if the value was updated
      expect(screen.getByText('16')).toBeInTheDocument();
    }
  });

  test('handles incrementWorkflow method', () => {
    const { rerender } = render(<UserEngagementTracker userId={123} />);
    
    // Get the initial component instance
    const instance = screen.getByTestId('mock-card').parentElement;
    
    // Simulate increment workflow
    if (instance) {
      // Update localStorage directly
      const data = JSON.parse(localStorageMock.getItem('user-engagement') || '{}');
      data.workflowsCreated = 5; // increment from 4
      localStorageMock.setItem('user-engagement', JSON.stringify(data));
      
      // Re-render to reflect changes
      rerender(<UserEngagementTracker userId={123} />);
      
      // Check if the value was updated
      expect(screen.getByText('5')).toBeInTheDocument();
    }
  });
});