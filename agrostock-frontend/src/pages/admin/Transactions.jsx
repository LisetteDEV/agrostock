import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from '../../services/config';
const StatusBadge = ({ statut }) => {
  const colors = {
    Succes: { text: "#0f9d58", bg: "rgba(15,157,88,0.1)" },
    Echec: { text: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    Rembourse: { text: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  };

  const c = colors[statut] || { text: "#a1a1aa", bg: "rgba(161,161,170,0.15)" };

  return (
    <span
      className="badge rounded-pill px-3 py-1 fw-bold small"
      style={{ color: c.text, backgroundColor: c.bg }}
    >
      {statut}
    </span>
  );
};

const formatFcfa = (n) => Number(n || 0).toLocaleString("fr-FR") + " FCFA";

const SectionPaiements = () => {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/admin/transactions`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => setTransactions(data.transactions || []))
      .catch(() => setTransactions([]));

    fetch(`${API_URL}/admin/finance/stats`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, [token]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return transactions;

    return transactions.filter(
      (t) =>
        String(t.reference || "")
          .toLowerCase()
          .includes(q) ||
        String(t.commande || "")
          .toLowerCase()
          .includes(q) ||
        String(t.type || "")
          .toLowerCase()
          .includes(q) ||
        String(t.statut || "")
          .toLowerCase()
          .includes(q),
    );
  }, [transactions, query]);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestion des Paiements</h4>
          <span style={{ color: "#8a9b92" }} className="small">
            {filtered.length} transaction(s)
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
            placeholder="Rechercher une transaction..."
            style={{ background: "#0e261a", fontSize: "0.9rem" }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          {
            label: "Total encaisse",
            value: formatFcfa(stats?.encaisse_total),
            color: "#10b981",
          },
          {
            label: "Commissions (10%)",
            value: formatFcfa(stats?.commissions_total),
            color: "#8b5cf6",
          },
          {
            label: "En escrow",
            value: formatFcfa(stats?.escrow_total),
            color: "#3b82f6",
          },
          {
            label: "Remboursements",
            value: formatFcfa(stats?.remboursements_total),
            color: "#f59e0b",
          },
        ].map((s, i) => (
          <div className="col-6 col-lg-3" key={i}>
            <div className="p-3 rounded-3" style={{ background: "#0a1d13" }}>
              <div
                className="fw-bold text-white mb-1"
                style={{ fontSize: "1.1rem" }}
              >
                {s.value}
              </div>
              <div
                className="small fw-bold text-uppercase"
                style={{ color: s.color, fontSize: "0.7rem" }}
              >
                {s.label}
              </div>
            </div>
          </div>
        ))}
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
                  Reference
                </th>
                <th
                  className="fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  Commande
                </th>
                <th
                  className="fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  Type
                </th>
                <th
                  className="fw-bold small text-uppercase"
                  style={{ color: "#8a9b92" }}
                >
                  Methode
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
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Aucune transaction trouvee.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #183827" }}>
                    <td className="ps-4 fw-bold text-white">{p.reference}</td>
                    <td className="text-success fw-bold small">
                      {p.commande || "-"}
                    </td>
                    <td className="text-white small text-capitalize">
                      {String(p.type || "").replace("_", " ")}
                    </td>
                    <td className="text-white small">{p.methode || "-"}</td>
                    <td className="text-white fw-bold">
                      {formatFcfa(p.montant)}
                    </td>
                    <td>
                      <StatusBadge statut={p.statut} />
                    </td>
                    <td className="text-muted small">
                      {new Date(p.date).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SectionPaiements;

