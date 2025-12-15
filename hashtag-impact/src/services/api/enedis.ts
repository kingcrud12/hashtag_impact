const BASE_URL = 'https://data.enedis.fr/api/explore/v2.1/catalog/datasets/consommation-annuelle-residentielle-par-adresse/records';

export interface EnedisBuildingConsumption {
    addr_label: string;
    conso_totale: number; // Consumption annual total in MWh
    nb_pdl: number; // Number of units
    conso_avg: number; // Average per unit in MWh
    segment: string; // RESIDENTIEL or PRO
}

export const fetchBuildingConsumption = async (city: string, address: string): Promise<EnedisBuildingConsumption | null> => {
    try {
        // Enedis API: consommation-annuelle-residentielle-par-adresse
        // Query by city and refine address match. 
        // Input address is normalized (e.g. "12 Rue de l'Ingénieur Robert Keller 75015 Paris")
        // We strip the zip/city to get "12 Rue de l'Ingénieur Robert Keller"
        const streetPart = address.replace(/\s\d{5}.*$/i, '').trim();
        const query = `nom_commune="${city.toUpperCase()}" AND adresse LIKE "${streetPart.toUpperCase()}"`
        const url = `${BASE_URL}?where=${encodeURIComponent(query)}&limit=5`;

        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const record = data.results[0]; // Take best match
            return {
                addr_label: record.adresse,
                conso_totale: record.consommation_annuelle_totale_de_l_adresse_mwh,
                nb_pdl: record.nombre_de_logements,
                conso_avg: record.consommation_annuelle_moyenne_par_site_de_l_adresse_mwh, // in MWh
                segment: record.segment_de_client
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
