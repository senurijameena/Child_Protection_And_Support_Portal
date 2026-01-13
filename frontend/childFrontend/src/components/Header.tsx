import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (anchor: string, retries = 0) => {
    const element = document.querySelector(anchor);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    } else if (retries < 5) {

      setTimeout(() => scrollToSection(anchor, retries + 1), 200);
    }
  };

  const handleAnchorClick = (e: React.MouseEvent, anchor: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (location.pathname === '/') {
      scrollToSection(anchor);
    } else {

      navigate('/');

      setTimeout(() => {
        scrollToSection(anchor);
      }, 800);
    }
  };

  useEffect(() => {
    if (location.hash && location.pathname === '/') {

      const timer = setTimeout(() => {
        scrollToSection(location.hash);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const isActive = (path: string) => {
    if (path.startsWith('/#')) return false;
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'HOME', anchor: null },
    { path: '/about', label: 'ABOUT', anchor: null },
    { path: '/#statistics', label: 'STATISTICS', anchor: '#statistics' },
    { path: '/#how-it-works', label: 'HOW IT WORKS', anchor: '#how-it-works' },
    { path: '/#testimonials', label: 'TESTIMONIALS', anchor: '#testimonials' },
    { path: '/contact', label: 'CONTACT', anchor: null }
  ];

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <Container fluid="xxl" className="header-container">
        <div className="header-content">
          { }
          <Link to="/" className="logo-wrapper" onClick={() => setIsMobileMenuOpen(false)}>
            {logoError ? (
              <div className="logo-placeholder">
                <span>🛡️</span>
              </div>
            ) : (
              <img
                src="/images/logo.png"
                alt="Child Protection Portal Logo"
                className="logo-image"
                onError={() => setLogoError(true)}
              />
            )}
            <div className="logo-text">
              <h1 className="logo-main-text">CHILD PROTECTION AND SUPPORT PORTAL</h1>
              <p className="logo-sub-text">Government Initiative</p>
            </div>
          </Link>

          { }
          <nav className="desktop-nav">
            {navItems.map((item) => (
              item.anchor ? (
                <button
                  key={item.path}
                  type="button"
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={(e) => handleAnchorClick(e, item.anchor!)}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          { }
          <div className="header-actions">
            <Button
              variant="outline-primary"
              className="header-btn login-header-btn"
              onClick={() => handleNavigation('/login')}
            >
              LOGIN
            </Button>
            <Button
              variant="primary"
              className="header-btn register-header-btn"
              onClick={() => handleNavigation('/register')}
            >
              REGISTER
            </Button>
          </div>

          { }
          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        { }
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            item.anchor ? (
              <button
                key={item.path}
                type="button"
                className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={(e) => handleAnchorClick(e, item.anchor!)}
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          ))}
          <div className="mobile-actions">
            <Button
              variant="outline-primary"
              className="mobile-btn"
              onClick={() => handleNavigation('/login')}
            >
              LOGIN
            </Button>
            <Button
              variant="primary"
              className="mobile-btn"
              onClick={() => handleNavigation('/register')}
            >
              REGISTER
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
