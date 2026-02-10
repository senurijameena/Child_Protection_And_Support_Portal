export interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  rounded?: boolean
}

export function Skeleton({ width, height = 20, className = '', rounded = true }: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width ?? '100%',
    height: typeof height === 'number' ? `${height}px` : height,
  }
  return <div className={`cp-skeleton ${rounded ? 'rounded' : ''} ${className}`.trim()} style={style} aria-hidden />
}

export function StatCardSkeleton() {
  return (
    <div className="cp-stat-card p-4 h-100">
      <div className="d-flex justify-content-between">
        <div className="flex-grow-1">
          <Skeleton width="60%" height={14} className="mb-2" />
          <Skeleton width="40%" height={28} className="mb-1" />
          <Skeleton width="80%" height={12} />
        </div>
        <Skeleton width={48} height={48} />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <Skeleton height={16} />
        </td>
      ))}
    </tr>
  )
}
