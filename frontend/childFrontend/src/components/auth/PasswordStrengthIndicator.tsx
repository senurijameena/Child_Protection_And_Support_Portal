import { useMemo } from 'react'

export type Strength = 'weak' | 'fair' | 'good' | 'strong'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

export function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const { label, width, color } = useMemo(() => {
    if (!password) return { label: '', width: 0, color: '#ef4444' }
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    if (password.length < 6) score = 0

    const s: Strength =
      score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 4 ? 'good' : 'strong'
    const labels: Record<Strength, string> = {
      weak: 'Weak',
      fair: 'Fair',
      good: 'Good',
      strong: 'Strong',
    }
    const widths: Record<Strength, number> = {
      weak: 25,
      fair: 50,
      good: 75,
      strong: 100,
    }
    const colors: Record<Strength, string> = {
      weak: '#ef4444',
      fair: '#f59e0b',
      good: '#22c55e',
      strong: '#10b981',
    }
    return {
      label: labels[s],
      width: widths[s],
      color: colors[s],
    }
  }, [password])

  if (!password) return null

  return (
    <div className={className}>
      <div
        className="rounded-pill overflow-hidden"
        style={{ height: 4, backgroundColor: 'var(--accent-light-blue, #e0f2fe)' }}
      >
        <div
          className="h-100 transition-all"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
        Password strength: <span style={{ color }}>{label}</span>
      </small>
    </div>
  )
}
