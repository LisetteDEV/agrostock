import React from "react";
import { Search, MapPin, Eye, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from '../../services/config';
const StatusBadge = ({ statut }) => {
  const map = {
    en_attente_confirmation: { label: "En attente", color: "#f59e0b" },
    confirmee: { label: "Confirmee", color: "#3b82f6" },
    en_cours_livraison: { label: "En livraison", color: "#06b6d4" },
    livree: { label: "Livree", color: "#10b981" },
    recue: { label: "Reception confirmee", color: "#22c55e" },
    litige_ouvert: { label: "Litige ouvert", color: "#ef4444" },
    remboursee: { label: "Remboursee", color: "#f59e0b" },
    annulee_auto: { label: "Annulee auto", color: "#ef4444" },
  };

  const s = map[statut] || { label: statut || "N/A", color: "#a1a1aa" };

  return (
    <span
      className="badge rounded-pill px-3 py-1 fw-bold small"
      style={{ color: s.color, backgroundColor: `${s.color}20` }}
    >
      {s.label}
    </span>
  );
};

const SectionCommandes = () => {
  const { token } = useAuth();
  const [search, setSearch] = React.useState("");
  const [commandes, setCommandes] = React.useState([]);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [decisionNote, setDecisionNote] = React.useState("");
  const [uiMessage, setUiMessage] = React.useState(null);
  const [resolvingDecision, setResolvingDecision] = React.useState(null);

  const loadCommandes = React.useCallback(() => {
    if (!token) return;

    fetch(`${API_URL}/admin/commandes`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => setCommandes(data.commandes || []))
      .catch(() => setCommandes([]));
  }, [token]);

  React.useEffect(() => {
    loadCommandes();
  }, [loadCommandes]);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return commandes;
    return commandes.filter(
      (c) =>
        String(c.numero || "")
          .toLowerCase()
          .includes(q) ||
        String(c.acheteur || "")
          .toLowerCase()
          .includes(q) ||
        String(c.transformateur || "")
          .toLowerCase()
          .includes(q) ||
        String(c.statut || "")
          .toLowerCase()
          .includes(q),
    );
  }, [commandes, search]);

  const formatPrice = (n) => Number(n || 0).toLocaleString("fr-FR") + " FCFA";

  const resolveLitige = async (decision) => {
    if (!selectedOrder?.litige?.id) return;
    setResolvingDecision(decision);

    try {
      const res = await fetch(
        `${API_URL}/admin/litiges/${selectedOrder.litige.id}/resolve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ decision, note: decisionNote }),
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUiMessage({ type: 'danger', text: data.message || 'Impossible de traiter le litige.' });
        return;
      }

      setUiMessage({ type: 'success', text: 'Decision enregistree.' });
      setSelectedOrder(null);
      setDecisionNote("");
      loadCommandes();
    } catch {
      setUiMessage({ type: 'danger', text: 'Erreur technique lors du traitement du litige.' });
    } finally {
      setResolvingDecision(null);
    }
  };

  return (
    <div>
      {uiMessage && <div className={`alert alert-${uiMessage.type} border-0 rounded-3`}>{uiMessage.text}</div>}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestion des Commandes</h4>
          <span style={{ color: "#8a9b92" }} className="small">
            {filtered.length} commande(s)
          </span>
        </div>
        <div className="input-group" style={{ maxWidth: "320px" }}>
          <span
            className="input-group-text border-0"
            style={{ background: "#0e261a" }}
          >
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-0 text-white"
            placeholder="Rechercher..."
            style={{ background: "#0e261a", fontSize: "0.9rem" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div
        className="card border-0 rounded-4 overflow-hidden shadow-lg"
        style={{ background: "#0a1d13" }}
      >
        <div className="table-responsive">
          <table
            className="table table-dark table-hover mb-0 align-middle"
            style={{
              background: "transparent",
              "--bs-table-bg": "transparent",
              "--bs-table-hover-bg": "#0e261a",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #183827" }}>
                <th
                  className="ps-4 fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  No Commande
                </th>
                <th
                  className="fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  Acheteur
                </th>
                <th
                  className="fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  Transformateur
                </th>
                <th
                  className="fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  Ville
                </th>
                <th
                  className="fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  Montant
                </th>
                <th
                  className="fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  Statut
                </th>
                <th
                  className="fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  Date
                </th>
                <th
                  className="pe-4 text-end fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Aucune commande trouvee.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #183827" }}>
                    <td className="ps-4 fw-bold text-success">{c.numero}</td>
                    <td className="text-white">{c.acheteur || "-"}</td>
                    <td className="text-white small">
                      {c.transformateur || "-"}
                    </td>
                    <td className="text-muted small">
                      <MapPin size={12} className="me-1" />
                      {c.ville || "-"}
                    </td>
                    <td className="text-white fw-bold">
                      {formatPrice(c.montant_total)}
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1 align-items-start">
                        <StatusBadge statut={c.statut} />
                        {c.litige && (
                          <span
                            className="badge rounded-pill px-2 py-1"
                            style={{
                              background: "rgba(239,68,68,0.2)",
                              color: "#ef4444",
                            }}
                          >
                            Litige #{c.litige.id}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-muted small">
                      {new Date(c.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="pe-4 text-end">
                      <button
                        className="btn btn-sm btn-outline-light rounded-pill px-3 fw-bold small"
                        onClick={() => setSelectedOrder(c)}
                      >
                        <Eye size={14} className="me-1" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedOrder && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={(e) => {
            if (e.target.className.includes("modal ")) setSelectedOrder(null);
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content"
              style={{
                background: "#0e261a",
                color: "white",
                border: "1px solid #183827",
              }}
            >
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  Details de la Commande #{selectedOrder.numero}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedOrder(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <div>
                    <strong>Acheteur :</strong> {selectedOrder.acheteur || "-"}
                  </div>
                  <div>
                    <strong>Transformateur :</strong>{" "}
                    {selectedOrder.transformateur || "-"}
                  </div>
                  <div>
                    <strong>Statut :</strong>{" "}
                    <StatusBadge statut={selectedOrder.statut} />
                  </div>
                  <div className="mt-2">
                    <strong>Escrow:</strong> {selectedOrder.escrow_status}
                  </div>
                  <div>
                    <strong>Paiement:</strong> {selectedOrder.payment_status}
                  </div>
                </div>

                <h6 className="fw-bold text-success mb-3">Produits achetes</h6>
                <ul
                  className="list-group mb-3 rounded-3"
                  style={{ border: "1px solid #183827" }}
                >
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((it, idx) => (
                      <li
                        key={idx}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        style={{
                          background: "transparent",
                          color: "white",
                          borderBottom: "1px solid #183827",
                        }}
                      >
                        <div>
                          <div className="fw-bold">{it.nom}</div>
                          <small className="text-muted">
                            {it.quantite} x {formatPrice(it.prix_unitaire)}
                          </small>
                        </div>
                        <div className="fw-bold text-success">
                          {formatPrice(it.sous_total)}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li
                      className="list-group-item disabled text-muted"
                      style={{ background: "transparent" }}
                    >
                      Aucun detail de produit trouve.
                    </li>
                  )}
                </ul>

                <div
                  className="d-flex justify-content-between align-items-center mt-3 pt-3"
                  style={{ borderTop: "1px solid #183827" }}
                >
                  <span className="fs-6 text-muted">Frais de livraison :</span>
                  <span className="fs-6 text-muted">
                    {formatPrice(selectedOrder.frais_livraison)}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="fs-6 text-muted">
                    Commission plateforme (10%) :
                  </span>
                  <span className="fs-6 text-muted">
                    {formatPrice(selectedOrder.commission)}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="fs-5">Total regle :</span>
                  <span className="fs-4 fw-bold text-success">
                    {formatPrice(selectedOrder.montant_total)}
                  </span>
                </div>

                {selectedOrder.litige && (
                  <div
                    className="mt-4 p-3 rounded-3"
                    style={{
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.35)",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2 text-danger fw-bold">
                      <ShieldAlert size={18} /> Litige #
                      {selectedOrder.litige.id}
                    </div>
                    <div className="small mb-2">
                      Motif: {selectedOrder.litige.motif}
                    </div>
                    <div className="small mb-3">
                      Statut litige:{" "}
                      <strong>{selectedOrder.litige.statut}</strong>
                    </div>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      placeholder="Note de resolution (optionnel)"
                    />

                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-sm btn-warning fw-bold"
                        disabled={!!resolvingDecision}
                        onClick={() => resolveLitige("remboursement")}
                      >
                        {resolvingDecision === "remboursement" ? "Traitement..." : "Rembourser acheteur"}
                      </button>
                      <button
                        className="btn btn-sm btn-success fw-bold"
                        disabled={!!resolvingDecision}
                        onClick={() => resolveLitige("reversement")}
                      >
                        {resolvingDecision === "reversement" ? "Traitement..." : "Verser transformateur"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-light fw-bold"
                        disabled={!!resolvingDecision}
                        onClick={() => resolveLitige("rejet")}
                      >
                        {resolvingDecision === "rejet" ? "Traitement..." : "Rejeter litige"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionCommandes;




