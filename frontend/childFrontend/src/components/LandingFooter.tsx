import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const LandingFooter: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="pt-24 pb-12 bg-slate-900 text-slate-400">
            <Container>
                <Row className="mb-20">
                    <Col lg={4} className="mb-12 lg:mb-0">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-900/50">
                                <i className="bi bi-shield-check"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white tracking-tight uppercase">
                                    Child<span className="text-blue-500 italic">Portal</span>
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Digital Safety Network</span>
                            </div>
                        </div>
                        <p className="mb-10 pr-12 text-slate-400 leading-relaxed text-lg">
                            An integrated ecosystem for the protection and welfare of our nation's children.
                            Built with security, speed, and compassion at its core.
                        </p>
                        <div className="flex items-center gap-5">
                            {[
                                { icon: 'bi-facebook', hover: 'hover:bg-blue-600' },
                                { icon: 'bi-twitter-x', hover: 'hover:bg-slate-800' },
                                { icon: 'bi-instagram', hover: 'hover:bg-pink-600' },
                                { icon: 'bi-linkedin', hover: 'hover:bg-blue-700' }
                            ].map((social, i) => (
                                <a key={i} href="#" className={`w-12 h-12 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center text-white transition-all duration-300 ${social.hover} hover:-translate-y-1`}>
                                    <i className={`bi ${social.icon} text-lg`}></i>
                                </a>
                            ))}
                        </div>
                    </Col>

                    <Col xs={6} lg={2} className="mb-12 lg:mb-0 pl-lg-10">
                        <h5 className="text-white font-bold mb-8 text-xs uppercase tracking-[0.25em]">Navigation</h5>
                        <ul className="list-unstyled space-y-4">
                            <li><Link to="/" className="hover:text-blue-400 transition-colors no-underline flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></div> Home</Link></li>
                            <li><Link to="/login" className="hover:text-blue-400 transition-colors no-underline flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></div> Agency Login</Link></li>
                            <li><Link to="/register" className="hover:text-blue-400 transition-colors no-underline flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></div> Public Access</Link></li>
                            <li><Link to="/report-case" className="hover:text-blue-400 transition-colors no-underline flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></div> Crisis Center</Link></li>
                        </ul>
                    </Col>

                    <Col xs={6} lg={2} className="mb-12 lg:mb-0">
                        <h5 className="text-white font-bold mb-8 text-xs uppercase tracking-[0.25em]">Legal & Compliance</h5>
                        <ul className="list-unstyled space-y-4">
                            <li><a href="#" className="hover:text-blue-400 transition-colors no-underline">Protection Acts</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors no-underline">Privacy Shield</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors no-underline">Authority Contacts</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors no-underline">Cyber Policy</a></li>
                        </ul>
                    </Col>

                    <Col lg={4}>
                        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[2rem] backdrop-blur-md">
                            <h5 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.25em]">Emergency Command</h5>
                            <ul className="list-unstyled space-y-6">
                                <li className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                        <i className="bi bi-geo-alt"></i>
                                    </div>
                                    <span className="text-sm font-medium leading-relaxed">National Child Protection Authority Headquarters, NCPA Complex, New Delhi</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                        <i className="bi bi-shield-check"></i>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Crisis Response</span>
                                        <span className="text-2xl font-black text-white tracking-tighter">1098</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </Col>
                </Row>

                <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 text-xs font-bold uppercase tracking-widest">
                    <p className="mb-0 text-slate-500">
                        &copy; {currentYear} NCPA Digital Sovereignty. All Rights Reserved.
                    </p>
                    <div className="flex gap-10">
                        <Link to="/privacy" className="text-slate-500 hover:text-white transition-colors no-underline">Security Protocol</Link>
                        <Link to="/terms" className="text-slate-500 hover:text-white transition-colors no-underline">Terms of Engagement</Link>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] text-slate-600 max-w-2xl mx-auto italic uppercase tracking-widest opacity-50">
                        This system is managed in collaboration with national child protection authorities
                        and verified social service organizations. Professional conduct is mandated and tracked.
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default LandingFooter;
