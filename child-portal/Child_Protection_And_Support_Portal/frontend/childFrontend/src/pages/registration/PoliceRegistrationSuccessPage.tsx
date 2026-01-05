import React from 'react';
import { Container, Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './PoliceRegistrationSuccessPage.css';

const PoliceRegistrationSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userName, badgeNumber, station, rank } = location.state || {};

  const userID = user?.id ? `PO-${user.id.slice(-4).toUpperCase()}` : 'PO-0000';
  const badgeDisplay = badgeNumber || 'N/A';

  const dashboardFeatures = [
    {
      icon: '📋',
      title: 'Cases',
      subtitle: 'Assigned',
      description: '0 cases pending',
      route: '/dashboard'
    },
    {
      icon: '🚨',
      title: 'Alerts',
      subtitle: '& Emergencies',
      description: '0 active',
      route: '/dashboard'
    },
    {
      icon: '📊',
      title: 'Analytics',
      subtitle: '& Reports',
      description: 'View performance',
      route: '/dashboard'
    },
    {
      icon: '👥',
      title: 'Team',
      subtitle: 'Chat',
      description: 'Message colleagues',
      route: '/messages'
    }
  ];

  return (
    <>
      <Header />
      <div className="police-registration-success-page">
        <Container className="py-5">
          <Card className="success-card shadow-lg border-0">
            <Card.Body className="p-5 text-center">
              <div className="success-icon mb-4">
                <span style={{ fontSize: '5rem' }}>🎖️</span>
              </div>
              
              <h2 className="display-4 fw-bold text-danger mb-3">
                WELCOME OFFICER!
              </h2>

              <Card className="info-card mb-4">
                <Card.Body>
                  <div className="success-badges mb-3">
                    <Badge bg="success" className="me-2 mb-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Identity Verified Successfully!
                    </Badge>
                    <Badge bg="success" className="me-2 mb-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Account Auto-Approved
                    </Badge>
                    <Badge bg="success" className="mb-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Immediate Access Granted
                    </Badge>
                  </div>

                  <Card className="officer-info-card mb-0">
                    <Card.Body>
                      <Row className="text-start">
                        <Col md={6} className="mb-2">
                          <strong>Police Officer ID:</strong> {userID}
                        </Col>
                        <Col md={6} className="mb-2">
                          <strong>Badge:</strong> {badgeDisplay}
                        </Col>
                        <Col md={6} className="mb-2">
                          <strong>Station:</strong> {station || 'N/A'}
                        </Col>
                        <Col md={6} className="mb-2">
                          <strong>Rank:</strong> {rank || 'N/A'}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>

              <h5 className="mb-4">Dashboard Features Available Immediately:</h5>

              <Row className="g-4 mb-4">
                {dashboardFeatures.map((feature, index) => (
                  <Col key={index} xs={6} md={3}>
                    <Card className="feature-card h-100 border-0 shadow-sm">
                      <Card.Body className="p-3 text-center">
                        <div className="feature-icon mb-2" style={{ fontSize: '2.5rem' }}>
                          {feature.icon}
                        </div>
                        <Card.Title className="h6 fw-bold mb-1">{feature.title}</Card.Title>
                        <Card.Text className="text-muted small mb-1">{feature.subtitle}</Card.Text>
                        <Card.Text className="text-muted small mb-0">{feature.description}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Card className="info-alert-card mb-4">
                <Card.Body>
                  <div className="d-flex align-items-start">
                    <span className="alert-icon me-3" style={{ fontSize: '2rem' }}>🚨</span>
                    <div className="text-start">
                      <strong>You will receive case assignments automatically</strong> when citizens report emergencies.
                      <br />
                      Set your availability status in profile.
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Button
                variant="danger"
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="px-5"
              >
                Proceed to Police Dashboard →
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default PoliceRegistrationSuccessPage;

