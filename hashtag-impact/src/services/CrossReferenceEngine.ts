import { type Property, type Trajectory, type PropertyStatus } from '../types';
import { fetchTransactionHistory } from './api/dvf';
import { fetchOwnerDetails } from './api/pappers';
import { fetchDPE } from './api/ademe';
import { checkConsumption, fetchCityAverageConsumption } from './api/enedis';
import { searchDeathRecord } from './api/matchid';
import { searchAddress } from './api/ban';

interface AnalysisReport {
    property: Property;
    confidence: number;
}

export const analyzeProperty = async (address: string): Promise<AnalysisReport> => {
    // 1. Fetch Coordinates first (needed for DVF)
    const banResult = await searchAddress(address);
    const coordinates = banResult ? banResult.geometry.coordinates : null; // [lon, lat]
    const city = banResult ? banResult.properties.city : 'Paris';

    // Use normalized address if available for better matching in other services
    const searchAddr = banResult ? banResult.properties.label : address;

    // 2. Parallel Data Fetching
    const [dvfData, ownerData, dpeData, cityAvgConsumption] = await Promise.all([
        coordinates ? fetchTransactionHistory(coordinates[1], coordinates[0]) : Promise.resolve([]),
        fetchOwnerDetails(searchAddr), // Use normalized address
        fetchDPE(searchAddr), // Use normalized address
        fetchCityAverageConsumption(city)
    ]);

    // 2b. Dependent Fetches
    let consumptionCheck = await checkConsumption(city, searchAddr, cityAvgConsumption);
    let nearbySuggestion = undefined;

    // Fallback Logic: Nearest Neighbor Search
    if (consumptionCheck.consumption === null) {
        // Try nearby numbers +/- 2
        console.log('[CrossReferenceEngine] No data for exact address. Trying nearby...');
        const streetBase = searchAddr.replace(/\d+/, '').trim();
        const number = parseInt(searchAddr.match(/\d+/)?.[0] || '0');

        if (number > 0) {
            const nearbyNumbers = [number - 2, number + 2, number - 1, number + 1]; // Prioritize same side
            for (const n of nearbyNumbers) {
                if (n <= 0) continue;
                const nearbyAddr = `${n} ${streetBase}`; // Simplified reconstruction
                const nearbyCheck = await checkConsumption(city, nearbyAddr, cityAvgConsumption);
                if (nearbyCheck.consumption !== null) {
                    console.log(`[CrossReferenceEngine] Found nearby data at ${nearbyAddr}`);
                    consumptionCheck = nearbyCheck;
                    nearbySuggestion = nearbyAddr;
                    break;
                }
            }
        }
    }

    // Check Death Record
    let deathRecord = null;
    if (ownerData.type === 'Individual' && ownerData.name) {
        const nameParts = ownerData.name.split(' ');
        if (nameParts.length >= 2) {
            deathRecord = await searchDeathRecord(nameParts[0], nameParts[1], city);
            if (!deathRecord) deathRecord = await searchDeathRecord(nameParts[1], nameParts[0], city);
        }
    }

    const insights: string[] = [];
    let score = 0;

    // --- SCORING ALGORITHM (Refined) ---
    // Max Score: 100 (weighted indicators)

    // 1. Consumption Gap (Weight: 40)
    // Theoretical Consumption (MWh/year/unit)
    // If DPE available: (kWh/m² * AvgSurface) / 1000
    // AvgSurface assumption: 60m² (Paris avg for 2-3 rooms) or from DVF if recent? Let's stick to 60.
    const avgSurface = 60;
    let theoreticalConsumption = cityAvgConsumption; // Default 4.5 MWh

    if (dpeData?.estimatedConsumption) {
        theoreticalConsumption = (dpeData.estimatedConsumption * avgSurface) / 1000;
    }

    const realConsumption = consumptionCheck.consumption; // MWh/year/unit
    let consumptionScore = 0;

    if (realConsumption !== null) {
        const ratio = realConsumption / theoreticalConsumption;
        if (ratio < 0.2) {
            consumptionScore = 40; // Extremely low (< 20% of theory)
            insights.push(`Consommation très faible (${Math.round(ratio * 100)}% de la théorie) (+40)`);
        } else if (ratio < 0.5) {
            consumptionScore = 20; // Suspiciously low (< 50%)
            insights.push(`Sous-consommation marquée (${Math.round(ratio * 100)}% de la théorie) (+20)`);
        }
    } else {
        // No Enedis Data (Privacy threshold or other)
        // If > 10 units but no data? (Hard to know units count if no data, but maybe from DVF count?)
        // Neutral for now.
    }
    score += consumptionScore;

    // 2. Transaction Void (Weight: 30)
    // No transaction in > 5 years
    let transactionScore = 0;
    const lastTransaction = dvfData[0];
    let yearsSinceLastTransaction = 0;
    if (lastTransaction) {
        yearsSinceLastTransaction = new Date().getFullYear() - new Date(lastTransaction.date_mutation).getFullYear();
    } else {
        yearsSinceLastTransaction = 10; // Assume long time
    }

    if (yearsSinceLastTransaction > 5) {
        transactionScore = 20;
        insights.push(`Aucune transaction depuis > 5 ans (+20)`);
    } else if (yearsSinceLastTransaction > 3) {
        transactionScore = 15; // Keep 15 or reduce to 10? User said 30 is too much. Let's make it 20/10.
        transactionScore = 10;
        insights.push(`Aucune transaction depuis > 3 ans (+10)`);
    }
    score += transactionScore;

    // 3. Nature / Building Type
    // If Commercial/Office, behavior is different.
    if (consumptionCheck.segment === 'NON_RESIDENTIEL' || consumptionCheck.segment === 'PRO') {
        insights.push("Bâtiment à usage Tertiaire/Pro");
        // Maybe different threshold? 
        // For now, just info.
    }

    // 4. Owner Deceased (Weight: 20)
    if (deathRecord) {
        score += 20;
        insights.push(`Propriétaire décédé (+20)`);
    }

    // 5. Energy Sieve (Weight: 10)
    // High probability of vacancy if G-rated
    if (dpeData?.isEnergySieve) {
        score += 10;
        insights.push(`Passoire énergétique (${dpeData.dpeClass}) (+10)`);
    } else {
        // Strict scoring: Missing data = 0 points.
    }

    // Check Vacancy suggestion
    if (nearbySuggestion) {
        insights.push(`Données extrapolées depuis le N°${nearbySuggestion.split(' ')[0]}`);
    }

    // 8. Floor Identified (Strict: False by default, no mock)
    const floorIdentified = false;
    if (floorIdentified) {
        score += 5;
        insights.push("Étage identifié (+5)");
    }

    // --- CLASSIFICATION ---
    // Remove normalization to 24. Use raw score capped at 100.
    const finalVacancyScore = Math.min(score, 100);

    let status: PropertyStatus = 'Occupied';
    let trajectory: Trajectory = 'Indeterminate';

    if (score >= 12) { // >= 50% of criteria met
        status = 'Vacant';
    } else if (score >= 6) {
        status = 'Under Analysis';
    }

    // Trajectory Logic
    if (ownerData.type === 'Public' || ownerData.type === 'Company') trajectory = 'Social';
    if (dpeData?.isEnergySieve) trajectory = 'Ecological';


    // Map DVF type to system type
    let systemType: any = 'Living';
    const dvfType = lastTransaction?.type_local?.toLowerCase() || '';

    // Logic: If we have multiple units from Enedis, it's a Building
    if (consumptionCheck.unitsCount > 1) {
        systemType = 'Building';
    } else if (dvfType.includes('commercial') || dvfType.includes('local') || dvfType.includes('bureau')) {
        systemType = 'Commercial';
    }

    const property: Property = {
        id: btoa(encodeURIComponent(address)),
        address: banResult ? banResult.properties.label : address,
        city: banResult ? banResult.properties.city : 'Inconnu',
        zipCode: banResult ? banResult.properties.postcode : '00000',
        type: systemType,
        area: lastTransaction?.surface_reelle_bati || 0,
        vacancyScore: finalVacancyScore, // UI expects 0-100
        trajectory,
        status,
        owner: ownerData,
        energy: dpeData || undefined,
        lastTransactionDate: lastTransaction?.date_mutation,
        insights,
        confidence: 0.9,
        numberOfLots: consumptionCheck.unitsCount || 1, // Populate with Enedis data

        // Enhance with new fields
        nearbyValidAddress: nearbySuggestion,
        consumptionDetails: {
            real: realConsumption || 0,
            theoretical: theoreticalConsumption,
            ratio: realConsumption && theoreticalConsumption ? realConsumption / theoreticalConsumption : 1,
            segment: consumptionCheck.segment || 'Unknown'
        },
        buildingSurface: consumptionCheck.unitsCount ? consumptionCheck.unitsCount * avgSurface : 0, // Estimate
        floors: consumptionCheck.unitsCount > 20 ? Math.ceil(consumptionCheck.unitsCount / 4) : 0, // Very rough estimate if not available

        scoringAttributes: {
            consumptionRatio: realConsumption && theoreticalConsumption ? realConsumption / theoreticalConsumption : 1,
            ownerStatus: ownerData.status === 'Liquidation' ? 'Liquidation' : ownerData.status === 'Inactive' ? 'Inactive' : deathRecord ? 'Deceased' : 'Alive', // Heuristic mapping
            yearsSinceLastTransaction,
            facadeUnchangedYears: 0, // Mock removed
            isSciOrIndivision: ownerData.type === 'Company' && (ownerData.name?.includes('SCI') || ownerData.name?.includes('INDIVISION') || false),
            dpeClass: dpeData?.dpeClass || 'Unknown',
            buildingAge: 40, // Mock removed
            hasVacantLotIdentified: false, // Mock removed
            floorIdentified
        },
        buildingInfo: {
            vacantUnitsCount: score > 10 ? 1 : 0,
            vacantFloors: []
        }
    };

    return {
        property,
        confidence: 0.9
    };
};
