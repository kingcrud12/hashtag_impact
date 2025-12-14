import type { Property } from '../types';
import { CheckCircle, AlertTriangle, Leaf, Users, Zap, Building } from 'lucide-react';

interface AnalysisResultCardProps {
    property: Property;
}

export default function AnalysisResultCard({ property }: AnalysisResultCardProps) {
    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Main Score & Trajectory */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--space-6)',
                alignItems: 'stretch'
            }}>
                {/* Vacancy Score */}
                <div style={{
                    background: 'white',
                    padding: 'var(--space-6)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Score de Vacance
                    </span>
                    <div style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        color: property.vacancyScore > 70 ? 'var(--color-accent)' : 'var(--color-primary)',
                        lineHeight: 1
                    }}>
                        {property.vacancyScore}/100
                    </div>
                </div>

                {/* Trajectory */}
                <div style={{
                    background: property.trajectory === 'Social' ? '#EFF6FF' : '#F0FDF4',
                    padding: 'var(--space-6)',
                    borderRadius: 'var(--radius-xl)',
                    border: `1px solid ${property.trajectory === 'Social' ? '#BFDBFE' : '#BBF7D0'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 'var(--space-2)'
                }}>
                    <span style={{ color: property.trajectory === 'Social' ? '#1E40AF' : '#166534', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Trajectoire Recommandée
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {property.trajectory === 'Social' ? <Users size={32} color="#2563EB" /> : <Leaf size={32} color="#16A34A" />}
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: property.trajectory === 'Social' ? '#1E3A8A' : '#14532D' }}>
                            {property.trajectory}
                        </span>
                    </div>
                </div>
            </div>

            {/* Insights Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-4)'
            }}>
                <div style={{ background: 'white', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <Building size={16} />
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Bien</h3>
                    </div>
                    <p style={{ fontWeight: 600 }}>{property.type} ({property.area} m²)</p>
                </div>

                <div style={{ background: 'white', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <Zap size={16} />
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Énergie</h3>
                    </div>
                    <p style={{ fontWeight: 600 }}>DPE {property.energy?.dpeClass || 'N/A'}</p>
                </div>

                <div style={{ background: 'white', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <Users size={16} />
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Usage</h3>
                    </div>
                    <p style={{ fontWeight: 600 }}>{property.owner?.type === 'Company' ? 'Personne Morale' : 'Particulier'}</p>
                </div>
            </div>

            {/* Detailed Insights List */}
            <div style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Analyse Multicritère</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {property.insights.map((insight, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                            <CheckCircle size={20} color="var(--color-accent)" style={{ marginTop: '2px' }} />
                            <span>{insight}</span>
                        </li>
                    ))}
                    <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                        <AlertTriangle size={20} color="orange" style={{ marginTop: '2px' }} />
                        <span style={{ color: 'var(--color-text-muted)' }}>Données croisées en temps réel (DVF, Pappers, Enedis).</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
