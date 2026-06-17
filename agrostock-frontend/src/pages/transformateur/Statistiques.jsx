import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Users,
  ShoppingCart,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/config";

const PERIODS = {
  semaine: { label: "Semaine", days: 7 },
  mois: { label: "Mois", days: 30 },
  annee: { label: "Annee", days: 365 },
};

const normalizeStatus = (status) =>
  status === "en_cours" ? "en_cours_livraison" : status;

const calcGrowth = (current, previous) => {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const formatFcfa = (value) => `${Math.round(value).toLocaleString("fr-FR")} FCFA`;

const Statistiques = () => {
  const { token } = useAuth();
  const [period, setPeriod] = useState("mois");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      if (!token) return;
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_URL}/transformateur/commandes`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const raw = await res.text();
        let data = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = {};
        }

        if (!res.ok) {
          setError(data.message || "Impossible de charger les statistiques.");
          return;
        }

        const normalized = (data.commandes || []).map((o) => ({
          ...o,
          statut: normalizeStatus(o.statut),
          date_obj: o.date ? new Date(o.date) : new Date(),
        }));
        setOrders(normalized);
      } catch {
        setError("Erreur technique lors du chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token]);

  const computed = useMemo(() => {
    const days = PERIODS[period].days;
    const now = new Date();

    const startCurrent = new Date(now);
    startCurrent.setDate(startCurrent.getDate() - days);

    const startPrevious = new Date(startCurrent);
    startPrevious.setDate(startPrevious.getDate() - days);

    const inCurrent = orders.filter((o) => o.date_obj >= startCurrent && o.date_obj <= now);
    const inPrevious = orders.filter((o) => o.date_obj >= startPrevious && o.date_obj < startCurrent);

    const caCurrent = inCurrent.reduce((sum, o) => sum + Number(o.montant_total || 0), 0);
    const caPrevious = inPrevious.reduce((sum, o) => sum + Number(o.montant_total || 0), 0);

    const countCurrent = inCurrent.length;
    const countPrevious = inPrevious.length;

    const panierCurrent = countCurrent > 0 ? caCurrent / countCurrent : 0;
    const panierPrevious = countPrevious > 0 ? caPrevious / countPrevious : 0;

    const currentClients = new Set(inCurrent.map((o) => o.client_nom || `client-${o.acheteur_id || o.id}`));
    const previousClients = new Set(inPrevious.map((o) => o.client_nom || `client-${o.acheteur_id || o.id}`));

    const productsMap = new Map();
    inCurrent.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.nom || "Produit";
        const qty = Number(it.quantite || 0);
        const row = productsMap.get(key) || { nom: key, quantite: 0, montant: 0 };
        row.quantite += qty;
        row.montant += Number(it.sous_total || 0);
        productsMap.set(key, row);
      });
    });

    const topProducts = Array.from(productsMap.values())
      .sort((a, b) => b.quantite - a.quantite)
      .slice(0, 5);

    const points = [];
    const bucketCount = period === "semaine" ? 7 : period === "mois" ? 4 : 12;
    const slice = Math.max(1, Math.floor(days / bucketCount));

    for (let i = bucketCount - 1; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(end.getDate() - i * slice);
      const start = new Date(end);
      start.setDate(start.getDate() - slice);

      const total = orders
        .filter((o) => o.date_obj >= start && o.date_obj <= end)
        .reduce((s, o) => s + Number(o.montant_total || 0), 0);

      let label = "";
      let rangeLabel = "";
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

    const maxValue = Math.max(...points.map((p) => p.value), 0);

    return {
      caCurrent,
      caPrevious,
      caGrowth: calcGrowth(caCurrent, caPrevious),
      countCurrent,
      countPrevious,
      countGrowth: calcGrowth(countCurrent, countPrevious),
      panierCurrent,
      panierPrevious,
      panierGrowth: calcGrowth(panierCurrent, panierPrevious),
      clientsCurrent: currentClients.size,
      clientsPrevious: previousClients.size,
      clientsGrowth: calcGrowth(currentClients.size, previousClients.size),
      topProducts,
      points,
      maxValue,
    };
  }, [orders, period]);

  const kpis = [
    {
      label: "Chiffre d affaires",
      value: formatFcfa(computed.caCurrent),
      previous: formatFcfa(computed.caPrevious),
      growth: computed.caGrowth,
      icon: <Wallet size={18} />,
      tone: "success",
    },
    {
      label: "Commandes totales",
      value: computed.countCurrent.toLocaleString("fr-FR"),
      previous: computed.countPrevious.toLocaleString("fr-FR"),
      growth: computed.countGrowth,
      icon: <ShoppingCart size={18} />,
      tone: "primary",
    },
    {
      label: "Panier moyen",
      value: formatFcfa(computed.panierCurrent),
      previous: formatFcfa(computed.panierPrevious),
      growth: computed.panierGrowth,
      icon: <TrendingUp size={18} />,
      tone: "violet",
    },
    {
      label: "Nouveaux clients",
      value: computed.clientsCurrent.toLocaleString("fr-FR"),
      previous: computed.clientsPrevious.toLocaleString("fr-FR"),
      growth: computed.clientsGrowth,
      icon: <Users size={18} />,
      tone: "warning",
    },
  ];

  const svgW = 760;
  const svgH = 300;
  const padLeft = 52;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 40;
  const innerW = svgW - padLeft - padRight;
  const innerH = svgH - padTop - padBottom;

  const chartPoints = computed.points.map((p, idx) => {
    const x = padLeft + (computed.points.length <= 1 ? innerW / 2 : (idx / (computed.points.length - 1)) * innerW);
    const ratio = computed.maxValue === 0 ? 0 : p.value / computed.maxValue;
    const y = padTop + (1 - ratio) * innerH;
    return { ...p, x, y };
  });

  const linePath = chartPoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const areaPath = chartPoints.length
    ? `${linePath} L${chartPoints[chartPoints.length - 1].x},${padTop + innerH} L${chartPoints[0].x},${padTop + innerH} Z`
    : "";

  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(computed.maxValue * ratio));

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <h2 className="fw-bold text-dark mb-1">Analyse des ventes</h2>
          <p className="text-muted mb-0">Vue executive: evolution, tendance et comparaison par periode.</p>
        </div>

        <div className="period-switch d-flex gap-2 p-1 rounded-pill shadow-sm bg-white">
          {Object.entries(PERIODS).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`btn btn-sm rounded-pill px-3 fw-bold ${period === key ? "btn-success" : "btn-light"}`}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-warning border-0 mb-4">{error}</div>}

      <div className="row g-4 mb-5">
        {kpis.map((kpi) => {
          const up = kpi.growth >= 0;
          return (
            <div className="col-sm-6 col-lg-3" key={kpi.label}>
              <div className={`kpi-card card border-0 rounded-4 p-4 h-100 tone-${kpi.tone}`}>
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <h6 className="text-muted mb-0 small text-uppercase fw-bold letter-spacing-1">{kpi.label}</h6>
                  <span className="kpi-icon">{kpi.icon}</span>
                </div>

                <h2 className="fw-bold text-dark mb-1 kpi-value">{kpi.value}</h2>
                <div className="small text-muted mb-3">Periode precedente: {kpi.previous}</div>

                <div className={`trend-strip ${up ? "up" : "down"}`}>
                  {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <span className="fw-bold">{Math.abs(kpi.growth).toFixed(1)}%</span>
                  <span className="opacity-75">de variation</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100 chart-card">
            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <h5 className="fw-bold text-dark mb-1">Courbe du chiffre d affaires</h5>
                <p className="small text-muted mb-0">Lecture: chaque point represente un segment temporel (jour, semaine ou mois selon le filtre).</p>
              </div>
              <div className="curve-legend">
                <span className="dot"></span>
                <span>Total ventes</span>
              </div>
            </div>

            <div className="card-body p-4">
              {loading ? (
                <div className="text-center py-5 text-muted">Chargement...</div>
              ) : chartPoints.every((p) => p.value === 0) ? (
                <div className="p-5 text-center text-muted opacity-75">
                  <TrendingUp size={52} className="mb-3" />
                  <p className="mb-0 fw-medium">Aucune vente detectee sur la periode selectionnee.</p>
                </div>
              ) : (
                <div className="curve-wrap">
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-100" role="img" aria-label="Courbe du chiffre d affaires">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16a34a" stopOpacity="1" />
                        <stop offset="100%" stopColor="#16a34a" stopOpacity="0.25" />
                      </linearGradient>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.34" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0.03" />
                      </linearGradient>
                    </defs>

                    {yTicks.map((tick, idx) => {
                      const y = padTop + (idx / (yTicks.length - 1)) * innerH;
                      return (
                        <g key={`tick-${idx}`}>
                          <line x1={padLeft} y1={y} x2={svgW - padRight} y2={y} stroke="#e8edf3" strokeDasharray="4 4" />
                          <text x={padLeft - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8" fontWeight="700">
                            {tick.toLocaleString("fr-FR")}
                          </text>
                        </g>
                      );
                    })}

                    <line x1={padLeft} y1={padTop + innerH} x2={svgW - padRight} y2={padTop + innerH} stroke="#dbe2ea" />

                    <path d={areaPath} fill="url(#areaGrad)" />
                    <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                    {chartPoints.map((p, idx) => (
                      <g key={`point-${idx}`}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#16a34a" />
                        <circle cx={p.x} cy={p.y} r="10" fill="#16a34a" fillOpacity="0.12" />
                        <text x={p.x} y={padTop + innerH + 18} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="700">
                          {p.label}
                        </text>
                        <text x={p.x} y={padTop + innerH + 30} textAnchor="middle" fontSize="10" fill="#9aa5b3" fontWeight="600">
                          {p.rangeLabel}
                        </text>
                        <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="700">
                          {Math.round(p.value).toLocaleString("fr-FR")}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100 d-flex flex-column">
            <div className="card-header bg-white border-bottom p-4">
              <h5 className="fw-bold text-dark mb-0">Produits les plus vendus</h5>
            </div>
            <div className="card-body p-4">
              <div className="alert alert-info border-0 rounded-3 small d-flex gap-2">
                <Info size={18} className="flex-shrink-0" />
                <div>Classement calcule sur la periode selectionnee.</div>
              </div>

              {loading ? (
                <div className="text-center py-4 text-muted">Chargement...</div>
              ) : computed.topProducts.length === 0 ? (
                <div className="text-center py-5 text-muted opacity-75">
                  <ShoppingBag size={40} className="mb-2" />
                  <p className="mb-0 small">Donnees insuffisantes</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3 mt-3">
                  {computed.topProducts.map((p, i) => (
                    <div key={`${p.nom}-${i}`} className="d-flex align-items-center justify-content-between border rounded-3 px-3 py-2">
                      <div>
                        <div className="fw-bold text-dark" style={{ lineHeight: 1.2 }}>{p.nom}</div>
                        <small className="text-muted">{Math.round(p.montant).toLocaleString("fr-FR")} FCFA</small>
                      </div>
                      <span className="badge bg-success-subtle text-success-emphasis rounded-pill">{p.quantite}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .letter-spacing-1 { letter-spacing: 1px; }
        .period-switch .btn-light { border: 1px solid #edf0f3; background: #fff; }

        .kpi-card {
          border: 1px solid #ecf1f6;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
          background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
          position: relative;
          overflow: hidden;
        }
        .kpi-card::after {
          content: "";
          position: absolute;
          inset: auto -24px -42px auto;
          width: 120px;
          height: 120px;
          border-radius: 999px;
          opacity: 0.14;
          background: currentColor;
          pointer-events: none;
        }
        .kpi-value { font-size: clamp(2rem, 2.2vw, 2.45rem); line-height: 1.1; letter-spacing: -0.01em; }
        .kpi-icon {
          border-radius: 12px;
          padding: 8px;
          display: inline-flex;
          background: #f7f9fc;
          border: 1px solid #edf1f6;
        }
        .tone-success { color: #0f8f5b; }
        .tone-success .kpi-icon { color: #0f8f5b; background: #ecfaf2; }
        .tone-primary { color: #2563eb; }
        .tone-primary .kpi-icon { color: #2563eb; background: #edf4ff; }
        .tone-violet { color: #7c3aed; }
        .tone-violet .kpi-icon { color: #7c3aed; background: #f4efff; }
        .tone-warning { color: #d97706; }
        .tone-warning .kpi-icon { color: #d97706; background: #fff7eb; }

        .trend-strip {
          border-radius: 999px;
          padding: 8px 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
        }
        .trend-strip.up { background: #e9fbf1; color: #0f8f5b; }
        .trend-strip.down { background: #fff0f0; color: #dc2626; }

        .chart-card {
          border: 1px solid #edf1f6;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
        }
        .curve-legend {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #effaf4;
          border: 1px solid #d8f3e2;
          color: #0f8f5b;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .curve-legend .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.2);
        }
        .curve-wrap {
          border: 1px solid #edf2f7;
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff 0%, #f9fcff 100%);
          padding: 10px;
        }
      `}</style>
    </div>
  );
};

export default Statistiques;


