import React from 'react';
// import { Card } from 'react-bootstrap';
import '../modern/GlassCard.css';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorVariant?: 'blue' | 'red' | 'green' | 'yellow' | 'purple';
    onClick?: () => void;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    colorVariant = 'blue',
    onClick,
    className = ''
}) => {


    return (
        <div
            className={`glass-card ${className}`}
            onClick={onClick}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                padding: '1.5rem',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
        >
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div
                    className="stat-icon-wrapper"
                    style={{
                        background: colorVariant === 'red' ? 'var(--danger-color)' :
                            colorVariant === 'green' ? 'var(--success-color)' :
                                colorVariant === 'yellow' ? 'var(--warning-color)' :
                                    'var(--primary-light)', // Default soft blue for primary
                        color: colorVariant === 'blue' || !colorVariant ? 'var(--primary-dark)' : 'white',
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px', // Softer radius
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    {icon}
                </div>
                <div className="stat-trend text-success small fw-bold">
                    {/* Placeholder for trend if needed */}
                </div>
            </div>
            <div>
                <h3 className="h2 fw-bold mb-1 text-dark">{value}</h3>
                <p className="text-muted mb-0 small text-uppercase fw-semibold tracking-wider">{title}</p>
            </div>
        </div>
    );
};

export default StatCard;
