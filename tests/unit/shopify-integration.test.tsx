import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShopifyIntegration } from '../../client/src/components/integrations/shopify-integration';

// Mock all UI components used
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, disabled }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size}
      className={className}
      disabled={disabled}
      data-testid="mock-button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="mock-card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardFooter: ({ children, className }: any) => <div className={className} data-testid="card-footer">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, onValueChange, className }: any) => (
    <div data-tabs-default={defaultValue} className={className} data-testid="mock-tabs">
      {typeof children === 'function' ? children({ value: defaultValue }) : children}
    </div>
  ),
  TabsContent: ({ children, value, className }: any) => (
    <div data-tabs-content-value={value} className={className} data-testid="tabs-content">
      {children}
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div className={className} data-testid="tabs-list">
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <button data-tabs-trigger-value={value} data-testid="tabs-trigger">
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ id, checked, onCheckedChange }: any) => (
    <input 
      type="checkbox" 
      id={id} 
      checked={checked} 
      onChange={() => onCheckedChange(!checked)} 
      data-testid={`switch-${id}`}
    />
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="mock-dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({ children, className }: any) => (
    <div className={className} data-testid="dialog-content">
      {children}
    </div>
  ),
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children, className }: any) => <div className={className} data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, value, onChange, placeholder, className }: any) => (
    <input 
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid={`input-${id || 'default'}`}
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor} data-testid="mock-label">{children}</label>,
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ id }: any) => <input type="checkbox" id={id} data-testid={`checkbox-${id}`} />,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ className }: any) => <hr className={className} data-testid="mock-separator" />,
}));

jest.mock('@/components/ui/skeleton-loader', () => ({
  SkeletonLoader: ({ isLoading, children }: any) => (
    <div data-testid="skeleton-loader" data-loading={isLoading}>
      {isLoading ? <div>Loading...</div> : children}
    </div>
  ),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" data-motion-props={JSON.stringify(props)}>
        {children}
      </div>
    ),
  },
}));

describe('ShopifyIntegration Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state when isLoading is true', () => {
    render(<ShopifyIntegration isLoading={true} />);
    
    const skeletonLoader = screen.getByTestId('skeleton-loader');
    expect(skeletonLoader).toHaveAttribute('data-loading', 'true');
  });

  test('renders disconnected state by default', () => {
    render(<ShopifyIntegration />);
    
    // Should show Shopify Integration title
    expect(screen.getByText('Shopify Integration')).toBeInTheDocument();
    
    // Should show connect prompt
    expect(screen.getByText('Connect Your Shopify Store')).toBeInTheDocument();
    
    // Should have Connect Store button
    const connectButton = screen.getByText('Connect Store');
    expect(connectButton).toBeInTheDocument();
  });

  test('renders connected state when connected prop is true', () => {
    render(<ShopifyIntegration connected={true} storeName="teststore" />);
    
    // Should show connected message
    expect(screen.getByText('Connected to teststore.myshopify.com')).toBeInTheDocument();
    
    // Should show Disconnect button instead of Connect
    const disconnectButton = screen.getByText('Disconnect');
    expect(disconnectButton).toBeInTheDocument();
    
    // Should show tabs for settings, products, etc.
    expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
  });

  test('opens connect dialog when Connect Store button is clicked', () => {
    render(<ShopifyIntegration />);
    
    // Click the Connect Store button
    fireEvent.click(screen.getByText('Connect Store'));
    
    // Dialog should be shown
    const dialog = screen.getByTestId('mock-dialog');
    expect(dialog).toHaveAttribute('data-open', 'true');
    
    // Should show dialog title
    expect(screen.getByText('Connect Shopify Store')).toBeInTheDocument();
  });

  test('handles store name input in connect dialog', () => {
    render(<ShopifyIntegration />);
    
    // Click the Connect Store button to open dialog
    fireEvent.click(screen.getByText('Connect Store'));
    
    // Find the store name input
    const storeInput = screen.getByTestId('input-store-name');
    
    // Type a store name
    fireEvent.change(storeInput, { target: { value: 'myawesomestore' } });
    
    // Input should have the new value
    expect(storeInput).toHaveValue('myawesomestore');
  });

  test('calls onConnect with store name when connect button is clicked', async () => {
    const mockOnConnect = jest.fn().mockResolvedValue(undefined);
    
    render(<ShopifyIntegration onConnect={mockOnConnect} />);
    
    // Click the Connect Store button to open dialog
    fireEvent.click(screen.getByText('Connect Store'));
    
    // Enter a store name
    const storeInput = screen.getByTestId('input-store-name');
    fireEvent.change(storeInput, { target: { value: 'myawesomestore' } });
    
    // Click the Connect button in the dialog
    const connectDialogButton = screen.getAllByText('Connect Store')[1];
    fireEvent.click(connectDialogButton);
    
    // onConnect should be called with the store name
    expect(mockOnConnect).toHaveBeenCalledWith('myawesomestore');
  });

  test('calls onDisconnect when disconnect button is clicked', () => {
    const mockOnDisconnect = jest.fn().mockResolvedValue(undefined);
    
    render(<ShopifyIntegration connected={true} storeName="teststore" onDisconnect={mockOnDisconnect} />);
    
    // Click the Disconnect button
    fireEvent.click(screen.getByText('Disconnect'));
    
    // onDisconnect should be called
    expect(mockOnDisconnect).toHaveBeenCalled();
  });
});