import type { OwnerDetails } from '../../types';

// Fetches from Recherche Entreprises (Data Gouv)
// Documentation: https://recherche-entreprises.api.gouv.fr/
export const fetchOwnerDetails = async (address: string): Promise<OwnerDetails> => {
    console.log(`[EntrepriseAPI] Searching owner for ${address}`);

    try {
        const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(address)}&limit=5`);
        if (!response.ok) throw new Error('Entreprise API Error');

        const data = await response.json();

        // Look for the best match at this address
        // The API returns companies. We filter for those clearly at this address.
        // We prioritize "SCI" or similar.
        if (data.results && data.results.length > 0) {
            // Find first active one matching the address number roughly? 
            // The API search is already ranked by relevance.
            // Let's take the first result as the primary "owner" candidate or the first SCI.

            const sci = data.results.find((r: any) => r.nom_complet.includes('SCI') || r.nature_juridique?.startsWith('65'));
            const company = sci || data.results[0];

            return {
                type: 'Company',
                name: company.nom_complet,
                siren: company.siren,
                nafCode: company.activite_principale,
                status: company.etat_administratif === 'A' ? 'Active' : 'Inactive'
            };
        }

        // Use 'Individual' as fallback if no company found (likely individual owner)
        return {
            type: 'Individual',
            name: 'Propriétaire Privé (Non-Commercial)'
        };
    } catch (error) {
        console.warn('Entreprise API Failed:', error);
        return {
            type: 'Individual',
            name: 'Inconnu (Erreur API)'
        };
    }
};
