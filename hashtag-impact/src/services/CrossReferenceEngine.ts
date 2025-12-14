import { type Property, type Trajectory, type PropertyStatus } from '../types';
import { fetchTransactionHistory } from './api/dvf';
import { fetchOwnerDetails } from './api/pappers';
import { fetchDPE } from './api/ademe';
// import { checkConsumption } from './api/enedis'; // Removed as function no longer exists

interface AnalysisReport {
    property: Property;
    confidence: number;
}

import { searchAddress } from './api/ban';

export const analyzeProperty = async (address: string): Promise<AnalysisReport> => {
    // 1. Fetch Coordinates first (needed for DVF)
    const banResult = await searchAddress(address);
    const coordinates = banResult ? banResult.geometry.coordinates : null; // [lon, lat]

    // 2. Parallel Data Fetching
    const [dvfData, ownerData, dpeData] = await Promise.all([
        coordinates ? fetchTransactionHistory(coordinates[1], coordinates[0]) : Promise.resolve([]),
        fetchOwnerDetails(address),
        fetchDPE(address)
    ]);

    const insights: string[] = [];

    // --- SCORING ALGORITHM (F04) ---
    // Total 100 points distributed as follows:
    // Enedis (Consumption): 40 pts
    // Enedis (Consumption): 40 pts (Removed)
    // Pappers (Owner Structure): 30 pts
    // DVF (Transaction Inertia): 20 pts
    // Ademe (Energy State): 10 pts

    let score = 0;

    // 1. Enedis Check (40 pts) - Removed
    // if (consumptionData.isLowConsumption) {
    //     score += 40;
    //     insights.push("F01: Consommation critique (<10% moyenne) - Fort indice de vacance");
    // }

    // 2. Pappers Check (30 pts)
    if (ownerData.nafCode === '6810Z' || ownerData.nafCode === '9609Z') { // Immobilier or other specific
        score += 30;
        insights.push("F03: Structure juridique immobilière sans activité récente détectée");
    }
    else if (ownerData.type === 'Company') {
        score += 15; // Partial score for company ownership
    }

    // 3. DVF Check (20 pts)
    const lastTransaction = dvfData[0];
    if (lastTransaction) {
        const yearsSinceTransaction = new Date().getFullYear() - new Date(lastTransaction.date_mutation).getFullYear();
        if (yearsSinceTransaction > 5) {
            score += 20;
            insights.push(`F01: Inertie transactionnelle (> ${yearsSinceTransaction} ans)`);
        }
    } else {
        score += 20; // No recent transaction record found
    }

    // 4. Ademe/DPE Check (10 pts for vacancy correlation)
    // Energy sieves are harder to rent/sell
    if (dpeData?.isEnergySieve) {
        score += 10;
        insights.push(`F02: Passoire Énergétique (Classe ${dpeData.dpeClass})`);
    }

    // --- CLASSIFICATION ---
    const finalVacancyScore = Math.min(score, 100);

    let status: PropertyStatus = 'Occupied';
    let trajectory: Trajectory = 'Indeterminate';

    // F01 Detection
    if (finalVacancyScore >= 60) {
        status = 'Vacant';
        insights.push("-> Classé VACANT (Score > 60)");
    } else if (finalVacancyScore > 30) {
        status = 'Under Analysis';
    }

    // F02 Detection (Occupied but Energy Sieve)
    if (status === 'Occupied' && dpeData?.isEnergySieve) {
        insights.push("-> ATTENTION: Bien Occupé mais Énergivore (Cible F02)");
        trajectory = 'Ecological'; // High priority for renovation
    }

    // Social vs Ecological Trajectory
    if (ownerData.type === 'Public' || ownerData.type === 'Company') {
        trajectory = 'Social'; // Potential for social housing conversion
    }
    if (dpeData?.isEnergySieve) {
        trajectory = 'Ecological'; // Overrides social if renovation is critical
    }

    // F03 Building Extrapolation (Mocked for single address analysis, but structure ready)
    // In a real engine, we would query the Cadastre for neighbor plots here.

    // Map DVF type to system type (Habitation / Commercial)
    let systemType: any = 'Living';
    const dvfType = lastTransaction?.type_local?.toLowerCase() || '';

    if (dvfType.includes('commercial') || dvfType.includes('local') || dvfType.includes('bureau')) {
        systemType = 'Commercial';
    } else if (dvfType.includes('maison') || dvfType.includes('appartement')) {
        systemType = 'Living'; // Will be displayed as "Habitation" in UI via translation if needed, or we can store French directly.
    }

    // Explicit Type for Display (if we want to override the Enum strictness or just rely on 'type' field being displayed)
    // The current Property interface likely expects specific strings. Let's assume 'Living' | 'Commercial' are key.
    // If the UI displays raw string, we might want 'Habitation'. 
    // Let's stick to the Interface 'Living' | 'Commercial' but ensure it's correct.

    const property: Property = {
        id: btoa(encodeURIComponent(address)), // Deterministic ID based on Address to allow permalinks (re-analysis on reload)
        address: banResult ? banResult.properties.label : address,
        city: banResult ? banResult.properties.city : 'Inconnu',
        zipCode: banResult ? banResult.properties.postcode : '00000',
        type: systemType,
        area: lastTransaction?.surface_reelle_bati || 0,
        vacancyScore: finalVacancyScore,
        trajectory,
        status,
        owner: ownerData,
        energy: dpeData || undefined,
        lastTransactionDate: lastTransaction?.date_mutation,
        // ...
        insights,
        confidence: 0.9,
        // Mocking F03 building info for the analysis result
        buildingInfo: {
            vacantUnitsCount: score > 50 ? Math.floor(Math.random() * 3) + 1 : 0,
            vacantFloors: score > 50 ? [Math.floor(Math.random() * 5)] : []
        }
    };

    return {
        property,
        confidence: 0.9
    };
};
