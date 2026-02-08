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
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 auth-page">
      <div className="position-absolute w-100 h-100 overflow-hidden auth-bg-shapes" aria-hidden="true" />
      <div className="position-relative w-100" style={{ maxWidth: 440 }}>
        <Card className="shadow-lg border-0 rounded-4 overflow-hidden auth-card">
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4">
              <img
                src="/images/logo.jpeg"
                alt="Logo"
                className="logo-navbar mb-3"
                style={{ height: 40, width: 'auto' }}
              />
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
                <Form.Control
                  id="login-password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="auth-input"
                  autoComplete="current-password"
                />
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
