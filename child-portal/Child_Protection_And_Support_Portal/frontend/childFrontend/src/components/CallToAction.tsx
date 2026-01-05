import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();

  const registrationOptions = [
    {
      title: 'REGISTER AS PUBLIC USER',
      description: 'Report cases, request help, track progress',
      variant: 'primary',
      path: '/register/public',
      icon: '👥'
    },
    {
      title: 'BECOME POLICE OFFICER',
      description: 'Join our network of child protection officers',
      variant: 'danger',
      path: '/register/police',
      icon: '👮'
    },
    {
      title: 'JOIN AS SOCIAL WORKER',
      description: 'Offer your services to help vulnerable children',
      variant: 'success',
      path: '/register/social-worker',
      icon: '🤝'
    }
  ];

  return (
    <section className="call-to-action py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-primary mb-3">
            Ready to Make a Difference?
          </h2>
          <p className="lead text-muted">
            Join our community of protectors and supporters
          </p>
        </div>

        <Row className="g-4">
          {registrationOptions.map((option, index) => (
            <Col key={index} md={4}>
              <Card className="h-100 text-center border-0 shadow-lg">
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="cta-icon mb-3">
                    <span className="display-1">{option.icon}</span>
                  </div>
                  <Card.Title className="h4 fw-bold mb-3">
                    {option.title}
                  </Card.Title>
                  <Card.Text className="text-muted mb-4 flex-grow-1">
                    {option.description}
                  </Card.Text>
                  <Button
                    variant={option.variant as any}
                    size="lg"
                    className="mt-auto"
                    onClick={() => navigate(option.path)}
                  >
                    {option.title}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default CallToAction;