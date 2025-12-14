
const BASE_URL = 'https://data.enedis.fr/api/explore/v2.1/catalog/datasets/consommation-annuelle-residentielle-par-adresse/records';

export interface EnedisBuildingConsumption {
    addr_label: string;
    conso_totale: number; // Consumption annual total
    nb_pdl: number; // Number of units
    conso_avg: number; // Average per unit
}

export const fetchBuildingConsumption = async (city: string, address: string): Promise<EnedisBuildingConsumption | null> => {
    try {
        // Enedis API: consommation-annuelle-residentielle-par-adresse
        // Query by city and loosely by address match
        const query = `nom_commune="${city.toUpperCase()}" AND adresse LIKE "${address.toUpperCase().split(' ').slice(0, 2).join(' ')}"`
        const url = `${BASE_URL}?where=${encodeURIComponent(query)}&limit=5`;

        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const record = data.results[0]; // Take best match
            return {
                addr_label: record.adresse,
                conso_totale: record.conso_totale,
                nb_pdl: record.nb_sites,
                conso_avg: record.conso_moyen
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
    return 4500; // Placeholder: Ideally we fetch aggregations for the city. 
    // Average Fr residential is ~4700 kWh/year.
};
