import { useState } from "react";
import Button from "../components/Button";
import { Loader2, CheckCircle2, UploadCloud } from "lucide-react";

export default function Deposit() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. Informations sur le bien
  const [typeBien, setTypeBien] = useState("");
  const [adresse, setAdresse] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [etatBien, setEtatBien] = useState("");
  const [travaux, setTravaux] = useState("");
  const [surface, setSurface] = useState("");
  const [commentaires, setCommentaires] = useState("");

  const searchAddress = async (query: string) => {
    setAdresse(query);
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    setIsSearchingAddress(true);
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
      );
      const data = await response.json();
      setAddressSuggestions(data.features || []);
      setShowAddressSuggestions(true);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // 2. Informations sur le propriétaire / contact
  const [vousEtes, setVousEtes] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  const [typePropriete, setTypePropriete] = useState("");
  const [statutSociete, setStatutSociete] = useState("");
  const [proprietaireDecede, setProprietaireDecede] = useState("");
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [documents, setDocuments] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log("Form data submitted:", {
        bien: { typeBien, adresse, etatBien, travaux, surface, commentaires },
        proprio: { vousEtes, nom, email, telephone },
        juridique: { typePropriete, statutSociete, proprietaireDecede },
        docs: { photosCount: photos?.length, documents },
      });
      setLoading(false);
      setSuccess(true);
      window.scrollTo(0, 0);
    }, 1500);
  };

  if (success) {
    return (
      <div
        className="container"
        style={{
          maxWidth: "800px",
          paddingBottom: "var(--space-12)",
          textAlign: "center",
          paddingTop: "var(--space-12)",
        }}
      >
        <CheckCircle2
          size={64}
          color="var(--color-success)"
          style={{ margin: "0 auto var(--space-6)" }}
        />
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "var(--space-4)",
          }}
        >
          Dossier reçu !
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "1.25rem",
            marginBottom: "var(--space-8)",
          }}
        >
          Merci de nous avoir confié votre bien. Nos équipes vont l'analyser
          dans les plus brefs délais.
        </p>
        <Button
          onClick={() => {
            setSuccess(false);
          }}
        >
          Soumettre un autre bien
        </Button>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ maxWidth: "800px", paddingBottom: "var(--space-12)" }}
    >
      <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
        <h1 className="page-title">Je dépose mon bien</h1>
        <p className="page-subtitle">Formulaire Hashtag Impact</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 1. Informations sur le bien */}
        <div className="form-section">
          <h2 className="form-section-title">Informations sur le bien</h2>

          <div className="form-group">
            <label className="form-label">Type de bien *</label>
            <select
              required
              value={typeBien}
              onChange={(e) => setTypeBien(e.target.value)}
              className="form-select"
            >
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

          <div className="form-group">
            <label className="form-label">
              Adresse * (BAN/ quartier / rue / code postal)
            </label>
            <div style={{ position: "relative" }}>
              <input
                required
                type="text"
                value={adresse}
                onChange={(e) => searchAddress(e.target.value)}
                onFocus={() => {
                  if (addressSuggestions.length > 0)
                    setShowAddressSuggestions(true);
                }}
                onBlur={() =>
                  setTimeout(() => setShowAddressSuggestions(false), 200)
                }
                placeholder="Ex: 12 rue de la Paix, 75000 Paris"
                className="form-input"
              />
              {isSearchingAddress && (
                <div
                  style={{ position: "absolute", right: "10px", top: "14px" }}
                >
                  <Loader2
                    className="animate-spin"
                    size={16}
                    color="var(--color-primary)"
                  />
                </div>
              )}
              {showAddressSuggestions && addressSuggestions.length > 0 && (
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
                    zIndex: 10,
                    listStyle: "none",
                    padding: 0,
                    margin: "0.25rem 0 0 0",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {addressSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.properties.id}
                      onClick={() => {
                        setAdresse(suggestion.properties.label);
                        setShowAddressSuggestions(false);
                      }}
                      style={{
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--color-border)",
                        fontSize: "0.9rem",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#fafafa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      {suggestion.properties.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">État du bien *</label>
            <select
              required
              value={etatBien}
              onChange={(e) => setEtatBien(e.target.value)}
              className="form-select"
            >
              <option value="">Sélectionnez l'état</option>
              <option value="Vacant">Vacant</option>
              <option value="Occupé">Occupé</option>
              <option value="Inconnu">Inconnu</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Travaux à prévoir *</label>
            <div className="form-radio-group">
              <label className="form-radio-label">
                <input
                  type="radio"
                  name="travaux"
                  required
                  value="Oui"
                  checked={travaux === "Oui"}
                  onChange={(e) => setTravaux(e.target.value)}
                  className="form-radio-input"
                />{" "}
                Oui
              </label>
              <label className="form-radio-label">
                <input
                  type="radio"
                  name="travaux"
                  required
                  value="Non"
                  checked={travaux === "Non"}
                  onChange={(e) => setTravaux(e.target.value)}
                  className="form-radio-input"
                />{" "}
                Non
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Surface approximative en m² (optionnel)
            </label>
            <input
              type="number"
              min="0"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              placeholder="Ex: 85"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Commentaires / précisions (optionnel)
            </label>
            <textarea
              value={commentaires}
              onChange={(e) => setCommentaires(e.target.value)}
              rows={3}
              placeholder="Détails supplémentaires..."
              className="form-textarea"
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        {/* 2. Informations sur le propriétaire / contact */}
        <div className="form-section">
          <h2 className="form-section-title">
            Informations sur le propriétaire / contact
          </h2>

          <div className="form-group">
            <label className="form-label">Vous êtes *</label>
            <div className="form-radio-group">
              <label className="form-radio-label">
                <input
                  type="radio"
                  name="vousEtes"
                  required
                  value="Particulier"
                  checked={vousEtes === "Particulier"}
                  onChange={(e) => setVousEtes(e.target.value)}
                  className="form-radio-input"
                />{" "}
                Particulier
              </label>
              <label className="form-radio-label">
                <input
                  type="radio"
                  name="vousEtes"
                  required
                  value="Professionnel"
                  checked={vousEtes === "Professionnel"}
                  onChange={(e) => setVousEtes(e.target.value)}
                  className="form-radio-input"
                />{" "}
                Professionnel
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nom / Prénom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Jean Dupont"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean.dupont@email.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Téléphone (optionnel)</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="form-input"
            />
          </div>
        </div>

        {/* 3. État juridique du propriétaire */}
        <div className="form-section">
          <h2 className="form-section-title">État juridique du propriétaire</h2>

          <div className="form-group">
            <label className="form-label">Type de propriété / société</label>
            <select
              value={typePropriete}
              onChange={(e) => setTypePropriete(e.target.value)}
              className="form-select"
            >
              <option value="">Sélectionnez le type</option>
              <option value="Plein droit">Plein droit</option>
              <option value="Usufruit">Usufruit</option>
              <option value="SCI">SCI</option>
              <option value="Indivision">Indivision</option>
              <option value="Autres">Autres</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Statut société (si applicable)</label>
            <select
              value={statutSociete}
              onChange={(e) => setStatutSociete(e.target.value)}
              className="form-select"
            >
              <option value="">Sélectionnez le statut</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Liquidation">Liquidation</option>
              <option value="Redressement judiciaire">
                Redressement judiciaire
              </option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Propriétaire décédé</label>
            <div className="form-radio-group">
              <label className="form-radio-label">
                <input
                  type="radio"
                  name="decede"
                  value="Oui"
                  checked={proprietaireDecede === "Oui"}
                  onChange={(e) => setProprietaireDecede(e.target.value)}
                  className="form-radio-input"
                />{" "}
                Oui
              </label>
              <label className="form-radio-label">
                <input
                  type="radio"
                  name="decede"
                  value="Non"
                  checked={proprietaireDecede === "Non"}
                  onChange={(e) => setProprietaireDecede(e.target.value)}
                  className="form-radio-input"
                />{" "}
                Non
              </label>
              <label className="form-radio-label">
                <input
                  type="radio"
                  name="decede"
                  value="Inconnu"
                  checked={proprietaireDecede === "Inconnu"}
                  onChange={(e) => setProprietaireDecede(e.target.value)}
                  className="form-radio-input"
                />{" "}
                Inconnu
              </label>
            </div>
          </div>
        </div>

        {/* 4. Photos et documentation */}
        <div className="form-section">
          <h2 className="form-section-title">
            Photos et documentation{" "}
            <span
              style={{
                fontWeight: 400,
                fontSize: "1rem",
                color: "var(--color-text-muted)",
              }}
            >
              (optionnel)
            </span>
          </h2>

          <div className="form-group">
            <label className="form-label">Photos du bien</label>
            <label className="upload-zone">
              <UploadCloud
                size={32}
                color="var(--color-primary)"
                style={{ marginBottom: "1rem" }}
              />
              <span style={{ color: "var(--color-text-muted)" }}>
                Cliquez pour uploader des photos
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setPhotos(e.target.files)}
                style={{ display: "none" }}
              />
              {photos && photos.length > 0 && (
                <span
                  style={{
                    marginTop: "1rem",
                    fontWeight: 500,
                    color: "var(--color-primary)",
                  }}
                >
                  {photos.length} photo(s) sélectionnée(s)
                </span>
              )}
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              Documents ou observations complémentaires
            </label>
            <textarea
              value={documents}
              onChange={(e) => setDocuments(e.target.value)}
              rows={4}
              placeholder="Liens, remarques, détails..."
              className="form-textarea"
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "var(--space-8)",
          }}
        >
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              style={{ width: "100%" }}
            >
              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={24}
                  style={{ margin: "0 auto" }}
                />
              ) : (
                "Soumettre le dossier"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
