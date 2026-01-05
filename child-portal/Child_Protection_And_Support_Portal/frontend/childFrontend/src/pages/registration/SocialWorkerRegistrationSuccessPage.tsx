import React from 'react';
import { Container, Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './SocialWorkerRegistrationSuccessPage.css';

const SocialWorkerRegistrationSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userName, licenseNumber, specializations, experience } = location.state || {};

  const userID = user?.id ? `SW-${user.id.slice(-4).toUpperCase()}` : 'SW-0000';
  const licenseDisplay = licenseNumber || 'N/A';
  const specializationsDisplay = specializations?.join(', ') || 'N/A';

  const marketplaceFeatures = [
    {
      icon: '🆘',
      title: 'Help',
      subtitle: 'Requests',
      description: 'Marketplace',
      route: '/help-requests/marketplace'
    },
    {
      icon: '💼',
      title: 'Create',
      subtitle: 'Service',
      description: 'Offers',
      route: '/services/create'
    },
    {
      icon: '📊',
      title: 'Match',
      subtitle: 'Analytics',
      description: 'View your matching rate',
      route: '/dashboard'
    },
    {
      icon: '👥',
      title: 'Network',
      subtitle: 'with Other',
      description: 'Social Workers',
      route: '/messages'
    }
  ];

  return (
    <>
      <Header />
      <div className="social-worker-registration-success-page">
        <Container className="py-5">
          <Card className="success-card shadow-lg border-0">
            <Card.Body className="p-5 text-center">
              <div className="success-icon mb-4">
                <span style={{ fontSize: '5rem' }}>🌟</span>
              </div>
              
              <h2 className="display-4 fw-bold text-success mb-3">
                WELCOME SOCIAL WORKER!
              </h2>

              <Card className="info-card mb-4">
                <Card.Body>
                  <div className="success-badges mb-3">
                    <Badge bg="success" className="me-2 mb-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Certification Verified!
                    </Badge>
                    <Badge bg="success" className="me-2 mb-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Account Auto-Approved
                    </Badge>
                    <Badge bg="success" className="mb-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Ready to Help Children in Need
                    </Badge>
                  </div>

                  <Card className="worker-info-card mb-0">
                    <Card.Body>
                      <Row className="text-start">
                        <Col md={6} className="mb-2">
                          <strong>Social Worker ID:</strong> {userID}
                        </Col>
                        <Col md={6} className="mb-2">
                          <strong>License:</strong> {licenseDisplay}
                        </Col>
                        <Col md={6} className="mb-2">
                          <strong>Specializations:</strong> {specializationsDisplay}
                        </Col>
                        <Col md={6} className="mb-2">
                          <strong>Experience:</strong> {experience || 'N/A'}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>

              <h5 className="mb-4">Marketplace Features Available:</h5>

              <Row className="g-4 mb-4">
                {marketplaceFeatures.map((feature, index) => (
                  <Col key={index} xs={6} md={3}>
                    <Card className="feature-card h-100 border-0 shadow-sm">
                      <Card.Body className="p-3 text-center">
                        <div className="feature-icon mb-2" style={{ fontSize: '2.5rem' }}>
                          {feature.icon}
                        </div>
                        <Card.Title className="h6 fw-bold mb-1">{feature.title}</Card.Title>
                        <Card.Text className="text-muted small mb-1">{feature.subtitle}</Card.Text>
                        <Card.Text className="text-muted small mb-2">{feature.description}</Card.Text>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => navigate(feature.route)}
                          className="w-100"
                        >
                          Explore
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Card className="info-alert-card mb-4">
                <Card.Body>
                  <div className="d-flex align-items-start">
                    <span className="alert-icon me-3" style={{ fontSize: '2rem' }}>💡</span>
                    <div className="text-start">
                      <strong>You will be automatically matched with help requests</strong> based on your specializations and location.
                      <br />
                      You can also browse and offer services in marketplace.
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Button
                variant="success"
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="px-5"
              >
                Proceed to Social Worker Dashboard →
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default SocialWorkerRegistrationSuccessPage;

