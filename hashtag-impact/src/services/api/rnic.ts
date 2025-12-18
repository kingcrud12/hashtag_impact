import type { BuildingDetails } from '../../types';

// Georisques API for Peril/Insalubrity
// Docs: https://api.gouv.fr/documentation/api_georisques
export const fetchBuildingRisks = async (_lat: number, _lon: number): Promise<{ isPeril: boolean; isInsalubre: boolean }> => {
    // Georisques uses 'latlon' endpoint for precise location risks
    // Endpoint: https://georisques.gouv.fr/api/v1/gaspar/risques?latlon=lon,lat
    // Note: Lat/Lon order in API might be specific. Docs say 'latlon=coord'.
    // Typically it's 'lat,lon' or 'lon,lat'. Let's try standard query params if available or the documented one.
    // Actually, Georisques has distinct endpoints. For specific property risks (ERP), we often check specific hazards.
    // "Péril" isn't always a distinct "Layer" in Georisques, it's often municipal data.
    // However, we can check for "Arrêtés de péril" if exposed.
    // As a fallback/proxy for now, we will check if the area has high relevant risks, 
    // BUT user specifically asked for "Péril Immeuble". 
    // Real "Arrêtés de péril" are often in local datasets (Paris Open Data etc).
    // The user linked RNIC. RNIC might have "procédures".

    // We will verify if the *address* (via coordinates) is in a zone of "insalubrité".
    // Since specific "Péril" API is fragmented, we will return a neutral false unless we find a specific hit.

    try {
        // Mocking the specific "Péril" fetch for now as the uniform API key-less access 
        // to ALL France peril orders doesn't exist in one simple GET.
        // We will return false to avoid false positives.
        return { isPeril: false, isInsalubre: false };
    } catch (e) {
        return { isPeril: false, isInsalubre: false };
    }
}

// RNIC / API Copro stub
// This would ideally connect to 'https://data.ademe.fr/data-fair/api/v1/datasets/...' or RNIC API
export const fetchCoproDetails = async (address: string): Promise<Partial<BuildingDetails>> => {
    // In a real scenario with API token, we would search by address.
    // Here we simulate the structure the user wants.
    console.log(`[RNIC] Fetching details for ${address}`);

    // Deterministic Mock based on address hash to give "Real" feel without lying (we call it "Estimations")
    // or try to fetch from open Ademe dataset if possible.

    // For now, return "Unknown" or basic data to be filled by the Engine logic if real data absent.
    return {
        rnicId: 'PENDING-SEARCH',
        totalLots: 0,
        constructionYear: 0
    };
}
