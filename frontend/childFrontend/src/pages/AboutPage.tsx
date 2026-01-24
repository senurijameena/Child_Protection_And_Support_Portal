
import React from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Accordion
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/LandingHeader';
import Footer from '../components/LandingFooter';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const missionValues = [
    {
      icon: '🎯',
      title: 'Our Mission',
      description: 'To create a secure platform connecting vulnerable children with protection services through technology-driven solutions.',
      color: 'primary'
    },
    {
      icon: '👁️',
      title: 'Our Vision',
      description: 'A society where every child is protected, heard, and supported through a robust digital ecosystem of care.',
      color: 'success'
    },
    {
      icon: '💖',
      title: 'Our Values',
      description: 'Compassion, Integrity, Confidentiality, Collaboration, and Accountability guide every action we take.',
      color: 'danger'
    }
  ];

  const keyFeatures = [
    {
      title: '24/7 Emergency Reporting',
      description: 'Instant case reporting system with real-time tracking and emergency response coordination.',
      icon: '🚨'
    },
    {
      title: 'Multi-Role Collaboration',
      description: 'Seamless coordination between Public Users, Police Officers, Social Workers, and Administrators.',
      icon: '🤝'
    },
    {
      title: 'Case Management',
      description: 'Comprehensive tracking from report to resolution with status updates and documentation.',
      icon: '📋'
    },
    {
      title: 'Service Coordination',
      description: 'Matching children in need with appropriate social services and support programs.',
      icon: '🎗️'
    },
    {
      title: 'Feedback & Transparency',
      description: 'Anonymous feedback system and transparent progress tracking for all stakeholders.',
      icon: '💬'
    },
    {
      title: 'Data Security',
      description: 'Military-grade encryption and strict privacy controls to protect sensitive information.',
      icon: '🔒'
    }
  ];

  const faqs = [
    {
      question: 'Who can use this portal?',
      answer: 'The portal is designed for four main user groups: General Public (to report cases), Police Officers (to investigate cases), Social Workers (to provide services), and Administrators (to manage the system).'
    },
    {
      question: 'Is my information secure?',
      answer: 'Yes. We use end-to-end encryption, secure servers, and comply with all data protection regulations. Personal information is only shared with authorized personnel on a need-to-know basis.'
    },
    {
      question: 'How are emergency cases handled?',
      answer: 'Emergency reports trigger immediate alerts to the nearest police station and child welfare committee. Response teams are dispatched within 30 minutes in urban areas and 60 minutes in rural areas.'
    },
    {
      question: 'Can I track my reported case?',
      answer: 'Yes. Once you report a case, you receive a tracking ID. You can log in to your dashboard to see real-time updates, assigned officers, and progress status.'
    },
    {
      question: 'What happens after I submit a report?',
      answer: 'Reports are reviewed within 2 hours. Valid cases are assigned to police officers for investigation. You will receive notifications at each stage: review, investigation, resolution.'
    },
    {
      question: 'How can I become a social worker on this platform?',
      answer: 'Qualified social workers can register through our verification process. You will need to provide professional credentials, which are verified by our admin team before account activation.'
    }
  ];

  return (
    <>
      <Header />
      <div className="about-page">
        { }
        <section className="about-hero py-5">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="mb-4 mb-lg-0">
                <h1 className="display-4 fw-bold text-primary mb-4">
                  Protecting Childhood,
                  <span className="d-block text-warning">Building Futures</span>
                </h1>
                <p className="lead mb-4">
                  The Child Protection Portal is a comprehensive digital platform
                  connecting vulnerable children with protection services, law enforcement,
                  and social support systems across India.
                </p>
                <div className="d-flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/register/public')}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Join Our Mission
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => navigate('/login')}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </Button>
                </div>
              </Col>
              <Col lg={6}>
                <div className="about-hero-image position-relative">
                  { }
                  <img
                    src="/images/about.jpg"  // Updated path
                    alt="Child Protection Platform Team"
                    className="img-fluid rounded-3 shadow-lg border"
                    style={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                    onError={(e) => {

                      console.error('Image failed to load:', e);
                      (e.target as HTMLImageElement).src = '/images/about-placeholder.png';
                      (e.target as HTMLImageElement).style.objectFit = 'contain';
                      (e.target as HTMLImageElement).style.padding = '20px';
                    }}
                  />
                  <div className="image-badge">
                    <Badge bg="success" className="fs-6 p-3 shadow">
                      <i className="bi bi-shield-check me-2"></i>
                      Government Verified Platform
                    </Badge>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        { }
        <section className="py-5 bg-light">
          <Container>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-primary mb-3">
                <i className="bi bi-stars me-2"></i>
                Our Guiding Principles
              </h2>
              <p className="lead text-muted">
                Driven by compassion, powered by technology, dedicated to child safety
              </p>
            </div>
            <Row>
              {missionValues.map((item, index) => (
                <Col lg={4} md={6} className="mb-4" key={index}>
                  <Card className="h-100 border-0 shadow-sm text-center mission-card">
                    <Card.Body className="p-4">
                      <div className={`mission-icon bg-${item.color} text-white`}>
                        <span className="fs-1">{item.icon}</span>
                      </div>
                      <Card.Title className="h4 fw-bold mt-4 mb-3">
                        {item.title}
                      </Card.Title>
                      <Card.Text className="text-muted">
                        {item.description}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        { }
        <section className="py-5">
          <Container>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-primary mb-3">
                <i className="bi bi-lightning-charge me-2"></i>
                Platform Features
              </h2>
              <p className="lead text-muted">
                Comprehensive tools for effective child protection
              </p>
            </div>
            <Row>
              {keyFeatures.map((feature, index) => (
                <Col lg={4} md={6} className="mb-4" key={index}>
                  <Card className="h-100 border-0 shadow-sm feature-card">
                    <Card.Body className="p-4">
                      <div className="feature-icon mb-3">
                        <span className="fs-1">{feature.icon}</span>
                      </div>
                      <Card.Title className="h5 fw-bold mb-3">
                        {feature.title}
                      </Card.Title>
                      <Card.Text className="text-muted">
                        {feature.description}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        { }
        <section className="py-5 bg-light">
          <Container>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-primary mb-3">
                <i className="bi bi-people me-2"></i>
                Who Uses This Platform?
              </h2>
              <p className="lead text-muted">
                A collaborative ecosystem for child protection
              </p>
            </div>
            <Row>
              <Col lg={3} md={6} className="mb-4">
                <Card className="h-100 text-center border-0 shadow-sm role-card">
                  <Card.Body className="p-4">
                    <div className="role-icon bg-primary text-white mb-3">
                      <i className="bi bi-people fs-1"></i>
                    </div>
                    <Card.Title className="h5 fw-bold mb-2">Public Users</Card.Title>
                    <Card.Text className="text-muted small">
                      Report cases, request help, track progress, and provide feedback
                    </Card.Text>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate('/register/public')}
                    >
                      Register as Public User
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <Card className="h-100 text-center border-0 shadow-sm role-card">
                  <Card.Body className="p-4">
                    <div className="role-icon bg-danger text-white mb-3">
                      <i className="bi bi-shield fs-1"></i>
                    </div>
                    <Card.Title className="h5 fw-bold mb-2">Police Officers</Card.Title>
                    <Card.Text className="text-muted small">
                      Investigate cases, coordinate response, and maintain law enforcement records
                    </Card.Text>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate('/register/police')}
                    >
                      Register as Police Officer
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <Card className="h-100 text-center border-0 shadow-sm role-card">
                  <Card.Body className="p-4">
                    <div className="role-icon bg-success text-white mb-3">
                      <i className="bi bi-heart fs-1"></i>
                    </div>
                    <Card.Title className="h5 fw-bold mb-2">Social Workers</Card.Title>
                    <Card.Text className="text-muted small">
                      Provide counseling, rehabilitation, and support services to children
                    </Card.Text>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate('/register/social-worker')}
                    >
                      Register as Social Worker
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <Card className="h-100 text-center border-0 shadow-sm role-card">
                  <Card.Body className="p-4">
                    <div className="role-icon bg-warning text-white mb-3">
                      <i className="bi bi-gear fs-1"></i>
                    </div>
                    <Card.Title className="h5 fw-bold mb-2">Administrators</Card.Title>
                    <Card.Text className="text-muted small">
                      Manage users, monitor system performance, and ensure platform security
                    </Card.Text>
                    <div className="mt-3">
                      <Badge bg="warning" text="dark">
                        By Invitation Only
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        { }
        <section className="py-5">
          <Container>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-primary mb-3">
                <i className="bi bi-question-circle me-2"></i>
                Frequently Asked Questions
              </h2>
              <p className="lead text-muted">
                Common questions about using our platform
              </p>
            </div>
            <Row>
              <Col lg={8} className="mx-auto">
                <Accordion>
                  {faqs.map((faq, index) => (
                    <Accordion.Item eventKey={index.toString()} key={index}>
                      <Accordion.Header>
                        <span className="fw-bold">{faq.question}</span>
                      </Accordion.Header>
                      <Accordion.Body>
                        {faq.answer}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
                <div className="text-center mt-4">
                  <p className="text-muted">
                    Still have questions?{' '}
                    <Link to="/login" className="text-decoration-none fw-bold">
                      Contact our support team
                    </Link>
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        { }
        <section className="py-5 cta-section">
          <Container>
            <Row className="align-items-center">
              <Col lg={8} className="mb-4 mb-lg-0">
                <h2 className="display-6 fw-bold text-white mb-3">
                  Ready to Make a Difference?
                </h2>
                <p className="lead text-white-50 mb-0">
                  Join our collaborative network protecting children across India
                </p>
              </Col>
              <Col lg={4} className="text-lg-end">
                <Button
                  variant="warning"
                  size="lg"
                  className="px-5 py-3 fw-bold"
                  onClick={() => navigate('/register/public')}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Join the Movement
                </Button>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;