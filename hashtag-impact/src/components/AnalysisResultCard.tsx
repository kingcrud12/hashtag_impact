import type { Property } from '../types';
import { CheckCircle, AlertTriangle, Leaf, Users, Zap, Building, CircleHelp } from 'lucide-react';

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

                {/* New Building Details Block */}
                {property.buildingDetails && (
                    <div style={{ background: 'white', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                            <Building size={16} color="var(--color-primary)" />
                            <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Immeuble / Copropriété</h3>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Lots</span>
                                <span style={{ fontWeight: 600 }}>{property.buildingDetails.totalLots}</span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    Surf. Bâtiment
                                    <div title="Surface estimée (Moyenne des lots * Nombre de lots). Donnée probabiliste non contractuelle." style={{ cursor: 'help' }}>
                                        <CircleHelp size={12} />
                                    </div>
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                                    {Math.round(property.buildingSurface || 0)} m²
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Année</span>
                                <span style={{ fontWeight: 600 }}>{property.buildingDetails.constructionYear > 0 ? property.buildingDetails.constructionYear : 'Inconnue'}</span>
                            </div>
                            {property.buildingDetails.isPeril && (
                                <div style={{ padding: '4px 8px', background: '#FEF2F2', color: '#DC2626', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #FECACA' }}>
                                    PERIL IMMINENT
                                </div>
                            )}
                            {property.buildingDetails.isInsalubre && (
                                <div style={{ padding: '4px 8px', background: '#FFF7ED', color: '#EA580C', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #FED7AA' }}>
                                    INSALUBRE
                                </div>
                            )}
                            {!property.buildingDetails.isPeril && !property.buildingDetails.isInsalubre && (
                                <div style={{ padding: '4px 8px', background: '#F0FDF4', color: '#16A34A', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #BBF7D0' }}>
                                    Aucun Arrêté
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
