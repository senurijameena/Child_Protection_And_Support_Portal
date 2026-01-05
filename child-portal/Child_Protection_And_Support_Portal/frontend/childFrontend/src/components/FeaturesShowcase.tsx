import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './FeaturesShowcase.css';

const FeaturesShowcase: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '📱',
      title: 'Easy Reporting',
      description: '3-step process < 5 min',
      subtitle: 'Simple and quick'
    },
    {
      icon: '🕵️',
      title: 'Smart Matching',
      description: 'Auto-assign to best available',
      subtitle: 'Intelligent allocation'
    },
    {
      icon: '👥',
      title: 'Multi-Agency Coordination',
      description: 'Police, Social Workers, NGOs',
      subtitle: 'Seamless collaboration'
    },
    {
      icon: '📊',
      title: 'Real-time Tracking',
      description: 'Live updates & alerts',
      subtitle: 'Stay informed'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Encrypted data, anonymous option',
      subtitle: 'Your privacy matters'
    },
    {
      icon: '📈',
      title: 'Analytics & Insights',
      description: 'Detailed reports, trends analysis',
      subtitle: 'Data-driven decisions'
    },
    {
      icon: '🎯',
      title: 'Targeted Help Matching',
      description: 'Connect needs to services',
      subtitle: 'Right help, right time'
    },
    {
      icon: '🌐',
      title: 'Multi-lingual Support',
      description: '5+ languages',
      subtitle: 'Accessible to all'
    }
  ];

  return (
    <section className="features-showcase py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-primary mb-3">
            🚀 KEY FEATURES
          </h2>
        </div>

        <Row className="g-4">
          {features.map((feature, index) => (
            <Col key={index} lg={3} md={4} sm={6}>
              <Card className="h-100 border-0 shadow-sm feature-card text-center">
                <Card.Body className="p-4">
                  <div className="feature-icon mb-3">
                    <span className="display-4">{feature.icon}</span>
                  </div>
                  <Card.Title className="h6 fw-bold mb-2">
                    {feature.title}
                  </Card.Title>
                  <Card.Text className="text-muted small mb-2">
                    {feature.description}
                  </Card.Text>
                  <Card.Text className="text-primary small fw-semibold">
                    {feature.subtitle}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-5">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/features')}
            className="px-5"
          >
            EXPLORE ALL FEATURES
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default FeaturesShowcase;

