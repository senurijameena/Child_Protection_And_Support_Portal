import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'

export function ForgotPasswordPage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 auth-page">
      <div className="position-absolute w-100 h-100 overflow-hidden auth-bg-shapes" aria-hidden="true" />
      <Card className="position-relative shadow-lg border-0 rounded-4 overflow-hidden auth-card login-auth-card" style={{ maxWidth: 440 }}>
        <Card.Body className="p-4 p-md-5">
          <h1 className="h3 fw-bold text-dark mb-2">Forgot Password?</h1>
          <p className="text-secondary mb-4">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
          <p className="text-muted small">
            This feature is coming soon. Please contact your administrator for password recovery.
          </p>
          <Link to="/login" className="btn btn-primary rounded-pill px-4 btn-primary-custom">
            Back to Login
          </Link>
        </Card.Body>
      </Card>
    </div>
  )
}
