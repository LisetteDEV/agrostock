import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag, ArrowUpRight, ArrowDownRight, Info, Users,
  ShoppingCart, Wallet, TrendingUp, BarChart3, CalendarDays,
  Target, Star, Zap
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/config";

const PERIODS = {
  semaine: { label: "7 derniers jours", days: 7 },
  mois:    { label: "30 derniers jours", days: 30 },
  annee:   { label: "Cette annee",       days: 365 },
};

const STATUS_COLORS = {
  en_attente_confirmation:    { label: "En attente",   color: "#f97316" },
  confirmee:                  { label: "Confirmee",    color: "#6366f1" },
  en_attente_retrait_livreur: { label: "Retrait livr.", color: "#eab308" },
  en_cours_livraison:         { label: "En livraison", color: "#0ea5e9" },
  livree:                     { label: "Livree",       color: "#22c55e" },
  recue:                      { label: "Reçue",        color: "#10b981" },
  litige_ouvert:              { label: "Litige",       color: "#ef4444" },
  remboursee:                 { label: "Remboursee",   color: "#8b5cf6" },
  annulee_auto:               { label: "Annulee",      color: "#94a3b8" },
};

const normalizeStatus = (s) => s === "en_cours" ? "en_cours_livraison" : s;
const calcGrowth = (c, p) => p <= 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100;
const formatFcfa = (v) => `${Math.round(v).toLocaleString("fr-FR")} FCFA`;

