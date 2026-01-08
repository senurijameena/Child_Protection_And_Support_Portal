import React from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './RegistrationOptionsPage.css';

const RegistrationOptionsPage: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'public',
      icon: '👨‍👩‍👧‍👦',
      title: 'PUBLIC USER',
      subtitle: 'I want to:',
      features: [
        'Report cases',
        'Request help',
        'Help others',
        'Track cases'
      ],
      buttonText: 'JOIN AS PUBLIC',
      buttonVariant: 'primary',
      route: '/register/public'
    },
    {
      id: 'police',
      icon: '👮‍♂️',
      title: 'POLICE OFFICER',
      subtitle: 'I am a:',
      features: [
        'Police officer',
        'Law enforcement',
        'Investigator'
      ],
      buttonText: 'JOIN AS POLICE',
      buttonVariant: 'danger',
      route: '/register/police'
    },
    {
      id: 'social-worker',
      icon: '🏥',
      title: 'SOCIAL WORKER',
      subtitle: 'I am a:',
      features: [
        'Social worker',
        'Counselor',
        'NGO staff',
        'Therapist'
      ],
      buttonText: 'JOIN AS SOCIAL WORKER',
      buttonVariant: 'success',
      route: '/register/social-worker'
    }
  ];

  const comparisonData = [
    {
      feature: 'Report Cases',
      public: '✅ Yes',
      police: '✅ Yes',
      socialWorker: '✅ Yes'
    },
    {
      feature: 'View Cases',
      public: '✅ Own only',
      police: '✅ Assigned',
      socialWorker: '❌ No'
    },
    {
      feature: 'Assign Cases',
      public: '❌ No',
      police: '✅ Yes',
      socialWorker: '❌ No'
    },
    {
      feature: 'Help Market',
      public: '✅ Yes',
      police: '❌ No',
      socialWorker: '✅ Yes'
    },
    {
      feature: 'Dashboard',
      public: '✅ Basic',
      police: '✅ Advanced',
      socialWorker: '✅ Professional'
    },
    {
      feature: 'Analytics',
      public: '✅ Personal',
      police: '✅ Performance',
      socialWorker: '✅ Workload'
    },
    {
      feature: 'Verification',
      public: '❌ Not required',
      police: '✅ ID Required',
      socialWorker: '✅ Cert Required'
    }
  ];

  return (
    <>
      <Header />
      <div className="registration-options-page">
        <Container className="py-5">
          {}
          <div className="mb-4">
            <Button 
              variant="outline-primary" 
              onClick={() => navigate('/')}
              className="back-to-home-btn"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to home
            </Button>
          </div>

          {}
          <Card className="main-content-card shadow-lg border-0">
            <Card.Body className="p-5">
              {}
              <div className="text-center mb-5">
                <h1 className="display-4 fw-bold text-primary mb-3">
                  CHOOSE YOUR ROLE IN CHILD PROTECTION
                </h1>
                <p className="lead text-muted">
                  How do you want to contribute to protecting children?
                </p>
              </div>

              {}
              <Row className="g-4 mb-5">
                {roles.map((role, index) => (
                  <Col key={role.id} xs={12} md={4} className="role-col">
                    <Card className="h-100 role-card border-0 shadow">
                      <Card.Body className="p-4 text-center">
                        <div className="role-icon mb-3" style={{ fontSize: '4rem' }}>
                          {role.icon}
                        </div>
                        <Card.Title className="h4 fw-bold mb-2">{role.title}</Card.Title>
                        <Card.Subtitle className="text-muted mb-3 small">
                          {role.subtitle}
                        </Card.Subtitle>
                        <ul className="list-unstyled text-start mb-3 role-features">
                          {role.features.map((feature, idx) => (
                            <li key={idx} className="mb-2">
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant={role.buttonVariant as any}
                          size="lg"
                          className="w-100 role-button"
                          onClick={() => navigate(role.route)}
                        >
                          {role.buttonText}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {}
              <div className="text-center mb-5 animated-arrows">
                <i className="bi bi-arrow-right text-primary" style={{ fontSize: '2rem', margin: '0 1rem' }}></i>
                <i className="bi bi-arrow-right text-primary" style={{ fontSize: '2rem', margin: '0 1rem' }}></i>
              </div>

              {}
              <Card className="comparison-card border-0 shadow mb-4">
                <Card.Body className="p-4">
                  <h3 className="text-center fw-bold mb-4">COMPARISON TABLE</h3>
                  <div className="table-responsive">
                    <Table striped bordered hover className="comparison-table">
                      <thead>
                        <tr>
                          <th className="fw-bold">FEATURE</th>
                          <th className="fw-bold text-center">PUBLIC USER</th>
                          <th className="fw-bold text-center">POLICE OFFICER</th>
                          <th className="fw-bold text-center">SOCIAL WORKER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.map((row, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">{row.feature}</td>
                            <td className="text-center">{row.public}</td>
                            <td className="text-center">{row.police}</td>
                            <td className="text-center">{row.socialWorker}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

              {}
              <div className="text-center">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none fw-bold"
                    onClick={() => navigate('/login')}
                  >
                    LOGIN HERE
                  </Button>
                  {' → '}
                  <span className="text-muted">/login</span>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default RegistrationOptionsPage;

