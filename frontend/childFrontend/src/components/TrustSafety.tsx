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
        <section className="py-28 bg-white" id="trust">
            <Container>
                <Row className="align-items-center">
                    <Col lg={5} className="mb-20 lg:mb-0 pr-lg-12">
                        <div className="relative">
                            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full">
                                Trust & Security
                            </span>
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-8 leading-[1.1] tracking-tighter">
                                Built on Trust, Guarded by <span className="text-blue-600 italic">Safety</span>.
                            </h2>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                                We understand the profound sensitivity of child protection.
                                Our system architecture follows a "Zero Trust" security model
                                ensuring absolute anonymity and defense.
                            </p>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-8 rounded-r-[2rem] shadow-sm">
                                <p className="text-blue-900 font-bold mb-0 text-lg italic leading-snug">
                                    "Security isn't just a layer of code here; it's our foundational promise to the next generation."
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col lg={7}>
                        <Row className="g-4">
                            {features.map((feature, index) => (
                                <Col sm={6} key={index}>
                                    <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 transition-all duration-500 hover:bg-white hover:shadow-premium hover:-translate-y-3 group h-100">
                                        <div className="w-16 h-16 bg-white shadow-premium rounded-2xl flex items-center justify-center text-3xl text-blue-600 mb-8 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6">
                                            <i className={`bi ${feature.icon}`}></i>
                                        </div>
                                        <h4 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{feature.title}</h4>
                                        <p className="text-slate-600 mb-0 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
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
