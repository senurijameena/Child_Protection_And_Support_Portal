import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [_currentSlide, _setCurrentSlide] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.warn('Video autoplay prevented:', error);
        setVideoError(true);
      });
    }
  }, []);

  const emergencyContacts = [
    {
      id: 1,
      title: 'Child Helpline',
      number: '1098',
      description: '24/7 National Emergency Child Helpline',
      icon: '📞',
      color: 'danger'
    },
    {
      id: 2,
      title: 'Women Helpline',
      number: '181',
      description: 'Women in Distress Support Line',
      icon: '👩',
      color: 'warning'
    },
    {
      id: 3,
      title: 'Police Emergency',
      number: '100',
      description: 'Police Emergency Response',
      icon: '🚔',
      color: 'primary'
    },
    {
      id: 4,
      title: 'Ambulance',
      number: '102',
      description: 'Medical Emergency Services',
      icon: '🚑',
      color: 'success'
    }
  ];

  const contactPoints = [
    {
      department: 'Case Reporting Support',
      email: 'cases@childportal.gov.in',
      phone: '+91-11-2374XXXX',
      hours: '24/7',
      description: 'For reporting child welfare cases and emergencies'
    },
    {
      department: 'Technical Support',
      email: 'support@childportal.gov.in',
      phone: '+91-11-2374XXXX',
      hours: '9:00 AM - 6:00 PM (Mon-Sat)',
      description: 'For technical issues with the portal'
    },
    {
      department: 'Police Coordination',
      email: 'police.coord@childportal.gov.in',
      phone: '+91-11-2374XXXX',
      hours: '24/7',
      description: 'For police officers and law enforcement coordination'
    },
    {
      department: 'Social Worker Support',
      email: 'social.workers@childportal.gov.in',
      phone: '+91-11-2374XXXX',
      hours: '9:00 AM - 8:00 PM',
      description: 'For registered social workers and service providers'
    },
    {
      department: 'Media & Public Relations',
      email: 'media@childportal.gov.in',
      phone: '+91-11-2374XXXX',
      hours: '10:00 AM - 5:00 PM (Mon-Fri)',
      description: 'For media inquiries and public information'
    },
    {
      department: 'Partnership & Collaboration',
      email: 'partnerships@childportal.gov.in',
      phone: '+91-11-2374XXXX',
      hours: '10:00 AM - 6:00 PM (Mon-Fri)',
      description: 'For NGOs and organization partnerships'
    }
  ];

  const regionalOffices = [
    {
      city: 'New Delhi',
      address: 'Ministry of Women and Child Development, Shastri Bhawan',
      contact: '+91-11-2374XXXX',
      jurisdiction: 'North India Region'
    },
    {
      city: 'Mumbai',
      address: 'Child Welfare Committee, Bandra East',
      contact: '+91-22-2654XXXX',
      jurisdiction: 'West India Region'
    },
    {
      city: 'Chennai',
      address: 'Social Welfare Department, Anna Salai',
      contact: '+91-44-2854XXXX',
      jurisdiction: 'South India Region'
    },
    {
      city: 'Kolkata',
      address: 'Child Rights Commission, Salt Lake',
      contact: '+91-33-2334XXXX',
      jurisdiction: 'East India Region'
    }
  ];

  return (
    <>
      <Header />
      <div className="contact-page">
        {}
        <section className="contact-hero py-5">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="mb-4 mb-lg-0">
                <h1 className="display-4 fw-bold text-primary mb-3">
                  Get in Touch
                </h1>
                <h2 className="display-6 text-warning mb-4">
                  We're Here to Help Protect Children
                </h2>
                <p className="lead mb-4">
                  Contact us for emergencies, case reporting, technical support, 
                  or collaboration opportunities. Our teams are ready to assist you.
                </p>
                
                <Alert variant="info" className="mb-4">
                  <Alert.Heading>
                    <i className="bi bi-info-circle me-2"></i>
                    Important Notice
                  </Alert.Heading>
                  <p className="mb-0">
                    For immediate child protection emergencies, use the emergency 
                    contact numbers. For non-emergency inquiries, use the departmental contacts below.
                  </p>
                </Alert>
              </Col>
              
              <Col lg={6}>
                <div className="video-container position-relative rounded-3 overflow-hidden shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="contact-video w-100"
                    poster="/images/video-poster.jpg"
                    onLoadedData={() => setVideoLoaded(true)}
                    onError={() => setVideoError(true)}
                  >
                    <source src="/videos/output_free.mp4" type="video/mp4" />
                    <source src="/videos/output_free.webm" type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {!videoLoaded && !videoError && (
                    <div className="video-loading-overlay d-flex flex-column align-items-center justify-content-center">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading video...</span>
                      </div>
                      <p className="text-white mb-0">Loading video...</p>
                    </div>
                  )}
                  
                  {videoError && (
                    <div className="video-error-overlay d-flex flex-column align-items-center justify-content-center">
                      <i className="bi bi-exclamation-triangle text-warning mb-3" style={{ fontSize: '3rem' }}></i>
                      <p className="text-white mb-0">Video unavailable. Please refresh.</p>
                    </div>
                  )}
                  
                  <div className="video-caption p-3">
                    <Badge bg="primary" className="mb-2">
                      <i className="bi bi-play-circle me-2"></i>
                      Video Presentation
                    </Badge>
                    <p className="text-white mb-0 small">
                      Watch how our platform protects children across India
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {}
        <section className="py-5 bg-danger bg-opacity-10">
          <Container>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-danger mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                24/7 Emergency Contacts
              </h2>
              <p className="lead text-muted">
                Use these numbers for immediate child protection emergencies
              </p>
            </div>
            
            <Row className="g-4">
              {emergencyContacts.map((contact) => (
                <Col lg={3} md={6} key={contact.id}>
                  <Card className="h-100 text-center border-0 shadow-sm emergency-card">
                    <Card.Body className="p-4">
                      <div className={`emergency-icon bg-${contact.color} text-white mb-3`}>
                        <span className="fs-1">{contact.icon}</span>
                      </div>
                      <Card.Title className="h4 fw-bold mb-2">
                        {contact.title}
                      </Card.Title>
                      <div className="emergency-number display-6 fw-bold text-danger mb-2">
                        {contact.number}
                      </div>
                      <Card.Text className="text-muted small">
                        {contact.description}
                      </Card.Text>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        href={`tel:${contact.number}`}
                        className="mt-2"
                      >
                        <i className="bi bi-telephone me-1"></i>
                        Call Now
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            
            <div className="text-center mt-4">
              <Alert variant="danger" className="d-inline-flex align-items-center">
                <i className="bi bi-megaphone fs-4 me-3"></i>
                <div className="text-start">
                  <strong>Remember:</strong> For immediate danger to a child, call 1098 first, then 100 for police assistance.
                </div>
              </Alert>
            </div>
          </Container>
        </section>

        {}
        <section className="py-5">
          <Container>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-primary mb-3">
                <i className="bi bi-building me-2"></i>
                Department Contacts
              </h2>
              <p className="lead text-muted">
                Contact specific departments for non-emergency inquiries
              </p>
            </div>
            
            <Row className="g-4">
              {contactPoints.map((dept, index) => (
                <Col lg={4} md={6} key={index}>
                  <Card className="h-100 border-0 shadow-sm department-card">
                    <Card.Body className="p-4">
                      <Card.Title className="h5 fw-bold text-primary mb-3">
                        {dept.department}
                      </Card.Title>
                      <div className="contact-info mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-envelope text-primary me-2"></i>
                          <a href={`mailto:${dept.email}`} className="text-decoration-none">
                            {dept.email}
                          </a>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-telephone text-primary me-2"></i>
                          <a href={`tel:${dept.phone}`} className="text-decoration-none">
                            {dept.phone}
                          </a>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-clock text-primary me-2"></i>
                          <span className="text-muted">{dept.hours}</span>
                        </div>
                      </div>
                      <Card.Text className="text-muted small">
                        {dept.description}
                      </Card.Text>
                      <div className="mt-3">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          href={`mailto:${dept.email}`}
                          className="me-2"
                        >
                          <i className="bi bi-envelope me-1"></i>
                          Email
                        </Button>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          href={`tel:${dept.phone}`}
                        >
                          <i className="bi bi-telephone me-1"></i>
                          Call
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {}
        <section className="py-5 bg-light">
          <Container>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-primary mb-3">
                <i className="bi bi-geo-alt me-2"></i>
                Regional Offices
              </h2>
              <p className="lead text-muted">
                Contact our regional offices across India
              </p>
            </div>
            
            <Row className="g-4">
              {regionalOffices.map((office, index) => (
                <Col lg={3} md={6} key={index}>
                  <Card className="h-100 border-0 shadow-sm office-card">
                    <Card.Body className="p-4">
                      <Badge bg="info" className="mb-3">
                        <i className="bi bi-geo me-1"></i>
                        {office.jurisdiction}
                      </Badge>
                      <Card.Title className="h5 fw-bold mb-3">
                        {office.city} Office
                      </Card.Title>
                      <div className="office-details">
                        <div className="d-flex align-items-start mb-3">
                          <i className="bi bi-geo-alt text-primary mt-1 me-2"></i>
                          <span className="small">{office.address}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-telephone text-primary me-2"></i>
                          <a href={`tel:${office.contact}`} className="text-decoration-none">
                            {office.contact}
                          </a>
                        </div>
                      </div>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        className="mt-3 w-100"
                        href={`https://maps.google.com/?q=${encodeURIComponent(office.address + ', ' + office.city)}`}
                        target="_blank"
                      >
                        <i className="bi bi-map me-1"></i>
                        View on Map
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {}
        <section className="py-5">
          <Container>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-primary mb-3">
                <i className="bi bi-info-circle me-2"></i>
                Additional Resources
              </h2>
              <p className="lead text-muted">
                Helpful information and support channels
              </p>
            </div>
            
            <Row className="g-4">
              <Col md={4}>
                <Card className="h-100 border-0 shadow-sm resource-card">
                  <Card.Body className="p-4 text-center">
                    <div className="resource-icon bg-primary text-white mb-3">
                      <i className="bi bi-question-circle fs-1"></i>
                    </div>
                    <Card.Title className="h5 fw-bold mb-3">
                      FAQ & Documentation
                    </Card.Title>
                    <Card.Text className="text-muted mb-4">
                      Find answers to common questions and platform documentation
                    </Card.Text>
                    <Link to="/faq" className="btn btn-outline-primary">
                      <i className="bi bi-journal-text me-1"></i>
                      Visit FAQ
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4}>
                <Card className="h-100 border-0 shadow-sm resource-card">
                  <Card.Body className="p-4 text-center">
                    <div className="resource-icon bg-success text-white mb-3">
                      <i className="bi bi-download fs-1"></i>
                    </div>
                    <Card.Title className="h5 fw-bold mb-3">
                      Download Resources
                    </Card.Title>
                    <Card.Text className="text-muted mb-4">
                      Download guidelines, reporting forms, and educational materials
                    </Card.Text>
                    <Button variant="outline-success" disabled>
                      <i className="bi bi-cloud-download me-1"></i>
                      Coming Soon
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4}>
                <Card className="h-100 border-0 shadow-sm resource-card">
                  <Card.Body className="p-4 text-center">
                    <div className="resource-icon bg-warning text-white mb-3">
                      <i className="bi bi-newspaper fs-1"></i>
                    </div>
                    <Card.Title className="h5 fw-bold mb-3">
                      Updates & News
                    </Card.Title>
                    <Card.Text className="text-muted mb-4">
                      Stay updated with the latest news and platform updates
                    </Card.Text>
                    <Button variant="outline-warning" disabled>
                      <i className="bi bi-rss me-1"></i>
                      Subscribe to Updates
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {}
        <section className="py-5 bg-warning bg-opacity-10">
          <Container>
            <Alert variant="warning" className="text-center">
              <Alert.Heading className="d-flex align-items-center justify-content-center">
                <i className="bi bi-exclamation-octagon me-2 fs-4"></i>
                Important Legal Notice
              </Alert.Heading>
              <p>
                All communications through this portal are confidential and protected under 
                the Protection of Children from Sexual Offences (POCSO) Act, 2012, and 
                Juvenile Justice (Care and Protection of Children) Act, 2015. False reporting 
                may lead to legal consequences.
              </p>
              <hr />
              <p className="mb-0">
                This platform is maintained by the Ministry of Women and Child Development, 
                Government of India.
              </p>
            </Alert>
          </Container>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;