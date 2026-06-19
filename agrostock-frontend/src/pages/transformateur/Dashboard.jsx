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
  TrendingUp,
  Zap,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/config";

const STATUS_META = {
  en_attente_confirmation: {
    label: "En attente",
    badge: "bg-secondary text-white",
  },
  confirmee: { label: "Confirmée", badge: "bg-primary text-white" },
  en_cours_livraison: { label: "En livraison", badge: "bg-warning text-dark" },
  livree: { label: "Livrée", badge: "bg-success text-white" },
  recue: { label: "Réception confirmée", badge: "bg-success text-white" },
  litige_ouvert: { label: "Litige ouvert", badge: "bg-danger text-white" },
  remboursee: { label: "Remboursée", badge: "bg-warning text-dark" },
  annulee_auto: { label: "Annulée auto", badge: "bg-danger text-white" },
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

// Mini sparkline SVG component
const MiniSparkline = ({ color }) => (
  <svg width="80" height="32" viewBox="0 0 80 32" fill="none" style={{ opacity: 0.5 }}>
    <path
      d="M0 28 Q10 20, 16 22 T32 18 T48 12 T64 16 T80 4"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M0 28 Q10 20, 16 22 T32 18 T48 12 T64 16 T80 4 V32 H0Z"
      fill={`url(#grad-${color.replace('#', '')})`}
      opacity="0.15"
    />
    <defs>
      <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

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
      setError("Impossible de charger certaines données du tableau de bord.");
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

  const entreprise = user?.transformateur?.nom_entreprise || user?.nom_complet || "Transformateur";
  const initiale = entreprise.charAt(0).toUpperCase();
  const now = new Date();
  const heures = now.getHours();
  const salutation = heures < 12 ? "Bonjour" : heures < 18 ? "Bon après-midi" : "Bonsoir";

  const stats = [
    {
      label: "Revenus nets",
      value: `${Number(statsData.ventesNettes).toLocaleString("fr-FR")} F`,
      icon: <ShoppingCart size={20} />,
      color: "#10b981",
      accent: "linear-gradient(135deg, #10b981, #059669)",
    },
    {
      label: "Produits actifs",
      value: statsData.produits.toString(),
      icon: <Package size={20} />,
      color: "#3b82f6",
      accent: "linear-gradient(135deg, #3b82f6, #2563eb)",
    },
    {
      label: "Escrow en cours",
      value: `${Number(statsData.escrowEstime).toLocaleString("fr-FR")} F`,
      icon: <BarChart3 size={20} />,
      color: "#8b5cf6",
      accent: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    },
    {
      label: `Réputation (${statsData.totalAvis})`,
      value: statsData.totalAvis > 0 ? `${statsData.note}/5` : "—",
      icon: <Star size={20} />,
      color: "#f59e0b",
      accent: "linear-gradient(135deg, #f59e0b, #d97706)",
    },
  ];

  return (
    <div className="dash-senior">
      {/* ── HERO BANNER ── */}
      <div className="hero-banner position-relative overflow-hidden mb-4" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #0a1d13 0%, #0f3524 50%, #105c38 100%)', padding: '2rem 2.5rem' }}>
        {/* Grid pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)', backgroundSize: '22px 22px' }}></div>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '-30%', right: '5%', width: '250px', height: '250px', background: '#1ab273', filter: 'blur(80px)', opacity: 0.35, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-40%', left: '10%', width: '200px', height: '200px', background: '#f59e0b', filter: 'blur(80px)', opacity: 0.15, borderRadius: '50%' }}></div>

        <div className="position-relative z-1 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            {/* Avatar with animated ring */}
            <div className="position-relative" style={{ width: '56px', height: '56px' }}>
              <div className="avatar-ring position-absolute" style={{ inset: '-3px', borderRadius: '50%', border: '2px solid rgba(26,178,115,0.5)' }}></div>
              <div className="d-flex align-items-center justify-content-center text-white fw-bold rounded-circle" style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #1ab273, #059669)', fontSize: '1.4rem', boxShadow: '0 4px 15px rgba(26,178,115,0.4)' }}>
                {initiale}
              </div>
              <div className="position-absolute" style={{ bottom: '2px', right: '2px', width: '14px', height: '14px', background: '#22c55e', borderRadius: '50%', border: '2.5px solid #0a1d13' }}></div>
            </div>
            <div>
              <p className="mb-0 fw-medium" style={{ color: '#a7f3d0', fontSize: '0.85rem' }}>{salutation} 👋</p>
              <h4 className="mb-0 fw-bold text-white" style={{ letterSpacing: '-0.5px' }}>{entreprise}</h4>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button onClick={() => navigate("/dashboard-transformateur/produits", { state: { openPublishModal: true } })} className="btn d-flex align-items-center gap-2 fw-bold" style={{ background: '#1ab273', color: 'white', borderRadius: '12px', border: 'none', padding: '10px 20px', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(26,178,115,0.3)', transition: 'all 0.2s' }}>
              <Plus size={18} strokeWidth={3} /> Nouveau produit
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning border-0 d-flex align-items-center gap-2 mb-4 rounded-3" style={{ background: '#fffbeb' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div className="col-12 col-sm-6 col-xl-3" key={i}>
            <div className="stat-card-v2 bg-white h-100 position-relative overflow-hidden">
              {/* Accent bar at top */}
              <div style={{ height: '4px', background: s.accent, borderRadius: '4px 4px 0 0' }}></div>
              <div className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div style={{ flex: 1 }}>
                    <p className="mb-1 fw-semibold" style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</p>
                    <h3 className="fw-bold mb-0" style={{ fontSize: '1.65rem', color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{s.value}</h3>
                  </div>
                  <div className="d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', borderRadius: '14px', background: s.accent, color: '#fff', flexShrink: 0, boxShadow: `0 6px 15px ${s.color}30` }}>
                    {s.icon}
                  </div>
                </div>
                {/* Mini sparkline */}
                <div className="mt-2 d-flex align-items-end justify-content-between">
                  <MiniSparkline color={s.color} />
                  <span className="d-flex align-items-center gap-1 fw-bold" style={{ fontSize: '0.7rem', color: s.color }}>
                    <TrendingUp size={12} /> Actif
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ALERT TILES ── */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="alert-tile d-flex align-items-center justify-content-between p-3" style={{ background: litigesOuverts > 0 ? '#fef2f2' : '#f8faf9', borderLeft: `4px solid ${litigesOuverts > 0 ? '#ef4444' : '#e2e8f0'}`, borderRadius: '12px' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', borderRadius: '10px', background: litigesOuverts > 0 ? '#fee2e2' : '#f1f5f9', color: litigesOuverts > 0 ? '#ef4444' : '#94a3b8' }}>
                <ShieldAlert size={18} />
              </div>
              <div>
                <div className="fw-bold" style={{ fontSize: '0.9rem', color: litigesOuverts > 0 ? '#991b1b' : '#475569' }}>Litiges ouverts</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Résolution requise</div>
              </div>
            </div>
            <span className="fw-bold d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', borderRadius: '50%', background: litigesOuverts > 0 ? '#ef4444' : '#e2e8f0', color: litigesOuverts > 0 ? '#fff' : '#94a3b8', fontSize: '0.9rem' }}>{litigesOuverts}</span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="alert-tile d-flex align-items-center justify-content-between p-3" style={{ background: remboursements > 0 ? '#fffbeb' : '#f8faf9', borderLeft: `4px solid ${remboursements > 0 ? '#f59e0b' : '#e2e8f0'}`, borderRadius: '12px' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', borderRadius: '10px', background: remboursements > 0 ? '#fef3c7' : '#f1f5f9', color: remboursements > 0 ? '#f59e0b' : '#94a3b8' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="fw-bold" style={{ fontSize: '0.9rem', color: remboursements > 0 ? '#92400e' : '#475569' }}>Remboursements</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Traités automatiquement</div>
              </div>
            </div>
            <span className="fw-bold d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', borderRadius: '50%', background: remboursements > 0 ? '#f59e0b' : '#e2e8f0', color: remboursements > 0 ? '#fff' : '#94a3b8', fontSize: '0.9rem' }}>{remboursements}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="orders-card bg-white h-100">
            <div className="p-4 pb-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <div className="d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>
                  <ShoppingCart size={16} />
                </div>
                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '1.05rem', letterSpacing: '-0.3px' }}>Commandes récentes</h6>
              </div>
              <Link to="/dashboard-transformateur/commandes" className="d-flex align-items-center gap-1 fw-bold text-decoration-none" style={{ color: '#10b981', fontSize: '0.85rem', padding: '6px 14px', background: '#f0fdf4', borderRadius: '8px', transition: 'all 0.2s' }}>
                Tout voir <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="px-4 pb-4">
              {loading ? (
                <div className="text-center py-5 text-muted">
                  <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                  Chargement...
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-5">
                  <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf4' }}>
                    <Sparkles size={28} style={{ color: '#10b981' }} />
                  </div>
                  <p className="fw-semibold text-dark mb-1">Pas encore de commandes</p>
                  <p className="text-muted small mb-3">Publiez vos premiers produits pour commencer à vendre</p>
                  <button className="btn fw-bold rounded-pill px-4 py-2" style={{ background: '#10b981', color: '#fff', border: 'none', fontSize: '0.9rem' }} onClick={() => navigate("/dashboard-transformateur/produits", { state: { openPublishModal: true } })}>
                    <Zap size={16} className="me-1" /> Publier un produit
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {recentOrders.map((order) => {
                    const status = getStatusMeta(order.statut);
                    const clientInitiale = (order.client_nom || "?").charAt(0).toUpperCase();
                    const avatarColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                    const avatarColor = avatarColors[order.id % avatarColors.length];
                    return (
                      <div key={order.id} className="order-row d-flex align-items-center justify-content-between p-3" style={{ background: '#fafbfc', borderRadius: '14px', transition: 'all 0.2s' }}>
                        <div className="d-flex align-items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                          <div className="d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '12px', background: avatarColor, fontSize: '0.9rem', boxShadow: `0 3px 8px ${avatarColor}30` }}>
                            {clientInitiale}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem' }}>{order.client_nom}</div>
                            <div className="text-muted text-truncate" style={{ fontSize: '0.78rem' }}>
                              {(order.items || []).map((i) => i.nom).join(", ") || "—"} · {new Date(order.date).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-3 flex-shrink-0">
                          <span className="fw-bold d-none d-md-block" style={{ color: '#0f172a', fontSize: '0.9rem' }}>{Number(order.montant_total || 0).toLocaleString("fr-FR")} F</span>
                          <span className={`badge ${status.badge} fw-medium`} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', letterSpacing: '0.3px' }}>{status.label}</span>
                          <Link to="/dashboard-transformateur/commandes" className="chevron-link d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: '8px', color: '#94a3b8', transition: 'all 0.2s' }}>
                            <ChevronRight size={18} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CTA PANEL ── */}
        <div className="col-lg-4 d-flex flex-column gap-4">
          <div className="cta-card position-relative overflow-hidden d-flex flex-column" style={{ flex: 1, borderRadius: '20px', background: 'linear-gradient(160deg, #0a1d13 0%, #0f3524 100%)', padding: '2rem' }}>
            {/* Dot grid pattern */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
            <div style={{ position: 'absolute', top: '-20%', right: '-15%', width: '180px', height: '180px', background: '#1ab273', filter: 'blur(60px)', opacity: 0.4, borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '120px', height: '120px', background: '#f59e0b', filter: 'blur(50px)', opacity: 0.15, borderRadius: '50%' }}></div>

            <div className="position-relative z-1 d-flex flex-column h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(26,178,115,0.2)', color: '#4ade80' }}>
                  <Zap size={16} />
                </div>
                <span className="fw-bold" style={{ color: '#6ee7b7', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Action rapide</span>
              </div>

              <h5 className="fw-bold text-white mb-2" style={{ fontSize: '1.35rem', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                Développez votre activité
              </h5>
              <p className="mb-4" style={{ color: '#94d2b5', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Ajoutez vos produits transformés et touchez des milliers d'acheteurs au Bénin.
              </p>

              <div className="mt-auto">
                <button
                  className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 cta-btn"
                  onClick={() => navigate("/dashboard-transformateur/produits", { state: { openPublishModal: true } })}
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '14px', border: 'none', fontSize: '0.95rem', boxShadow: '0 8px 25px rgba(16,185,129,0.3)' }}
                >
                  <Plus size={18} strokeWidth={3} /> Publier un produit
                </button>
              </div>

              <div className="d-flex align-items-center gap-2 mt-3" style={{ color: '#6ee7b7' }}>
                <Info size={14} />
                <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.8 }}>
                  Les belles photos doublent vos ventes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dash-senior { position: relative; }

        /* Hero Banner */
        .hero-banner { animation: fadeInDown 0.5s ease; }

        /* Stat Cards */
        .stat-card-v2 {
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .stat-card-v2:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: #e2e8f0;
        }

        /* Alert tiles */
        .alert-tile { transition: all 0.2s; border: 1px solid transparent; }
        .alert-tile:hover { border-color: #e2e8f0; }

        /* Orders card */
        .orders-card {
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .order-row:hover { background: #f0fdf4 !important; }
        .chevron-link:hover { background: #f0fdf4; color: #10b981 !important; }

        /* CTA */
        .cta-card { box-shadow: 0 20px 40px rgba(10,29,19,0.25); }
        .cta-btn { transition: all 0.25s; }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(16,185,129,0.4) !important; color: white; }

        /* Avatar ring pulse */
        .avatar-ring {
          animation: ringPulse 3s ease-in-out infinite;
        }
        @keyframes ringPulse {
          0%, 100% { border-color: rgba(26,178,115,0.3); transform: scale(1); }
          50% { border-color: rgba(26,178,115,0.6); transform: scale(1.05); }
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
