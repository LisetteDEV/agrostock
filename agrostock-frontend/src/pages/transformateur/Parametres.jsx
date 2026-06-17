import React, { useEffect, useState } from "react";
import {
  Settings,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Building2,
  Phone,
  User,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/config";

const AlertMsg = ({ type, msg }) => {
  if (!msg) return null;
  const isSuccess = type === "success";
  return (
    <div className={`d-flex align-items-center gap-2 p-3 rounded-3 mb-3 ${isSuccess ? "bg-success" : "bg-danger"} bg-opacity-15`}>
      {isSuccess ? <CheckCircle size={16} className="text-success flex-shrink-0" /> : <AlertCircle size={16} className="text-danger flex-shrink-0" />}
      <span className={`small fw-bold ${isSuccess ? "text-success" : "text-danger"}`}>{msg}</span>
    </div>
  );
};

const ParametresTransformateur = () => {
  const { token, user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("generales");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [generalForm, setGeneralForm] = useState({
    nom_complet: "",
    telephone: "",
    nom_entreprise: "",
    departement: "",
    commune: "",
    description: "",
  });
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalAlert, setGeneralAlert] = useState(null);

  const [pwForm, setPwForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwAlert, setPwAlert] = useState(null);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileError("");

      try {
        const res = await fetch(`${API_URL}/transformateur/parametres/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const data = await res.json();

        if (!res.ok) {
          setProfileError(data.message || "Impossible de charger vos parametres.");
          return;
        }

        setGeneralForm({
          nom_complet: data.nom_complet || "",
          telephone: data.telephone || "",
          nom_entreprise: data.transformateur?.nom_entreprise || "",
          departement: data.transformateur?.departement || "",
          commune: data.transformateur?.commune || "",
          description: data.transformateur?.description || "",
        });
      } catch {
        setProfileError("Erreur de connexion au serveur.");
      } finally {
        setLoadingProfile(false);
      }
    };

    if (token) {
      loadProfile();
    } else {
      setLoadingProfile(false);
      setProfileError("Session invalide. Reconnectez-vous.");
    }
  }, [token]);

  const saveGenerales = async (e) => {
    e.preventDefault();
    setGeneralSaving(true);
    setGeneralAlert(null);

    try {
      const res = await fetch(`${API_URL}/transformateur/parametres/generales`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(generalForm),
      });

      const data = await res.json();
      setGeneralAlert({ type: res.ok ? "success" : "error", msg: data.message || "Erreur de mise a jour" });
      if (res.ok && data.user && updateUser) {
        updateUser(data.user);
      }
    } catch {
      setGeneralAlert({ type: "error", msg: "Erreur de connexion au serveur." });
    }

    setGeneralSaving(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.password_confirmation) {
      setPwAlert({ type: "error", msg: "Les mots de passe ne correspondent pas." });
      return;
    }

    setPwSaving(true);
    setPwAlert(null);

    try {
      const res = await fetch(`${API_URL}/transformateur/parametres/password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(pwForm),
      });

      const data = await res.json();
      if (res.ok) {
        setPwAlert({ type: "success", msg: data.message || "Mot de passe mis a jour" });
        setPwForm({ current_password: "", password: "", password_confirmation: "" });
      } else {
        setPwAlert({ type: "error", msg: data.message || "Mise a jour impossible" });
      }
    } catch {
      setPwAlert({ type: "error", msg: "Erreur de connexion au serveur." });
    }

    setPwSaving(false);
  };

  const sections = [
    {
      id: "generales",
      title: "Informations generales",
      desc: "Coordonnees et informations de votre entreprise",
      icon: <Settings size={20} />,
      color: "#1ab273",
      content: (
        <form onSubmit={saveGenerales} className="mt-3">
          <AlertMsg type={generalAlert?.type} msg={generalAlert?.msg} />
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">NOM COMPLET</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><User size={16} className="text-muted" /></span>
                <input className="form-control bg-light border-0" value={generalForm.nom_complet} onChange={(e) => setGeneralForm((p) => ({ ...p, nom_complet: e.target.value }))} required />
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">TELEPHONE</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><Phone size={16} className="text-muted" /></span>
                <input className="form-control bg-light border-0" value={generalForm.telephone} onChange={(e) => setGeneralForm((p) => ({ ...p, telephone: e.target.value }))} required />
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">NOM ENTREPRISE</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><Building2 size={16} className="text-muted" /></span>
                <input className="form-control bg-light border-0" value={generalForm.nom_entreprise} onChange={(e) => setGeneralForm((p) => ({ ...p, nom_entreprise: e.target.value }))} required />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold text-muted">DEPARTEMENT</label>
              <input className="form-control bg-light border-0" value={generalForm.departement} onChange={(e) => setGeneralForm((p) => ({ ...p, departement: e.target.value }))} />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold text-muted">COMMUNE</label>
              <input className="form-control bg-light border-0" value={generalForm.commune} onChange={(e) => setGeneralForm((p) => ({ ...p, commune: e.target.value }))} />
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-muted">DESCRIPTION</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><MapPin size={16} className="text-muted" /></span>
                <textarea className="form-control bg-light border-0" rows="3" value={generalForm.description} onChange={(e) => setGeneralForm((p) => ({ ...p, description: e.target.value }))}></textarea>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" disabled={generalSaving} className="btn btn-success rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2">
              <Save size={16} /> {generalSaving ? "Sauvegarde..." : "Enregistrer"}
            </button>
          </div>
        </form>
      ),
    },
    {
      id: "securite",
      title: "Securite",
      desc: "Changer votre mot de passe",
      icon: <Shield size={20} />,
      color: "#3b82f6",
      content: (
        <form onSubmit={savePassword} className="mt-3">
          <AlertMsg type={pwAlert?.type} msg={pwAlert?.msg} />
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-bold text-muted">MOT DE PASSE ACTUEL</label>
              <div className="position-relative">
                <input type={showPw.current ? "text" : "password"} className="form-control bg-light border-0 pe-5" value={pwForm.current_password} onChange={(e) => setPwForm((p) => ({ ...p, current_password: e.target.value }))} required />
                <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-2" onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}>{showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">NOUVEAU MOT DE PASSE</label>
              <div className="position-relative">
                <input type={showPw.next ? "text" : "password"} className="form-control bg-light border-0 pe-5" value={pwForm.password} onChange={(e) => setPwForm((p) => ({ ...p, password: e.target.value }))} minLength={6} required />
                <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-2" onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))}>{showPw.next ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">CONFIRMATION</label>
              <div className="position-relative">
                <input type={showPw.confirm ? "text" : "password"} className="form-control bg-light border-0 pe-5" value={pwForm.password_confirmation} onChange={(e) => setPwForm((p) => ({ ...p, password_confirmation: e.target.value }))} required />
                <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-2" onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}>{showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" disabled={pwSaving} className="btn btn-primary rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2">
              <Shield size={16} /> {pwSaving ? "Mise a jour..." : "Changer le mot de passe"}
            </button>
          </div>
        </form>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1 text-dark">Parametres</h4>
        <span className="text-muted small">Gerez votre compte transformateur</span>
      </div>

      {loadingProfile && (
        <div className="card border-0 rounded-4 shadow-sm p-4 mb-3">
          <span className="text-muted small">Chargement des parametres...</span>
        </div>
      )}

      {!loadingProfile && profileError && <AlertMsg type="error" msg={profileError} />}

      {!loadingProfile && !user && (
        <AlertMsg type="error" msg="Vous devez etre connecte pour modifier vos parametres." />
      )}

      <div className="d-flex flex-column gap-3">
        {sections.map((s) => {
          const isOpen = activeSection === s.id;
          return (
            <div key={s.id} className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white">
              <button
                onClick={() => setActiveSection(isOpen ? null : s.id)}
                className="btn w-100 d-flex align-items-center gap-3 p-4 text-start"
                style={{ background: "transparent", borderBottom: isOpen ? "1px solid #eef2f7" : "none" }}
              >
                <div className="p-3 rounded-circle flex-shrink-0" style={{ background: `${s.color}20`, color: s.color }}>
                  {s.icon}
                </div>
                <div className="flex-grow-1">
                  <h6 className="fw-bold text-dark mb-1">{s.title}</h6>
                  <p className="text-muted small mb-0">{s.desc}</p>
                </div>
                <ChevronDown size={20} className="text-muted flex-shrink-0" style={{ transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>

              {isOpen && <div className="p-4">{s.content}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParametresTransformateur;
