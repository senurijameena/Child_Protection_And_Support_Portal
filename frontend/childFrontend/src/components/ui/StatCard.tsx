import { Link } from 'react-router-dom'

export type StatVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'neutral'

const variantStyles: Record<StatVariant, { bg: string; value: string; icon: string }> = {
  primary: { bg: 'var(--cp-primary-light)', value: 'var(--cp-primary)', icon: 'var(--cp-primary)' },
  secondary: { bg: 'var(--cp-secondary-light)', value: 'var(--cp-secondary)', icon: 'var(--cp-secondary)' },
  accent: { bg: 'var(--cp-accent-light)', value: 'var(--cp-accent-hover)', icon: 'var(--cp-accent)' },
  danger: { bg: 'var(--cp-danger-muted)', value: 'var(--cp-danger)', icon: 'var(--cp-danger)' },
  neutral: { bg: 'var(--cp-bg-subtle)', value: 'var(--cp-text)', icon: 'var(--cp-text-muted)' },
}

export interface StatCardProps {
  title: string
  value: string | number
  sub?: string
  variant?: StatVariant
  icon?: React.ReactNode
  trend?: 'up' | 'down'
  trendLabel?: string
  linkTo?: string
  className?: string
}

export function StatCard({
  title,
  value,
  sub,
  variant = 'primary',
  icon,
  trend,
  trendLabel,
  linkTo,
  className = '',
}: StatCardProps) {
  const styles = variantStyles[variant]
  const content = (
    <>
      <div className="d-flex align-items-start justify-content-between flex-grow-1 min-w-0">
        <div>
          <div className="cp-stat-label">{title}</div>
          <div className="cp-stat-value d-flex align-items-center gap-2" style={{ color: styles.value }}>
            {value}
            {trend && (
              <span className={`cp-stat-trend-${trend}`} title={trendLabel}>
                {trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
          {sub && <div className="text-muted small mt-1">{sub}</div>}
        </div>
        {icon && (
          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 48, height: 48, backgroundColor: styles.bg, color: styles.icon }}
          >
            {icon}
          </div>
        )}
      </div>
      {linkTo && (
        <span className="small mt-2 d-inline-block" style={{ color: styles.value }}>
          View details →
        </span>
      )}
    </>
  )

  const cardClass = `cp-stat-card p-4 h-100 ${className}`.trim()

  if (linkTo) {
    return (
      <Link to={linkTo} className="text-decoration-none text-dark">
        <div className={cardClass}>{content}</div>
      </Link>
    )
  }

  return <div className={cardClass}>{content}</div>
}
