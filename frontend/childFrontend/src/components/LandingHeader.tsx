import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';

const LandingHeader: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Navbar
            bg="white"
            expand="lg"
            fixed="top"
            className={`transition-all duration-300 ${scrolled ? 'py-2 shadow-md' : 'py-4 shadow-sm'}`}
        >
            <Container>
                <Navbar.Brand as={Link} to="/" className="flex items-center no-underline transition-all hover:opacity-90">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-100 ring-4 ring-white overflow-hidden">
                        <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-2xl text-gray-900 leading-none tracking-tighter uppercase sm:inline-block">
                            Child<span className="text-primary italic">Portal</span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-tight">National Security Unit</span>
                    </div>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="landing-navbar" />

                <Navbar.Collapse id="landing-navbar">
                    <Nav className="mx-auto space-x-2 lg:space-x-4">
                        <Nav.Link as={Link} to="/" className="text-gray-600 hover:text-primary font-medium">Home</Nav.Link>
                        <Nav.Link href="#services" className="text-gray-600 hover:text-primary font-medium">Services</Nav.Link>
                        <Nav.Link href="#how-it-works" className="text-gray-600 hover:text-primary font-medium">How It Works</Nav.Link>
                        <Nav.Link href="#trust" className="text-gray-600 hover:text-primary font-medium">Trust & Safety</Nav.Link>
                    </Nav>
                    <div className="flex items-center gap-3 mt-3 lg:mt-0">
                        <Button
                            variant="outline-primary"
                            className="rounded-full px-4 py-2 font-semibold transition-all hover:scale-105"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </Button>
                        <Button
                            variant="primary"
                            className="rounded-full px-4 py-2 font-semibold shadow-md transition-all hover:scale-105"
                            onClick={() => navigate('/register')}
                        >
                            Register
                        </Button>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default LandingHeader;
