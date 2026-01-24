import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const LandingFooter: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="pt-20 pb-10 bg-gray-900 text-gray-400">
            <Container>
                <Row className="mb-20">
                    <Col lg={4} className="mb-12 lg:mb-0">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white text-2xl">
                                <i className="bi bi-shield-check"></i>
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">
                                Child<span className="text-primary">Portal</span>
                            </span>
                        </div>
                        <p className="mb-8 pr-10 text-gray-400 leading-relaxed font-normal">
                            A secure and collaborative platform dedicated to the protection
                            and welfare of children across the nation. Empowering citizens
                            and authorities to take action.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition-all">
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition-all">
                                <i className="bi bi-twitter-x"></i>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition-all">
                                <i className="bi bi-instagram"></i>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition-all">
                                <i className="bi bi-youtube"></i>
                            </a>
                        </div>
                    </Col>

                    <Col xs={6} lg={2} className="mb-10 lg:mb-0">
                        <h5 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em]">Quick Links</h5>
                        <ul className="list-unstyled space-y-4">
                            <li><Link to="/" className="hover:text-primary transition-colors no-underline">Home</Link></li>
                            <li><Link to="/login" className="hover:text-primary transition-colors no-underline">Login</Link></li>
                            <li><Link to="/register" className="hover:text-primary transition-colors no-underline">Register</Link></li>
                            <li><Link to="/report-case" className="hover:text-primary transition-colors no-underline">Report Case</Link></li>
                        </ul>
                    </Col>

                    <Col xs={6} lg={2} className="mb-10 lg:mb-0">
                        <h5 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em]">Resources</h5>
                        <ul className="list-unstyled space-y-4">
                            <li><a href="#" className="hover:text-primary transition-colors no-underline">How It Works</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors no-underline">FAQ</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors no-underline">Safety Guidelines</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors no-underline">Portal Docs</a></li>
                        </ul>
                    </Col>

                    <Col lg={4}>
                        <h5 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em]">Contact Us</h5>
                        <ul className="list-unstyled space-y-5">
                            <li className="flex gap-4">
                                <i className="bi bi-geo-alt text-primary flex-shrink-0 mt-1"></i>
                                <span>Ministry of Welfare, National Child Protection Authority, Shastri Bhawan, New Delhi</span>
                            </li>
                            <li className="flex gap-4">
                                <i className="bi bi-envelope text-primary flex-shrink-0 mt-1"></i>
                                <span>support@childportal.gov.in</span>
                            </li>
                            <li className="flex gap-4">
                                <i className="bi bi-telephone text-primary flex-shrink-0 mt-1"></i>
                                <span className="font-bold text-white text-lg tracking-wider">HelpLine: 1098</span>
                            </li>
                        </ul>
                    </Col>
                </Row>

                <div className="pt-10 border-t border-gray-800 text-center text-sm font-medium">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="mb-0">
                            &copy; {currentYear} Child Protection & Support Portal. Government Managed System.
                        </p>
                        <div className="flex gap-8">
                            <Link to="/privacy" className="hover:text-white transition-colors no-underline">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-white transition-colors no-underline">Terms of Service</Link>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600 max-w-2xl mx-auto italic">
                        This system is managed in collaboration with child protection authorities
                        and social service organizations. Professional conduct is mandated and tracked.
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default LandingFooter;
