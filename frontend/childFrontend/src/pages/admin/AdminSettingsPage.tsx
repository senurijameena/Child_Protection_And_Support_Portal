import { Card } from 'react-bootstrap'

export function AdminSettingsPage() {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Settings</h1>
        <p className="text-muted mb-0">System configuration</p>
      </div>
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-4">
          <p className="text-muted mb-0">Settings page – configuration options can be added here.</p>
        </Card.Body>
      </Card>
    </div>
  )
}
