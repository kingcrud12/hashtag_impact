import type { EnergyDetails } from '../../types';



// Fetches from Ademe Open Data API
export const fetchDPE = async (address: string, banId?: string): Promise<EnergyDetails | null> => {
    console.log(`[Ademe] Fetching DPE for ${address} (BAN ID: ${banId})`);

    // Use BAN ID if available for precise lookup
    const query = banId ? `identifiant_ban:"${banId}"` : address;
    const endpoint = `https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines?q=${encodeURIComponent(query)}&size=1&select=etiquette_dpe,conso_5_usages_par_m2_ep,etiquette_ges,surface_habitable_logement`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(endpoint, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Ademe API Error');
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const dpe = data.results[0];
            return {
                dpeClass: dpe.etiquette_dpe as any,
                gesClass: dpe.etiquette_ges as any,
                estimatedConsumption: dpe.conso_5_usages_par_m2_ep,
                isEnergySieve: ['F', 'G'].includes(dpe.etiquette_dpe),
                surfaceEstimate: dpe.surface_habitable_logement
            };
        }
        return null;
    } catch (error) {
        console.warn('Ademe API Failed:', error);
        return null;
    }
};

export const fetchBuildingStatsFromDPE = async (banId: string): Promise<{ totalLots: number; totalSurface: number }> => {
    if (!banId) return { totalLots: 0, totalSurface: 0 };

    // Fetch all DPEs for this BAN ID (often represents the whole building if multiple units)
    // Limit to 100 which is reasonable for most buildings.
    const endpoint = `https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines?q=identifiant_ban:"${banId}"&size=100&select=surface_habitable_logement`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(endpoint, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Ademe API Error');
        const data = await response.json();

        if (data.results) {
            const lots = data.total || data.results.length;
            // Sum surfaces
            const totalSurface = data.results.reduce((acc: number, curr: any) => acc + (curr.surface_habitable_logement || 0), 0);

            return { totalLots: lots, totalSurface };
        }
        return { totalLots: 0, totalSurface: 0 };
    } catch (error) {
        console.warn('Ademe Building Stats Failed:', error);
        return { totalLots: 0, totalSurface: 0 };
    }
};
