import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import Papa from "papaparse";
import { Loader2, SlidersHorizontal, Map as MapIcon, ChevronDown, ChevronUp, Download, Share2 } from "lucide-react";
import Button from "../components/Button";
import { autocompleteAddress, type BanFeature } from "../services/api/ban";
import "leaflet/dist/leaflet.css";

// Fix Leaflet obscure marker icon issue in React
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Search() {
    const [loadingCsv, setLoadingCsv] = useState(true);
    const [lovacData, setLovacData] = useState<any[]>([]);

    // 1. Zone
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<BanFeature[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [locationCenter, setLocationCenter] = useState<[number, number]>([46.603354, 1.888334]); // France center
    const [radius, setRadius] = useState(10);
    const [typeBien, setTypeBien] = useState("");

    // 2. Vacance
    const [etatBien, setEtatBien] = useState("Indifférent");
    const [travaux, setTravaux] = useState("Peu importe");
    const [surfaceMin, setSurfaceMin] = useState("");
    const [surfaceMax, setSurfaceMax] = useState("");
    const [piecesMin, setPiecesMin] = useState("");
    const [piecesMax, setPiecesMax] = useState("");
    const [etage, setEtage] = useState("Indifférent");

    const hideRoomsAndFloor = ["Terrain", "Parking", "Local industriel"].includes(typeBien);

    // 3. Juridique
    const [proprioDecede, setProprioDecede] = useState("Indifférent");
    const [typePropriete, setTypePropriete] = useState("Indifférent");
    const [statutSociete, setStatutSociete] = useState("Indifférent");

    const showStatutSociete = ["SCI", "Indivision", "Autres"].includes(typePropriete);

    // 4. Énergie
    const [dpe, setDpe] = useState("Indifférent");
    const [ges, setGes] = useState("Indifférent");
    const [potentielEco, setPotentielEco] = useState("Indifférent");

    // 5. Complémentaire
    const [typologie, setTypologie] = useState("Indifférent");
    const [orientationEco, setOrientationEco] = useState("Indifférent");

    // Accordion UI State
    const [expandedSections, setExpandedSections] = useState({
        s1: true,
        s2: false,
        s3: false,
        s4: false,
        s5: false,
    });

    const toggleSection = (sec: string) => {
        setExpandedSections((prev: any) => ({ ...prev, [sec]: !prev[sec] }));
    };

    // Results & CSV Matching
    const [currentVacancyInfo, setCurrentVacancyInfo] = useState<any | null>(null);

    useEffect(() => {
        // Load CSV on mount
        fetch("/lovac-opendata-communes (5).csv")
            .then((res) => res.text())
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    delimiter: ";", // LOVAC uses semicolon
                    skipEmptyLines: true,
                    complete: (results) => {
                        setLovacData(results.data);
                        setLoadingCsv(false);
                    },
                });
            })
            .catch((err) => {
                console.error("Failed to load CSV", err);
                setLoadingCsv(false);
            });
    }, []);

    const handleQueryChange = async (val: string) => {
        setQuery(val);
        if (val.length > 3) {
            const hits = await autocompleteAddress(val);
            setSuggestions(hits);
            setShowSuggestions(hits.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectAddress = (feature: BanFeature) => {
        setQuery(feature.properties.label);
        const coords = feature.geometry.coordinates; // [lon, lat]
        setLocationCenter([coords[1], coords[0]]);
        setSuggestions([]);
        setShowSuggestions(false);

        // Try to find vacancy data for this city based on citycode or postcode
        const cityCode = feature.properties.citycode; // INSEE code
        if (cityCode && lovacData.length > 0) {
            // Look for the row in lovac data
            // LOVAC columns: CODGEO_25, LIBGEO_25, pp_vacant_25, etc.
            const row = lovacData.find((d) => d.CODGEO_25 === cityCode);
            if (row) {
                setCurrentVacancyInfo(row);
            } else {
                setCurrentVacancyInfo(null);
            }
        }
    };

    const SectionHeader = ({ title, secId }: { title: string; secId: string }) => (
        <div
            onClick={() => toggleSection(secId)}
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                marginBottom: "0.5rem",
                fontWeight: 600,
                color: "var(--color-primary)",
            }}
        >
            {title}
            {(expandedSections as any)[secId] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
    );

    return (
        <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
            {/* Left Sidebar (Filters) */}
            <aside
                style={{
                    width: "400px",
                    overflowY: "auto",
                    background: "var(--color-background-subtle)",
                    borderRight: "1px solid var(--color-border)",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    <SlidersHorizontal size={24} color="var(--color-primary)" />
                    <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Filtres de recherche</h2>
                </div>

                {/* Section 1 - Zone */}
                <div>
                    <SectionHeader title="1. Zone géographique" secId="s1" />
                    {(expandedSections as any)["s1"] && (
                        <div style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
                            <div style={{ marginBottom: "1rem", position: "relative" }}>
                                <label className="form-label">Localisation *</label>
                                <input
                                    type="text"
                                    placeholder="Ville / Quartier / Code postal"
                                    value={query}
                                    onChange={(e) => handleQueryChange(e.target.value)}
                                    className="form-input"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            right: 0,
                                            background: "white",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "var(--radius-md)",
                                            boxShadow: "var(--shadow-md)",
                                            zIndex: 1000,
                                            listStyle: "none",
                                            padding: 0,
                                            margin: "0.25rem 0 0 0",
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        {suggestions.map((suggestion) => (
                                            <li
                                                key={suggestion.properties.id}
                                                onClick={() => selectAddress(suggestion)}
                                                style={{ padding: "0.75rem", cursor: "pointer", borderBottom: "1px solid #eee" }}
                                            >
                                                {suggestion.properties.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">Rayon de recherche : {radius} km</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={radius}
                                    onChange={(e) => setRadius(Number(e.target.value))}
                                    style={{ width: "100%", accentColor: "var(--color-accent)" }}
                                />
                            </div>

                            <div>
                                <label className="form-label">Type de bien *</label>
                                <select value={typeBien} onChange={(e) => setTypeBien(e.target.value)} className="form-select">
                                    <option value="">Sélectionnez un type</option>
                                    <option value="Appartement">Appartement</option>
                                    <option value="Maison">Maison</option>
                                    <option value="Terrain">Terrain</option>
                                    <option value="Local commercial">Local commercial</option>
                                    <option value="Bureau">Bureau</option>
                                    <option value="Immeuble">Immeuble</option>
                                    <option value="Parking">Parking</option>
                                    <option value="Loft">Loft</option>
                                    <option value="Local industriel">Local industriel</option>
                                    <option value="Fonds de commerce">Fonds de commerce</option>
                                    <option value="Bâtiment agricole">Bâtiment agricole</option>
                                    <option value="Divers">Divers</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 2 - Vacance */}
                <div>
                    <SectionHeader title="2. Critères de vacance / occupation" secId="s2" />
                    {(expandedSections as any)["s2"] && (
                        <div style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">État du bien</label>
                                <select value={etatBien} onChange={(e) => setEtatBien(e.target.value)} className="form-select">
                                    <option value="Vacant">Vacant</option>
                                    <option value="Occupé">Occupé</option>
                                    <option value="Inconnu">Inconnu</option>
                                    <option value="Indifférent">Indifférent</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">Travaux à prévoir</label>
                                <select value={travaux} onChange={(e) => setTravaux(e.target.value)} className="form-select">
                                    <option value="Oui">Oui</option>
                                    <option value="Non">Non</option>
                                    <option value="Peu importe">Peu importe</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Surface Min (m²)</label>
                                    <input type="number" value={surfaceMin} onChange={e => setSurfaceMin(e.target.value)} className="form-input" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Max (m²)</label>
                                    <input type="number" value={surfaceMax} onChange={e => setSurfaceMax(e.target.value)} className="form-input" />
                                </div>
                            </div>

                            {!hideRoomsAndFloor && (
                                <>
                                    <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
                                        <div style={{ flex: 1 }}>
                                            <label className="form-label">Pièces Min</label>
                                            <input type="number" value={piecesMin} onChange={e => setPiecesMin(e.target.value)} className="form-input" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label className="form-label">Max</label>
                                            <input type="number" value={piecesMax} onChange={e => setPiecesMax(e.target.value)} className="form-input" />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "1rem" }}>
                                        <label className="form-label">Étage</label>
                                        <select value={etage} onChange={(e) => setEtage(e.target.value)} className="form-select">
                                            <option value="RDC">RDC</option>
                                            <option value="Intermédiaire">Intermédiaire</option>
                                            <option value="Dernier étage">Dernier étage</option>
                                            <option value="Indifférent">Indifférent</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Section 3 - Juridique */}
                <div>
                    <SectionHeader title="3. Juridique / Propriétaires" secId="s3" />
                    {(expandedSections as any)["s3"] && (
                        <div style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">Propriétaire décédé</label>
                                <select value={proprioDecede} onChange={(e) => setProprioDecede(e.target.value)} className="form-select">
                                    <option value="Oui">Oui</option>
                                    <option value="Non">Non</option>
                                    <option value="Indifférent">Indifférent</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">Type de propriété / société</label>
                                <select value={typePropriete} onChange={(e) => setTypePropriete(e.target.value)} className="form-select">
                                    <option value="Plein droit">Plein droit</option>
                                    <option value="Usufruit">Usufruit</option>
                                    <option value="SCI">SCI</option>
                                    <option value="Indivision">Indivision</option>
                                    <option value="Autres">Autres sociétés</option>
                                    <option value="Indifférent">Indifférent</option>
                                </select>
                            </div>

                            {showStatutSociete && (
                                <div style={{ marginBottom: "1rem" }}>
                                    <label className="form-label">Statut société</label>
                                    <select value={statutSociete} onChange={(e) => setStatutSociete(e.target.value)} className="form-select">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Liquidation">Liquidation</option>
                                        <option value="Redressement judiciaire">Redressement judiciaire</option>
                                        <option value="Indifférent">Indifférent</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Section 4 - Énergie */}
                <div>
                    <SectionHeader title="4. Énergétique et écologique" secId="s4" />
                    {(expandedSections as any)["s4"] && (
                        <div style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">Classe DPE</label>
                                <select value={dpe} onChange={(e) => setDpe(e.target.value)} className="form-select">
                                    <option value="A-C">A → C (Performant)</option>
                                    <option value="D-E">D → E (Moyen)</option>
                                    <option value="F-G">F → G (Passoire thermique)</option>
                                    <option value="Indifférent">Indifférent</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">Classe GES</label>
                                <select value={ges} onChange={(e) => setGes(e.target.value)} className="form-select">
                                    <option value="A-C">A → C</option>
                                    <option value="D-E">D → E</option>
                                    <option value="F-G">F → G</option>
                                    <option value="Indifférent">Indifférent</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">Potentiel écologique</label>
                                <select value={potentielEco} onChange={(e) => setPotentielEco(e.target.value)} className="form-select">
                                    <option value="Oui">Oui</option>
                                    <option value="Non">Non</option>
                                    <option value="Indifférent">Indifférent</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 5 - Complémentaire */}
                <div>
                    <SectionHeader title="5. Critères complémentaires" secId="s5" />
                    {(expandedSections as any)["s5"] && (
                        <div style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">Typologie des lots</label>
                                <select value={typologie} onChange={(e) => setTypologie(e.target.value)} className="form-select">
                                    <option value="T1">T1</option>
                                    <option value="T2">T2</option>
                                    <option value="T3">T3</option>
                                    <option value="T4+">T4 et +</option>
                                    <option value="Indifférent">Indifférent</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">Orientation sociale/écologique</label>
                                <select value={orientationEco} onChange={(e) => setOrientationEco(e.target.value)} className="form-select">
                                    <option value="Oui">Oui</option>
                                    <option value="Non">Non</option>
                                    <option value="Indifférent">Indifférent</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

            </aside>

            {/* Right Workspace (Map + Results Table) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "white", position: "relative" }}>

                {/* Loading Overlay */}
                {loadingCsv && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.8)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
                        <p style={{ marginTop: "1rem", fontWeight: 600 }}>Chargement des données LOVAC...</p>
                    </div>
                )}

                {/* Map Container - Taking top half */}
                <div style={{ flex: 1, borderBottom: "1px solid var(--color-border)", minHeight: "40%" }}>
                    <MapContainer
                        center={locationCenter}
                        zoom={12}
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%", zIndex: 10 }}
                        key={`${locationCenter[0]}-${locationCenter[1]}`} // Re-mount if center changes rapidly
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        />
                        {currentVacancyInfo && (
                            <>
                                <Marker position={locationCenter}>
                                    <Popup>
                                        <strong>{currentVacancyInfo.LIBGEO_25}</strong><br />
                                        Taux de vacance (&gt;2 ans) : <b>{currentVacancyInfo.pp_total_24 ? ((parseInt(currentVacancyInfo.pp_vacant_plus_2ans_25 || "0") / parseInt(currentVacancyInfo.pp_total_24)) * 100).toFixed(1) : 'N/A'}%</b><br />
                                        Parc total : {currentVacancyInfo.pp_total_24}
                                    </Popup>
                                </Marker>
                                <Circle
                                    center={locationCenter}
                                    pathOptions={{ color: 'var(--color-accent)', fillColor: 'var(--color-accent)', fillOpacity: 0.1 }}
                                    radius={radius * 1000} // radius in meters
                                />
                            </>
                        )}
                    </MapContainer>
                </div>

                {/* Section 6 - Résultats Table - Taking bottom half */}
                <div style={{ flex: 1, padding: "2rem", overflowY: "auto", background: "var(--color-background-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Section 6 – Résultats et suivi</h2>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <Button variant="outline" size="sm"><Download size={16} /> Export PDF</Button>
                            <Button size="sm"><Share2 size={16} /> Routage Partenaires</Button>
                        </div>
                    </div>

                    <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead style={{ background: "#F1F5F9", borderBottom: "1px solid var(--color-border)" }}>
                                <tr>
                                    <th style={{ padding: "1rem" }}>Adresse</th>
                                    <th style={{ padding: "1rem" }}>Score Vacance (LOVAC)</th>
                                    <th style={{ padding: "1rem" }}>Orientation</th>
                                    <th style={{ padding: "1rem" }}>État juridique</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentVacancyInfo ? (() => {
                                    const vacantNumber = parseInt(currentVacancyInfo.pp_vacant_plus_2ans_25 || "0", 10);
                                    const totalNumber = parseInt(currentVacancyInfo.pp_total_24 || "1", 10);
                                    const percentage = totalNumber > 0 ? ((vacantNumber / totalNumber) * 100).toFixed(1) : "0";
                                    return (
                                        // Mocked matched row combining the LOVAC real data with the search query
                                        <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                                            <td style={{ padding: "1rem", fontWeight: 500 }}>{query}</td>
                                            <td style={{ padding: "1rem" }}>
                                                <span style={{ background: "#FEE2E2", color: "#991B1B", padding: "0.25rem 0.5rem", borderRadius: "99px", fontWeight: 600, fontSize: "0.875rem" }}>
                                                    {currentVacancyInfo.pp_vacant_plus_2ans_25 ? `${percentage}% (${vacantNumber} biens)` : "Moyen"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1rem", color: "var(--color-text-muted)" }}>{orientationEco !== "Indifférent" ? orientationEco : "Mixte"}</td>
                                            <td style={{ padding: "1rem", color: "var(--color-text-muted)" }}>{typePropriete !== "Indifférent" ? typePropriete : "Copropriété"}</td>
                                        </tr>
                                    );
                                })() : (
                                    <tr>
                                        <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                                            <MapIcon size={48} style={{ margin: "0 auto 1rem", opacity: 0.2 }} />
                                            Recherchez une commune pour filtrer les données LOVAC et découvrir les gisements territoriaux.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