/* ── Donut Chart ── */
const DonutChart = ({ data, total }) => {
  const cx = 100, cy = 100, r = 70, stroke = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const slices = data.map(d => {
    const pct = total > 0 ? d.value / total : 0;
    const dashArray = `${pct * circumference} ${circumference}`;
    const dashOffset = -offset * circumference;
    offset += pct;
    return { ...d, dashArray, dashOffset };
  }).filter(d => d.value > 0);

  return (
    <div className="d-flex flex-column align-items-center">
      <div className="position-relative" style={{ width: 200, height: 200 }}>
        <svg viewBox="0 0 200 200" width="200" height="200">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          {slices.map((s, i) => (
            <circle
              key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={s.dashArray}
              strokeDashoffset={s.dashOffset}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dasharray 0.8s ease" }}
            />
          ))}
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="800" fill="#0f172a">{total}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="600">commandes</text>
        </svg>
      </div>
      <div className="d-flex flex-column gap-2 w-100 mt-2">
        {slices.map((s, i) => (
          <div key={i} className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>{s.label}</span>
            </div>
            <span style={{ fontSize: "0.8rem", color: "#0f172a", fontWeight: 700 }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Gauge Chart ── */
const GaugeChart = ({ value, max = 5 }) => {
  const pct = Math.min(value / max, 1);
  const r = 70, cx = 100, cy = 105;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const arcLength = Math.PI * r;
  const filled = pct * arcLength;
  const toXY = (angle) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle)
  });
  const start = toXY(startAngle);
  const end = toXY(endAngle);
  const filledEnd = toXY(startAngle + pct * Math.PI);
  const color = value >= 4 ? "#10b981" : value >= 2.5 ? "#f59e0b" : "#ef4444";
  return (
    <div className="d-flex flex-column align-items-center">
      <svg viewBox="0 0 200 130" width="200" height="130">
        <path d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
          fill="none" stroke="#f1f5f9" strokeWidth={18} strokeLinecap="round" />
        {value > 0 && (
          <path d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${filledEnd.x} ${filledEnd.y}`}
            fill="none" stroke={color} strokeWidth={18} strokeLinecap="round"
            style={{ transition: "all 1s ease" }} />
        )}
        <text x={cx} y={cy - 12} textAnchor="middle" fontSize="28" fontWeight="800" fill="#0f172a">
          {value > 0 ? value.toFixed(1) : "—"}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="600">/ {max} étoiles</text>
        {[...Array(5)].map((_, i) => (
          <text key={i} x={43 + i * 29} y={cy + 28} textAnchor="middle" fontSize="13" fill={i < Math.round(value) ? color : "#e2e8f0"}>★</text>
        ))}
      </svg>
    </div>
  );
};

/* ── Funnel Chart ── */
const FunnelChart = ({ steps }) => {
  const max = Math.max(...steps.map(s => s.value), 1);
  return (
    <div className="d-flex flex-column gap-2 w-100">
      {steps.map((s, i) => {
        const pct = s.value / max;
        const convRate = i > 0 && steps[i-1].value > 0 ? Math.round((s.value / steps[i-1].value) * 100) : null;
        return (
          <div key={i}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>{s.label}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {convRate !== null && (
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>({convRate}%)</span>
                )}
                <span style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 700 }}>{s.value}</span>
              </div>
            </div>
            <div style={{ background: "#f1f5f9", borderRadius: 6, height: 10, overflow: "hidden" }}>
              <div style={{
                width: `${pct * 100}%`, height: "100%",
                background: s.color, borderRadius: 6,
                transition: "width 1s cubic-bezier(0.4,0,0.2,1)"
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Statistiques = () => {
  const { token } = useAuth();
  const [period, setPeriod] = useState("mois");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      if (!token) return;
      setLoading(true); setError("");
      try {
        const res = await fetch(`${API_URL}/transformateur/commandes`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const raw = await res.text();
        let data = {};
        try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
        if (!res.ok) { setError(data.message || "Impossible de charger les statistiques."); return; }
        const normalized = (data.commandes || []).map((o) => ({
          ...o, statut: normalizeStatus(o.statut),
          date_obj: o.date ? new Date(o.date) : new Date(),
        }));
        setOrders(normalized);
      } catch { setError("Erreur technique."); }
      finally { setLoading(false); }
    };
    loadOrders();
  }, [token]);

  const computed = useMemo(() => {
    const days = PERIODS[period].days;
    const now = new Date();
    const startCurrent = new Date(now); startCurrent.setDate(startCurrent.getDate() - days);
    const startPrevious = new Date(startCurrent); startPrevious.setDate(startPrevious.getDate() - days);

    const inCurrent = orders.filter((o) => o.date_obj >= startCurrent && o.date_obj <= now);
    const inPrevious = orders.filter((o) => o.date_obj >= startPrevious && o.date_obj < startCurrent);

    const caCurrent = inCurrent.reduce((s, o) => s + Number(o.montant_total || 0), 0);
    const caPrevious = inPrevious.reduce((s, o) => s + Number(o.montant_total || 0), 0);
    const countCurrent = inCurrent.length;
    const countPrevious = inPrevious.length;
    const panierCurrent = countCurrent > 0 ? caCurrent / countCurrent : 0;
    const panierPrevious = countPrevious > 0 ? caPrevious / countPrevious : 0;
    const currentClients = new Set(inCurrent.map((o) => o.client_nom || `c-${o.acheteur_id || o.id}`));
    const previousClients = new Set(inPrevious.map((o) => o.client_nom || `c-${o.acheteur_id || o.id}`));

    // Products map
    const productsMap = new Map();
    inCurrent.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.nom || "Produit";
        const row = productsMap.get(key) || { nom: key, quantite: 0, montant: 0 };
        row.quantite += Number(it.quantite || 0);
        row.montant += Number(it.sous_total || 0);
        productsMap.set(key, row);
      });
    });
    const topProducts = Array.from(productsMap.values()).sort((a, b) => b.montant - a.montant).slice(0, 5);

    // Funnel: command pipeline
    const allStatuses = inCurrent.map(o => normalizeStatus(o.statut));
    const countStatus = (s) => inCurrent.filter(o => o.statut === s).length;
    const funnelSteps = [
      { label: "Reçues",         value: countCurrent,                           color: "#6366f1" },
      { label: "Confirmees",     value: countStatus("confirmee") + countStatus("en_attente_retrait_livreur") + countStatus("en_cours_livraison") + countStatus("livree") + countStatus("recue"), color: "#0ea5e9" },
      { label: "En livraison",   value: countStatus("en_cours_livraison") + countStatus("livree") + countStatus("recue"), color: "#f59e0b" },
      { label: "Livrees",        value: countStatus("livree") + countStatus("recue"),             color: "#10b981" },
    ];

    // Donut status breakdown
    const statusBreakdown = Object.entries(STATUS_COLORS).map(([key, meta]) => ({
      label: meta.label, color: meta.color,
      value: inCurrent.filter(o => o.statut === key).length
    })).filter(d => d.value > 0);

    // Chart points for area/line
    const points = [];
    const bucketCount = period === "semaine" ? 7 : period === "mois" ? 4 : 12;
    const slice = Math.max(1, Math.floor(days / bucketCount));
    for (let i = bucketCount - 1; i >= 0; i--) {
      const end = new Date(now); end.setDate(end.getDate() - i * slice);
      const start = new Date(end); start.setDate(start.getDate() - slice);
      const total = orders.filter((o) => o.date_obj >= start && o.date_obj <= end)
        .reduce((s, o) => s + Number(o.montant_total || 0), 0);
      let label = "", rangeLabel = "";
      if (period === "semaine") {
        label = end.toLocaleDateString("fr-FR", { weekday: "short" });
        rangeLabel = end.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      } else if (period === "mois") {
        label = `Sem ${bucketCount - i}`;
        rangeLabel = `${start.getDate()}-${end.getDate()}`;
      } else {
        label = end.toLocaleDateString("fr-FR", { month: "short" });
        rangeLabel = end.getFullYear().toString();
      }
      points.push({ label, rangeLabel, value: total });
    }
    const maxValue = Math.max(...points.map(p => p.value), 0);

    // Note rating (from avis in order data if available, else mock 0)
    const noteData = { note: 0, total: 0 };

    return {
      caCurrent, caPrevious, caGrowth: calcGrowth(caCurrent, caPrevious),
      countCurrent, countPrevious, countGrowth: calcGrowth(countCurrent, countPrevious),
      panierCurrent, panierPrevious, panierGrowth: calcGrowth(panierCurrent, panierPrevious),
      clientsCurrent: currentClients.size, clientsPrevious: previousClients.size,
      clientsGrowth: calcGrowth(currentClients.size, previousClients.size),
      topProducts, points, maxValue, statusBreakdown, funnelSteps, noteData,
    };
  }, [orders, period]);

  const kpis = [
    { label: "Chiffre d'affaires", value: formatFcfa(computed.caCurrent), previous: formatFcfa(computed.caPrevious), growth: computed.caGrowth, icon: <Wallet size={20} />, accent: "#10b981" },
    { label: "Commandes",          value: computed.countCurrent.toLocaleString("fr-FR"),  previous: computed.countPrevious.toLocaleString("fr-FR"),  growth: computed.countGrowth,   icon: <ShoppingCart size={20} />, accent: "#6366f1" },
    { label: "Panier moyen",       value: formatFcfa(computed.panierCurrent), previous: formatFcfa(computed.panierPrevious), growth: computed.panierGrowth, icon: <TrendingUp size={20} />, accent: "#f59e0b" },
    { label: "Clients actifs",     value: computed.clientsCurrent.toLocaleString("fr-FR"), previous: computed.clientsPrevious.toLocaleString("fr-FR"), growth: computed.clientsGrowth, icon: <Users size={20} />, accent: "#0ea5e9" },
  ];

  // SVG Area/Line chart
  const svgW = 760, svgH = 260, padL = 60, padR = 24, padT = 24, padB = 40;
  const innerW = svgW - padL - padR, innerH = svgH - padT - padB;
  const chartPoints = computed.points.map((p, idx) => {
    const x = padL + (computed.points.length <= 1 ? innerW / 2 : (idx / (computed.points.length - 1)) * innerW);
    const ratio = computed.maxValue === 0 ? 0 : p.value / computed.maxValue;
    const y = padT + (1 - ratio) * innerH;
    return { ...p, x, y };
  });
  const linePath = chartPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = chartPoints.length
    ? `${linePath} L${chartPoints[chartPoints.length - 1].x},${padT + innerH} L${chartPoints[0].x},${padT + innerH} Z`
    : "";
  const yTicks = [1, 0.75, 0.5, 0.25, 0].map(r => Math.round(computed.maxValue * r));

  // Top products max montant
  const maxMontant = Math.max(...computed.topProducts.map(p => p.montant), 1);
  const productPalette = ["#10b981", "#6366f1", "#f59e0b", "#0ea5e9", "#ec4899"];

  return (
    <div className="premium-analytics-container">

      {/* ── HERO HEADER ── */}
      <div className="stat-hero mb-5 overflow-hidden rounded-4 position-relative">
        <div className="stat-hero-bg position-absolute top-0 start-0 w-100 h-100" />
        <div className="p-4 p-md-5 position-relative z-1 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div className="text-white">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="stat-hero-icon rounded-3 d-flex align-items-center justify-content-center">
                <BarChart3 size={26} className="text-white" />
              </div>
              <h2 className="fw-bold mb-0">Intelligence & Analytics</h2>
            </div>
            <p className="text-white-50 mb-0 ms-md-5" style={{ maxWidth: 480, fontSize: "0.95rem" }}>
              Vue executive de vos performances. Analysez, comparez et optimisez vos ventes en temps reel.
            </p>
          </div>
          <div className="period-switch-premium d-flex gap-1 p-1 rounded-pill stat-glass">
            {Object.entries(PERIODS).map(([key, meta]) => (
              <button key={key} onClick={() => setPeriod(key)}
                className={`btn btn-sm rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 ${period === key ? "active-period shadow" : "inactive-period"}`}>
                {period === key && <CalendarDays size={15} />}
                {meta.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger border-0 rounded-4 mb-4"><Info size={18} className="me-2" />{error}</div>}

      {/* ── KPI CARDS ── */}
      <div className="row g-4 mb-5">
        {kpis.map((kpi, idx) => {
          const up = kpi.growth >= 0;
          return (
            <div className="col-sm-6 col-xl-3" key={kpi.label}>
              <div className="kpi-premium bg-white rounded-4 p-4 h-100 border position-relative overflow-hidden" style={{ borderColor: "#e2e8f0", animationDelay: `${idx * 0.1}s` }}>
                <div className="kpi-accent-line" style={{ background: kpi.accent }} />
                <div className="d-flex align-items-start justify-content-between mb-4">
                  <div className="kpi-icon-wrap d-flex align-items-center justify-content-center rounded-circle" style={{ width: 48, height: 48, background: `${kpi.accent}18`, color: kpi.accent }}>
                    {kpi.icon}
                  </div>
                  <span className={`trend-pill fw-bold ${up ? "up" : "down"}`}>
                    {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {Math.abs(kpi.growth).toFixed(1)}%
                  </span>
                </div>
                <p className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.6px" }}>{kpi.label}</p>
                <h3 className="fw-bold mb-1" style={{ color: "#0f172a", letterSpacing: "-0.5px" }}>{kpi.value}</h3>
                <p className="small mb-0" style={{ color: "#94a3b8" }}>vs {kpi.previous} prec.</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ROW 1: AREA CHART + DONUT ── */}
      <div className="row g-4 mb-4">
        {/* Area Chart */}
        <div className="col-lg-8">
          <div className="chart-card-premium bg-white rounded-4 shadow-sm h-100 overflow-hidden border" style={{ borderColor: "#e2e8f0" }}>
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: "#0f172a" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                  Dynamique du Chiffre d'Affaires
                </h5>
                <p className="small mb-0" style={{ color: "#94a3b8" }}>Courbe d'evolution sur la periode active.</p>
              </div>
              <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill" style={{ background: "#f0fdf4", border: "1px solid #d1fae5" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,0.2)" }} />
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#059669" }}>Total ventes</span>
              </div>
            </div>
            <div className="card-body p-4 position-relative">
              <div className="position-absolute w-100 h-100 top-0 start-0" style={{ backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.4, pointerEvents: "none" }} />
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success" /></div>
              ) : chartPoints.every(p => p.value === 0) ? (
                <div className="text-center py-5 text-muted opacity-50"><TrendingUp size={44} className="mb-2" /><p className="mb-0 fw-medium">Aucune vente sur cette periode.</p></div>
              ) : (
                <div className="rounded-4 bg-white position-relative z-1 p-2" style={{ border: "1px solid #f1f5f9" }}>
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-100 h-auto" style={{ overflow: "visible" }}>
                    <defs>
                      <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                      <filter id="glow"><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#10b981" floodOpacity="0.25" /></filter>
                    </defs>
                    {yTicks.map((tick, i) => {
                      const y = padT + (i / (yTicks.length - 1)) * innerH;
                      return (
                        <g key={i}>
                          <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#f1f5f9" strokeDasharray="4 4" />
                          <text x={padL - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8" fontWeight="600">
                            {tick >= 1000 ? `${(tick/1000).toFixed(1)}k` : tick}
                          </text>
                        </g>
                      );
                    })}
                    <line x1={padL} y1={padT + innerH} x2={svgW - padR} y2={padT + innerH} stroke="#cbd5e1" strokeWidth="1.5" />
                    <path d={areaPath} fill="url(#ag1)" />
                    <path d={linePath} fill="none" stroke="url(#lg1)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" className="chart-line-draw" />
                    {chartPoints.map((p, i) => (
                      <g key={i} className="chart-pt">
                        <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke="#10b981" strokeWidth="3" />
                        <text x={p.x} y={padT + innerH + 18} textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="700">{p.label}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Donut Chart - Répartition des statuts */}
        <div className="col-lg-4">
          <div className="chart-card-premium bg-white rounded-4 shadow-sm h-100 border" style={{ borderColor: "#e2e8f0" }}>
            <div className="p-4 border-bottom">
              <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: "#0f172a" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#6366f1" }} />
                Statuts des commandes
              </h5>
              <p className="small mb-0" style={{ color: "#94a3b8" }}>Repartition par etat sur la periode.</p>
            </div>
            <div className="p-4 d-flex align-items-center justify-content-center">
              {loading ? (
                <div className="py-5 text-center"><div className="spinner-border spinner-border-sm text-success" /></div>
              ) : computed.statusBreakdown.length === 0 ? (
                <div className="text-center py-5 text-muted opacity-50">
                  <ShoppingBag size={36} className="mb-2" />
                  <p className="small fw-medium mb-0">Aucune commande</p>
                </div>
              ) : (
                <DonutChart data={computed.statusBreakdown} total={computed.countCurrent} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: HORIZONTAL BARS + FUNNEL + GAUGE ── */}
      <div className="row g-4">
        {/* Top Produits - Horizontal bars */}
        <div className="col-lg-5">
          <div className="chart-card-premium bg-white rounded-4 shadow-sm h-100 border" style={{ borderColor: "#e2e8f0" }}>
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: "#0f172a" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                  Top Produits par CA
                </h5>
                <p className="small mb-0" style={{ color: "#94a3b8" }}>Classement selon le chiffre d'affaires genere.</p>
              </div>
              <Target size={18} style={{ color: "#f59e0b" }} />
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-success" /></div>
              ) : computed.topProducts.length === 0 ? (
                <div className="text-center py-5 text-muted opacity-50">
                  <ShoppingBag size={36} className="mb-2" />
                  <p className="small fw-medium mb-0">Aucune vente</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {computed.topProducts.map((p, i) => {
                    const pct = maxMontant > 0 ? (p.montant / maxMontant) * 100 : 0;
                    const color = productPalette[i % productPalette.length];
                    return (
                      <div key={i}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="d-flex align-items-center justify-content-center rounded-2 fw-bold" style={{ width: 24, height: 24, background: `${color}18`, color, fontSize: "0.7rem" }}>#{i+1}</div>
                            <span className="fw-bold" style={{ color: "#0f172a", fontSize: "0.88rem" }}>{p.nom}</span>
                          </div>
                          <span className="fw-bold" style={{ color, fontSize: "0.85rem" }}>{Math.round(p.montant).toLocaleString("fr-FR")} F</span>
                        </div>
                        <div style={{ background: "#f1f5f9", borderRadius: 8, height: 8, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 8, transition: "width 1s ease" }} />
                        </div>
                        <div className="d-flex justify-content-end mt-1">
                          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{p.quantite} unite(s)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Funnel Chart - Conversion */}
        <div className="col-lg-4">
          <div className="chart-card-premium bg-white rounded-4 shadow-sm h-100 border" style={{ borderColor: "#e2e8f0" }}>
            <div className="p-4 border-bottom">
              <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: "#0f172a" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0ea5e9" }} />
                Entonnoir de conversion
              </h5>
              <p className="small mb-0" style={{ color: "#94a3b8" }}>Pipeline complet, de la reception a la livraison.</p>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-success" /></div>
              ) : (
                <FunnelChart steps={computed.funnelSteps} />
              )}
              <div className="mt-4 p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Zap size={14} style={{ color: "#10b981" }} />
                  <span className="fw-bold small" style={{ color: "#0f172a" }}>Taux de completion</span>
                </div>
                <p className="fw-bold mb-0" style={{ fontSize: "1.5rem", color: "#10b981" }}>
                  {computed.funnelSteps[0].value > 0
                    ? `${Math.round((computed.funnelSteps[3].value / computed.funnelSteps[0].value) * 100)}%`
                    : "—"}
                </p>
                <p className="small mb-0" style={{ color: "#94a3b8" }}>commandes effectivement livrees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gauge - Réputation */}
        <div className="col-lg-3">
          <div className="chart-card-premium bg-white rounded-4 shadow-sm h-100 border" style={{ borderColor: "#e2e8f0" }}>
            <div className="p-4 border-bottom">
              <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: "#0f172a" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                Reputation
              </h5>
              <p className="small mb-0" style={{ color: "#94a3b8" }}>Note moyenne acheteurs.</p>
            </div>
            <div className="p-4 d-flex flex-column align-items-center justify-content-center">
              {loading ? (
                <div className="py-4"><div className="spinner-border spinner-border-sm text-success" /></div>
              ) : (
                <>
                  <GaugeChart value={computed.noteData.note} max={5} />
                  <div className="mt-3 text-center">
                    <div className="d-flex align-items-center gap-2 justify-content-center mb-1">
                      <Star size={16} style={{ color: "#f59e0b" }} />
                      <span className="fw-bold" style={{ color: "#0f172a" }}>
                        {computed.noteData.note > 0 ? `${computed.noteData.note.toFixed(1)} / 5` : "Aucun avis"}
                      </span>
                    </div>
                    <p className="small mb-0" style={{ color: "#94a3b8" }}>
                      {computed.noteData.total > 0 ? `Base sur ${computed.noteData.total} avis` : "Publiez des produits pour collecter des avis"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .text-slate-400 { color: #94a3b8; }
        .text-slate-800 { color: #1e293b; }

        .stat-hero { background: #052e16; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.3); }
        .stat-hero-bg {
          background: radial-gradient(circle at 85% 10%, rgba(16,185,129,0.3) 0%, transparent 50%),
                      radial-gradient(circle at 10% 90%, rgba(5,150,105,0.18) 0%, transparent 50%);
        }
        .stat-hero-icon { background: rgba(255,255,255,0.12); backdrop-filter: blur(10px); width: 52px; height: 52px; }
        .stat-glass { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); }
        .inactive-period { color: rgba(255,255,255,0.65); background: transparent; border: none; }
        .inactive-period:hover { color: white; background: rgba(255,255,255,0.08); }
        .active-period { background: white !important; color: #0f172a !important; border: none; }

        .kpi-premium {
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          animation: fadeUp 0.5s ease-out both;
        }
        .kpi-premium:hover { transform: translateY(-5px); box-shadow: 0 16px 32px rgba(0,0,0,0.08); border-color: #cbd5e1 !important; }
        .kpi-accent-line { position: absolute; top: 0; left: 0; width: 100%; height: 3px; border-radius: 4px 4px 0 0; opacity: 0; transition: opacity 0.3s; }
        .kpi-premium:hover .kpi-accent-line { opacity: 1; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

        .trend-pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; }
        .trend-pill.up { background: #ecfdf5; color: #10b981; }
        .trend-pill.down { background: #fef2f2; color: #ef4444; }

        .chart-card-premium { transition: box-shadow 0.3s; }
        .chart-card-premium:hover { box-shadow: 0 12px 28px rgba(0,0,0,0.07) !important; }

        .chart-pt circle { transition: r 0.2s; }
        .chart-pt:hover circle { r: 8; }

        .chart-line-draw {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: drawLine 1.5s ease-out forwards;
        }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
};

export default Statistiques;
