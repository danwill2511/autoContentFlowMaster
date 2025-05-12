import React from 'react';
import { render, screen } from '@testing-library/react';
import { SkeletonLoader } from '../../client/src/components/ui/skeleton-loader';

describe('SkeletonLoader Component', () => {
  test('renders children when isLoading is false', () => {
    render(
      <SkeletonLoader isLoading={false}>
        <div data-testid="test-content">Content</div>
      </SkeletonLoader>
    );
    
    // Should render children
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    
    // Should not render skeleton elements
    expect(screen.queryByTestId('skeleton-item')).not.toBeInTheDocument();
  });
  
  test('renders skeleton elements when isLoading is true', () => {
    render(
      <SkeletonLoader isLoading={true}>
        <div data-testid="test-content">Content</div>
      </SkeletonLoader>
    );
    
    // Should not render children
    expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
    
    // Should render skeleton elements
    expect(screen.getAllByTestId('skeleton-item').length).toBeGreaterThan(0);
  });
  
  test('renders with custom count and height', () => {
    const customCount = 5;
    const customHeight = 100;
    
    render(
      <SkeletonLoader 
        isLoading={true} 
        count={customCount}
        height={customHeight}
      >
        <div>Content</div>
      </SkeletonLoader>
    );
    
    // Should render exact number of skeleton items
    expect(screen.getAllByTestId('skeleton-item')).toHaveLength(customCount);
    
    // First skeleton item should have the custom height
    const firstSkeletonItem = screen.getAllByTestId('skeleton-item')[0];
    expect(firstSkeletonItem).toHaveStyle(`height: ${customHeight}px`);
  });
  
  test('applies custom className to container', () => {
    const customClass = 'test-skeleton-class';
    
    render(
      <SkeletonLoader 
        isLoading={true} 
        className={customClass}
      >
        <div>Content</div>
      </SkeletonLoader>
    );
    
    // Container should have the custom class
    const container = screen.getByTestId('skeleton-container');
    expect(container).toHaveClass(customClass);
  });

  test('respects custom width for skeleton items', () => {
    const customWidth = '75%';
    
    render(
      <SkeletonLoader 
        isLoading={true} 
        width={customWidth}
      >
        <div>Content</div>
      </SkeletonLoader>
    );
    
    // Skeleton items should have the custom width
    const skeletonItems = screen.getAllByTestId('skeleton-item');
    const firstSkeletonItem = skeletonItems[0];
    expect(firstSkeletonItem).toHaveStyle(`width: ${customWidth}`);
  });
  
  test('applies different widths for each skeleton row when array provided', () => {
    const customWidths = ['50%', '75%', '60%'];
    
    render(
      <SkeletonLoader 
        isLoading={true} 
        count={3}
        width={customWidths}
      >
        <div>Content</div>
      </SkeletonLoader>
    );
    
    // Each skeleton item should have its respective width from the array
    const skeletonItems = screen.getAllByTestId('skeleton-item');
    
    expect(skeletonItems[0]).toHaveStyle('width: 50%');
    expect(skeletonItems[1]).toHaveStyle('width: 75%');
    expect(skeletonItems[2]).toHaveStyle('width: 60%');
  });
});