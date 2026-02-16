import { useAuth } from '../../hooks/useAuth'
import { Card } from 'react-bootstrap'

export function PoliceProfilePage() {
  const { user } = useAuth()

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Profile</h1>
        <p className="text-muted mb-0">
          Your police station account details.
        </p>
      </div>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Name:</strong> {user?.fullName || '-'}</p>
              <p><strong>Email:</strong> {user?.email || '-'}</p>
              <p><strong>Role:</strong> Police Officer</p>
            </div>
            <div className="col-md-6">
              <p className="text-muted small mb-0">
                Profile updates and badge details are managed through your station administrator.
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
