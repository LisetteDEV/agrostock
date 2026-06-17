import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LogOut,
  ShoppingBag,
  Clock,
  DollarSign,
  Heart,
  MapPin,
  Truck,
  CheckCircle2,
  Package,
  Star,
  Send,
  Trash2,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from '../../services/config';
const STATUS_META = {
  en_attente_confirmation: {
    label: "En attente de confirmation",
    badge: "bg-secondary text-white",
  },
  confirmee: { label: "Confirmee", badge: "bg-primary text-white" },
  en_cours_livraison: {
    label: "En cours de livraison",
    badge: "bg-warning text-dark",
  },
  livree: { label: "Livree (a confirmer)", badge: "bg-success text-white" },
  recue: { label: "Reception confirmee", badge: "bg-success text-white" },
  litige_ouvert: { label: "Litige ouvert", badge: "bg-danger text-white" },
  remboursee: { label: "Remboursee", badge: "bg-warning text-dark" },
  annulee_auto: { label: "Annulee auto", badge: "bg-danger text-white" },
  annulee: { label: "Annulee", badge: "bg-danger text-white" },
};

const FINAL_STATUSES = ["recue", "remboursee", "annulee_auto", "annulee"];
const SPENT_STATUSES = ["recue"];

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const pastOrders = orders.filter((o) => FINAL_STATUSES.includes(o.statut));
  const activeOrders = orders.filter((o) => !FINAL_STATUSES.includes(o.statut));
  const totalSpent = orders
    .filter((o) => SPENT_STATUSES.includes(o.statut))
    .reduce((acc, o) => acc + parseFloat(o.montant_total || 0), 0);

  const openDisputes = orders.filter((o) => o.statut === "litige_ouvert");
  const refundedOrders = orders.filter(
    (o) => o.statut === "remboursee" || o.statut === "annulee_auto",
  );

  // Avis
  const [avis, setAvis] = useState([]);
  const [transformateurs, setTransformateurs] = useState([]);
  const [newAvis, setNewAvis] = useState({
    transformateur_id: "",
    note: 5,
    commentaire: "",
  });
  const [avisSent, setAvisSent] = useState(false);
  const [avisError, setAvisError] = useState("");
  const [avisLoading, setAvisLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/avis/mes-avis`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => setAvis(data.avis || []))
      .catch(() => setAvis([]));

    fetch(`${API_URL}/transformateurs/publics`)
      .then((r) => r.json())
      .then((data) => setTransformateurs(data.transformateurs || []))
      .catch(() => setTransformateurs([]));

    fetch(`${API_URL}/acheteur/commandes`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => setOrders(data.commandes || []))
      .catch(() => setOrders([]));
  }, [token]);

  const handleSubmitAvis = async (e) => {
    e.preventDefault();
    if (!newAvis.commentaire.trim() || !newAvis.transformateur_id) return;
    setAvisLoading(true);
    setAvisError("");

    try {
      const res = await fetch(`${API_URL}/avis`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(newAvis),
      });
      const data = await res.json();
      if (!res.ok) {
        setAvisError(data.message || "Une erreur est survenue.");
      } else {
        setAvis((prev) => [data.avis, ...prev]);
        setNewAvis({ transformateur_id: "", note: 5, commentaire: "" });
        setAvisSent(true);
        setTimeout(() => setAvisSent(false), 3000);
      }
    } catch {
      setAvisError("Erreur de connexion au serveur.");
    } finally {
      setAvisLoading(false);
    }
  };

  const handleDeleteAvis = async (avisId) => {
    try {
      await fetch(`${API_URL}/avis/${avisId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setAvis((prev) => prev.filter((a) => a.id !== avisId));
    } catch {
      /* ignore */
    }
  };

  const StarInput = ({ value, onChange }) => (
    <div className="d-flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="btn p-0 border-0 bg-transparent"
          style={{ cursor: "pointer" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill={i <= value ? "#f59e0b" : "#e2e8f0"}
            viewBox="0 0 16 16"
          >
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
          </svg>
        </button>
      ))}
    </div>
  );

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const getStatusMeta = (statut) => {
    return (
      STATUS_META[statut] || {
        label: String(statut || "N/A").replace("_", " "),
        badge: "bg-secondary text-white",
      }
    );
  };

  const latestTrackedOrder = activeOrders[0] || orders[0] || null;

  const getProgressIndex = (statut) => {
    switch (statut) {
      case "en_attente_confirmation":
        return 1;
      case "confirmee":
        return 2;
      case "en_cours_livraison":
        return 3;
      case "livree":
      case "recue":
      case "litige_ouvert":
      case "remboursee":
      case "annulee_auto":
        return 4;
      default:
        return 1;
    }
  };

  const progressIndex = latestTrackedOrder
    ? getProgressIndex(latestTrackedOrder.statut)
    : 0;
  const progressWidth =
    progressIndex > 0 ? `${((progressIndex - 1) / 3) * 100}%` : "0%";

  if (!user) {
    return (
      <div className="container py-5 mt-5 text-center">
        <h2>Veuillez vous connecter pour acceder a votre tableau de bord.</h2>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 pb-5" style={{ paddingTop: "80px" }}>
      {/* HERO SECTION DASHBOARD */}
      <div
        className="position-relative text-white pb-5 mb-5 overflow-hidden"
        style={{
          background: "#0a1d13",
          borderBottomLeftRadius: "2rem",
          borderBottomRightRadius: "2rem",
          paddingTop: "3rem",
        }}
      >
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "400px",
            height: "400px",
            filter: "blur(100px)",
            opacity: 0.15,
            top: "20%",
            left: "-10%",
            background: "#1ab273",
            zIndex: 1,
          }}
        />
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "500px",
            height: "500px",
            filter: "blur(120px)",
            opacity: 0.1,
            bottom: "-20%",
            right: "-10%",
            background: "#1ab273",
            zIndex: 1,
          }}
        />
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
            <div className="d-flex align-items-center gap-3">
              <div
                className="bg-white text-success rounded-circle d-flex align-items-center justify-content-center shadow"
                style={{
                  width: "60px",
                  height: "60px",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                {user.nom_complet
                  ? user.nom_complet.charAt(0).toUpperCase()
                  : "A"}
              </div>
              <div>
                <h4 className="fw-bold mb-1">Tableau de bord</h4>
                <p className="mb-0 text-white-50">
                  Bienvenue,{" "}
                  <span className="fw-bold text-white">
                    {user.nom_complet || "Acheteur"}
                  </span>
                </p>
              </div>
            </div>
            <div className="d-flex gap-3">
              <Link
                to="/catalogue"
                className="btn btn-light rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
              >
                <ShoppingBag size={18} /> Nouveau panier
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline-light d-flex align-items-center gap-2 rounded-pill px-4 fw-bold transition-all"
              >
                <LogOut size={18} /> Deconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "-80px" }}>
        <div className="row g-4 mb-5 position-relative" style={{ zIndex: 3 }}>
          {[
            {
              label: "Commandes terminees",
              value: pastOrders.length,
              icon: <ShoppingBag size={24} className="text-primary" />,
              bgColor: "rgba(13, 110, 253, 0.15)",
            },
            {
              label: "Commandes en cours",
              value: activeOrders.length,
              icon: <Clock size={24} className="text-warning" />,
              bgColor: "rgba(255, 193, 7, 0.15)",
            },
            {
              label: "Total depense (FCFA)",
              value:
                totalSpent > 0
                  ? Number(totalSpent).toLocaleString("fr-FR")
                  : "0",
              icon: <DollarSign size={24} className="text-success" />,
              bgColor: "rgba(26, 178, 115, 0.15)",
            },
            {
              label: "Produits en favoris",
              value: "0",
              icon: <Heart size={24} className="text-danger" />,
              bgColor: "rgba(220, 53, 69, 0.15)",
            },
          ].map((s, i) => (
            <div className="col-6 col-lg-3" key={i}>
              <div
                className="card border-0 shadow-lg rounded-4 p-4 h-100 text-white transition-all hover-translate-up"
                style={{ background: "#0a1d13" }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div
                    className="p-3 rounded-circle"
                    style={{ backgroundColor: s.bgColor }}
                  >
                    {s.icon}
                  </div>
                  <h3 className="fw-bold mb-0 text-white">{s.value}</h3>
                </div>
                <h6
                  className="mb-0 fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  {s.label}
                </h6>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div
              className="card border-0 shadow-lg rounded-4 h-100 overflow-hidden text-white"
              style={{ background: "#0a1d13" }}
            >
              <div
                className="card-header border-bottom border-secondary p-4 d-flex justify-content-between align-items-center"
                style={{ background: "#0e261a" }}
              >
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-white">
                  <MapPin className="text-success" size={20} /> Suivi de
                  commande
                </h5>
                <span className="badge bg-success bg-opacity-25 text-success rounded-pill px-3 py-2 fw-bold">
                  {latestTrackedOrder ? latestTrackedOrder.numero : "Aucune"}
                </span>
              </div>
              <div className="card-body p-4 p-md-5">
                {!latestTrackedOrder ? (
                  <div className="text-center text-muted py-4">
                    <Package size={42} className="mb-2 opacity-25" />
                    <p className="mb-0">
                      Aucune commande a suivre pour le moment.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0 text-white">
                        Statut de la livraison
                      </h6>
                      <span
                        className={`badge px-2 rounded-pill ${getStatusMeta(latestTrackedOrder.statut).badge}`}
                        style={{ fontSize: "0.72rem" }}
                      >
                        {getStatusMeta(latestTrackedOrder.statut).label}
                      </span>
                    </div>

                    <div className="position-relative d-flex justify-content-between">
                      <div
                        className="position-absolute top-50 start-0 w-100"
                        style={{
                          height: "4px",
                          transform: "translateY(-50%)",
                          zIndex: 1,
                          backgroundColor: "#183827",
                        }}
                      ></div>
                      <div
                        className="position-absolute top-50 start-0 bg-success"
                        style={{
                          height: "4px",
                          transform: "translateY(-50%)",
                          zIndex: 2,
                          width: progressWidth,
                        }}
                      ></div>

                      {[
                        {
                          idx: 1,
                          label: "Validation",
                          icon: <Package size={18} />,
                        },
                        {
                          idx: 2,
                          label: "Preparation",
                          icon: <Package size={18} />,
                        },
                        {
                          idx: 3,
                          label: "En transit",
                          icon: <Truck size={18} />,
                        },
                        {
                          idx: 4,
                          label: "Livree",
                          icon: <CheckCircle2 size={18} />,
                        },
                      ].map((step) => {
                        const active = progressIndex >= step.idx;
                        return (
                          <div
                            key={step.idx}
                            className="text-center position-relative"
                            style={{ zIndex: 3 }}
                          >
                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 border border-2 border-dark ${active ? "bg-success text-white" : "text-muted"}`}
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: active ? undefined : "#0e261a",
                              }}
                            >
                              {step.icon}
                            </div>
                            <span
                              className={`small d-block ${active ? "text-white fw-bold" : "text-muted"}`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {latestTrackedOrder.statut === "litige_ouvert" && (
                      <div className="alert alert-danger mt-4 mb-0 py-2 small d-flex align-items-center gap-2">
                        <AlertTriangle size={16} /> Un litige est ouvert sur
                        cette commande. L'administration est en cours d'analyse.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Commandes recentes</h5>
                <Link
                  to="/mes-commandes"
                  className="btn btn-link text-success p-0 text-decoration-none small fw-bold"
                >
                  Voir tout
                </Link>
              </div>
              <div className="card-body p-4">
                {orders.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {orders.slice(0, 3).map((cmd, idx) => {
                      const status = getStatusMeta(cmd.statut);
                      return (
                        <div
                          key={idx}
                          className="d-flex justify-content-between align-items-center p-3 rounded-3"
                          style={{
                            background: "#f8fbf8",
                            border: "1px solid #e1e9e4",
                          }}
                        >
                          <div>
                            <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                              <ShoppingBag size={16} className="text-success" />{" "}
                              {cmd.numero}
                            </h6>
                            <small className="text-muted">
                              {new Date(cmd.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </small>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold text-success mb-1">
                              {Number(cmd.montant_total).toLocaleString(
                                "fr-FR",
                              )}{" "}
                              FCFA
                            </div>
                            <span
                              className={`badge px-2 rounded-pill ${status.badge}`}
                              style={{ fontSize: "0.7rem" }}
                            >
                              {status.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <ShoppingBag
                      size={40}
                      className="mb-3 text-muted opacity-25"
                    />
                    <p className="mb-0 fw-bold">
                      Aucune commande pour le moment
                    </p>
                    <p className="small">Vos commandes apparaitront ici.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <ShieldAlert size={18} className="text-danger" /> Litiges &
                  remboursements
                </h5>
                <Link
                  to="/mes-commandes"
                  className="btn btn-link text-danger p-0 text-decoration-none small fw-bold"
                >
                  Gerer
                </Link>
              </div>
              <div className="card-body p-4">
                {openDisputes.length === 0 && refundedOrders.length === 0 ? (
                  <div className="text-center text-muted py-2">
                    <p className="mb-0 small">
                      Aucun litige ni remboursement en cours.
                    </p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {openDisputes.slice(0, 3).map((o) => (
                      <div
                        key={`d-${o.id}`}
                        className="small d-flex justify-content-between align-items-center border rounded-3 p-2"
                      >
                        <span className="fw-bold text-dark">{o.numero}</span>
                        <span className="badge bg-danger text-white">
                          Litige ouvert
                        </span>
                      </div>
                    ))}
                    {refundedOrders.slice(0, 2).map((o) => (
                      <div
                        key={`r-${o.id}`}
                        className="small d-flex justify-content-between align-items-center border rounded-3 p-2"
                      >
                        <span className="fw-bold text-dark">{o.numero}</span>
                        <span className="badge bg-warning text-dark">
                          Remboursee
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section */}
        <div className="mt-5">
          <div className="d-flex align-items-center gap-2 mb-4">
            <Star size={22} className="text-warning" />
            <h4 className="fw-bold mb-0">Mes Avis Transformateurs</h4>
          </div>

          <div className="row g-4">
            {/* Formulaire */}
            <div className="col-lg-5">
              <div
                className="card border-0 shadow-lg rounded-4 overflow-hidden"
                style={{ background: "#0a1d13" }}
              >
                <div
                  className="card-header border-0 p-4"
                  style={{ background: "#0e261a" }}
                >
                  <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                    <Star size={18} className="text-warning" /> Laisser un avis
                  </h5>
                  <p className="text-muted small mb-0 mt-1">
                    Partagez votre experience avec la communaute
                  </p>
                </div>
                <div className="card-body p-4">
                  {avisSent && (
                    <div
                      className="alert border-0 rounded-3 mb-3 d-flex align-items-center gap-2"
                      style={{
                        background: "rgba(26,178,115,0.15)",
                        color: "#6ee7b7",
                      }}
                    >
                      <CheckCircle2 size={16} /> Avis publie avec succes !
                    </div>
                  )}
                  <form onSubmit={handleSubmitAvis}>
                    <div className="mb-3">
                      <label
                        className="form-label small fw-bold"
                        style={{ color: "#8a9b92" }}
                      >
                        TRANSFORMATEUR *
                      </label>
                      <select
                        className="form-select rounded-3 border-0"
                        style={{ background: "#0e261a", color: "#fff" }}
                        value={newAvis.transformateur_id}
                        onChange={(e) =>
                          setNewAvis((prev) => ({
                            ...prev,
                            transformateur_id: e.target.value,
                          }))
                        }
                        required
                      >
                        <option value="">-- Selectionner --</option>
                        {transformateurs.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nom_entreprise}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label
                        className="form-label small fw-bold"
                        style={{ color: "#8a9b92" }}
                      >
                        NOTE *
                      </label>
                      <StarInput
                        value={newAvis.note}
                        onChange={(v) =>
                          setNewAvis((prev) => ({ ...prev, note: v }))
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        className="form-label small fw-bold"
                        style={{ color: "#8a9b92" }}
                      >
                        COMMENTAIRE *
                      </label>
                      <textarea
                        className="form-control border-0 rounded-3"
                        style={{
                          background: "#0e261a",
                          color: "#fff",
                          resize: "none",
                        }}
                        rows="4"
                        placeholder="Decrivez votre experience..."
                        value={newAvis.commentaire}
                        onChange={(e) =>
                          setNewAvis((prev) => ({
                            ...prev,
                            commentaire: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    {avisError && (
                      <div
                        className="alert border-0 rounded-3 mb-3 small"
                        style={{
                          background: "rgba(220,53,69,0.15)",
                          color: "#f87171",
                        }}
                      >
                        {avisError}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={avisLoading}
                      className="btn w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                      style={{
                        background:
                          "linear-gradient(135deg, #1ab273 0%, #105c38 100%)",
                        color: "#fff",
                      }}
                    >
                      {avisLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" />{" "}
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Publier l'avis
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Liste des avis */}
            <div className="col-lg-7">
              <div
                className="card border-0 shadow-lg rounded-4 overflow-hidden"
                style={{ background: "#0a1d13", minHeight: "200px" }}
              >
                <div
                  className="card-header border-0 p-4"
                  style={{ background: "#0e261a" }}
                >
                  <h5 className="fw-bold mb-0 text-white">
                    Mes avis publies ({avis.length})
                  </h5>
                </div>
                <div className="card-body p-4">
                  {avis.length === 0 ? (
                    <div className="text-center py-4">
                      <Star size={40} className="text-muted opacity-25 mb-3" />
                      <p className="text-muted mb-0">
                        Vous n'avez pas encore publie d'avis.
                      </p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {avis.map((a, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-3 position-relative"
                          style={{
                            background: "#0e261a",
                            border: "1px solid #183827",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <span className="fw-bold text-white">
                                {a.transformateur_nom}
                              </span>
                              <div className="d-flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <svg
                                    key={s}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    fill={s <= a.note ? "#f59e0b" : "#283d30"}
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small style={{ color: "#b9c8c0" }}>
                                {new Date(a.date).toLocaleDateString("fr-FR")}
                              </small>
                              <button
                                onClick={() => handleDeleteAvis(a.id)}
                                className="btn btn-link text-danger p-0 border-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="small mb-0 fst-italic" style={{ color: "#d8e5de", lineHeight: "1.55" }}>
                            "{a.commentaire}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
                .hover-translate-up:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
                }
            `}</style>
    </div>
  );
};

export default Dashboard;



