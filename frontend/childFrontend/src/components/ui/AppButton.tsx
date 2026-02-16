import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

export interface AppButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant
  loading?: boolean
  children: ReactNode
  className?: string
  as?: 'button' | 'submit'
}

const baseClass = 'btn border-0 px-4 py-2 rounded fw-semibold transition-all d-inline-flex align-items-center justify-content-center gap-2'
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'cp-btn-primary',
  secondary: 'cp-btn-secondary',
  danger: 'cp-btn-danger',
  ghost: 'bg-transparent text-dark border',
}

export function AppButton({
  variant = 'primary',
  loading,
  children,
  className = '',
  as = 'button',
  type = 'button',
  disabled,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || loading
  return (
    <button
      type={as === 'submit' ? 'submit' : type}
      className={`${baseClass} ${variantClasses[variant]} ${className}`.trim()}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <>
          <span className="cp-spinner-dots" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="visually-hidden">Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
