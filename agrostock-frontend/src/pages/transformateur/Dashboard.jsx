import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  BarChart3,
  Star,
  Plus,
  Clock,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/config";

const STATUS_META = {
  en_attente_confirmation: {
    label: "En attente",
    badge: "bg-secondary text-white",
  },
  confirmee: { label: "Confirmee", badge: "bg-primary text-white" },
  en_cours_livraison: { label: "En livraison", badge: "bg-warning text-dark" },
  livree: { label: "Livree", badge: "bg-success text-white" },
  recue: { label: "Reception confirmee", badge: "bg-success text-white" },
  litige_ouvert: { label: "Litige ouvert", badge: "bg-danger text-white" },
  remboursee: { label: "Remboursee", badge: "bg-warning text-dark" },
  annulee_auto: { label: "Annulee auto", badge: "bg-danger text-white" },
};

const ESCROW_HOLD_STATUSES = [
  "en_attente_confirmation",
  "confirmee",
  "en_cours_livraison",
  "livree",
  "litige_ouvert",
];

const normalizeStatus = (status) =>
  status === "en_cours" ? "en_cours_livraison" : status;

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState({
    ventesNettes: 0,
    produits: 0,
    escrowEstime: 0,
    note: 0,
    totalAvis: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const litigesOuverts = useMemo(
    () => recentOrders.filter((o) => normalizeStatus(o.statut) === "litige_ouvert").length,
    [recentOrders],
  );

  const remboursements = useMemo(
    () =>
      recentOrders.filter((o) => {
        const status = normalizeStatus(o.statut);
        return status === "remboursee" || status === "annulee_auto";
      }).length,
    [recentOrders],
  );

  const getStatusMeta = (status) => {
    const normalized = normalizeStatus(status);
    return (
      STATUS_META[normalized] || {
        label: String(normalized || "N/A").replace("_", " "),
        badge: "bg-secondary text-white",
      }
    );
  };

  const loadStats = useCallback(async () => {
    if (!token) return;

    setLoading((prev) => (lastUpdatedAt ? prev : true));
    setError("");

    try {
      const transformateurId = user?.transformateur?.id;

      const [productsRes, commandesRes, avisRes] = await Promise.all([
        fetch(`${API_URL}/produits`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
        fetch(`${API_URL}/transformateur/commandes`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
        transformateurId
          ? fetch(`${API_URL}/avis/transformateur/${transformateurId}`, {
              headers: { Accept: "application/json" },
            })
          : Promise.resolve(null),
      ]);

      let produitsCount = 0;
      let commandes = [];
      let noteMoyenne = 0;
      let totalAvis = 0;

      if (productsRes.ok) {
        const data = await productsRes.json();
        produitsCount = (data.produits || []).length;
      }

      if (commandesRes.ok) {
        const data = await commandesRes.json();
        commandes = (data.commandes || []).map((cmd) => ({
          ...cmd,
          statut: normalizeStatus(cmd.statut),
        }));
        setRecentOrders(commandes.slice(0, 5));
      }

      if (avisRes && avisRes.ok) {
        const data = await avisRes.json();
        const avis = data.avis || [];
        totalAvis = avis.length;
        if (avis.length > 0) {
          const sum = avis.reduce((acc, a) => acc + Number(a.note || 0), 0);
          noteMoyenne = sum / avis.length;
        }
      }

      const ventesNettes = commandes
        .filter((c) => c.statut === "recue")
        .reduce((acc, c) => {
          const sousTotal = Number(c.sous_total || 0);
          const commission = Number(c.commission || 0);
          return acc + Math.max(sousTotal - commission, 0);
        }, 0);

      const escrowEstime = commandes
        .filter((c) => ESCROW_HOLD_STATUSES.includes(c.statut))
        .reduce((acc, c) => acc + Number(c.montant_total || 0), 0);

      setStatsData({
        ventesNettes,
        produits: produitsCount,
        escrowEstime,
        note: Number(noteMoyenne.toFixed(2)),
        totalAvis,
      });
      setLastUpdatedAt(new Date());
    } catch (e) {
      console.error("Erreur chargement dashboard transformateur", e);
      setError("Impossible de charger certaines donnees du tableau de bord.");
    } finally {
      setLoading(false);
    }
  }, [token, user?.transformateur?.id, lastUpdatedAt]);

  useEffect(() => {
    if (!token) return;

    loadStats();

    const intervalId = setInterval(() => {
      loadStats();
    }, 20000);

    const onFocus = () => loadStats();
    const onVisibility = () => {
      if (!document.hidden) loadStats();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [token, loadStats]);

  const stats = [
    {
      label: "Revenus nets encaisses",
      value: `${Number(statsData.ventesNettes).toLocaleString("fr-FR")} FCFA`,
      icon: <ShoppingCart size={22} />,
      color: "#1ab273",
    },
    {
      label: "Produits en ligne",
      value: statsData.produits.toString(),
      icon: <Package size={22} />,
      color: "#3b82f6",
    },
    {
      label: "Montant en attente (escrow estime)",
      value: `${Number(statsData.escrowEstime).toLocaleString("fr-FR")} FCFA`,
      icon: <BarChart3 size={22} />,
      color: "#8b5cf6",
    },
    {
      label: `Note moyenne (${statsData.totalAvis} avis)`,
      value: statsData.totalAvis > 0 ? statsData.note.toString() : "-",
      icon: <Star size={22} />,
      color: "#f59e0b",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold text-dark">
          Bienvenue, {" "}
          <span style={{ color: "#1ab273" }}>
            {user?.transformateur?.nom_entreprise || user?.nom_complet || "Transformateur"}
          </span>
        </h2>
        <p className="text-muted mb-1">
          Voici le recapitulatif reel de vos activites sur AgroStock.
        </p>
      </div>

      {error && (
        <div className="alert alert-warning border-0 d-flex align-items-center gap-2 mb-4">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="row g-4 mb-4">
        {stats.map((s, i) => (
          <div className="col-6 col-lg-3" key={i}>
            <div className="card border-0 rounded-4 p-4 h-100 shadow-sm bg-white">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-2 rounded-3" style={{ background: `${s.color}15`, color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <h3 className="fw-bold text-dark mb-1" style={{ fontSize: "1.2rem" }}>
                {s.value}
              </h3>
              <p className="small text-muted mb-0">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-5">
        <div className="col-md-6">
          <div className="p-3 rounded-4 border d-flex align-items-center justify-content-between" style={{ background: "#fff5f5", borderColor: "#fecaca" }}>
            <div className="d-flex align-items-center gap-2">
              <ShieldAlert size={18} className="text-danger" />
              <span className="fw-bold text-danger">Litiges ouverts</span>
            </div>
            <span className="badge bg-danger text-white rounded-pill px-3">{litigesOuverts}</span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="p-3 rounded-4 border d-flex align-items-center justify-content-between" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
            <div className="d-flex align-items-center gap-2">
              <CheckCircle2 size={18} className="text-warning" />
              <span className="fw-bold text-warning-emphasis">Commandes remboursees</span>
            </div>
            <span className="badge bg-warning text-dark rounded-pill px-3">{remboursements}</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden">
            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <ShoppingCart size={20} className="text-success" /> Commandes recentes
              </h5>
              <Link to="/dashboard-transformateur/commandes" className="text-success text-decoration-none small fw-bold">
                Tout voir
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4 py-3 border-0 text-muted small text-uppercase">Client</th>
                      <th className="border-0 text-muted small text-uppercase">Produit</th>
                      <th className="border-0 text-muted small text-uppercase">Montant</th>
                      <th className="border-0 text-muted small text-uppercase">Statut</th>
                      <th className="pe-4 text-end border-0 text-muted small text-uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">Chargement des commandes...</td>
                      </tr>
                    ) : recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="opacity-25 mb-3"><Clock size={50} /></div>
                          <p className="text-muted fw-medium">Aucune commande pour le moment.</p>
                          <button
                            className="btn btn-outline-success btn-sm rounded-pill px-4 mt-2"
                            onClick={() => navigate("/dashboard-transformateur/produits", { state: { openPublishModal: true } })}
                          >
                            Partager mes produits
                          </button>
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => {
                        const status = getStatusMeta(order.statut);
                        return (
                          <tr key={order.id}>
                            <td className="ps-4 py-3 border-0">
                              <div className="fw-bold text-dark">{order.client_nom}</div>
                              <div className="small text-muted">{new Date(order.date).toLocaleDateString("fr-FR")}</div>
                            </td>
                            <td className="border-0">
                              <div
                                className="text-dark"
                                style={{ maxWidth: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                title={(order.items || []).map((i) => i.nom).join(", ")}
                              >
                                {(order.items || []).map((i) => i.nom).join(", ") || "-"}
                              </div>
                            </td>
                            <td className="border-0 fw-bold" style={{ color: "#1ab273" }}>
                              {Number(order.montant_total || 0).toLocaleString("fr-FR")} FCFA
                            </td>
                            <td className="border-0">
                              <span className={`badge ${status.badge} rounded-pill px-3 py-2`}>{status.label}</span>
                            </td>
                            <td className="pe-4 border-0 text-end">
                              <Link to="/dashboard-transformateur/commandes" className="btn btn-light btn-sm rounded-circle p-2 text-muted">
                                <ChevronRight size={18} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white mb-4">
            <h5 className="fw-bold text-dark mb-4">Vendre un produit</h5>
            <button
              className="btn btn-success w-100 py-3 rounded-4 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2 shadow-sm animate-button"
              onClick={() => navigate("/dashboard-transformateur/produits", { state: { openPublishModal: true } })}
            >
              <Plus size={22} strokeWidth={3} />
              <span style={{ fontSize: "1.1rem" }}>PUBLIER MAINTENANT</span>
            </button>
            <p className="small text-muted text-center px-2">
              Ajoutez vos produits transformes pour les rendre visibles aux acheteurs beninois.
            </p>
          </div>

          <div className="card border-0 rounded-4 p-4 shadow-sm bg-success text-white" style={{ background: "linear-gradient(135deg, #105c38 0%, #1ab273 100%)" }}>
            <h6 className="fw-bold mb-3 small opacity-75 text-uppercase letter-spacing-1">Conseil Pro</h6>
            <div className="d-flex gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-circle align-self-start"><Info size={20} /></div>
              <p className="small mb-0 opacity-90">
                Les produits avec une description detaillee et plusieurs photos se vendent plus vite.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-button { transition: transform 0.2s; }
        .animate-button:hover { transform: translateY(-2px); }
        .letter-spacing-1 { letter-spacing: 1px; }
      `}</style>
    </div>
  );
};

export default Dashboard;
