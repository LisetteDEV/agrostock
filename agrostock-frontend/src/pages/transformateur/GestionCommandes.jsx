import React, { useState } from "react";
import { ShoppingBag, Clock, CheckCircle2, User, FileText, MapPin, Phone, Truck, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/config";

const STATUS_LABELS = {
  en_attente_confirmation: "En attente",
  confirmee: "Confirmee",
  en_attente_retrait_livreur: "En attente retrait livreur",
  en_cours_livraison: "En livraison",
  livree: "Livree",
  recue: "Reception confirmee",
  litige_ouvert: "Litige ouvert",
  remboursee: "Remboursee",
  annulee_auto: "Annulee",
};

const STATUS_STYLES = {
  en_attente_confirmation: "bg-warning text-warning",
  confirmee: "bg-primary text-primary",
  en_attente_retrait_livreur: "bg-warning text-warning",
  en_cours_livraison: "bg-info text-info",
  livree: "bg-success text-success",
  recue: "bg-success text-success",
  litige_ouvert: "bg-danger text-danger",
  remboursee: "bg-warning text-warning",
  annulee_auto: "bg-secondary text-secondary",
};

const FILTERS = ["Toutes", "En attente", "Confirmee", "En attente retrait livreur", "En livraison", "Livree", "Reception confirmee", "Litige ouvert", "Remboursee", "Annulee"];

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
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
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
        if (refreshed) {
          setSelectedOrder(refreshed);
          setBonCodeInput(refreshed.bon_retrait?.code || "");
        }
      }
    } catch (error) {
      console.error("Failed to load orders", error);
    }
  };

  React.useEffect(() => {
    if (!token) return;

    loadOrders();
    const interval = setInterval(() => {
      loadOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, [token]);

  const getStatusLabel = (status) => STATUS_LABELS[status] || status;
  const getStatusStyle = (status) => STATUS_STYLES[status] || "bg-secondary text-secondary";

  const updateStatus = async (id, statut) => {
    setUiMessage(null);
    setStatusLoadingId(id);

    try {
      const res = await fetch(`${API_URL}/transformateur/commandes/${id}/statut`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ statut }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUiMessage({ type: "danger", text: data.message || "Action impossible" });
        return;
      }

      await loadOrders();
      setUiMessage({ type: "success", text: "Statut de la commande mis a jour." });
    } catch (error) {
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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ bon_code: bonCodeInput.trim(), otp_code: otpInput.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUiMessage({ type: "danger", text: data.message || "Validation retrait impossible." });
        return;
      }

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
    if (!filteredOrders.length) {
      setUiMessage({ type: "warning", text: "Aucune commande a exporter pour ce filtre." });
      return;
    }

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

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <h2 className="fw-bold text-dark mb-1">Commandes</h2>
          <p className="text-muted mb-0">Gerez vos ventes et retraits securises</p>
        </div>
        <button onClick={handleExportReport} className="btn btn-white shadow-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2">
          <FileText size={18} /> Exporter le rapport
        </button>
      </div>

      <div className="alert alert-info small">Rappel anti-contournement: aucune remise de commande hors processus AgroStock (code bon + OTP).</div>

      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`btn rounded-pill px-4 py-2 border-0 fw-bold text-nowrap shadow-none ${filter === f ? "bg-success text-white" : "bg-white text-muted shadow-sm"}`}>
            {f}
          </button>
        ))}
      </div>

      {uiMessage && <div className={`alert alert-${uiMessage.type} mb-4`}>{uiMessage.text}</div>}

      <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4 py-3 border-0 text-muted small text-uppercase">N commande</th>
                <th className="border-0 text-muted small text-uppercase">Client</th>
                <th className="border-0 text-muted small text-uppercase">Date</th>
                <th className="border-0 text-muted small text-uppercase">Articles</th>
                <th className="border-0 text-muted small text-uppercase">Montant</th>
                <th className="border-0 text-muted small text-uppercase">Statut</th>
                <th className="pe-4 text-end border-0 text-muted small text-uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.filter((o) => filter === "Toutes" || getStatusLabel(o.status) === filter).map((o) => (
                <tr key={o.id}>
                  <td className="ps-4 py-4 fw-bold text-dark">{o.numero}</td>
                  <td><div className="d-flex align-items-center gap-2"><div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}><User size={16} className="text-muted" /></div><span>{o.client}</span></div></td>
                  <td className="text-muted">{o.date}</td>
                  <td>{o.itemsCount} produit(s)</td>
                  <td className="fw-bold">{o.total.toLocaleString("fr-FR")} FCFA</td>
                  <td><span className={`badge ${getStatusStyle(o.status)} bg-opacity-10 rounded-pill px-3 py-2 fw-medium`}>{getStatusLabel(o.status)}</span></td>
                  <td className="pe-4 text-end"><button className="btn btn-outline-success btn-sm rounded-pill px-3 fw-bold" onClick={() => { setSelectedOrder(o); setBonCodeInput(o.bon_retrait?.code || ""); setOtpInput(""); }}>Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg p-3">
              <div className="modal-header border-bottom-0 pb-0">
                <div>
                  <h4 className="modal-title fw-bold d-flex align-items-center gap-2">Commande <span className="text-success">#{selectedOrder.numero}</span></h4>
                  <p className="text-muted small mb-0 mt-1">Passee le {selectedOrder.date}</p>
                </div>
                <button type="button" className="btn-close mb-3 align-self-start" onClick={() => setSelectedOrder(null)}></button>
              </div>

              <div className="modal-body pb-0">
                <div className="bg-light rounded-3 p-4 mb-4 border border-light">
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><MapPin size={18} className="text-success" /> Informations livraison</h6>
                  <div className="row">
                    <div className="col-md-6 mb-2 mb-md-0">
                      <p className="mb-1 text-muted small"><strong>Client:</strong></p>
                      <p className="fw-medium text-dark mb-3">{selectedOrder.client}</p>
                      <p className="mb-1 text-muted small"><strong>Contact:</strong></p>
                      <p className="fw-medium text-dark d-flex align-items-center gap-2 mb-0"><Phone size={14} /> {selectedOrder.telephone || "Non specifie"}</p>
                    </div>
                    <div className="col-md-6 border-start border-light ps-md-4">
                      <p className="mb-1 text-muted small"><strong>Adresse:</strong></p>
                      <p className="text-dark mb-0 small">{selectedOrder.adresse || "Adresse non fournie."}</p>
                      <p className="mb-1 text-muted small mt-2"><strong>Mode logistique:</strong> {selectedOrder.logistique_mode === 'livreur_propre' ? 'Livreur propre' : 'Gozem (simulation)'}</p>
                    </div>
                  </div>
                </div>

                {selectedOrder.status === 'en_attente_retrait_livreur' && (
                  <div className="border rounded-3 p-3 mb-4 bg-warning bg-opacity-10">
                    <h6 className="fw-bold d-flex align-items-center gap-2"><ShieldCheck size={18} className="text-warning" /> Validation retrait securisee</h6>
                    <div className="small mb-2">Ne remettez jamais la commande sans code bon + OTP valides.</div>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small">Code bon</label>
                        <input className="form-control" value={bonCodeInput} onChange={(e) => setBonCodeInput(e.target.value)} placeholder="BRT-..." />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">OTP acheteur</label>
                        <input className="form-control" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="6 chiffres" />
                      </div>
                    </div>
                    <button onClick={() => validateRetrait(selectedOrder.id)} disabled={statusLoadingId === selectedOrder.id} className="btn btn-warning mt-3 rounded-pill fw-bold">
                      {statusLoadingId === selectedOrder.id ? 'Traitement...' : 'Valider retrait et passer en livraison'}
                    </button>
                  </div>
                )}

                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><ShoppingBag size={18} className="text-success" /> Produits</h6>
                <div className="border rounded-4 overflow-hidden mb-4">
                  <ul className="list-group list-group-flush">
                    {selectedOrder.items?.length ? selectedOrder.items.map((it, idx) => (
                      <li key={idx} className="list-group-item d-flex justify-content-between align-items-center p-3">
                        <div>
                          <div className="fw-bold text-dark fs-6">{it.nom}</div>
                          <div className="d-inline-flex px-2 py-1 bg-light rounded text-muted mt-2 fw-bold" style={{ fontSize: "0.85rem" }}>Quantite: <span className="text-success ms-1">{it.quantite}</span></div>
                        </div>
                        <div className="text-end">
                          <div className="small text-muted">{Number(it.prix_unitaire || 0).toLocaleString("fr-FR")} FCFA / unite</div>
                          <div className="fw-bold text-dark mt-1">{Number(it.sous_total || 0).toLocaleString("fr-FR")} FCFA</div>
                        </div>
                      </li>
                    )) : <li className="list-group-item text-muted text-center py-4">Detail des produits non disponible.</li>}
                  </ul>
                </div>
              </div>

              <div className="modal-footer border-top-0 d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center bg-light rounded-bottom-4 py-3">
                <div><span className="text-muted small">Revenu estime: </span><span className="fw-bold text-success fs-5">{Math.max(selectedOrder.sousTotal - selectedOrder.commission, 0).toLocaleString("fr-FR")} FCFA</span></div>

                <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
                  <button className="btn btn-light fw-bold px-4 rounded-pill border" onClick={() => setSelectedOrder(null)}>Fermer</button>
                  {selectedOrder.status === "en_attente_confirmation" && <button onClick={() => handleConfirmOrder(selectedOrder.id)} disabled={statusLoadingId === selectedOrder.id} className="btn btn-success fw-bold px-4 rounded-pill d-flex align-items-center gap-2 shadow-sm"><CheckCircle2 size={18} /> Confirmer</button>}
                  {selectedOrder.status === "confirmee" && <button onClick={() => updateStatus(selectedOrder.id, "en_cours_livraison")} disabled={statusLoadingId === selectedOrder.id} className="btn btn-primary fw-bold px-4 rounded-pill d-flex align-items-center gap-2 shadow-sm">{statusLoadingId === selectedOrder.id ? "Traitement..." : <><Truck size={18} /> Passer en livraison</>}</button>}
                  {selectedOrder.status === "en_cours_livraison" && <button onClick={() => updateStatus(selectedOrder.id, "livree")} disabled={statusLoadingId === selectedOrder.id} className="btn btn-success fw-bold px-4 rounded-pill d-flex align-items-center gap-2 shadow-sm">{statusLoadingId === selectedOrder.id ? "Traitement..." : <><CheckCircle2 size={18} /> Marquer livree</>}</button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModalOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Confirmer cette commande</h5>
                <button type="button" className="btn-close" aria-label="Fermer" onClick={() => setConfirmModalOrder(null)}></button>
              </div>
              <div className="modal-body pt-2"><p className="mb-0 text-muted">La commande sera confirmee et l'acheteur notifie.</p></div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setConfirmModalOrder(null)}>Annuler</button>
                <button type="button" className="btn btn-success rounded-pill px-4" onClick={confirmOrderAction} disabled={statusLoadingId === confirmModalOrder.id}>{statusLoadingId === confirmModalOrder.id ? "Traitement..." : "Oui, confirmer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`.btn-white { background: #fff; border: 1px solid #eee; } .btn-white:hover { background: #f8f9fa; border-color: #1ab273; }`}</style>
    </div>
  );
};

export default GestionCommandes;
