
import { fetchDPE, fetchBuildingStatsFromDPE } from './src/services/api/ademe';
import { searchAddress } from './src/services/api/ban';

async function test() {
    const addr = "11 Rue de la Vistule 75013 Paris";
    console.log(`Testing DPE for: ${addr}`);

    const banResult = await searchAddress(addr);

    if (!banResult) {
        console.error("BAN Search failed");
        return;
    }

    const banId = banResult.properties.id;
    console.log(`Found BAN ID: ${banId}`);

    const result = await fetchDPE(addr, banId);
    console.log("DPE Result:", result);

    const stats = await fetchBuildingStatsFromDPE(banId);
    console.log("Building Stats:", stats);
}

test();
