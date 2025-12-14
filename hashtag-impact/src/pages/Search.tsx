import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProperties, type PropertyFilters } from '../services/PropertyService';
import type { Property } from '../types';
import { Filter, SlidersHorizontal, HelpCircle } from 'lucide-react';
import Button from '../components/Button';

export default function Search() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<Property[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Filters State
    const [filters, setFilters] = useState<PropertyFilters>({
        query: '',
        minScore: 0,
        minSurface: 0
    });

    const runSearch = async () => {
        setLoading(true);
        try {
            const data = await searchProperties(filters);
            setResults(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('[Search] Component mounted/filtered, triggering search.');
        runSearch();
    }, [filters.minScore, filters.orientation, filters.legalStatus, filters.ecologicalPotential, filters.type]);
    // Trigger search on filter change (for select/checkboxes) - for text we might want a debounce or manual submit

    const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="container" style={{ paddingBottom: 'var(--space-12)', display: 'flex', gap: 'var(--space-8)', alignItems: 'start' }}>

            {/* Mobile Filter Toggle */}
            <button
                style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100, background: 'var(--color-primary)', color: 'white', padding: '1rem', borderRadius: '50%', boxShadow: 'var(--shadow-xl)', display: 'none' }}
                className="mobile-filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
            >
                <Filter size={24} />
            </button>

            {/* Filters Sidebar */}
            <aside style={{
                width: '300px',
                background: 'white',
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--color-border)',
                position: 'sticky',
                top: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-6)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <SlidersHorizontal size={20} /> Filtres
                    </h2>
                    {/* Clear Filters */}
                    <button
                        onClick={() => setFilters({ query: '', minScore: 0 })}
                        style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}
                    >
                        Réinitialiser
                    </button>
                </div>

                {/* Localisation */}
                <div className="filter-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Localisation</label>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <input
                            type="text"
                            placeholder="Ville, Code postal..."
                            value={filters.query || ''}
                            onChange={(e) => handleFilterChange('query', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                            style={{ flex: 1, padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                        <button
                            onClick={runSearch}
                            style={{
                                background: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                width: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                            title="Rechercher"
                        >
                            <SlidersHorizontal size={16} style={{ display: 'none' }} /> {/* dummy */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                    </div>
                </div>

                {/* Score Vacance */}
                <div className="filter-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>
                        Score de Vacance Min ({filters.minScore || 0})
                    </label>
                    <input
                        type="range"
                        min="0" max="100"
                        value={filters.minScore || 0}
                        onChange={(e) => handleFilterChange('minScore', Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Surface */}
                <div className="filter-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>
                        Surface Min (m²)
                    </label>
                    <input
                        type="number"
                        placeholder="0"
                        value={filters.minSurface || ''}
                        onChange={(e) => handleFilterChange('minSurface', Number(e.target.value))}
                        onBlur={runSearch}
                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                    />
                </div>

                {/* Type Filter */}
                <div className="filter-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Type de bien</label>
                    <select
                        value={filters.type || ''}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                    >
                        <option value="">Tous</option>
                        <option value="Living">Habitation</option>
                        <option value="Commercial">Commercial</option>
                    </select>
                </div>

                {/* Orientation */}
                <div className="filter-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>
                        Orientation
                        <div className="tooltip-container" style={{ position: 'relative', display: 'inline-flex' }}>
                            <HelpCircle size={14} className="text-muted" style={{ cursor: 'help', color: 'var(--color-text-muted)' }} />
                            <div className="tooltip-text">
                                Orientation principale du bien (Nord, Sud, Est, Ouest).
                            </div>
                        </div>
                    </label>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {[
                            { val: 'N', label: 'Nord' },
                            { val: 'S', label: 'Sud' },
                            { val: 'E', label: 'Est' },
                            { val: 'W', label: 'Ouest' }
                        ].map(o => (
                            <button
                                key={o.val}
                                title={o.label}
                                onClick={() => handleFilterChange('orientation', filters.orientation === o.val ? undefined : o.val)}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--color-border)',
                                    background: filters.orientation === o.val ? 'var(--color-primary)' : 'white',
                                    color: filters.orientation === o.val ? 'white' : 'inherit',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {o.val}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Potentiel Ecologique */}
                <div className="filter-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Potentiel Écologique</label>
                    <select
                        value={filters.ecologicalPotential || ''}
                        onChange={(e) => handleFilterChange('ecologicalPotential', e.target.value)}
                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                    >
                        <option value="">Tous</option>
                        <option value="High">Haut</option>
                        <option value="Medium">Moyen</option>
                        <option value="Low">Faible</option>
                    </select>
                </div>

                {/* Etage */}
                <div className="filter-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>Étage</label>
                    <input type="number" placeholder="Étage min" onChange={(e) => handleFilterChange('floor', Number(e.target.value))} onBlur={runSearch} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                </div>

                {/* Etat Juridique */}
                <div className="filter-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>État Juridique</label>
                    <select
                        value={filters.legalStatus || ''}
                        onChange={(e) => handleFilterChange('legalStatus', e.target.value)}
                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                    >
                        <option value="">Tous</option>
                        <option value="Co-ownership">Copropriété</option>
                        <option value="Single Owner">Mono-propriété</option>
                        <option value="Indivision">Indivision</option>
                    </select>
                </div>

            </aside>

            {/* Main Content */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Explorateur de Gisements</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>{results.length} biens correspondent à vos critères.</p>
                </div>

                {loading ? (
                    <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Chargement en cours...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
                        {results.map(p => (
                            <div key={p.id} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
                                {/* We can re-use parts of AnalysisResultCard or make a summary card here */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{p.address}</h3>
                                        <p style={{ color: 'var(--color-text-muted)' }}>{p.zipCode} {p.city}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{p.vacancyScore}/100</span>
                                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-text-muted)' }}>Score Vacance</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                    <div className="badge-info">
                                        <span className="label">Surface</span>
                                        <span className="value">{p.area} m²</span>
                                    </div>
                                    <div className="badge-info">
                                        <span className="label">Type</span>
                                        <span className="value">{p.type} ({p.typology})</span>
                                    </div>
                                    <div className="badge-info">
                                        <span className="label">Orientation</span>
                                        <span className="value">{p.orientation}</span>
                                    </div>
                                    <div className="badge-info">
                                        <span className="label">Juridique</span>
                                        <span className="value">{p.legalStatus}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/property/${p.id}`)}>Voir les détails</Button>
                                </div>       </div>
                        ))}

                        {results.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--color-background-subtle)', borderRadius: 'var(--radius-lg)' }}>
                                <p>Aucun résultat. Essayez d'ajuster vos filtres.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
