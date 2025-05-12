import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSwitcher } from '../../client/src/components/ui/theme-switcher';

// Mock the Button, Popover components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <button onClick={onClick} data-testid="mock-button">{children}</button>
  ),
}));

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children, align }: { children: React.ReactNode, align?: string }) => (
    <div data-testid="popover-content" data-align={align}>{children}</div>
  ),
  PopoverTrigger: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => (
    <div data-testid="popover-trigger" data-aschild={asChild?.toString()}>{children}</div>
  ),
}));

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
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

describe('ThemeSwitcher Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();

    // Mock document.documentElement for CSS variables
    Object.defineProperty(document, 'documentElement', {
      value: {
        style: {
          setProperty: jest.fn(),
        },
      },
      writable: true,
    });
  });

  test('renders with default theme', () => {
    render(<ThemeSwitcher floatingButton={false} />);
    
    // Check if theme options are rendered
    expect(screen.getByText('Choose your preferred color scheme')).toBeInTheDocument();
    
    // Check if theme buttons are present
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Purple')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
    expect(screen.getByText('Orange')).toBeInTheDocument();
    expect(screen.getByText('Pink')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  test('loads theme from localStorage', () => {
    // Set a theme in localStorage
    localStorageMock.setItem('app-theme', 'green');
    
    render(<ThemeSwitcher floatingButton={false} />);
    
    // Expect setProperty to have been called with green theme values
    expect(document.documentElement.style.setProperty).toHaveBeenCalled();
  });

  test('renders floating button when specified', () => {
    render(<ThemeSwitcher floatingButton={true} />);
    
    // Check if the floating button variant is rendered
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
  });
});