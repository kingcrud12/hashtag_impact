import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPropertyById } from '../services/PropertyService';
import type { Property } from '../types';
import { ArrowLeft, Building2, Zap, CheckCircle } from 'lucide-react';

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
                            <span className="label">Lots</span>
                            <span className="value">{property.numberOfLots}</span>
                        </div>
                    </div>

                    {/* Building Insights (F03) */}
                    {(property.buildingInfo?.vacantUnitsCount ?? 0) > 0 && (
                        <div style={{ padding: 'var(--space-6)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-8)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: '1.1rem', fontWeight: 700 }}>
                                <Building2 size={20} /> Gisement Immeuble Détecté
                            </h3>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                                    {property.buildingInfo?.vacantUnitsCount}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>autres lots vacants détectés</p>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Étages concernés :</span>
                                        {property.buildingInfo?.vacantFloors.map((f, i) => (
                                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>• Étage {f}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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

                {/* Score Breakdown (F01/F04) */}
                <div style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-6)' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>{property.vacancyScore}/100</span>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Score Vacance Calculé</span>
                    </div>

                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Détail du calcul (Spec 3.1)</h3>

                    {attrs && (
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {attrs.consumptionRatio < 0.20 && (
                                <ScoreItem label="Consommation très faible (<20%)" points="+3" />
                            )}
                            {attrs.consumptionRatio > 1.50 && (
                                <ScoreItem label="Consommation excessive (>150%)" points="+2" />
                            )}
                            {attrs.ownerStatus === 'Deceased' && (
                                <ScoreItem label="Propriétaire décédé" points="+3" />
                            )}
                            {attrs.yearsSinceLastTransaction > 5 && (
                                <ScoreItem label={`Pas de mutation depuis ${attrs.yearsSinceLastTransaction} ans`} points="+2" />
                            )}
                            {attrs.facadeUnchangedYears > 5 && (
                                <ScoreItem label="Façade inchangée (Street View)" points="+4" />
                            )}
                            {attrs.isSciOrIndivision && attrs.ownerStatus === 'Inactive' && (
                                <ScoreItem label="SCI/Indivision Inactive" points="+2" />
                            )}
                            {attrs.isSciOrIndivision && attrs.ownerStatus === 'Liquidation' && (
                                <ScoreItem label="SCI en Liquidation" points="+3" />
                            )}
                            {/* [STRICT ALIGNMENT] Extras disabled in PropertyService, so disabled in UI
                            {(['E', 'F', 'G'].includes(attrs.dpeClass) || (attrs.buildingAge > 30 && attrs.dpeClass === 'Unknown')) && (
                                <ScoreItem label="DPE E-G ou Bâti Ancien sans DPE" points="+2" />
                            )}
                            {attrs.hasVacantLotIdentified && (
                                <ScoreItem label="Lot vacant identifié (Croisement)" points="+3" />
                            )}
                            {attrs.floorIdentified && (
                                <ScoreItem label="Étage identifié (DPE/Ademe)" points="+1" />
                            )} */ }
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

const ScoreItem = ({ label, points }: { label: string, points: string }) => (
    <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <CheckCircle size={14} className="text-primary" /> {label}
        </span>
        <span style={{ fontWeight: 700, background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '12px' }}>{points} pts</span>
    </li>
);
