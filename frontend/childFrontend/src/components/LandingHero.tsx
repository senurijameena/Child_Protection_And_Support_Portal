import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const LandingHero: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-32 pb-24 lg:pt-56 lg:pb-40 overflow-hidden">
            {/* Main Hero Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
                    alt="Child Protection Background"
                    className="w-full h-full object-cover opacity-20 filter contrast-[1.1]"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/95 via-white/80 to-indigo-50/90 shadow-inner"></div>
            </div>

            {/* Dynamic Background Elements */}
            <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_50%)]"></div>
            <div className="absolute bottom-0 inset-x-0 h-full bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.08),transparent_50%)]"></div>

            <div className="absolute top-20 right-[10%] w-72 h-72 bg-blue-400 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-indigo-300 rounded-full blur-[150px] opacity-10"></div>

            <Container className="relative z-10">
                <Row className="align-items-center">
                    <Col lg={6} className="text-center lg:text-left mb-16 lg:mb-0">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold mb-8 animate__fadeInUp">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            National Child Protection Initiative 2026
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
                            Every Child <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Deserves To Be Safe.</span>
                        </h1>

                        <p className="text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            A secure, state-of-the-art platform for reporting cases and accessing
                            immediate support. Together, we build a shield for the future.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start mb-12">
                            <Button
                                variant="primary"
                                size="lg"
                                className="px-10 py-4 rounded-2xl font-bold shadow-premium transition-all hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 border-none"
                                onClick={() => navigate('/login')}
                            >
                                <i className="bi bi-shield-lock-fill text-xl"></i>
                                Report Case Securely
                            </Button>
                            <Button
                                variant="white"
                                size="lg"
                                className="px-10 py-4 rounded-2xl font-bold shadow-md transition-all hover:scale-105 border border-slate-200 flex items-center justify-center gap-3 bg-white text-slate-700 hover:bg-slate-50"
                                onClick={() => navigate('/login')}
                            >
                                <i className="bi bi-heart-pulse-fill text-xl text-blue-500"></i>
                                Request Support
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-80">
                            {[
                                { icon: 'bi-check-circle-fill', text: '100% Confidential', color: 'text-emerald-500' },
                                { icon: 'bi-clock-fill', text: '24/7 Response', color: 'text-blue-500' },
                                { icon: 'bi-people-fill', text: 'Expert Legal Aid', color: 'text-indigo-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <i className={`bi ${item.icon} ${item.color} text-lg`}></i>
                                    <span className="font-semibold text-slate-700 text-sm italic">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </Col>

                    <Col lg={6} className="relative">
                        <div className="relative mx-auto max-w-xl">
                            {/* Premium Image Container with Glassmorphism */}
                            <div className="relative z-20 group">
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-30 transition duration-1000"></div>
                                <div className="relative bg-white/40 backdrop-blur-xl p-3 rounded-[2.5rem] shadow-premium border border-white/50 overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1544333346-64e4fe18274b?q=80&w=2070&auto=format&fit=crop"
                                        alt="Child Protection"
                                        className="w-full h-[500px] object-cover rounded-[2rem] filter contrast-[1.05] group-hover:scale-105 transition-transform duration-1000"
                                    />

                                    {/* Abstract Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent opacity-60"></div>

                                    <div className="absolute bottom-8 left-8 right-8 text-white">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-[2px] w-12 bg-blue-400"></div>
                                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Our Mission</span>
                                        </div>
                                        <h3 className="text-2xl font-bold leading-tight">Empowering children through safety and care.</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Square Image - Addressing "Blank Square" Top Left */}
                            <div className="absolute -top-16 -left-16 z-30 hidden xl:block animate-float">
                                <div className="relative p-2 bg-white rounded-[2rem] shadow-premium border border-white/80 overflow-hidden transform hover:scale-110 transition-transform duration-700">
                                    <img
                                        src="https://images.unsplash.com/photo-1594608661623-aa0bd3a67d28?q=80&w=400&auto=format&fit=crop"
                                        alt="Supportive Care"
                                        className="w-40 h-40 object-cover rounded-2xl"
                                    />
                                    <div className="absolute inset-0 bg-blue-500/5 hover:bg-transparent transition-colors"></div>
                                </div>
                            </div>

                            {/* Third Square Image - Addressing "Blank Square" Bottom Right */}
                            <div className="absolute -bottom-20 -right-12 z-30 hidden xl:block animate-float-delayed">
                                <div className="relative p-2 bg-white rounded-[2rem] shadow-premium border border-white/80 overflow-hidden transform hover:scale-110 transition-transform duration-700">
                                    <img
                                        src="https://images.unsplash.com/photo-1502086223501-7ea2443d844d?q=80&w=400&auto=format&fit=crop"
                                        alt="Safe Environment"
                                        className="w-36 h-36 object-cover rounded-2xl"
                                    />
                                    <div className="absolute inset-0 bg-indigo-500/5 hover:bg-transparent transition-colors"></div>
                                </div>
                            </div>

                            {/* Floating Stats Card */}
                            <div className="absolute -bottom-8 -left-8 z-30 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-premium border border-white max-w-[200px] animate-bounce-slow">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-200">
                                        <i className="bi bi-activity"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0">Active Support</p>
                                        <p className="text-xl font-black text-slate-900 leading-none">24/7</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-600 leading-snug">Average response time under 15 minutes.</p>
                            </div>

                            {/* Helpline Badge */}
                            <div className="absolute -top-10 -right-6 z-30 bg-white p-5 rounded-3xl shadow-premium border border-slate-50 flex items-center gap-4 hover:scale-110 transition-transform cursor-pointer">
                                <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl animate-pulse">
                                    <i className="bi bi-telephone-fill"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Emergency 24h</p>
                                    <p className="text-2xl font-black text-slate-900 leading-none tracking-tighter">1098</p>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(-6deg); }
                    50% { transform: translate(-10px, -15px) rotate(-2deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translate(0, 0) rotate(4deg); }
                    50% { transform: translate(10px, 15px) rotate(8deg); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                    animation-delay: 1s;
                }
            `}</style>
        </section>
    );
};

export default LandingHero;
