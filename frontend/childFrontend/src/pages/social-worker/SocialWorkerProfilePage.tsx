import { Card, Container, Row, Col, Button, Form } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'

export function SocialWorkerProfilePage() {
  const { user } = useAuth()

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h3 fw-700 mb-1">My Profile 👤</h1>
        <p className="text-muted">Manage your professional information and preferences</p>
      </div>
      <Row className="g-4">
        <Col xs={12} lg={8}>
          <Card className="sw-card border-0">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Personal Information</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control defaultValue={user?.fullName} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control defaultValue={user?.email} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Professional ID</Form.Label>
                <Form.Control defaultValue={user?.userId?.slice(0, 8)} disabled />
              </Form.Group>
              <Button variant="primary">Edit Profile</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="sw-card border-0">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Quick Settings</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Button variant="outline-secondary" className="w-100 mb-2">Security Settings</Button>
                <Button variant="outline-secondary" className="w-100 mb-2">Notifications</Button>
                <Button variant="outline-secondary" className="w-100">Help & Support</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
