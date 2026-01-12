import React, { ButtonHTMLAttributes } from 'react';
import './ShinyButton.css';

interface ShinyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

const ShinyButton: React.FC<ShinyButtonProps> = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    return (
        <button
            className={`shiny-button ${variant} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default ShinyButton;
