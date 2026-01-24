import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const TrustSafety: React.FC = () => {
    const features = [
        {
            icon: 'bi-incognito',
            title: 'Anonymous Reporting',
            description: 'Your identity is fully protected. You can choose to report incidents without revealing your name or contact information.'
        },
        {
            icon: 'bi-shield-lock',
            title: 'Secure System',
            description: 'Advanced encryption and JWT authentication ensure that all data is stored securely and accessible only to authorized personnel.'
        },
        {
            icon: 'bi-patch-check',
            title: 'Verified Authorities',
            description: 'Every report is handled by certified police officers and verified social workers who undergo extensive background checks.'
        },
        {
            icon: 'bi-list-ul',
            title: 'Audit & Transparency',
            description: 'Complete transparency with unique tracking IDs and a case timeline that logs every action taken from report to resolution.'
        }
    ];

    return (
        <section className="py-24 bg-white" id="trust">
            <Container>
                <Row className="align-items-center">
                    <Col lg={5} className="mb-16 lg:mb-0">
                        <div className="relative">
                            <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-3">Our Commitment</h2>
                            <h3 className="text-4xl font-extrabold text-gray-900 mb-8 leading-tight">
                                Built on Trust, Guarded by <span className="text-primary">Safety</span>.
                            </h3>
                            <p className="text-lg text-gray-600 mb-8">
                                We understand the sensitivity of child protection.
                                Our system is designed with a "Safety First" approach,
                                ensuring that victims and reporters are always protected.
                            </p>
                            <div className="bg-blue-50 border-l-4 border-primary p-6 rounded-r-2xl">
                                <p className="text-gray-800 font-semibold mb-0 italic">
                                    "Confidentiality is not just a feature, it's our promise to the community."
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col lg={7}>
                        <Row className="g-4">
                            {features.map((feature, index) => (
                                <Col sm={6} key={index}>
                                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-2 group h-100">
                                        <div className="w-14 h-14 bg-white shadow-md rounded-2xl flex items-center justify-center text-2xl text-primary mb-6 transition-transform group-hover:scale-110">
                                            <i className={`bi ${feature.icon}`}></i>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h4>
                                        <p className="text-sm text-gray-600 mb-0 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default TrustSafety;
