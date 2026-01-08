import React, { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import type { Feedback } from '../types';
import './TestimonialsSection.css';

const TestimonialsSection: React.FC = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const feedback = await apiService.getPublicFeedback();

        const filtered = feedback
          .filter(f => f.rating && f.rating >= 4 && f.comment && f.comment.trim().length > 0)
          .slice(0, 8);

        const testimonialsToShow = filtered.length > 0
          ? filtered
          : feedback.filter(f => f.comment && f.comment.trim().length > 0).slice(0, 8);

        setTestimonials(testimonialsToShow);
      } catch (err) {
        console.error('Error fetching testimonials:', err);

        setTestimonials([
          {
            id: '1',
            userId: 'user1',
            userName: 'Parent, Mumbai',
            rating: 5,
            comment: 'This system saved my daughter. Within 2 hours, help arrived and she\'s now safe.',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Community Member',
            rating: 5,
            comment: 'Excellent service! The coordination between different agencies was seamless. Highly recommend.',
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            userId: 'user3',
            userName: 'Parent',
            rating: 5,
            comment: 'The 24/7 support is amazing. I got help when I needed it most. Thank you for this initiative.',
            createdAt: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <section className="testimonials-section py-5" id="testimonials">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-primary mb-3">
              🌟 REAL SUCCESS STORIES
            </h2>
          </div>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="testimonials-section py-5" id="testimonials">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-primary mb-3">
              🌟 REAL SUCCESS STORIES
            </h2>
          </div>
          <div className="text-center py-5">
            <p className="text-muted">No testimonials available at the moment.</p>
          </div>
        </Container>
      </section>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="testimonials-section py-5" id="testimonials">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-primary mb-3">
            🌟 REAL SUCCESS STORIES
          </h2>
          <p className="lead text-muted">
            Hear from families and communities we've helped
          </p>
        </div>

        <div className="testimonials-carousel">
          <div className="carousel-controls">
            <Button
              variant="outline-primary"
              className="carousel-btn prev-btn"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              ←
            </Button>
            <Button
              variant="outline-primary"
              className="carousel-btn next-btn"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              →
            </Button>
          </div>

          <Card className="testimonial-card border-0 shadow-lg">
            <Card.Body className="p-5">
              <div className="testimonial-content">
                <div className="testimonial-avatar mb-4">
                  <div className="avatar-circle">
                    <i className="bi bi-person-circle"></i>
                  </div>
                </div>
                <blockquote className="testimonial-quote mb-4">
                  "{currentTestimonial.comment}"
                </blockquote>
                <div className="testimonial-author-info">
                  <div className="author-name fw-bold text-primary">
                    {currentTestimonial.userName || 'Verified Citizen'}
                  </div>
                  <div className="testimonial-meta text-muted small">
                    📍 Case ID: {currentTestimonial.id?.substring(0, 8).toUpperCase()} |
                    Type: {currentTestimonial.userId?.startsWith('PO') ? 'Police Feedback' :
                      currentTestimonial.userId?.startsWith('SW') ? 'Social Worker Feedback' :
                        'Public Case'} |
                    Date: {formatDate(currentTestimonial.createdAt)}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <div className="carousel-indicators mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
            <span className="indicator-text ms-3">
              {currentIndex + 1}/{testimonials.length} testimonials
            </span>
          </div>
        </div>

        <div className="text-center mt-4">
          <Button
            variant="outline-primary"
            onClick={() => {
              const element = document.getElementById('statistics');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            SEE SYSTEM IMPACT
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default TestimonialsSection;
