import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    style: customStyle,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        gap: 'var(--space-2)'
    };

    const variants = {
        primary: {
            background: 'var(--color-primary)',
            color: 'white',
            border: '1px solid var(--color-primary)',
            boxShadow: 'var(--shadow-sm)'
        },
        outline: {
            background: 'transparent',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-border)'
        },
        ghost: {
            background: 'transparent',
            color: 'var(--color-primary)',
            border: 'none'
        }
    };

    const sizes = {
        sm: { padding: 'var(--space-1) var(--space-3)', fontSize: '0.875rem' },
        md: { padding: 'var(--space-2) var(--space-4)', fontSize: '1rem' },
        lg: { padding: 'var(--space-3) var(--space-6)', fontSize: '1.125rem' }
    };

    // Merge styles
    const mergedStyle = {
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        ...customStyle
    };

    return (
        <button style={mergedStyle} className={className} {...props}>
            {children}
        </button>
    );
}
