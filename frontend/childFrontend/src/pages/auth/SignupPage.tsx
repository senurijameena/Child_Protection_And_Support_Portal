import { Link } from 'react-router-dom'
import { SignupForm } from '../../components/auth/SignupForm'

export function SignupPage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 auth-page">
      <div className="position-absolute w-100 h-100 overflow-hidden auth-bg-shapes" aria-hidden="true" />
      <div className="position-relative w-100 px-3" style={{ maxWidth: 520 }}>
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-block mb-3">
            <img
              src="/images/logo.jpeg"
              alt="Logo"
              className="logo-navbar"
              style={{ height: 36, width: 'auto' }}
            />
          </Link>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
