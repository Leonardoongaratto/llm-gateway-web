import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton, SkeletonCard } from './Skeleton';

describe('Skeleton Components (AC-2A-10, AC-17 / F-07)', () => {
  it('renders base skeleton with custom width and height', () => {
    render(<Skeleton width="120px" height="24px" data-testid="test-skeleton" />);

    const el = screen.getByTestId('test-skeleton');
    expect(el).toBeInTheDocument();
    expect(el).toHaveStyle({ width: '120px', height: '24px' });
  });

  it('renders skeleton card with multiple placeholder lines', () => {
    render(<SkeletonCard lines={3} data-testid="test-card" />);

    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card.querySelectorAll('.skeleton-shimmer')).toHaveLength(4); // 1 title + 3 lines
  });
});
