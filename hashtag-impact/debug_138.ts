
import { searchAddress } from './src/services/api/ban';
import { fetchTransactionHistory } from './src/services/api/dvf';
import { fetchDPE } from './src/services/api/ademe';

async function debugData() {
    const query = "138 avenue jean jaurès argenteuil 95100";
    console.log(`--- DEBUGGING DATA FOR: ${query} ---`);

    try {
        // 1. BAN
        console.log('\n1. BAN (Base Adresse Nationale):');
        const banResult = await searchAddress(query);
        if (banResult) {
            console.log('   FOUND:', banResult.properties.label);
            console.log('   Coordinates:', banResult.geometry.coordinates);
            console.log('   City:', banResult.properties.city);
        } else {
            console.log('   NOT FOUND');
            return;
        }

        // 2. DVF
        console.log('\n2. DVF (Demandes de Valeurs Foncières):');
        if (banResult && banResult.geometry.coordinates) {
            const [lon, lat] = banResult.geometry.coordinates;
            try {
                const txHistory = await fetchTransactionHistory(lat, lon);
                console.log(`   Found ${txHistory.length} transactions.`);
                txHistory.slice(0, 3).forEach((tx: any) => {
                    console.log(`   - Date: ${tx.date_mutation}, Valeur: ${tx.valeur_fonciere}€, Type: ${tx.type_local}`);
                });
                if (txHistory.length === 0) {
                    console.log('   No transactions found nearby (implying > 5 years? or just no data).');
                }
            } catch (e) {
                console.log('   Error fetching DVF:', e);
            }
        }

        // 3. ADEME (DPE)
        console.log('\n3. ADEME (Diagnostic Performance Énergétique):');
        try {
            const dpe = await fetchDPE(banResult.properties.label);
            if (dpe) {
                console.log('   Found DPE:', dpe);
            } else {
                console.log('   No DPE found for this exact address.');
            }
        } catch (e) {
            console.log('   Error fetching DPE:', e);
        }

    } catch (err) {
        console.error('Fatal error:', err);
    }
}

debugData();
