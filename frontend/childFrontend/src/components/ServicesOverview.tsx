import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const ServicesOverview: React.FC = () => {
    const services = [
        {
            icon: 'bi-shield-exclamation',
            title: 'Report Child Abuse',
            description: 'Confidentially report physical, emotional, or sexual abuse of children.',
            color: 'text-red-600',
            bg: 'bg-red-50'
        },
        {
            icon: 'bi-person-slash',
            title: 'Missing Child Reports',
            description: 'Immediate alert system for missing children to notify local authorities.',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            icon: 'bi-briefcase',
            title: 'Labor & Trafficking',
            description: 'Report instances of illegal child labor and suspicious trafficking activities.',
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        },
        {
            icon: 'bi-house-heart',
            title: 'Request Food & Shelter',
            description: 'Emergency support for children in need of nutrition and safe housing.',
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            icon: 'bi-heart-pulse',
            title: 'Medical & Counseling',
            description: 'Access to healthcare services and psychological support for victims.',
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            icon: 'bi-mortarboard',
            title: 'Education Assistance',
            description: 'Support for continuing education and school supplies for at-risk children.',
            color: 'text-teal-600',
            bg: 'bg-teal-50'
        }
    ];

    return (
        <section className="py-24 bg-white" id="services">
            <Container>
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-3">Our Services</h2>
                    <h3 className="text-4xl font-extrabold text-gray-900 mb-6">Comprehensive Protection for Every Child</h3>
                    <p className="text-lg text-gray-600">
                        We provide a wide range of services to ensure children are protected,
                        supported, and given the opportunity to thrive in a safe environment.
                    </p>
                </div>

                <Row className="g-4">
                    {services.map((service, index) => (
                        <Col lg={4} md={6} key={index}>
                            <Card className="h-100 border-0 shadow-sm hover:shadow-xl transition-all duration-300 group rounded-2xl overflow-hidden border-b-4 border-transparent hover:border-primary">
                                <Card.Body className="p-8">
                                    <div className={`w-16 h-16 ${service.bg} ${service.color} rounded-2xl flex items-center justify-center mb-6 text-3xl transition-transform group-hover:rotate-6`}>
                                        <i className={`bi ${service.icon}`}></i>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h4>
                                    <p className="text-gray-600 mb-6 flex-grow">
                                        {service.description}
                                    </p>
                                    <button className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all no-underline">
                                        Learn More <i className="bi bi-arrow-right"></i>
                                    </button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default ServicesOverview;
