import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Shield,
  UserCheck,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { API_URL } from '../../services/config';

const TableCard = ({ children }) => (
  <div
    className="card border-0 rounded-4 overflow-hidden shadow-lg"
    style={{ background: "#0a1d13" }}
  >
    {children}
  </div>
);

const Dashboard = () => {
  const { token } = useAuth();

  const [stats, setStats] = useState({
    total_users: "-",
    pending_transformateurs: "-",
    total_products: "-",
    monthly_commands: "-",
    revenue: "-",
    open_disputes: "-",
    flagged_reviews: "-",
    new_users_today: "-",
    escrow_total_raw: 0,
  });

  const [pendingList, setPendingList] = useState([]);
  const [openDisputes, setOpenDisputes] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.total_users !== undefined) setStats(data);
      })
      .catch((err) => console.error("Erreur stats", err));

    setIsLoadingList(true);
    fetch(`${API_URL}/admin/transformateurs/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPendingList(data);
        setIsLoadingList(false);
      })
      .catch(() => setIsLoadingList(false));

    fetch(`${API_URL}/admin/litiges`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = data.litiges || [];
        setOpenDisputes(
          list
            .filter((l) => ["ouvert", "en_cours"].includes(l.statut))
            .slice(0, 5),
        );
      })
      .catch(() => setOpenDisputes([]));
  }, [token]);

  const formatFcfa = (n) => Number(n || 0).toLocaleString("fr-FR") + " FCFA";

  return (
    <div>
      <div className="row g-3 mb-5">
        {[
          {
            label: "Transformateurs en attente",
            count: stats.pending_transformateurs,
            color: "#f59e0b",
            icon: <AlertTriangle size={20} />,
          },
          {
            label: "Litiges ouverts",
            count: stats.open_disputes,
            color: "#ef4444",
            icon: <Shield size={20} />,
          },
          {
            label: "Avis signales",
            count: stats.flagged_reviews,
            color: "#f97316",
            icon: <MessageSquare size={20} />,
          },
          {
            label: "Nouveaux inscrits (aujourd'hui)",
            count: stats.new_users_today,
            color: "#3b82f6",
            icon: <UserCheck size={20} />,
          },
        ].map((a, i) => (
          <div className="col-6 col-lg-3" key={i}>
            <div
              className="d-flex align-items-center gap-3 p-3 rounded-3 border"
              style={{
                borderColor: `${a.color}33`,
                background: `${a.color}08`,
              }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center shrink-0"
                style={{
                  width: "42px",
                  height: "42px",
                  background: `${a.color}15`,
                  color: a.color,
                }}
              >
                {a.icon}
              </div>
              <div>
                <div
                  className="fw-bold"
                  style={{ color: a.color, fontSize: "1.3rem" }}
                >
                  {a.count}
                </div>
                <div
                  className="small lh-1 mt-1"
                  style={{ fontSize: "0.75rem", color: "#8a9b92" }}
                >
                  {a.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-5">
        {[
          {
            label: "Total Utilisateurs",
            value: stats.total_users,
            icon: <Users size={24} />,
            color: "rgba(59,130,246,0.15)",
            iconColor: "#3b82f6",
          },
          {
            label: "Produits Publies",
            value: stats.total_products,
            icon: <Package size={24} />,
            color: "rgba(16,185,129,0.15)",
            iconColor: "#10b981",
          },
          {
            label: "Commandes du mois",
            value: stats.monthly_commands,
            icon: <ShoppingCart size={24} />,
            color: "rgba(245,158,11,0.15)",
            iconColor: "#f59e0b",
          },
          {
            label: "Commissions encaissees",
            value: stats.revenue,
            icon: <DollarSign size={24} />,
            color: "rgba(139,92,246,0.15)",
            iconColor: "#8b5cf6",
          },
        ].map((c, i) => (
          <div className="col-6 col-lg-3" key={i}>
            <div
              className="card border-0 shadow-lg rounded-4 p-4 h-100"
              style={{ background: "#0a1d13" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div
                  className="p-3 rounded-circle"
                  style={{ backgroundColor: c.color }}
                >
                  {React.cloneElement(c.icon, {
                    style: { color: c.iconColor },
                  })}
                </div>
                <h3
                  className="fw-bold mb-0 text-white"
                  style={{ fontSize: "1.1rem" }}
                >
                  {c.value}
                </h3>
              </div>
              <h6
                className="mb-0 fw-bold small text-uppercase"
                style={{ color: "#8a9b92" }}
              >
                {c.label}
              </h6>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <TableCard>
            <div
              className="card-header p-4 d-flex justify-content-between align-items-center"
              style={{
                background: "#0e261a",
                borderBottom: "1px solid #183827",
              }}
            >
              <h6 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <AlertTriangle size={18} className="text-warning" />{" "}
                Transformateurs en attente
              </h6>
              <span className="badge bg-warning bg-opacity-15 text-warning rounded-pill px-3">
                {pendingList.length} en attente
              </span>
            </div>
            <div className="table-responsive">
              <table
                className="table table-dark table-hover mb-0 align-middle"
                style={{ backgroundColor: "#0a1d13" }}
              >
                <thead>
                  <tr style={{ background: "#0e261a" }}>
                    <th className="border-0 p-3 text-muted small text-uppercase">
                      Entreprise
                    </th>
                    <th className="border-0 p-3 text-muted small text-uppercase">
                      Date
                    </th>
                    <th className="border-0 p-3 text-muted small text-uppercase">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingList ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-4 text-muted small"
                      >
                        Chargement...
                      </td>
                    </tr>
                  ) : pendingList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-4 text-muted small"
                      >
                        Aucun en attente.
                      </td>
                    </tr>
                  ) : (
                    pendingList.slice(0, 5).map((t) => (
                      <tr
                        key={t.id}
                        className="border-bottom border-light border-opacity-10"
                      >
                        <td className="p-3">
                          <div className="fw-bold text-white">
                            {t.entreprise}
                          </div>
                          <div className="small text-muted">{t.nom}</div>
                        </td>
                        <td className="p-3 text-muted small">{t.date}</td>
                        <td className="p-3 text-muted small">{t.type}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TableCard>
        </div>

        <div className="col-lg-6">
          <TableCard>
            <div
              className="card-header p-4 d-flex justify-content-between align-items-center"
              style={{
                background: "#0e261a",
                borderBottom: "1px solid #183827",
              }}
            >
              <h6 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                <Shield size={18} className="text-danger" /> Litiges ouverts
              </h6>
              <span className="badge bg-danger bg-opacity-15 text-danger rounded-pill px-3">
                {openDisputes.length}
              </span>
            </div>
            <div className="table-responsive">
              <table
                className="table table-dark table-hover mb-0 align-middle"
                style={{ backgroundColor: "#0a1d13" }}
              >
                <thead>
                  <tr style={{ background: "#0e261a" }}>
                    <th className="border-0 p-3 text-muted small text-uppercase">
                      Commande
                    </th>
                    <th className="border-0 p-3 text-muted small text-uppercase">
                      Acheteur
                    </th>
                    <th className="border-0 p-3 text-muted small text-uppercase">
                      Motif
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {openDisputes.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-4 text-muted small d-flex align-items-center justify-content-center gap-2"
                      >
                        <CheckCircle2 size={16} />
                        Aucun litige ouvert
                      </td>
                    </tr>
                  ) : (
                    openDisputes.map((l) => (
                      <tr
                        key={l.id}
                        className="border-bottom border-light border-opacity-10"
                      >
                        <td className="p-3 text-white fw-bold">
                          {l.commande?.numero}
                        </td>
                        <td className="p-3 text-muted small">{l.acheteur}</td>
                        <td className="p-3 text-muted small">{l.motif}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TableCard>
        </div>
      </div>

      <div className="small text-muted text-end">
        Montant en escrow actuel:{" "}
        <strong className="text-white">
          {formatFcfa(stats.escrow_total_raw)}
        </strong>
      </div>
    </div>
  );
};

export default Dashboard;

