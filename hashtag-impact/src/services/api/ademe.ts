import type { EnergyDetails } from '../../types';



// Fetches from Ademe Open Data API
export const fetchDPE = async (address: string): Promise<EnergyDetails | null> => {
    console.log(`[Ademe] Fetching DPE for ${address}`);

    // Address needs to be geocoded or searched exactly. 
    // The Ademe API allows 'q' parameter for full text search.
    // Dataset: DPE Logements existants (depuis juillet 2021) -> ID: dpe03existant
    const endpoint = `https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines?q=${encodeURIComponent(address)}&size=1&select=etiquette_dpe,conso_5_usages_par_m2_ep,etiquette_ges`;

    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Ademe API Error');
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const dpe = data.results[0];
            return {
                dpeClass: dpe.etiquette_dpe as any,
                gesClass: dpe.etiquette_ges as any,
                estimatedConsumption: dpe.conso_5_usages_par_m2_ep,
                isEnergySieve: ['F', 'G'].includes(dpe.etiquette_dpe)
            };
        }
        return null;
    } catch (error) {
        console.warn('Ademe API Failed:', error);
        return null;
    }
};
