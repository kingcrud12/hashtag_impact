import { type Property, type Trajectory, type PropertyStatus } from '../types';
import { fetchTransactionHistory } from './api/dvf';
import { fetchOwnerDetails } from './api/pappers';
import { fetchDPE, fetchBuildingStatsFromDPE } from './api/ademe';
import { fetchBuildingRisks, fetchCoproDetails } from './api/rnic';
import { checkConsumption, fetchCityAverageConsumption } from './api/enedis';
import { searchDeathRecord } from './api/matchid';
import { searchAddress } from './api/ban';

interface AnalysisReport {
    property: Property;
    confidence: number;
}

export const analyzeProperty = async (address: string): Promise<AnalysisReport> => {
    const banResult = await searchAddress(address);
    const coordinates = banResult ? banResult.geometry.coordinates : null; // [lon, lat]
    const city = banResult ? banResult.properties.city : 'Paris';

    const searchAddr = banResult ? banResult.properties.label : address;

    const banId = banResult?.properties.id; // Get BAN ID

    const [rawDvfData, ownerData, dpeData, cityAvgConsumption, buildingRisks, coproDetails, dpeBuildingStats] = await Promise.all([
        coordinates ? fetchTransactionHistory(coordinates[1], coordinates[0]) : Promise.resolve([]),
        fetchOwnerDetails(searchAddr),
        fetchDPE(searchAddr, banId),
        fetchCityAverageConsumption(city),
        coordinates ? fetchBuildingRisks(coordinates[1], coordinates[0]) : Promise.resolve({ isPeril: false, isInsalubre: false }),
        fetchCoproDetails(searchAddr),
        banId ? fetchBuildingStatsFromDPE(banId) : Promise.resolve({ totalLots: 0, totalSurface: 0 })
    ]);

    const number = parseInt(searchAddr.match(/\d+/)?.[0] || '0');

    const dvfData = rawDvfData.filter(t => {
        if (t.adresse_numero && t.adresse_numero !== number) return false;
        return true;
    }).sort((a, b) => new Date(b.date_mutation).getTime() - new Date(a.date_mutation).getTime());

    console.log(`[CrossReferenceEngine] Filtered DVF transactions from ${rawDvfData.length} to ${dvfData.length} for ${searchAddr}`);

    let consumptionCheck = await checkConsumption(city, searchAddr, cityAvgConsumption);
    let nearbySuggestion = undefined;

    if (consumptionCheck.consumption === null) {
        console.log('[CrossReferenceEngine] No data for exact address. Trying nearby...');
        const streetBase = searchAddr.replace(/\d+/, '').trim();
        const number = parseInt(searchAddr.match(/\d+/)?.[0] || '0');

        if (number > 0) {
            const nearbyNumbers = [number - 2, number + 2, number - 1, number + 1]
            for (const n of nearbyNumbers) {
                if (n <= 0) continue;
                const nearbyAddr = `${n} ${streetBase}`;
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
    const avgSurface = 60;
    let theoreticalConsumption = cityAvgConsumption;

    if (dpeData?.estimatedConsumption) {
        theoreticalConsumption = (dpeData.estimatedConsumption * avgSurface) / 1000;
    }

    const realConsumption = consumptionCheck.consumption; // MWh/year/unit
    let consumptionScore = 0;

    let status: PropertyStatus = 'Occupied';
    let trajectory: Trajectory = 'Indeterminate';

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

    // --- DVF AGGREGATION FOR BUILDING STATS ---
    // Enedis often fails (404/Privacy). We use DVF history to reconstruct building metrics.
    // 1. Filter for valid housing transactions at this number
    const buildingTransactions = dvfData.filter(t =>
        (t.type_local === 'Appartement' || t.type_local === 'Maison') &&
        t.surface_reelle_bati > 9 // Ignore tiny utility spaces
    );

    // 2. Estimate Unique Lots 
    // Heuristic: Parse "lot1_numero" to find the highest lot number (e.g., "42" -> at least 42 lots)
    // Also use unique count as a baseline.
    let maxLotNumber = 0;
    const uniqueDvfLots = new Set();

    buildingTransactions.forEach(t => {
        if (t.lot1_numero) {
            uniqueDvfLots.add(t.lot1_numero);
            const parsed = parseInt(t.lot1_numero);
            if (!isNaN(parsed) && parsed < 500) { // <500 to avoid "Lot 1001" which might be distinct block
                if (parsed > maxLotNumber) maxLotNumber = parsed;
            }
        } else {
            uniqueDvfLots.add(`${t.surface_reelle_bati}-${t.valeur_fonciere}`);
        }
    });

    const countUnique = uniqueDvfLots.size;

    // Fallback for lots: Max of Enedis PDL vs Max Lot Number vs Unique Sales
    // usage of maxLotNumber helps if turnover is low but we saw "Lot 15" sold.
    const estimatedTotalLots = Math.max(consumptionCheck.unitsCount, countUnique, maxLotNumber > 0 ? maxLotNumber : 0, 1);

    // 3. Estimate Building Surface
    // Sum of surfaces of these unique lots? hard to know which are unique.
    // Alternative: Average surface * estimated lots
    const avgDvfSurface = buildingTransactions.reduce((acc, t) => acc + t.surface_reelle_bati, 0) / (buildingTransactions.length || 1);

    // Fallback order: DVF Average -> DPE Surface (Unit) -> Default 60
    const baseSurface = avgDvfSurface > 10 ? avgDvfSurface : (dpeData?.surfaceEstimate || 60);

    // Logic: If Enedis gives 0 units, use DVF estimate.
    // Logic: If Enedis gives 0 units, use DVF estimate or DPE Stats.
    // DPE Stats (dpeBuildingStats) are often more accurate for total units if DVF is sparse.
    const finalUnitsCount = consumptionCheck.unitsCount > 0
        ? consumptionCheck.unitsCount
        : Math.max(estimatedTotalLots, dpeBuildingStats.totalLots);

    const finalBuildingSurface = (consumptionCheck.unitsCount && avgSurface)
        ? consumptionCheck.unitsCount * avgSurface
        : (dpeBuildingStats.totalSurface > 0 ? dpeBuildingStats.totalSurface : (finalUnitsCount * baseSurface));

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

    // Georisques / Peril
    if (buildingRisks.isPeril) {
        score += 30;
        insights.push("Immeuble sous arrêté de péril (+30)");
        status = 'Vacant'; // Almost certainly problems preventing occupation
    }
    if (buildingRisks.isInsalubre) {
        score += 20;
        insights.push("Signalé insalubre (+20)");
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
        area: lastTransaction?.surface_reelle_bati || dpeData?.surfaceEstimate || 0,
        vacancyScore: finalVacancyScore, // UI expects 0-100
        trajectory,
        status,
        owner: ownerData,
        energy: dpeData || undefined,
        lastTransactionDate: lastTransaction?.date_mutation,
        insights,
        confidence: 0.9,
        numberOfLots: finalUnitsCount, // Populate with Enedis data or DVF Aggregation

        // Enhance with new fields
        orientation: 'N/A', // TODO: Complex to deduce without geometric data
        nearbyValidAddress: nearbySuggestion,
        consumptionDetails: {
            real: realConsumption || 0,
            theoretical: theoreticalConsumption,
            ratio: realConsumption && theoreticalConsumption ? realConsumption / theoreticalConsumption : 1,
            segment: consumptionCheck.segment || 'Unknown'
        },
        buildingSurface: finalBuildingSurface, // Improved estimate from DVF aggregation
        floors: finalUnitsCount > 20 ? Math.ceil(finalUnitsCount / 4) : 0, // Very rough estimate if not available

        buildingDetails: {
            rnicId: coproDetails.rnicId || 'Non identifié',
            totalLots: coproDetails.totalLots || finalUnitsCount,
            constructionYear: coproDetails.constructionYear || 1970, // Fallback
            isPeril: buildingRisks.isPeril,
            isInsalubre: buildingRisks.isInsalubre,
            valeurAssuree: undefined
        },

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
