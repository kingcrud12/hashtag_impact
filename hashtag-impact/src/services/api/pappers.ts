import type { OwnerDetails } from '../../types';

// Simulates Pappers.fr Data
// Key Check: NAF Code 9609Z (Services personnels - often liberal professions mixed use)
export const fetchOwnerDetails = async (address: string): Promise<OwnerDetails> => {
    console.log(`[Pappers] Searching owner for ${address}`);

    return new Promise((resolve) => {
        setTimeout(() => {
            const rand = Math.random();

            if (rand > 0.6) {
                // Company Owner - Potential SCI or Liberal Profession
                resolve({
                    type: 'Company',
                    name: 'SCI DU PARC',
                    siren: '123456789',
                    nafCode: rand > 0.8 ? '9609Z' : '6820B' // 9609Z specific target
                });
            } else {
                // Individual
                resolve({
                    type: 'Individual',
                    name: 'Propriétaire Privé'
                });
            }
        }, 400);
    });
};
