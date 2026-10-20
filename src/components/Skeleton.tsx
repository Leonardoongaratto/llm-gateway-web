import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
  'data-testid'?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--hig-radius-xs)',
  style,
  className = '',
  'data-testid': dataTestId,
}) => {
  return (
    <div
      data-testid={dataTestId}
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--hig-bg-grouped)',
        ...style,
      }}
    />
  );
};

interface SkeletonCardProps {
  lines?: number;
  'data-testid'?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ lines = 2, 'data-testid': dataTestId }) => {
  return (
    <div
      data-testid={dataTestId}
      style={{
        backgroundColor: 'var(--hig-bg-card)',
        borderRadius: 'var(--hig-radius-md)',
        border: '1px solid var(--hig-border)',
        padding: '20px',
        boxShadow: 'var(--hig-shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <Skeleton width="40%" height="20px" borderRadius="var(--hig-radius-xs)" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height="14px"
          borderRadius="var(--hig-radius-xs)"
        />
      ))}
    </div>
  );
};
