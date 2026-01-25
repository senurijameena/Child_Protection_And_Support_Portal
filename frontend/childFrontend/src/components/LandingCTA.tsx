import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const CallToAction: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24">
            <Container>
                <div className="relative rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-20 text-center text-white shadow-premium">
                    {/* Decorative abstract elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl -ml-40 -mb-40"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-[0.2em] text-blue-200 uppercase bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
                            Take Immediate Action
                        </span>
                        <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight tracking-tighter">
                            Your Vigilance Can <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Save A Life Today.</span>
                        </h2>
                        <p className="text-xl text-blue-100/80 mb-12 font-medium leading-relaxed max-w-2xl mx-auto">
                            Join our nationwide network of protective authorities and compassionate
                            citizens. Every report is a step toward a safer tomorrow.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Button
                                variant="white"
                                size="lg"
                                className="px-12 py-4 rounded-2xl font-bold bg-white text-blue-700 shadow-premium transition-all hover:scale-105 hover:bg-blue-50 border-none"
                                onClick={() => navigate('/login')}
                            >
                                <i className="bi bi-shield-fill-exclamation mr-2"></i>
                                Open Secure Report
                            </Button>
                            <Button
                                variant="outline-light"
                                size="lg"
                                className="px-12 py-4 rounded-2xl font-bold border-2 border-white/30 backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/10"
                                onClick={() => navigate('/login')}
                            >
                                <i className="bi bi-heart-fill mr-2"></i>
                                Seek Protection
                            </Button>
                        </div>

                        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-xs font-bold uppercase tracking-[0.15em] opacity-80">
                            <Link to="/register/social-worker" className="text-white hover:text-blue-200 transition-all no-underline flex items-center gap-2">
                                <i className="bi bi-person-badge-fill text-lg"></i>
                                Register as Social Worker
                            </Link>
                            <Link to="/register/police" className="text-white hover:text-blue-200 transition-all no-underline flex items-center gap-2">
                                <i className="bi bi-shield-shaded text-lg"></i>
                                Register for Police Station
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default CallToAction;
