import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AiAssistant } from '../../client/src/components/ui/ai-assistant';

// Mock necessary components
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

jest.mock('lucide-react', () => ({
  MessagesSquare: () => <div data-testid="messages-square-icon" />,
  X: () => <div data-testid="x-icon" />,
  SendHorizonal: () => <div data-testid="send-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ placeholder, value, onChange, className, disabled }: any) => (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      disabled={disabled}
      data-testid="mock-textarea"
    />
  ),
}));

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ response: "This is a mock AI response" }),
    ok: true,
  })
) as jest.Mock;

describe('AiAssistant Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders in collapsed state by default', () => {
    render(<AiAssistant />);
    
    // Button with icon should be visible
    expect(screen.getByTestId('messages-square-icon')).toBeInTheDocument();
    
    // Chat panel should not be visible
    expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument();
  });

  test('expands when button is clicked', () => {
    render(<AiAssistant />);
    
    // Click the floating button to expand
    fireEvent.click(screen.getByTestId('mock-button'));
    
    // Chat panel should now be visible
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask me anything about AutoContentFlow...')).toBeInTheDocument();
  });

  test('collapses when close button is clicked', () => {
    render(<AiAssistant />);
    
    // Expand first
    fireEvent.click(screen.getByTestId('mock-button'));
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    
    // Now click the close button
    const closeButton = screen.getAllByTestId('mock-button')[1]; // Second button should be close
    fireEvent.click(closeButton);
    
    // Chat panel should be hidden again
    expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument();
  });

  test('handles user input and sends message', async () => {
    render(<AiAssistant />);
    
    // Expand chat
    fireEvent.click(screen.getByTestId('mock-button'));
    
    // Type a message
    const textarea = screen.getByTestId('mock-textarea');
    fireEvent.change(textarea, { target: { value: 'How do I create a workflow?' } });
    
    // Send the message
    const sendButton = screen.getAllByTestId('mock-button').find(btn => 
      btn.textContent === 'Send' || btn.innerHTML.includes('Send')
    );
    
    if (sendButton) {
      fireEvent.click(sendButton);
    }
    
    // Wait for the message to be added to the chat
    await waitFor(() => {
      expect(screen.getByText('How do I create a workflow?')).toBeInTheDocument();
    });
    
    // Input should be cleared
    expect(textarea).toHaveValue('');
  });

  test('displays loading state while waiting for AI response', async () => {
    // Make fetch take some time
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            json: () => Promise.resolve({ response: "This is a mock AI response" }),
            ok: true,
          });
        }, 100);
      })
    );
    
    render(<AiAssistant />);
    
    // Expand chat
    fireEvent.click(screen.getByTestId('mock-button'));
    
    // Type and send a message
    const textarea = screen.getByTestId('mock-textarea');
    fireEvent.change(textarea, { target: { value: 'Test question' } });
    
    const sendButton = screen.getAllByTestId('mock-button').find(btn => 
      btn.textContent === 'Send' || btn.innerHTML.includes('Send')
    );
    
    if (sendButton) {
      fireEvent.click(sendButton);
    }
    
    // Should show loading indicator
    await waitFor(() => {
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });
    
    // After response comes back, loading should be gone
    await waitFor(() => {
      expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
    }, { timeout: 500 });
    
    // AI response should be shown
    expect(screen.getByText('This is a mock AI response')).toBeInTheDocument();
  });

  test('handles fetch errors gracefully', async () => {
    // Mock a failed fetch request
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    render(<AiAssistant />);
    
    // Expand chat
    fireEvent.click(screen.getByTestId('mock-button'));
    
    // Type and send a message
    const textarea = screen.getByTestId('mock-textarea');
    fireEvent.change(textarea, { target: { value: 'Test question' } });
    
    const sendButton = screen.getAllByTestId('mock-button').find(btn => 
      btn.textContent === 'Send' || btn.innerHTML.includes('Send')
    );
    
    if (sendButton) {
      fireEvent.click(sendButton);
    }
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Sorry, I had trouble processing your request/i)).toBeInTheDocument();
    });
  });

  test('shows examples when chat is initialized', () => {
    render(<AiAssistant />);
    
    // Expand chat
    fireEvent.click(screen.getByTestId('mock-button'));
    
    // Should show example messages
    expect(screen.getByText(/How do I create a new workflow/i)).toBeInTheDocument();
    expect(screen.getByText(/What platforms do you support/i)).toBeInTheDocument();
    expect(screen.getByText(/How can I improve my content/i)).toBeInTheDocument();
  });

  test('clicking an example message sends it as user query', async () => {
    render(<AiAssistant />);
    
    // Expand chat
    fireEvent.click(screen.getByTestId('mock-button'));
    
    // Click an example message
    const exampleMessages = screen.getAllByTestId('mock-button').filter(btn => 
      btn.textContent?.includes('How do I create a new workflow')
    );
    
    if (exampleMessages.length > 0) {
      fireEvent.click(exampleMessages[0]);
    }
    
    // The example text should be sent as a user message
    await waitFor(() => {
      expect(screen.getByText('How do I create a new workflow')).toBeInTheDocument();
    });
    
    // AI should respond
    await waitFor(() => {
      expect(screen.getByText('This is a mock AI response')).toBeInTheDocument();
    });
  });
});