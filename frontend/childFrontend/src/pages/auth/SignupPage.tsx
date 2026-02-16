import { Link } from 'react-router-dom'
import { SignupForm } from '../../components/auth/SignupForm'

export function SignupPage() {
  return (
    <div className="min-vh-100 auth-page signup-upgraded-wrap">
      <div className="position-absolute w-100 h-100 overflow-hidden auth-bg-shapes" aria-hidden="true" />
      <div className="container py-4 py-lg-5 position-relative">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-5 d-none d-lg-block">
            <div className="signup-visual-panel h-100 rounded-4 p-4 p-xl-5">
              <Link to="/" className="d-inline-block mb-4 text-decoration-none text-white">
                <img
                  src="/images/logo.jpeg"
                  alt="Logo"
                  className="logo-navbar"
                  style={{ height: 36, width: 'auto' }}
                />
              </Link>
              <h2 className="fw-bold mb-3">Join the Child Protection Network</h2>
              <p className="mb-4 text-white-50">
                Register to report, coordinate, and deliver timely support with secure workflows.
              </p>
              <div className="signup-visual-list">
                <div className="signup-visual-item">Guided onboarding for each role</div>
                <div className="signup-visual-item">Secure document verification</div>
                <div className="signup-visual-item">Collaborative case communication</div>
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="w-100 px-0 px-lg-2">
              <div className="text-center mb-4 d-lg-none">
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
        </div>
      </div>
    </div>
  )
}
