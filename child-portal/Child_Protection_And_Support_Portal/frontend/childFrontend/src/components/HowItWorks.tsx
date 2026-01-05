import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { HOW_IT_WORKS_STEPS } from '../utils/constants';
import './HowItWorks.css';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="how-it-works py-5 bg-light" id="how-it-works">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-primary mb-3">
            🎯 HOW OUR SYSTEM WORKS
          </h2>
        </div>

        {}
        <div className="steps-container">
          <Row className="g-4 justify-content-center">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <Col lg={2} md={4} sm={6} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm text-center step-card">
                <Card.Body className="p-4">
                      <div className="step-number-circle mb-3">
                        <span className="step-number">{step.id}</span>
                      </div>
                  <div className="step-icon mb-3">
                        <span className="display-4">{step.icon}</span>
                    </div>
                      <Card.Title className="h6 fw-bold mb-2">{step.title}</Card.Title>
                      <Card.Text className="text-muted small mb-2">{step.description}</Card.Text>
                      <div className="step-time text-primary fw-semibold small">
                        {step.time}
                  </div>
                </Card.Body>
              </Card>
            </Col>
                {index < HOW_IT_WORKS_STEPS.length - 1 && (
                  <Col lg={1} className="d-none d-lg-block step-connector">
                    <div className="connector-line">
                      <div className="connector-dot"></div>
                    </div>
                  </Col>
                )}
              </React.Fragment>
          ))}
        </Row>
        </div>

        {}
        <div className="text-center mt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/process-guide')}
            className="px-5"
          >
            SEE DETAILED PROCESS
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;
