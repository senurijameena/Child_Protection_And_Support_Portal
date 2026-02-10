import { Card, Container } from 'react-bootstrap'

export function SocialWorkerMessagesPage() {
  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h3 fw-700 mb-1">Messages 💬</h1>
        <p className="text-muted">Communicate securely with families and team members</p>
      </div>
      <Card className="sw-card border-0">
        <Card.Body className="p-5 text-center text-muted">
          <p className="mb-0">Messaging interface would be displayed here</p>
        </Card.Body>
      </Card>
    </Container>
  )
}
