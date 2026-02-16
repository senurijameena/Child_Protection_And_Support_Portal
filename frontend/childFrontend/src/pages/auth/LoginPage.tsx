import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Form, Button, Card } from 'react-bootstrap'
import { login } from '../../services/authApi'
import { ROLE_LABELS } from '../../types/auth'
import type { Role } from '../../types/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const goBack = () => navigate(-1)

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    setLoading(true)
    try {
      const res = await login({ email: email.trim(), password })
      if (res.approved && res.token) {
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify({
          userId: res.userId,
          email: res.email,
          fullName: res.fullName,
          role: res.role,
        }))
        const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
        const target =
          res.role === 'ADMIN'
            ? '/admin'
            : res.role === 'PO'
              ? '/police'
              : res.role === 'SW'
                ? '/social-worker'
                : res.role === 'PU'
                  ? '/dashboard'
                  : from || '/'
        navigate(target)
        window.location.reload()
      } else {
        setError(res.message || 'Login failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const roles: Role[] = ['PU', 'PO', 'SW', 'ADMIN']

  return (
    <div className="login-split">
      <button
        type="button"
        onClick={goBack}
        className="btn btn-link login-back-btn"
        aria-label="Go back"
      >
        ← Back
      </button>

      <div className="login-left" aria-hidden="true">
        <div className="login-left-overlay" />
        <div className="login-left-content">
          <img src="/images/logo.jpeg" alt="Child Portal logo" className="login-left-logo" />
          <h2>Child Protection Portal</h2>
          <p>Secure access for social workers, police, administrators, and families.</p>
        </div>
      </div>

      <div className="login-right">
        <Card className="shadow-lg border-0 rounded-4 overflow-hidden auth-card w-100">
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold text-dark mb-1">Welcome Back</h1>
              <p className="text-secondary small">Sign in to the Child Protection Portal</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                {error}
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="login-email">Email</Form.Label>
                <Form.Control
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  className="auth-input"
                  autoComplete="email"
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="login-password">Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    className="auth-input pe-5"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y me-2 px-1 text-muted"
                    style={{ textDecoration: 'none' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span aria-hidden="true">👁</span>
                  </button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="login-role">Login as</Form.Label>
                <Form.Select
                  id="login-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role | '')}
                  className="auth-input"
                >
                  <option value="">Auto-detect</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="d-flex justify-content-end mb-3">
                <Link to="/forgot-password" className="small text-primary text-decoration-none">
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2 rounded-pill fw-semibold btn-primary-custom"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Log In'}
              </Button>
            </Form>

            <div className="mt-4 pt-3 border-top">
              <p className="text-center text-muted small mb-2">Or continue with</p>
              <div className="d-flex gap-2 justify-content-center">
                <Button variant="outline-secondary" size="sm" className="rounded-pill flex-grow-1" disabled>
                  Google
                </Button>
                <Button variant="outline-secondary" size="sm" className="rounded-pill flex-grow-1" disabled>
                  Facebook
                </Button>
              </div>
            </div>

            <p className="text-center text-secondary small mt-4 mb-0">
              Don&apos;t have an account? <Link to="/signup" className="text-primary fw-medium">Sign up</Link>
            </p>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}
