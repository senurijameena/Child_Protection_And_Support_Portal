import { Card } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'

export function SocialWorkerProfilePage() {
  const { user } = useAuth()

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Profile</h1>
        <p className="text-muted mb-0">Your social worker profile and account details.</p>
      </div>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3">
          <h5 className="mb-0">Account Information</h5>
        </Card.Header>
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="small text-muted">Full Name</label>
              <p className="mb-0 fw-medium">{user?.fullName || '-'}</p>
            </div>
            <div className="col-md-6">
              <label className="small text-muted">Email</label>
              <p className="mb-0 fw-medium">{user?.email || '-'}</p>
            </div>
            <div className="col-md-6">
              <label className="small text-muted">Role</label>
              <p className="mb-0 fw-medium">Social Worker</p>
            </div>
            <div className="col-md-6">
              <label className="small text-muted">User ID</label>
              <p className="mb-0 small text-muted font-monospace">{user?.userId || '-'}</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-3 mt-3">
        <Card.Header className="bg-white border-0 pt-3">
          <h5 className="mb-0">Portal Access</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted small mb-0">
            Your access is restricted to social worker features only. You can view assigned help requests,
            communicate with users, create service packages, and submit completion reports. Police investigation
            details and system administration are not accessible.
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}
