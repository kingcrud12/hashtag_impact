export type Trajectory = 'Social' | 'Ecological' | 'Indeterminate';
export type PropertyStatus = 'Vacant' | 'Occupied' | 'Under Analysis';
export type OwnerType = 'Individual' | 'Company' | 'Public';

export interface OwnerDetails {
    type: OwnerType;
    name?: string; // e.g. "SCI ...", "M. X"
    nafCode?: string; // e.g. "9609Z"
    siren?: string;
}

export interface EnergyDetails {
    dpeClass: string; // A-G
    gesClass: string; // A-G
    estimatedConsumption: number; // kWh/m²/year
    isEnergySieve: boolean; // True if F or G
}

export interface ScoringDetails {
    consumptionRatio: number; // % of local average (e.g., 0.15 for 15%)
    ownerStatus: 'Alive' | 'Deceased' | 'Active' | 'Inactive' | 'Liquidation';
    yearsSinceLastTransaction: number;
    facadeUnchangedYears: number; // Mocked Street View data
    isSciOrIndivision: boolean;
    dpeClass: string; // A-G or 'Unknown'
    buildingAge: number;
    hasVacantLotIdentified: boolean; // Cross-ref DVF/Cadastre
    floorIdentified: boolean; // Via DPE/Ademe
}

export interface Property {
    id: string;
    address: string;
    city: string;
    zipCode: string;
    type: 'Living' | 'Building' | 'Commercial' | 'Land';
    area: number;

    // Computed / Enriched Fields
    vacancyScore: number; // 0-100
    trajectory: Trajectory;
    status: PropertyStatus;

    // Data Sources
    owner?: OwnerDetails;
    energy?: EnergyDetails;
    lastTransactionDate?: string; // From DVF

    insights: string[];
    imageUrl?: string;
    confidence: number; // 0-1

    // Explicit Attributes for Scoring 3.1 (Deterministic)
    scoringAttributes?: ScoringDetails;

    // Advanced Search Fields
    orientation?: 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';
    numberOfLots?: number;
    floor?: number;
    typology?: string;
    legalStatus?: 'Co-ownership' | 'Single Owner' | 'Public' | 'Indivision';
    ecologicalPotential?: 'High' | 'Medium' | 'Low';

    // Building Level Insights
    buildingInfo?: {
        totalBroadbandUnits?: number; // mock
        vacantUnitsCount: number;
        vacantFloors: number[];
    };
}
