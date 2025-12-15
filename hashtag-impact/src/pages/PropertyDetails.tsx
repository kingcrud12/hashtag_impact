import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPropertyById } from '../services/PropertyService';
import type { Property } from '../types';
import { ArrowLeft, Zap, CheckCircle } from 'lucide-react';

export default function PropertyDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getPropertyById(id).then(data => {
                setProperty(data);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="container" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>Chargement...</div>;
    if (!property) return <div className="container" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>Bien introuvable.</div>;

    const attrs = property.scoringAttributes;

    return (
        <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', marginBottom: 'var(--space-6)', color: 'var(--color-primary)' }}>
                <ArrowLeft size={20} /> Retour
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8)' }}>
                {/* Main Info */}
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>{property.address}</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>{property.zipCode} {property.city}</p>

                    {/* Characteristics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                        <div className="badge-info" style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                            <span className="label">Surface</span>
                            <span className="value">{property.area} m²</span>
                        </div>
                        <div className="badge-info" style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                            <span className="label">Type</span>
                            <span className="value">{property.type}</span>
                        </div>
                        <div className="badge-info" style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                            <span className="label">Étage</span>
                            <span className="value">{property.floor}</span>
                        </div>
                        <div className="badge-info" style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                            <span className="label">{property.type === 'Building' ? 'Logements' : 'Lots'}</span>
                            <span className="value">{property.numberOfLots}</span>
                        </div>
                    </div>

                    {/* F02 - Energy Sieve Warning */}
                    {property.energy?.isEnergySieve && (
                        <div style={{ padding: 'var(--space-6)', background: '#fff7ed', borderRadius: 'var(--radius-lg)', border: '1px solid #fed7aa', marginBottom: 'var(--space-8)' }}>
                            <h3 style={{ color: '#c2410c', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: '1.1rem', fontWeight: 700 }}>
                                <Zap size={20} /> Passoire Énergétique
                            </h3>
                            <p style={{ color: '#9a3412' }}>
                                Ce bien est classé <strong>{property.energy.dpeClass}</strong>. Il nécessite une rénovation prioritaire pour être mis en location.
                            </p>
                        </div>
                    )}

                    {/* DPE Display (Always Visible) */}
                    <div style={{ padding: 'var(--space-6)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-8)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: '1.1rem', fontWeight: 700 }}>
                            <Zap size={20} /> Diagnostic de Performance Énergétique
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: 'var(--radius-full)',
                                background: ['A', 'B'].includes(property.energy?.dpeClass || '') ? 'var(--color-accent)' : ['F', 'G'].includes(property.energy?.dpeClass || '') ? '#EF4444' : '#F59E0B',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                fontWeight: 800,
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                {property.energy?.dpeClass}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Classe Énergie : {property.energy?.dpeClass}</p>
                                <p style={{ color: 'var(--color-text-muted)' }}>Consommation Théorique (DPE) : {property.energy?.estimatedConsumption} kWh/m²/an</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Consumption Analysis (New) */}
                {property.consumptionDetails && (
                    <div style={{ padding: 'var(--space-6)', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-8)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: '1.1rem', fontWeight: 700 }}>
                            <Zap size={20} /> Analyse de la Consommation
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div style={{ background: '#F3F4F6', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Théorique (DPE)</span>
                                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: '#374151' }}>{property.consumptionDetails.theoretical.toFixed(1)} <small style={{ fontSize: '0.9rem' }}>MWh/an</small></span>
                            </div>
                            <div style={{ background: property.consumptionDetails.ratio < 0.5 ? '#FEF3C7' : '#D1FAE5', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: property.consumptionDetails.ratio < 0.5 ? '#B45309' : '#047857', textTransform: 'uppercase', fontWeight: 600 }}>Réelle (Enedis)</span>
                                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: property.consumptionDetails.ratio < 0.5 ? '#B45309' : '#047857' }}>
                                    {property.consumptionDetails.real > 0 ? property.consumptionDetails.real.toFixed(1) : '—'} <small style={{ fontSize: '0.9rem' }}>MWh/an</small>
                                </span>
                            </div>
                        </div>
                        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: '#EFF6FF', borderRadius: 'var(--radius-md)', color: '#1E40AF', fontSize: '0.9rem' }}>
                            <strong>Ratio :</strong> {(property.consumptionDetails.ratio * 100).toFixed(0)}% de la consommation théorique standard.
                            {property.consumptionDetails.ratio < 0.2 && <span style={{ fontWeight: 800, marginLeft: '4px' }}> Anormalement faible.</span>}
                        </div>
                    </div>
                )}

                {/* Score Breakdown (F01/F04) */}
                <div style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-6)' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>{property.vacancyScore}/100</span>

                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '16px', background: property.vacancyScore > 50 ? '#FEF2F2' : '#F0FDF4', color: property.vacancyScore > 50 ? '#DC2626' : '#166534', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                            {property.vacancyScore > 75 ? 'Forte Suspicion' : property.vacancyScore > 40 ? 'Suspicion Modérée' : 'Faible Suspicion'}
                        </div>

                        <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '4px' }}>Indice de Vacance</span>
                    </div>

                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Détail du calcul (Spec 3.1)</h3>

                    {attrs ? (
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            <ScoreItem
                                label="Consommation très faible (< 20% moy.)"
                                met={attrs.consumptionRatio < 0.20}
                                points="+40"
                            />
                            <ScoreItem
                                label="Consommation très forte (> 150% moy.)"
                                met={attrs.consumptionRatio > 1.50}
                                points="+20"
                            />
                            <ScoreItem
                                label={`Pas de transaction DVF > 5 ans (${attrs.yearsSinceLastTransaction} ans)`}
                                met={attrs.yearsSinceLastTransaction > 5}
                                points="+20"
                            />
                            <ScoreItem
                                label="Propriétaire décédé"
                                met={attrs.ownerStatus === 'Deceased'}
                                points="+20"
                            />
                            <ScoreItem
                                label="Structure SCI/Indivision Inactive"
                                met={attrs.isSciOrIndivision && attrs.ownerStatus === 'Inactive'}
                                points="+20"
                            />
                            <ScoreItem
                                label="Structure en Liquidation / Redressement"
                                met={attrs.isSciOrIndivision && attrs.ownerStatus === 'Liquidation'}
                                points="+30"
                            />
                            <ScoreItem
                                label={`Passoire Énergétique (DPE ${attrs.dpeClass})`}
                                met={['E', 'F', 'G'].includes(attrs.dpeClass)}
                                points="+10"
                            />
                            <ScoreItem
                                label="Lot vacant identifié (Croisement)"
                                met={attrs.hasVacantLotIdentified}
                                points="+30"
                            />
                            <ScoreItem
                                label="Façade inchangée (Street View > 5 ans)"
                                met={attrs.facadeUnchangedYears > 5}
                                points="+10"
                            />
                            <ScoreItem
                                label="Étage identifié via DPE/Ademe"
                                met={attrs.floorIdentified}
                                points="+5"
                            />
                        </ul>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {property.insights.map((insight, index) => (
                                <li key={index} style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-2)', fontSize: '0.9rem' }}>
                                    <CheckCircle size={14} className="text-primary" style={{ marginTop: '3px', flexShrink: 0 }} />
                                    <span>{insight}</span>
                                </li>
                            ))}
                            {property.insights.length === 0 && (
                                <li style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Aucun signal spécifique détecté.</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

const ScoreItem = ({ label, points, met }: { label: string, points: string, met: boolean }) => (
    <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', opacity: met ? 1 : 0.6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <CheckCircle size={14} className={met ? "text-primary" : "text-muted"} color={met ? 'var(--color-primary)' : '#9CA3AF'} />
            {label}
        </span>
        <span style={{
            fontWeight: 700,
            background: met ? 'var(--color-primary-subtle)' : '#F3F4F6',
            color: met ? 'var(--color-primary)' : '#9CA3AF',
            padding: '2px 8px',
            borderRadius: '12px'
        }}>
            {met ? points : '0 pts'}
        </span>
    </li>
);
