import { Card, Container, ListGroup, Badge } from 'react-bootstrap'

export function SocialWorkerFollowUpsPage() {
  const followUps = [
    { id: 1, title: 'Thompson Family Check-in', date: 'Today 2:00 PM', status: 'Due' },
    { id: 2, title: 'Case Review Meeting', date: 'Tomorrow 10:00 AM', status: 'Scheduled' },
    { id: 3, title: 'Home Visit Follow-up', date: 'In 3 days', status: 'Planned' },
  ]

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h3 fw-700 mb-1">Follow-ups ⏰</h1>
        <p className="text-muted">Track your follow-up activities and reminders</p>
      </div>
      <Card className="sw-card border-0">
        <Card.Body className="p-0">
          <ListGroup variant="flush">
            {followUps.map(fu => (
              <ListGroup.Item key={fu.id} className="py-3 px-4 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-700 mb-1">{fu.title}</h6>
                  <small className="text-muted">{fu.date}</small>
                </div>
                <Badge bg={fu.status === 'Due' ? 'danger' : fu.status === 'Scheduled' ? 'success' : 'info'}>
                  {fu.status}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  )
}
