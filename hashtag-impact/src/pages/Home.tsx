import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Building2 } from 'lucide-react';
import Button from '../components/Button';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: 'calc(100vh - 5rem)', display: 'flex', flexDirection: 'column' }}>
            {/* Hero Section */}
            <section style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 'var(--space-12) var(--space-4)',
                gap: 'var(--space-6)'
            }}>
                <div style={{ maxWidth: '800px' }}>
                    <h1 className="text-gradient" style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        lineHeight: 1.2,
                        marginBottom: 'var(--space-4)'
                    }}>
                        Donnez du sens à vos m²
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--space-8)'
                    }}>
                        Valorisez vos biens inexploités pour l'hébergement d'urgence et la transition écologique grâce à notre réseau interprofessionnel.
                    </p>
                </div>

                {/* Dual Actions */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 'var(--space-8)',
                    width: '100%',
                    maxWidth: '900px',
                    marginTop: 'var(--space-4)'
                }}>
                    {/* Card 1: Deposit */}
                    <div
                        onClick={() => navigate('/deposit')}
                        style={{
                            padding: 'var(--space-8)',
                            background: 'white',
                            borderRadius: 'var(--radius-xl)',
                            boxShadow: 'var(--shadow-lg)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'var(--space-4)',
                            border: '1px solid var(--color-border)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                    >
                        <div style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-full)'
                        }}>
                            <Building2 size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Je dépose un bien</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Identifiez le potentiel social et écologique de vos biens vacants.
                        </p>
                        <Button variant="outline" style={{ marginTop: 'var(--space-2)' }}>
                            Analyser mon bien
                        </Button>
                    </div>

                    {/* Card 2: Search */}
                    <div
                        onClick={() => navigate('/search')}
                        style={{
                            padding: 'var(--space-8)',
                            background: 'white',
                            borderRadius: 'var(--radius-xl)',
                            boxShadow: 'var(--shadow-lg)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'var(--space-4)',
                            border: '1px solid var(--color-border)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                    >
                        <div style={{
                            background: 'var(--color-accent)',
                            color: 'white',
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-full)'
                        }}>
                            <SearchIcon size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Je cherche un bien</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Accédez à notre catalogue de biens qualifiés pour vos projets.
                        </p>
                        <Button variant="outline" style={{ marginTop: 'var(--space-2)' }}>
                            Voir les offres
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
