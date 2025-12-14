import { useState } from 'react';
import { analyzeProperty } from '../services/CrossReferenceEngine';
import type { Property } from '../types';
import Button from '../components/Button';
import AnalysisResultCard from '../components/AnalysisResultCard';
import { Loader2 } from 'lucide-react';

interface AnalysisResult {
    property: Property;
    confidence: number;
}

export default function Deposit() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.trim()) return;

        setLoading(true);
        setResult(null);
        try {
            const data = await analyzeProperty(address);
            setResult(data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', paddingBottom: 'var(--space-12)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                    Analysez votre bien
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
                    Découvrez instantanément le potentiel écologique et social de votre patrimoine vacant.
                </p>
            </div>

            {/* Input Form */}
            <div style={{
                background: 'white',
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
                marginBottom: 'var(--space-8)'
            }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <input
                        type="text"
                        placeholder="Entrez l'adresse du bien..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{
                            flex: 1,
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                    <Button type="submit" disabled={loading || !address.trim()}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Analyser'}
                    </Button>
                </form>
            </div>

            {/* Results */}
            {result && <AnalysisResultCard property={result.property} />}
        </div>
    );
}
