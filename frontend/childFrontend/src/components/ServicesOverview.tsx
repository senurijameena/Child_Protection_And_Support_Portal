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
        <section className="py-24 bg-slate-50" id="services">
            <Container>
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-100 rounded-full">
                        How We Protect
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Comprehensive Protection & Support
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Our platform orchestrates a multi-layered defense and support system
                        designed to ensure every child has access to safety, justice, and care.
                    </p>
                </div>

                <Row className="g-4">
                    {services.map((service, index) => (
                        <Col lg={4} md={6} key={index}>
                            <Card className="h-100 border-0 shadow-md hover:shadow-premium transition-all duration-500 group rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-sm border border-white">
                                <Card.Body className="p-10">
                                    <div className={`w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-8 text-4xl transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                                        <i className={`bi ${service.icon}`}></i>
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{service.title}</h4>
                                    <p className="text-slate-600 mb-8 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        {service.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-widest cursor-pointer group/link">
                                        More Details
                                        <i className="bi bi-arrow-right-short text-xl transition-transform group-hover/link:translate-x-2"></i>
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

export default ServicesOverview;
