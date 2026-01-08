import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleAction = () => {
    navigate('/login');
  };

  const actionCards = [
    {
      icon: '🚨',
      title: 'REPORT CASE',
      subtitle: 'Immediate Response',
      description: 'Report child welfare issues quickly and securely',
      color: 'danger'
    },
    {
      icon: '🆘',
      title: 'GET HELP',
      subtitle: 'Request Support',
      description: 'Food, Shelter, Medical Aid',
      color: 'warning'
    },
    {
      icon: '👮',
      title: 'JOIN FORCE',
      subtitle: "I'M A PROFESSIONAL",
      description: 'Police/Social Worker Portal',
      color: 'success'
    }
  ];

  return (
    <section className="hero-section" id="home">
      {}
      <div className="hero-video-background">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hero-video"
        >
          <source src="/videos/background.mp4.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay" />
      </div>

      {}
      <Container className="hero-content">
        <div className="hero-text text-center text-white">
          <h1 className="hero-title">
            PROTECTING OUR FUTURE
          </h1>
          <p className="hero-subtitle">
            Every Child Deserves Safety & Support
          </p>
        </div>

        {}
        <Row className="g-4 hero-cards-row">
          {actionCards.map((card, index) => (
            <Col key={index} lg={4} md={6} className="mb-4">
              <Card 
                className={`hero-action-card hero-card-${card.color} h-100`}
                onClick={handleAction}
              >
                <div className="hero-card-glow"></div>
                <Card.Body className="text-center p-3 position-relative">
                  <div className="hero-card-icon-wrapper mb-2">
                    <div className="hero-card-icon-bg"></div>
                    <div className="hero-card-icon">
                      <span>{card.icon}</span>
                    </div>
                  </div>
                  <Card.Title className="h5 fw-bold mb-2 hero-card-title">
                    {card.title}
                  </Card.Title>
                  <Card.Subtitle className="small mb-2 hero-card-subtitle fw-semibold">
                    {card.subtitle}
                  </Card.Subtitle>
                  <Card.Text className="mb-3 hero-card-description">
                    {card.description}
                  </Card.Text>
                  <div className="hero-card-action-btn">
                    <span>Get Started</span>
                    <i className="bi bi-arrow-right ms-2"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
