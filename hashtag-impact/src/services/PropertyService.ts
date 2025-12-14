import type { Property } from '../types';
import { analyzeProperty } from './CrossReferenceEngine';

export interface PropertyFilters {
    query?: string;
    location?: string;
    minScore?: number;
    type?: string;
    orientation?: string;
    ecologicalPotential?: string;
    minSurface?: number;
    maxSurface?: number;
    typology?: string;
    floor?: number;
    legalStatus?: string;
}

// Cache to avoid refetching during session
let PROPERTY_CACHE: Property[] = [];

// Curated list of REAL addresses to serve as "Random Discovery" feed
// These are existing buildings where we want to check the vacancy score in real-time.
const RANDOM_SEEDS = [
    "227 rue d'Alésia, 75014 Paris",
    "10 avenue de la République, 75011 Paris",
    "54 boulevard de Magenta, 75010 Paris",
    "15 rue de Vaugirard, 75006 Paris",
    "88 rue de la Pompe, 75016 Paris",
    "3 place des Terreaux, 69001 Lyon",
    "20 cours Vitton, 69006 Lyon",
    "14 rue de la République, 13001 Marseille",
    "5 avenue du Prado, 13006 Marseille",
    "12 rue Sainte-Catherine, 33000 Bordeaux"
];

export const searchProperties = async (filters: PropertyFilters): Promise<Property[]> => {
    // 1. Determine Search Mode
    let addressesToAnalyze: string[] = [];

    // If specific query, use it
    if (filters.query && filters.query.length > 3) {
        // We will try to resolve this specific address
        addressesToAnalyze = [filters.query];
    }
    // If location filter, we could try to generate addresses in that city (omitted for brevity, defaulting to randoms)
    else if (filters.location) {
        // Filter seeds by city roughly
        addressesToAnalyze = RANDOM_SEEDS.filter(a => a.toLowerCase().includes(filters.location!.toLowerCase()));
        // No fallback: if no match in seeds, return empty.
    }
    // Default: Return empty (User requested 0 by default)
    else {
        addressesToAnalyze = [];
    }

    // 2. Analyze Each Address (Real-Time)
    const propertyPromises = addressesToAnalyze.map(async (addr) => {
        try {
            console.log(`[PropertyService] Analyzing: ${addr}`);
            const report = await analyzeProperty(addr);
            return report.property;
        } catch (e) {
            console.error(`[PropertyService] Failed to analyze ${addr}`, e);
            return null;
        }
    });

    const properties = (await Promise.all(propertyPromises)).filter((p): p is Property => p !== null);

    // Update Cache
    PROPERTY_CACHE = properties;

    // 3. Client-Side Filtering
    return properties.filter(p => {
        if (filters.minScore && p.vacancyScore < filters.minScore) return false;
        if (filters.minSurface && p.area < filters.minSurface) return false;
        if (filters.maxSurface && p.area > filters.maxSurface) return false;
        if (filters.type && filters.type !== '' && p.type !== filters.type) return false;
        // Logic for other filters can be added here if data fields are populated
        return true;
    });
};

// Helper to analyze by ID (which is base64 address)
export const getPropertyById = async (id: string): Promise<Property | undefined> => {
    // 1. Check Cache
    const cached = PROPERTY_CACHE.find(p => p.id === id);
    if (cached) return cached;

    // 2. Try to recover from ID (Base64 Address)
    try {
        const address = decodeURIComponent(atob(id));
        if (address && address.length > 5) {
            console.log('[PropertyService] Cache miss, re-analyzing from ID:', address);
            const report = await analyzeProperty(address);
            return report.property;
        }
    } catch (e) {
        console.error('[PropertyService] Failed to recover property from ID', e);
    }

    return undefined;
};

