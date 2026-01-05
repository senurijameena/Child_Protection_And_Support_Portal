
import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PoliceRegistration from '../../components/registration/PoliceRegistration';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const PoliceRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Container className="py-5">
        <div className="mb-4">
          <Button 
            variant="outline-danger" 
            onClick={() => navigate('/')}
            className="d-flex align-items-center"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Home
          </Button>
        </div>
        <PoliceRegistration />
      </Container>
      <Footer />
    </>
  );
};

export default PoliceRegistrationPage;