import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const LandingHero: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30"></div>

            <Container className="relative z-10">
                <Row className="align-items-center">
                    <Col lg={6} className="text-center lg:text-left mb-12 lg:mb-0">
                        <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                            Protecting Children. <br />
                            <span className="text-primary italic">Supporting Families.</span> <br />
                            Saving Futures.
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                            A secure national platform to report child protection cases,
                            request help, and connect with authorities and social workers.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                            <Button
                                variant="danger"
                                size="lg"
                                className="px-8 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                                onClick={() => navigate('/login')}
                            >
                                <i className="bi bi-exclamation-triangle-fill"></i>
                                Report a Case
                            </Button>
                            <Button
                                variant="success"
                                size="lg"
                                className="px-8 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                                onClick={() => navigate('/login')}
                            >
                                <i className="bi bi-heart-fill"></i>
                                Request Help
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                            <div className="flex items-center gap-2 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <i className="bi bi-check-lg"></i>
                                </div>
                                <span className="font-medium text-sm">Anonymous Reporting</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <i className="bi bi-shield-check"></i>
                                </div>
                                <span className="font-medium text-sm">Trusted Authorities</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <i className="bi bi-lock-fill"></i>
                                </div>
                                <span className="font-medium text-sm">Secure & Confidential</span>
                            </div>
                        </div>
                    </Col>
                    <Col lg={6} className="relative">
                        <div className="relative mx-auto max-w-lg lg:max-w-none">
                            <div className="absolute inset-0 bg-primary opacity-10 rounded-3xl transform rotate-3 scale-105"></div>
                            <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 overflow-hidden group">
                                <img
                                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
                                    alt="Child Protection"
                                    className="w-full h-auto rounded-2xl grayscale-0 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                                    <p className="font-semibold text-lg italic tracking-wide">"Every child deserves a voice and protection."</p>
                                </div>
                            </div>
                            {/* Decorative badge */}
                            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-3 animate-bounce">
                                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl">
                                    <i className="bi bi-telephone-fill"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0">Emergency Helpline</p>
                                    <p className="text-xl font-black text-gray-900 leading-none">1098</p>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default LandingHero;
