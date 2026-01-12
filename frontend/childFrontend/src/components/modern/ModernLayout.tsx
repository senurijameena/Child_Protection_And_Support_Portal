import React, { ReactNode } from 'react';
import './ModernLayout.css';

interface ModernLayoutProps {
    children: ReactNode;
    activePath?: string;
    logoText?: string;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({
    children,
    activePath = '/',
    logoText = 'Portal'
}) => {
    return (
        <div className="modern-layout-container">
            {/* Animated Background Shapes */}
            <div className="modern-layout-bg-shape shape-1"></div>
            <div className="modern-layout-bg-shape shape-2"></div>

            <div className="modern-layout-content">
                <nav className="modern-navbar">
                    <div className="brand-logo">{logoText}</div>
                    <div className="nav-links">
                        <a href="/" className={`nav-link ${activePath === '/' ? 'active' : ''}`}>Home</a>
                        <a href="/dashboard" className={`nav-link ${activePath === '/dashboard' ? 'active' : ''}`}>Dashboard</a>
                        <a href="/reports" className={`nav-link ${activePath === '/reports' ? 'active' : ''}`}>Reports</a>
                        <a href="/settings" className={`nav-link ${activePath === '/settings' ? 'active' : ''}`}>Settings</a>
                        <a href="/profile" className={`nav-link ${activePath === '/profile' ? 'active' : ''}`}>Profile</a>
                    </div>
                </nav>

                <main className="modern-main">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ModernLayout;
