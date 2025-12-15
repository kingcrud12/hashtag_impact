
export interface DeathRecord {
    nom: string;
    prenom: string;
    date_deces: string;
    commune_deces: string;
    age: number;
}

// Search using matchID.io (Unofficial/Open source frontend affecting INSEE data)
// Endpoint: https://matchid-api.com/v1/search (Hypothetical - usually we use a dump or specific search)
// For this prototype, we'll use a mocked "search by name and city" if no public live API is easily reachable without key.
// However, checking public documentation, MatchID.io has a UI. 
// Let's implement a logical check that WOULD work with a real name.
export const searchDeathRecord = async (lastName: string, firstName: string, city: string): Promise<DeathRecord | null> => {
    console.log(`[MatchID] Checking death record for ${firstName} ${lastName} in ${city}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For the demo, if the last name is "MARTIN" (common) in "PARIS", we simulate a match 10% of time
    if (lastName.toUpperCase() === 'MARTIN' && Math.random() > 0.8) {
        return {
            nom: lastName.toUpperCase(),
            prenom: firstName,
            date_deces: '2023-05-12',
            commune_deces: city,
            age: 84
        };
    }

    return null;
};
