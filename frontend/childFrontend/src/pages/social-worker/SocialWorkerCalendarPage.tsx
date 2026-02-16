import { Card, Container } from 'react-bootstrap'

export function SocialWorkerCalendarPage() {
  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h3 fw-700 mb-1">Session Calendar 📅</h1>
        <p className="text-muted">Schedule and manage your visits and sessions</p>
      </div>
      <Card className="sw-card border-0">
        <Card.Body className="p-5 text-center text-muted">
          <p className="mb-0">Calendar component would be rendered here</p>
        </Card.Body>
      </Card>
    </Container>
  )
}
