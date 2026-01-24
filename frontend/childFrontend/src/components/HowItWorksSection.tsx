import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const HowItWorksSection: React.FC = () => {
    const steps = [
        {
            number: '01',
            title: 'Submit Report / Request',
            description: 'File a case or request help through our secure portal. You can choose to remain anonymous.',
            icon: 'bi-file-earmark-plus'
        },
        {
            number: '02',
            title: 'System Review',
            description: 'Our system automatically verifies the report and prioritizes it based on urgency and severity.',
            icon: 'bi-clipboard-check'
        },
        {
            number: '03',
            title: 'Professional Assignment',
            description: 'Cases are instantly assigned to the appropriate police station or local social workers.',
            icon: 'bi-people'
        },
        {
            number: '04',
            title: 'Direct Action Taken',
            description: 'Authorities and professionals investigate and provide the necessary intervention and support.',
            icon: 'bi-shield-check'
        },
        {
            number: '05',
            title: 'Track Progress',
            description: 'Receive real-time notifications and track the status of your report through the dashboard.',
            icon: 'bi-graph-up-arrow'
        }
    ];

    return (
        <section className="py-24 bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" id="how-it-works">
            <Container>
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-3">Our Process</h2>
                    <h3 className="text-4xl font-extrabold text-gray-900 mb-6">How the Portal Functions</h3>
                    <p className="text-lg text-gray-600">
                        Our streamlined process ensures every report is handled with
                        maximum efficiency and absolute confidentiality.
                    </p>
                </div>

                {/* Horizontal Desktop View */}
                <div className="hidden lg:block relative pt-10">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-blue-100 -translate-y-1/2 z-0"></div>
                    <Row className="relative z-10">
                        {steps.map((step, index) => (
                            <Col key={index} className="px-4">
                                <div className="text-center group">
                                    <div className="w-20 h-20 bg-white border-4 border-white shadow-lg rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:bg-primary group-hover:scale-110 relative">
                                        <i className={`bi ${step.icon} text-3xl text-primary group-hover:text-white`}></i>
                                        <div className="absolute -top-4 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                            {step.number}
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Vertical Mobile View */}
                <div className="lg:hidden space-y-12 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-1 before:bg-blue-100">
                    {steps.map((step, index) => (
                        <div key={index} className="flex gap-6 relative">
                            <div className="flex-shrink-0 w-16 h-16 bg-white border-4 border-white shadow-md rounded-full flex items-center justify-center z-10">
                                <i className={`bi ${step.icon} text-2xl text-primary`}></i>
                            </div>
                            <div className="pt-2">
                                <span className="text-primary font-bold text-xs uppercase mb-1 block">Step {step.number}</span>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                                <p className="text-gray-600 text-sm">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default HowItWorksSection;
