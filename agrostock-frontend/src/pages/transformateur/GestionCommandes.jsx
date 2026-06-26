import React, { useState } from "react";
import {
  ShoppingBag, Clock, CheckCircle2, User, FileText, MapPin, Phone,
  Truck, ShieldCheck, X, Package, Hash, CalendarDays, ArrowRight,
  Download, Filter, AlertTriangle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/config";

const STATUS_LABELS = {
  en_attente_confirmation: "En attente",
  confirmee: "Confirmee",
  en_attente_retrait_livreur: "Retrait livreur",
  en_cours_livraison: "En livraison",
  livree: "Livree",
  recue: "Reception confirmee",
  litige_ouvert: "Litige ouvert",
  remboursee: "Remboursee",
  annulee_auto: "Annulee",
};

const STATUS_CONFIG = {
  en_attente_confirmation: { bg: "#fff7ed", color: "#ea580c", dot: "#f97316" },
  confirmee:               { bg: "#eef2ff", color: "#4f46e5", dot: "#6366f1" },
  en_attente_retrait_livreur: { bg: "#fefce8", color: "#ca8a04", dot: "#eab308" },
  en_cours_livraison:      { bg: "#f0fdf4", color: "#059669", dot: "#10b981" },
  livree:                  { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  recue:                   { bg: "#f0fdf4", color: "#15803d", dot: "#16a34a" },
  litige_ouvert:           { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  remboursee:              { bg: "#faf5ff", color: "#7c3aed", dot: "#8b5cf6" },
  annulee_auto:            { bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" },
};

const FILTER_KEYS = [
  { label: "Toutes",       key: "Toutes" },
  { label: "En attente",   key: "En attente" },
  { label: "Confirmee",    key: "Confirmee" },
  { label: "En livraison", key: "En livraison" },
  { label: "Livree",       key: "Livree" },
  { label: "Litige",       key: "Litige ouvert" },
  { label: "Annulee",      key: "Annulee" },
];

const GestionCommandes = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("Toutes");
  const [uiMessage, setUiMessage] = useState(null);
  const [confirmModalOrder, setConfirmModalOrder] = useState(null);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [bonCodeInput, setBonCodeInput] = useState("");
  const [otpInput, setOtpInput] = useState("");

  const { token } = useAuth();

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/transformateur/commandes`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) return;
      const data = await res.json();
      const formatted = (data.commandes || []).map((cmd) => ({
        id: cmd.id,
        numero: cmd.numero || `CMD-${String(cmd.id).padStart(4, "0")}`,
        client: cmd.client_nom || "Client",
        telephone: cmd.telephone_livraison,
        adresse: cmd.adresse_livraison,
        date: cmd.date ? new Date(cmd.date).toLocaleDateString("fr-FR") : "-",
        itemsCount: cmd.items ? cmd.items.length : 0,
        items: cmd.items || [],
        total: Number(cmd.montant_total || 0),
        sousTotal: Number(cmd.sous_total || 0),
        commission: Number(cmd.commission || 0),
        remise: Number(cmd.remise_appliquee || 0),
        logistique_mode: cmd.logistique_mode || "gozem",
        bon_retrait: cmd.bon_retrait || null,
        status: cmd.statut === "en_cours" ? "en_cours_livraison" : (cmd.statut || "en_attente_confirmation"),
      }));
      setOrders(formatted);
      if (selectedOrder) {
        const refreshed = formatted.find((o) => o.id === selectedOrder.id);
        if (refreshed) { setSelectedOrder(refreshed); setBonCodeInput(refreshed.bon_retrait?.code || ""); }
      }
    } catch (error) {
      console.error("Failed to load orders", error);
    }
  };

  React.useEffect(() => {
    if (!token) return;
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const getStatusLabel = (status) => STATUS_LABELS[status] || status;
  const getStatusConfig = (status) => STATUS_CONFIG[status] || { bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" };

  const updateStatus = async (id, statut) => {
    setUiMessage(null);
    setStatusLoadingId(id);
    try {
      const res = await fetch(`${API_URL}/transformateur/commandes/${id}/statut`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ statut }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setUiMessage({ type: "danger", text: data.message || "Action impossible" }); return; }
      await loadOrders();
      setUiMessage({ type: "success", text: "Statut de la commande mis a jour." });
    } catch {
      setUiMessage({ type: "danger", text: "Erreur technique lors de la mise a jour du statut." });
    } finally {
      setStatusLoadingId(null);
    }
  };

  const validateRetrait = async (orderId) => {
    if (!bonCodeInput.trim() || !otpInput.trim()) {
      setUiMessage({ type: "warning", text: "Saisissez le code bon et OTP." });
      return;
    }
    setStatusLoadingId(orderId);
    try {
      const res = await fetch(`${API_URL}/transformateur/commandes/${orderId}/valider-retrait`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ bon_code: bonCodeInput.trim(), otp_code: otpInput.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setUiMessage({ type: "danger", text: data.message || "Validation retrait impossible." }); return; }
      setOtpInput("");
      await loadOrders();
      setUiMessage({ type: "success", text: "Retrait valide. Commande passee en livraison." });
    } catch {
      setUiMessage({ type: "danger", text: "Erreur technique lors de la validation retrait." });
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleConfirmOrder = (id) => {
    const order = orders.find((o) => o.id === id) || selectedOrder;
    setConfirmModalOrder(order || { id });
  };

  const confirmOrderAction = async () => {
    if (!confirmModalOrder?.id) return;
    await updateStatus(confirmModalOrder.id, "confirmee");
    setConfirmModalOrder(null);
  };

  const handleExportReport = () => {
    const filteredOrders = orders.filter((o) => filter === "Toutes" || getStatusLabel(o.status) === filter);
    if (!filteredOrders.length) { setUiMessage({ type: "warning", text: "Aucune commande a exporter pour ce filtre." }); return; }
    const header = ["Numero", "Client", "Telephone", "Adresse", "Date", "Statut", "Montant", "Sous-total", "Remise", "Commission"];
    const escapeCsv = (value) => '"' + String(value ?? "").replace(/"/g, '""') + '"';
    const rows = filteredOrders.map((o) => [o.numero, o.client, o.telephone || "", o.adresse || "", o.date, getStatusLabel(o.status), o.total, o.sousTotal, o.remise, o.commission].map(escapeCsv).join(","));
    const csv = [header.map(escapeCsv).join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rapport-commandes-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setUiMessage({ type: "success", text: `${filteredOrders.length} commande(s) exportee(s).` });
  };

  const filteredOrders = orders.filter((o) => filter === "Toutes" || getStatusLabel(o.status) === filter);
  const countByFilter = (key) => key === "Toutes" ? orders.length : orders.filter((o) => getStatusLabel(o.status) === key).length;

  return (
    <div className="gc-container">

      {/* ── HERO HEADER ── */}
      <div className="gc-hero mb-4 rounded-4 overflow-hidden position-relative">
        <div className="gc-hero-bg position-absolute top-0 start-0 w-100 h-100"></div>
        <div className="position-relative z-1 p-4 p-md-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div className="text-white">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="gc-hero-icon rounded-3 d-flex align-items-center justify-content-center">
                <Package size={26} className="text-white" />
              </div>
              <h2 className="fw-bold mb-0">Gestion des Commandes</h2>
            </div>
            <p className="text-white-50 mb-0 ms-md-5 ms-0" style={{ maxWidth: "480px", fontSize: "0.95rem" }}>
              Suivez, confirmez et gerez vos commandes. Chaque action est securisee par le protocole AgroStock.
            </p>
          </div>
          <button onClick={handleExportReport} className="gc-export-btn d-flex align-items-center gap-2 fw-bold rounded-pill px-4 py-2 shadow-sm flex-shrink-0">
            <Download size={18} />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* ── ANTI-FRAUD ALERT ── */}
      <div className="gc-alert-security d-flex align-items-start gap-3 rounded-4 p-3 mb-4">
        <div className="flex-shrink-0 mt-1">
          <ShieldCheck size={20} className="text-amber-600" />
        </div>
        <div>
          <p className="fw-bold mb-0 gc-alert-title">Rappel Securite</p>
          <p className="small mb-0 gc-alert-text">Ne remettez jamais une commande sans verifier le code bon + OTP fournis par l'acheteur. Aucun contournement du processus AgroStock n'est autorise.</p>
        </div>
      </div>

      {/* ── FILTER CHIPS ── */}
      <div className="gc-filter-bar bg-white rounded-4 p-3 mb-4 shadow-sm d-flex align-items-center gap-2 flex-wrap">
        <div className="d-flex align-items-center gap-2 text-muted me-2 flex-shrink-0">
          <Filter size={16} />
          <span className="fw-bold small text-uppercase" style={{ letterSpacing: "0.5px" }}>Filtrer</span>
        </div>
        <div className="vr mx-1 opacity-25 d-none d-md-block" style={{ height: "24px" }}></div>
        {FILTER_KEYS.map((f) => {
          const count = countByFilter(f.key);
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`gc-chip ${active ? "gc-chip-active" : "gc-chip-inactive"} d-flex align-items-center gap-2 rounded-pill fw-bold`}
            >
              {f.label}
              <span className={`gc-chip-count ${active ? "gc-chip-count-active" : "gc-chip-count-inactive"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── UI MESSAGE ── */}
      {uiMessage && (
        <div className={`alert alert-${uiMessage.type} border-0 rounded-4 shadow-sm mb-4 d-flex align-items-center gap-2`}>
          <AlertTriangle size={18} className="flex-shrink-0" />
          {uiMessage.text}
          <button type="button" className="btn-close ms-auto" onClick={() => setUiMessage(null)}></button>
        </div>
      )}

      {/* ── ORDERS TABLE ── */}
      {/* MOBILE CARDS */}
      <div className="d-lg-none mb-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
            <div className="d-flex flex-column align-items-center text-muted opacity-50">
              <ShoppingBag size={40} className="mb-3" />
              <p className="fw-medium mb-0">Aucune commande pour ce filtre</p>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredOrders.map((o) => {
              const cfg = getStatusConfig(o.status);
              const initials = (o.client || "C").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={o.id} className="bg-white rounded-4 shadow-sm border p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-dark" style={{ fontFamily: "monospace", letterSpacing: "-0.5px" }}>{o.numero}</span>
                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>{o.date}</span>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="gc-avatar d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0" style={{ width: "36px", height: "36px" }}>
                      {initials}
                    </div>
                    <div>
                      <div className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>{o.client}</div>
                      {o.telephone && <div className="text-muted" style={{ fontSize: "0.78rem" }}>{o.telephone}</div>}
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Montant & Articles</div>
                      <div className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>{o.total.toLocaleString("fr-FR")} FCFA</div>
                      <div className="text-muted" style={{ fontSize: "0.8rem" }}>{o.itemsCount} article{o.itemsCount > 1 ? "s" : ""}</div>
                    </div>
                    <div className="text-end">
                      <span className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 fw-bold" style={{ background: cfg.bg, color: cfg.color, fontSize: "0.75rem", textAlign: "right" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cfg.dot, display: "inline-block flex-shrink-0" }}></span>
                        <span>{getStatusLabel(o.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <hr className="my-2 opacity-50" />
                  <div className="text-end mt-2">
                    <button className="gc-detail-btn d-inline-flex align-items-center justify-content-center w-100 gap-2 fw-bold rounded-pill px-3 py-2 border-0"
                      onClick={() => { setSelectedOrder(o); setBonCodeInput(o.bon_retrait?.code || ""); setOtpInput(""); }}>
                      Détails <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white d-none d-lg-block mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                <th className="ps-4 py-3 border-0 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.8px" }}>
                  <div className="d-flex align-items-center gap-2"><Hash size={13} /> N° Commande</div>
                </th>
                <th className="border-0 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.8px" }}>
                  <div className="d-flex align-items-center gap-2"><User size={13} /> Client</div>
                </th>
                <th className="border-0 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.8px" }}>
                  <div className="d-flex align-items-center gap-2"><CalendarDays size={13} /> Date</div>
                </th>
                <th className="border-0 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.8px" }}>
                  <div className="d-flex align-items-center gap-2"><ShoppingBag size={13} /> Articles</div>
                </th>
                <th className="border-0 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.8px" }}>Montant</th>
                <th className="border-0 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.8px" }}>Statut</th>
                <th className="pe-4 text-end border-0 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.8px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-5 text-center">
                    <div className="d-flex flex-column align-items-center text-muted opacity-50">
                      <ShoppingBag size={40} className="mb-3" />
                      <p className="fw-medium mb-0">Aucune commande pour ce filtre</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.map((o) => {
                const cfg = getStatusConfig(o.status);
                const initials = (o.client || "C").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <tr key={o.id} className="gc-table-row">
                    <td className="ps-4 py-3">
                      <span className="fw-bold text-dark" style={{ fontFamily: "monospace", letterSpacing: "-0.5px" }}>{o.numero}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="gc-avatar d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0" style={{ width: "36px", height: "36px" }}>
                          {initials}
                        </div>
                        <div>
                          <div className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>{o.client}</div>
                          {o.telephone && <div className="text-muted" style={{ fontSize: "0.78rem" }}>{o.telephone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="text-muted" style={{ fontSize: "0.88rem" }}>{o.date}</td>
                    <td>
                      <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ background: "#f1f5f9", color: "#334155", fontSize: "0.78rem" }}>
                        {o.itemsCount} article{o.itemsCount > 1 ? "s" : ""}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>{o.total.toLocaleString("fr-FR")}</span>
                      <span className="text-muted ms-1" style={{ fontSize: "0.75rem" }}>FCFA</span>
                    </td>
                    <td>
                      <span className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 fw-bold" style={{ background: cfg.bg, color: cfg.color, fontSize: "0.78rem" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cfg.dot, display: "inline-block" }}></span>
                        {getStatusLabel(o.status)}
                      </span>
                    </td>
                    <td className="pe-4 text-end">
                      <button className="gc-detail-btn d-inline-flex align-items-center gap-2 fw-bold rounded-pill px-3 py-2"
                        onClick={() => { setSelectedOrder(o); setBonCodeInput(o.bon_retrait?.code || ""); setOtpInput(""); }}>
                        Détails <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ORDER DETAIL MODAL ── */}
      {selectedOrder && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1050, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}>
          <div className="gc-modal-card bg-white rounded-4 shadow-xl d-flex flex-column" style={{ maxWidth: "680px", width: "100%", maxHeight: "92vh" }}>
            {/* Modal Header */}
            <div className="p-4 border-bottom position-relative">
              <div className="position-absolute top-0 start-0 w-100 rounded-top-4" style={{ height: "4px", background: "linear-gradient(90deg, #10b981, #6366f1)" }}></div>
              <div className="d-flex align-items-start justify-content-between mt-1">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.5px" }}>Commande</span>
                    <span className="badge rounded-pill fw-bold px-2" style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "0.8rem" }}>#{selectedOrder.numero}</span>
                  </div>
                  <h4 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Détails de la commande</h4>
                  <p className="text-muted small mb-0 mt-1">Passée le {selectedOrder.date}</p>
                </div>
                <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "36px", height: "36px" }} onClick={() => setSelectedOrder(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-auto p-4 d-flex flex-column gap-4">
              {/* Client & Livraison */}
              <div className="rounded-4 p-4 border" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
                <h6 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: "#0f172a" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }}></div>
                  Informations de livraison
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <p className="text-muted small fw-bold text-uppercase mb-1" style={{ letterSpacing: "0.5px", fontSize: "0.7rem" }}>Client</p>
                    <p className="fw-bold text-dark mb-0">{selectedOrder.client}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small fw-bold text-uppercase mb-1" style={{ letterSpacing: "0.5px", fontSize: "0.7rem" }}>Contact</p>
                    <p className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <Phone size={14} className="text-muted" /> {selectedOrder.telephone || "Non specifie"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small fw-bold text-uppercase mb-1" style={{ letterSpacing: "0.5px", fontSize: "0.7rem" }}>Adresse</p>
                    <p className="fw-medium text-dark mb-0 d-flex align-items-start gap-2">
                      <MapPin size={14} className="text-muted flex-shrink-0 mt-1" /> {selectedOrder.adresse || "Non fournie"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small fw-bold text-uppercase mb-1" style={{ letterSpacing: "0.5px", fontSize: "0.7rem" }}>Logistique</p>
                    <p className="fw-medium text-dark mb-0 d-flex align-items-center gap-2">
                      <Truck size={14} className="text-muted" />
                      {selectedOrder.logistique_mode === "livreur_propre" ? "Livreur propre" : "Gozem (simulation)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Retrait Securisé */}
              {selectedOrder.status === "en_attente_retrait_livreur" && (
                <div className="rounded-4 p-4 border" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "#92400e" }}>
                    <ShieldCheck size={18} className="text-amber-600" />
                    Validation du retrait securise
                  </h6>
                  <p className="small mb-3" style={{ color: "#78350f" }}>Ne remettez jamais la commande sans valider les deux codes ci-dessous.</p>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small" style={{ color: "#78350f" }}>Code bon de retrait</label>
                      <input className="form-control premium-input" value={bonCodeInput} onChange={(e) => setBonCodeInput(e.target.value)} placeholder="BRT-XXXXXXXX" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small" style={{ color: "#78350f" }}>Code OTP acheteur</label>
                      <input className="form-control premium-input" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="6 chiffres" />
                    </div>
                  </div>
                  <button onClick={() => validateRetrait(selectedOrder.id)} disabled={statusLoadingId === selectedOrder.id}
                    className="btn fw-bold rounded-pill px-4 py-2 mt-3 d-flex align-items-center gap-2"
                    style={{ background: "#d97706", color: "white", border: "none" }}>
                    <ShieldCheck size={18} />
                    {statusLoadingId === selectedOrder.id ? "Traitement..." : "Valider et passer en livraison"}
                  </button>
                </div>
              )}

              {/* Articles */}
              <div>
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "#0f172a" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></div>
                  Articles commandés ({selectedOrder.itemsCount})
                </h6>
                <div className="rounded-4 overflow-hidden border" style={{ borderColor: "#e2e8f0" }}>
                  {selectedOrder.items?.length ? selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center p-3 gc-item-row" style={{ borderBottom: idx < selectedOrder.items.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center rounded-3 fw-bold" style={{ width: "32px", height: "32px", background: "#f0fdf4", color: "#16a34a", fontSize: "0.8rem" }}>
                          {it.quantite}
                        </div>
                        <div>
                          <div className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>{it.nom}</div>
                          <div className="text-muted" style={{ fontSize: "0.78rem" }}>{Number(it.prix_unitaire || 0).toLocaleString("fr-FR")} FCFA / unité</div>
                        </div>
                      </div>
                      <div className="fw-bold text-dark">{Number(it.sous_total || 0).toLocaleString("fr-FR")} <span className="text-muted fw-normal" style={{ fontSize: "0.78rem" }}>FCFA</span></div>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-muted">Détail des produits non disponible.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-top d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3" style={{ background: "#f8fafc" }}>
              <div>
                <p className="text-muted small mb-0">Revenu net estimé</p>
                <p className="fw-bold mb-0" style={{ fontSize: "1.3rem", color: "#0f172a" }}>
                  {Math.max(selectedOrder.sousTotal - selectedOrder.commission, 0).toLocaleString("fr-FR")} <span className="text-muted fw-normal" style={{ fontSize: "0.8rem" }}>FCFA</span>
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setSelectedOrder(null)}>Fermer</button>
                {selectedOrder.status === "en_attente_confirmation" && (
                  <button onClick={() => handleConfirmOrder(selectedOrder.id)} disabled={statusLoadingId === selectedOrder.id}
                    className="btn btn-success rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm">
                    <CheckCircle2 size={18} />
                    {statusLoadingId === selectedOrder.id ? "Traitement..." : "Confirmer"}
                  </button>
                )}
                {selectedOrder.status === "confirmee" && (
                  <button onClick={() => updateStatus(selectedOrder.id, "en_cours_livraison")} disabled={statusLoadingId === selectedOrder.id}
                    className="btn rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', border: 'none' }}>
                    <Truck size={18} />
                    {statusLoadingId === selectedOrder.id ? "Traitement..." : "Passer en livraison"}
                  </button>
                )}
                {selectedOrder.status === "en_cours_livraison" && (
                  <button onClick={() => updateStatus(selectedOrder.id, "livree")} disabled={statusLoadingId === selectedOrder.id}
                    className="btn btn-success rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm">
                    <CheckCircle2 size={18} />
                    {statusLoadingId === selectedOrder.id ? "Traitement..." : "Marquer livrée"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM MODAL ── */}
      {confirmModalOrder && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1060, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-4 shadow-xl p-4" style={{ maxWidth: "440px", width: "100%" }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", background: "#f0fdf4" }}>
                <CheckCircle2 size={24} className="text-success" />
              </div>
              <h5 className="fw-bold mb-0">Confirmer la commande ?</h5>
            </div>
            <p className="text-muted mb-4">La commande sera confirmée et l'acheteur sera notifié. Cette action est irréversible.</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setConfirmModalOrder(null)}>Annuler</button>
              <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={confirmOrderAction} disabled={statusLoadingId === confirmModalOrder.id}>
                {statusLoadingId === confirmModalOrder.id ? "Traitement..." : "Oui, confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ── GENERAL ── */
        .text-amber-600 { color: #d97706; }
        .text-emerald-600 { color: #059669; }

        /* ── HERO ── */
        .gc-hero { background: #052e16; box-shadow: 0 16px 40px -12px rgba(0,0,0,0.3); }
        .gc-hero-bg {
          background: radial-gradient(circle at 85% 20%, rgba(16,185,129,0.35) 0%, transparent 55%),
                      radial-gradient(circle at 15% 80%, rgba(5,150,105,0.2) 0%, transparent 55%);
        }
        .gc-hero-icon { background: rgba(255,255,255,0.12); backdrop-filter: blur(8px); width: 52px; height: 52px; }
        .gc-export-btn {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .gc-export-btn:hover {
          background: rgba(255,255,255,0.22);
          color: white;
          transform: translateY(-1px);
        }

        /* ── SECURITY ALERT ── */
        .gc-alert-security { background: #fffbeb; border: 1px solid #fde68a; }
        .gc-alert-title { color: #92400e; font-size: 0.9rem; }
        .gc-alert-text { color: #78350f; }

        /* ── FILTER CHIPS ── */
        .gc-filter-bar { border: 1px solid #e2e8f0; }
        .gc-chip {
          padding: 6px 14px;
          font-size: 0.82rem;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .gc-chip-active {
          background: #0f172a !important;
          color: white !important;
          border-color: #0f172a !important;
        }
        .gc-chip-inactive {
          background: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        }
        .gc-chip-inactive:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .gc-chip-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          min-width: 20px;
          height: 20px;
          font-size: 0.72rem;
          padding: 0 6px;
        }
        .gc-chip-count-active { background: rgba(255,255,255,0.2); color: white; }
        .gc-chip-count-inactive { background: #e2e8f0; color: #64748b; }

        /* ── TABLE ── */
        .gc-table-row { transition: background 0.15s; cursor: default; }
        .gc-table-row:hover { background: #f8fafc; }
        .gc-avatar { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #065f46; font-size: 0.78rem; }

        /* ── DETAIL BTN ── */
        .gc-detail-btn {
          background: #f8fafc;
          color: #334155;
          border: 1px solid #e2e8f0;
          font-size: 0.82rem;
          transition: all 0.2s;
        }
        .gc-detail-btn:hover {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
          transform: translateX(2px);
        }

        /* ── MODAL ── */
        .gc-modal-card { border: 1px solid #e2e8f0; }
        .gc-item-row { transition: background 0.15s; }
        .gc-item-row:hover { background: #f8fafc; }

        /* ── PREMIUM INPUTS ── */
        .premium-input {
          background: #fff;
          border: 1px solid #e2e8f0;
          font-weight: 500;
        }
        .premium-input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12) !important;
        }
      `}</style>
    </div>
  );
};

export default GestionCommandes;
