export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'neutral'

export interface StatusBadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function StatusBadge({ children, variant = 'neutral', className = '' }: StatusBadgeProps) {
  return <span className={`cp-badge cp-badge-${variant} ${className}`.trim()}>{children}</span>
}
