
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CameraIcon,
  Save,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Eye,
  ExternalLink,
  Upload,
  Navigation,
  LocateFixed,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL, STORAGE_URL } from "../../services/config";

const ProfilEntreprise = () => {
  const { user, token, updateUser } = useAuth();
  const transformateur = user?.transformateur || {};

  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [uploadingDocKey, setUploadingDocKey] = useState(null);
  const [uiMessage, setUiMessage] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [location, setLocation] = useState({
    latitude: transformateur.latitude || "",
    longitude: transformateur.longitude || "",
  });

  const [docs, setDocs] = useState({
    registre_commerce: transformateur.registre_commerce || null,
    piece_identite: transformateur.piece_identite || null,
    photo_atelier: transformateur.photo_atelier || null,
  });

  const pieceInputRef = useRef(null);
  const atelierInputRef = useRef(null);

  useEffect(() => {
    setLocation({
      latitude: transformateur.latitude || "",
      longitude: transformateur.longitude || "",
    });
    setDocs({
      registre_commerce: transformateur.registre_commerce || null,
      piece_identite: transformateur.piece_identite || null,
      photo_atelier: transformateur.photo_atelier || null,
    });
  }, [
    transformateur.latitude,
    transformateur.longitude,
    transformateur.registre_commerce,
    transformateur.piece_identite,
    transformateur.photo_atelier,
  ]);

  const getDocumentUrl = (docPath) => {
    if (!docPath) return null;
    if (/^https?:\/\//i.test(docPath)) return docPath;
    return `${STORAGE_URL}/${String(docPath).replace(/^\/+/, "")}`;
  };

  const uploadDocument = async (key, file) => {
    if (!file || !token) return;

    setUiMessage(null);
    setUploadingDocKey(key);

    try {
      const form = new FormData();
      form.append(key, file);

      const res = await fetch(`${API_URL}/transformateur/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUiMessage({ type: "danger", text: data.message || "Mise a jour impossible" });
        return;
      }

      setDocs((prev) => ({ ...prev, ...(data.documents || {}) }));
      if (data.user && updateUser) updateUser(data.user);

      setUiMessage({ type: "success", text: "Document mis a jour avec succes." });
    } catch {
      setUiMessage({ type: "danger", text: "Erreur technique lors de l upload." });
    } finally {
      setUploadingDocKey(null);
    }
  };

  const saveLocation = async (latitude, longitude) => {
    if (!token) {
      setUiMessage({ type: "danger", text: "Session invalide. Reconnectez-vous." });
      return;
    }

    setIsSaving(true);
    setUiMessage(null);

    try {
      const payload = {
        nom_complet: user?.nom_complet || "",
        telephone: user?.telephone || "",
        nom_entreprise: transformateur.nom_entreprise || "",
        departement: transformateur.departement || "",
        commune: transformateur.commune || "",
        description: transformateur.description || "",
        latitude,
        longitude,
      };

      const res = await fetch(`${API_URL}/transformateur/parametres/generales`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUiMessage({ type: "danger", text: data.message || "Impossible d enregistrer la localisation." });
        return;
      }

      if (data.user && updateUser) updateUser(data.user);
      setUiMessage({ type: "success", text: "Localisation enregistree avec succes." });
    } catch {
      setUiMessage({ type: "danger", text: "Erreur technique lors de l enregistrement GPS." });
    } finally {
      setIsSaving(false);
    }
  };

  const useCurrentLocation = () => {
    setUiMessage({ type: "info", text: "Activez la localisation de votre appareil puis autorisez AgroStock." });

    if (!navigator.geolocation) {
      setUiMessage({ type: "danger", text: "Geolocalisation non disponible sur cet appareil." });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude.toFixed(7));
        const longitude = Number(position.coords.longitude.toFixed(7));
        const accuracy = Math.round(position.coords.accuracy || 0);

        setLocation({ latitude, longitude });
        setLocationAccuracy(accuracy);

        if (accuracy > 60) {
          setUiMessage({ type: "warning", text: `Position recuperee (${accuracy}m). Reessayez pour meilleure precision.` });
          setIsLocating(false);
          return;
        }

        await saveLocation(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        let message = "Impossible de recuperer votre position.";
        if (error.code === 1) message = "Autorisation refusee. Activez la localisation puis reessayez.";
        if (error.code === 2) message = "Position indisponible. Verifiez le signal GPS.";
        if (error.code === 3) message = "Delai depasse. Reessayez dans une zone mieux couverte.";
        setUiMessage({ type: "danger", text: message });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const gpsLink = location.latitude && location.longitude ? `https://maps.google.com/?q=${location.latitude},${location.longitude}` : null;

  const documents = useMemo(
    () => [
      { key: "registre_commerce", label: "Registre de commerce (RCCM)", path: docs.registre_commerce, canEdit: false },
      { key: "piece_identite", label: "Piece d identite", path: docs.piece_identite, canEdit: true },
      { key: "photo_atelier", label: "Photo de l atelier", path: docs.photo_atelier, canEdit: true },
    ],
    [docs]
  );

  return (
    <div style={{ maxWidth: "980px" }}>
      <div className="mb-5">
        <h2 className="fw-bold text-dark mb-1">Profil entreprise</h2>
        <p className="text-muted mb-0">Informations publiques et documents de certification</p>
      </div>

      {uiMessage && (
        <div className={`alert alert-${uiMessage.type} d-flex justify-content-between align-items-center mb-4`} role="alert">
          <span>{uiMessage.text}</span>
          <button type="button" className="btn-close" aria-label="Fermer" onClick={() => setUiMessage(null)}></button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 rounded-4 shadow-sm bg-white p-4 text-center">
            <div className="position-relative d-inline-block mx-auto mb-4">
              <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center fw-bold fs-1" style={{ width: "120px", height: "120px" }}>
                {user?.nom_complet?.charAt(0) || "T"}
              </div>
              <button className="btn btn-success rounded-circle position-absolute bottom-0 end-0 p-2 shadow-sm border-white border-2" style={{ width: "35px", height: "35px" }}>
                <CameraIcon size={16} />
              </button>
            </div>
            <h5 className="fw-bold text-dark mb-1">{transformateur.nom_entreprise || user?.nom_complet}</h5>
            <p className="text-muted small mb-3">Partenaire AgroStock depuis Juin 2026</p>
            <div className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fw-medium d-inline-flex align-items-center gap-1 border border-success border-opacity-10">
              <ShieldCheck size={14} /> Profil verifie
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden">
            <div className="card-header bg-white border-bottom p-4">
              <h5 className="fw-bold text-dark mb-0">Localisation du vendeur</h5>
            </div>
            <div className="card-body p-4">
              <div className="border rounded-3 p-3 bg-light">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                  <div className="small fw-bold text-dark d-flex align-items-center gap-2">
                    <LocateFixed size={15} className="text-success" /> Position GPS de l atelier
                  </div>
                  <button type="button" className="btn btn-outline-success btn-sm rounded-pill fw-bold d-inline-flex align-items-center gap-2" onClick={useCurrentLocation} disabled={isLocating}>
                    <Navigation size={14} /> {isLocating ? "Localisation en cours..." : "Utiliser ma position actuelle"}
                  </button>
                </div>
                <div className="small text-muted mb-2">
                  Activez la localisation de votre appareil au moment opportun, puis cliquez sur le bouton pour enregistrer la position.
                </div>
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label small text-muted mb-1">Latitude</label>
                    <input type="text" className="form-control form-control-sm" value={location.latitude || ""} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted mb-1">Longitude</label>
                    <input type="text" className="form-control form-control-sm" value={location.longitude || ""} readOnly />
                  </div>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-3 mt-2">
                  {locationAccuracy !== null && <span className="small text-muted">Precision: {locationAccuracy}m</span>}
                  {gpsLink && (
                    <a href={gpsLink} target="_blank" rel="noreferrer" className="small text-success fw-bold text-decoration-none">
                      Ouvrir sur Google Maps
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4 text-end">
                <button className="btn btn-success rounded-pill px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2 py-2" onClick={() => saveLocation(location.latitude || null, location.longitude || null)} disabled={isSaving}>
                  {isSaving ? <span className="spinner-border spinner-border-sm"></span> : <Save size={18} />}
                  Sauvegarder la localisation
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 mt-4">
          <div className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden">
            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FileCheck size={20} className="text-success" /> Documents de certification
              </h5>
              <span className="text-muted small">Voir et modifier vos pieces justificatives.</span>
            </div>

            <div className="card-body p-4">
              <div className="row g-4">
                {documents.map((doc) => {
                  const docUrl = getDocumentUrl(doc.path);
                  const isAvailable = Boolean(docUrl);
                  const isUploading = uploadingDocKey === doc.key;

                  return (
                    <div className="col-md-4" key={doc.key}>
                      <div className="doc-card p-4 rounded-4 border h-100 d-flex flex-column justify-content-between">
                        <div>
                          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "42px", height: "42px" }}>
                            <FileCheck size={20} />
                          </div>
                          <div className="fw-bold text-dark mb-2" style={{ minHeight: "44px" }}>{doc.label}</div>

                          {isAvailable ? (
                            <div className="text-success small fw-bold mb-3 d-flex align-items-center gap-1">
                              <CheckCircle2 size={14} /> Document disponible
                            </div>
                          ) : (
                            <div className="text-muted small fw-bold mb-3">Document non fourni</div>
                          )}
                        </div>

                        <div className="d-grid gap-2">
                          <a href={docUrl || "#"} target="_blank" rel="noreferrer" className={`btn btn-sm rounded-pill fw-bold d-inline-flex align-items-center justify-content-center gap-2 ${isAvailable ? "btn-success" : "btn-outline-secondary disabled"}`} onClick={(e) => !isAvailable && e.preventDefault()}>
                            <Eye size={15} /> Voir le document
                          </a>

                          <a href={docUrl || "#"} target="_blank" rel="noreferrer" className={`btn btn-sm rounded-pill fw-bold d-inline-flex align-items-center justify-content-center gap-2 ${isAvailable ? "btn-light border" : "btn-outline-secondary disabled"}`} onClick={(e) => !isAvailable && e.preventDefault()}>
                            <ExternalLink size={14} /> Ouvrir dans un nouvel onglet
                          </a>

                          {doc.canEdit && (
                            <button type="button" className="btn btn-sm btn-outline-success rounded-pill fw-bold d-inline-flex align-items-center justify-content-center gap-2" onClick={() => { if (doc.key === "piece_identite") pieceInputRef.current?.click(); if (doc.key === "photo_atelier") atelierInputRef.current?.click(); }} disabled={isUploading}>
                              {isUploading ? <><span className="spinner-border spinner-border-sm"></span> Upload...</> : <><Upload size={14} /> Modifier</>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <input ref={pieceInputRef} type="file" accept="image/*" className="d-none" onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadDocument("piece_identite", file); e.target.value = ""; }} />
      <input ref={atelierInputRef} type="file" accept="image/*" className="d-none" onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadDocument("photo_atelier", file); e.target.value = ""; }} />

      <style>{`
        .spinner-border-sm {
          --bs-spinner-width: 1.1rem;
          --bs-spinner-height: 1.1rem;
        }
        .doc-card {
          background: linear-gradient(180deg, #f7fdf9 0%, #ffffff 45%);
          border-color: rgba(26, 178, 115, 0.22) !important;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .doc-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(10, 72, 44, 0.08);
        }
      `}</style>
    </div>
  );
};

export default ProfilEntreprise;
