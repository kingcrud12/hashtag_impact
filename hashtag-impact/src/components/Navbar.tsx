import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function Navbar() {
    return (
        <nav style={{
            padding: 'var(--space-4) 0',
            borderBottom: '1px solid var(--color-border)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            position: 'fixed',
            width: '100%',
            top: 0,
            zIndex: 50
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 700, fontSize: '1.25rem' }}>
                    <div style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--radius-md)'
                    }}>
                        <Home size={20} />
                    </div>
                    <span className="text-gradient">Hashtag Impact</span>
                </Link>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    {/* Add menu items if needed */}
                </div>
            </div>
        </nav>
    );
}
