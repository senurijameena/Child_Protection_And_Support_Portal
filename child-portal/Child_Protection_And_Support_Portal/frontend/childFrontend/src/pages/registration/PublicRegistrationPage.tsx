import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PublicRegistration from '../../components/registration/PublicRegistration';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const PublicRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Container className="py-5">
        <div className="mb-4">
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/')}
            className="d-flex align-items-center"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to home
          </Button>
        </div>
        <PublicRegistration />
      </Container>
      <Footer />
    </>
  );
};

export default PublicRegistrationPage;

