import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './RegistrationSuccessPage.css';

const RegistrationSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userName } = location.state || {};

  const userID = user?.id ? `PU-${user.id.slice(-6).toUpperCase()}` : 'PU-000000';
  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const quickActions = [
    {
      icon: '🚨',
      title: 'REPORT A CASE',
      description: 'File immediate report',
      route: '/report-case'
    },
    {
      icon: '🆘',
      title: 'REQUEST HELP',
      description: 'Seek assistance for a child in need',
      route: '/request-help'
    },
    {
      icon: '🎯',
      title: 'EXPLORE DASHBOARD',
      description: 'View your portal',
      route: '/my-cases'
    }
  ];

  return (
    <>
      <Header />
      <div className="registration-success-page">
        <Container className="py-5">
          <Card className="success-card shadow-lg border-0">
            <Card.Body className="p-5 text-center">
              <div className="success-icon mb-4">
                <span style={{ fontSize: '5rem' }}>🎉</span>
              </div>
              
              <h2 className="display-4 fw-bold text-success mb-3">
                ACCOUNT CREATED SUCCESSFULLY!
              </h2>

              <Card className="info-card mb-4">
                <Card.Body>
                  <div className="success-badges mb-3">
                    <span className="badge bg-success me-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Your account is ready to use!
                    </span>
                    <span className="badge bg-success me-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Auto-approved - No waiting period
                    </span>
                    <span className="badge bg-success">
                      <i className="bi bi-check-circle me-1"></i>
                      Immediate access to all features
                    </span>
                  </div>

                  <Card className="user-info-card mb-0">
                    <Card.Body>
                      <h5 className="fw-bold mb-3">Welcome, {userName || 'User'}!</h5>
                      <Row className="text-start">
                        <Col md={6} className="mb-2">
                          <strong>User ID:</strong> {userID}
                        </Col>
                        <Col md={6} className="mb-2">
                          <strong>Email:</strong> {user?.email || 'N/A'}
                        </Col>
                        <Col md={12}>
                          <strong>Joined:</strong> {currentTime}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>

              <h5 className="mb-4">What would you like to do first?</h5>

              <Row className="g-4 mb-4">
                {quickActions.map((action, index) => (
                  <Col key={index} xs={12} md={4}>
                    <Card className="action-card h-100 border-0 shadow-sm">
                      <Card.Body className="p-4 text-center">
                        <div className="action-icon mb-3" style={{ fontSize: '3rem' }}>
                          {action.icon}
                        </div>
                        <Card.Title className="h6 fw-bold mb-2">{action.title}</Card.Title>
                        <Card.Text className="text-muted small mb-3">
                          {action.description}
                        </Card.Text>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(action.route)}
                          className="w-100"
                        >
                          → {action.route}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Card className="tips-card mb-4">
                <Card.Body>
                  <h6 className="fw-bold mb-3">
                    <span style={{ fontSize: '1.5rem' }}>💡</span> Quick Tips:
                  </h6>
                  <ul className="text-start mb-0">
                    <li>Save emergency button to home screen</li>
                    <li>Enable notifications for urgent alerts</li>
                    <li>Complete your profile for better assistance</li>
                  </ul>
                </Card.Body>
              </Card>

              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/my-cases')}
                className="px-5"
              >
                Proceed to Dashboard →
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default RegistrationSuccessPage;

