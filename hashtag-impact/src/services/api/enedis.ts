const BASE_URL = 'https://data.enedis.fr/api/records/1.0/search/';

export interface EnedisBuildingConsumption {
    addr_label: string;
    conso_totale: number; // Consumption annual total in MWh
    nb_pdl: number; // Number of units
    conso_avg: number; // Average per unit in MWh
    segment: string; // RESIDENTIEL or PRO
}

export const fetchBuildingConsumption = async (city: string, address: string): Promise<EnedisBuildingConsumption | null> => {
    try {
        // Enedis API V1.0
        // Dataset: consommation-annuelle-residentielle-par-adresse
        // Query syntax: q=nom_commune:"PARIS" AND adresse:"12 RUE..."

        const streetPart = address.replace(/\s\d{5}.*$/i, '').trim();
        // V1.0 uses Lucene-like syntax in 'q'
        // Use exact phrase search for address to avoid partial matches on "RUE" or "DE"
        const query = `nom_commune:"${city.toUpperCase()}" AND adresse:"${streetPart.toUpperCase()}"`;

        const params = new URLSearchParams({
            dataset: 'consommation-annuelle-residentielle-par-adresse',
            q: query,
            rows: '5'
        });

        const url = `${BASE_URL}?${params.toString()}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn(`[Enedis] API Error ${response.status}: ${response.statusText}`);
            return null;
        };

        const data = await response.json();

        // V1.0 response structure: { records: [ { fields: { ... } } ] }
        if (data.records && data.records.length > 0) {
            // Find best match manually if needed, or trust V1.0 relevance
            const record = data.records[0].fields;

            return {
                addr_label: record.adresse,
                conso_totale: record.consommation_annuelle_totale_de_l_adresse_mwh,
                nb_pdl: record.nombre_de_logements,
                conso_avg: record.consommation_annuelle_moyenne_par_site_de_l_adresse_mwh, // in MWh
                segment: record.segment_de_client || 'RESIDENTIEL'
            };
        }
        return null;
    } catch (error) {
        console.error('Enedis API Error:', error);
        return null;
    }
};


export const fetchCityAverageConsumption = async (_city: string): Promise<number> => {
    // Determine local average for comparison
    return 4.5; // MWh (4500 kWh)
};

export const checkConsumption = async (city: string, address: string, avgCityConsumption: number): Promise<{ isLowConsumption: boolean, consumption: number | null, unitsCount: number, segment: string }> => {
    const buildingData = await fetchBuildingConsumption(city, address);

    if (!buildingData) {
        return { isLowConsumption: false, consumption: null, unitsCount: 0, segment: 'Unknown' };
    }

    // Heuristic: If avg per unit is < 10% of city average, it's likely vacant
    const isLow = buildingData.conso_avg < (avgCityConsumption * 0.1);

    return {
        isLowConsumption: isLow,
        consumption: buildingData.conso_avg,
        unitsCount: buildingData.nb_pdl,
        segment: buildingData.segment
    };
};
