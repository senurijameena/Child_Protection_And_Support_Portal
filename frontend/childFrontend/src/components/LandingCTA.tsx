import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const CallToAction: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="py-20">
            <Container>
                <div className="relative rounded-[3rem] overflow-hidden bg-primary px-8 py-16 text-center text-white shadow-2xl">
                    {/* Background patterns */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                        </svg>
                    </div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
                            You can make a difference today.
                        </h2>
                        <p className="text-xl text-blue-50 mb-10 font-medium">
                            Join thousands of citizens and professionals working together to build
                            a safer world for our children.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                variant="light"
                                size="lg"
                                className="px-10 py-3 rounded-full font-bold text-primary shadow-lg transition-all hover:scale-105"
                                onClick={() => navigate('/login')}
                            >
                                Report a Case
                            </Button>
                            <Button
                                variant="success"
                                size="lg"
                                className="px-10 py-3 rounded-full font-bold text-white shadow-lg border-2 border-white/20 transition-all hover:scale-105"
                                onClick={() => navigate('/login')}
                            >
                                Request Help
                            </Button>
                        </div>
                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-semibold opacity-90">
                            <Link to="/register/social-worker" className="text-white hover:text-green-200 transition-colors no-underline">
                                <i className="bi bi-person-plus me-2"></i>
                                Join as Social Worker
                            </Link>
                            <div className="w-1 h-1 bg-white/30 rounded-full hidden sm:block"></div>
                            <Link to="/register/police" className="text-white hover:text-blue-200 transition-colors no-underline">
                                <i className="bi bi-shield-shaded me-2"></i>
                                Join as Police Officer
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default CallToAction;
