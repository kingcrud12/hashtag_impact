
export interface BanFeature {
    properties: {
        label: string;
        score: number;
        housenumber?: string;
        street?: string;
        postcode: string;
        city: string;
        citycode: string; // INSEE code, crucial for DVF
        context: string;
        type: string;
        id: string; // BAN ID (Interop Key)
        x: number;
        y: number;
    };
    geometry: {
        type: string;
        coordinates: [number, number];
    };
}

interface BanResponse {
    features: BanFeature[];
}

export const autocompleteAddress = async (query: string): Promise<BanFeature[]> => {
    if (!query || query.length < 3) return [];
    try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&autocomplete=1`);
        if (!response.ok) throw new Error('BAN API Warning');

        const data: BanResponse = await response.json();
        return data.features || [];
    } catch (error) {
        console.warn('BAN Autocomplete Error:', error);
        return [];
    }
};

export const searchAddress = async (query: string): Promise<BanFeature | null> => {
    try {
        // limit=1 because we want the best match for the specific search
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`);
        if (!response.ok) throw new Error('BAN API Warning');

        const data: BanResponse = await response.json();

        if (data.features && data.features.length > 0) {
            return data.features[0];
        }
        return null;
    } catch (error) {
        console.warn('BAN API Error:', error);
        return null; // Fallback to manual parsing if API fails
    }
};
