export interface DVFTransaction {
    id_mutation: string;
    date_mutation: string;
    valeur_fonciere: number;
    adresse_numero: number;
    adresse_nom_voie: string;
    code_postal: string;
    nom_commune: string;
    type_local: string;
    surface_reelle_bati: number;
    nombre_lots?: number;
    lot1_numero?: string;
}

// Simulates fetching from https://api.cquest.org/dvf
// Fetches from https://api.cquest.org/dvf
export const fetchTransactionHistory = async (lat: number, lon: number, radius: number = 50): Promise<DVFTransaction[]> => {
    console.log(`[DVF] Searching transactions at ${lat}, ${lon} (radius: ${radius}m)`);

    try {
        // Query DVF for transactions within radius
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`https://api.cquest.org/dvf?lat=${lat}&lon=${lon}&dist=${radius}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('DVF API Error');

        const data: any = await response.json();

        // Map GeoJSON response to DVFTransaction interface
        if (data.features) {
            return data.features.map((f: any) => ({
                id_mutation: f.properties.id_mutation,
                date_mutation: f.properties.date_mutation,
                valeur_fonciere: f.properties.valeur_fonciere,
                adresse_numero: f.properties.numero,
                adresse_nom_voie: f.properties.voie,
                code_postal: f.properties.code_postal,
                nom_commune: f.properties.commune,
                type_local: f.properties.type_local,
                surface_reelle_bati: f.properties.surface_relle_batiment,
                nombre_lots: f.properties.nombre_lots,
                lot1_numero: f.properties.lot1_numero
            }));
        }
        return [];
    } catch (error) {
        console.warn('DVF API Failed:', error);
        return [];
    }
};
