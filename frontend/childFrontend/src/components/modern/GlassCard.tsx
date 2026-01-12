import React, { ReactNode } from 'react';
import './GlassCard.css';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    children: ReactNode;
    className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ title, children, className = '', ...props }) => {
    return (
        <div className={`glass-card ${className}`} {...props}>
            {title && <h3>{title}</h3>}
            <div>{children}</div>
        </div>
    );
};

export default GlassCard;
