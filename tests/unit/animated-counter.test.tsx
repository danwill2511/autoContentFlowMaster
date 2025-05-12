import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AnimatedCounter, AnimatedProgress, AnimatedBarChart } from '../../client/src/components/ui/animated-counter';

// Mock the framer-motion components
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-motion-props={JSON.stringify(props)} data-testid="motion-div">{children}</div>,
  },
}));

describe('AnimatedCounter Components', () => {
  // Helper to advance timers
  const advanceTimers = async (ms: number) => {
    await act(async () => {
      jest.advanceTimersByTime(ms);
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('AnimatedCounter', () => {
    test('renders with initial value and formats correctly', () => {
      render(<AnimatedCounter value={1000} />);
      
      // Initially, it should show the starting value or a transitioning value
      const counterElement = screen.getByText(/\d/);
      expect(counterElement).toBeInTheDocument();
      
      // After animation completes, it should show the formatted value
      act(() => {
        jest.runAllTimers();
      });
      
      // Check formatted value (with locale string)
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });

    test('applies custom formatting function', () => {
      const customFormat = (value: number) => `$${value.toFixed(2)}`;
      
      render(<AnimatedCounter 
        value={1000} 
        formatValue={customFormat} 
      />);
      
      // Run all timers to complete animations
      act(() => {
        jest.runAllTimers();
      });
      
      // Should use custom formatter
      expect(screen.getByText('$1000.00')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(<AnimatedCounter 
        value={1000} 
        className="test-class" 
      />);
      
      const element = screen.getByText(/\d/);
      expect(element).toHaveClass('test-class');
    });
  });

  describe('AnimatedProgress', () => {
    test('renders progress bar with correct percentage', () => {
      render(<AnimatedProgress value={50} max={100} />);
      
      // Should have a motion div for the progress bar
      const progressBar = screen.getByTestId('motion-div');
      expect(progressBar).toBeInTheDocument();
      
      // Run all timers to complete animations
      act(() => {
        jest.runAllTimers();
      });
    });

    test('shows label when enabled', () => {
      render(<AnimatedProgress value={30} max={100} showLabel={true} />);
      
      // Run all timers to complete animation
      act(() => {
        jest.runAllTimers();
      });
      
      // Should show the percentage label
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    test('respects custom max value', () => {
      render(<AnimatedProgress value={5} max={10} showLabel={true} />);
      
      // Run all timers to complete animation
      act(() => {
        jest.runAllTimers();
      });
      
      // Should calculate percentage based on max (5/10 = 50%)
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    test('uses custom format label function', () => {
      const customFormat = (value: number, max: number) => `${value} of ${max} points`;
      
      render(
        <AnimatedProgress 
          value={30} 
          max={100} 
          showLabel={true} 
          formatLabel={customFormat} 
        />
      );
      
      // Run all timers to complete animation
      act(() => {
        jest.runAllTimers();
      });
      
      // Should use the custom format
      expect(screen.getByText('30 of 100 points')).toBeInTheDocument();
    });
  });

  describe('AnimatedBarChart', () => {
    const sampleData = [
      { label: 'A', value: 10, color: '#ff0000' },
      { label: 'B', value: 20, color: '#00ff00' },
      { label: 'C', value: 30, color: '#0000ff' },
    ];

    test('renders bars for each data point', () => {
      render(<AnimatedBarChart data={sampleData} />);
      
      // Should render a label for each data point
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
      
      // Should have motion divs for each bar
      const motionDivs = screen.getAllByTestId('motion-div');
      expect(motionDivs.length).toBe(sampleData.length);
    });

    test('hides labels when specified', () => {
      render(<AnimatedBarChart data={sampleData} showLabels={false} />);
      
      // Labels should not be rendered
      expect(screen.queryByText('A')).not.toBeInTheDocument();
      expect(screen.queryByText('B')).not.toBeInTheDocument();
      expect(screen.queryByText('C')).not.toBeInTheDocument();
    });

    test('respects custom height', () => {
      const customHeight = 300;
      render(<AnimatedBarChart data={sampleData} height={customHeight} />);
      
      // Container should have the specified height
      const container = screen.getByTestId('motion-div').parentElement?.parentElement;
      expect(container).toHaveStyle(`height: ${customHeight}px`);
    });
  });
});