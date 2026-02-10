import { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4 ${className}`.trim()}>
      <div>
        <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--cp-text)', letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
