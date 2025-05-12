import React from 'react';
import { render, screen } from '@testing-library/react';
import { AchievementBadge, type Achievement } from '../../client/src/components/gamification/achievement-badge';

// Mock tooltip component that would otherwise cause issues in tests
jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('AchievementBadge Component', () => {
  const unlockedAchievement: Achievement = {
    id: 'test-achievement',
    name: 'Test Achievement',
    description: 'This is a test achievement',
    icon: <svg data-testid="test-icon" />,
    unlocked: true
  };

  const lockedAchievement: Achievement = {
    id: 'locked-achievement',
    name: 'Locked Achievement',
    description: 'This is a locked achievement',
    icon: <svg data-testid="test-icon" />,
    unlocked: false,
    progress: {
      current: 5,
      total: 10
    }
  };

  test('renders unlocked achievement correctly', () => {
    render(<AchievementBadge achievement={unlockedAchievement} showTooltip={false} />);
    
    // Check if icon is present
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    
    // Unlocked achievements should have a primary color class
    const badge = screen.getByRole('presentation', { hidden: true });
    expect(badge).toHaveClass('bg-primary-100');
    expect(badge).toHaveClass('text-primary-700');
  });

  test('renders locked achievement with progress correctly', () => {
    render(<AchievementBadge achievement={lockedAchievement} showTooltip={false} />);
    
    // Check if icon is present
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    
    // Locked achievements should have a neutral color class
    const badge = screen.getByRole('presentation', { hidden: true });
    expect(badge).toHaveClass('bg-neutral-100');
    expect(badge).toHaveClass('text-neutral-400');
    
    // Progress text should be visible (5/10)
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });
});