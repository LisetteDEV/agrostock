import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, UserCheck, UserX, Trash2 } from 'lucide-react';
import { API_URL } from '../../services/config';

const StatusBadge = ({ statut }) => {
  const raw = String(statut || '').trim().toLowerCase();
  const label = raw === 'actif' ? 'Actif' : raw === 'en_attente' ? 'En attente' : 'Suspendu';

  let color = '#ef4444';
  let bg = 'rgba(239,68,68,0.15)';

  if (label === 'Actif') {
    color = '#34d399';
    bg = 'rgba(52,211,153,0.15)';
  }

  if (label === 'En attente') {
    color = '#fbbf24';
    bg = 'rgba(251,191,36,0.15)';
  }

  return (
    <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ color, backgroundColor: bg, border: `1px solid ${color}` }}>
      {label}
    </span>
  );
};

const SectionUtilisateurs = () => {
  const { token } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tous les roles');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uiMessage, setUiMessage] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();
      if (Array.isArray(data)) setUtilisateurs(data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, fetchUsers]);

  const handleToggleStatus = async (user) => {
    const isActive = String(user.statut || '').toLowerCase() === 'actif';
    const action = isActive ? 'suspend' : 'reactivate';

    setUiMessage(null);
    setActionLoadingId(user.id);

    try {
      const res = await fetch(`${API_URL}/admin/users/${user.id}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setUiMessage({ type: 'danger', text: data.message || 'Action impossible.' });
        return;
      }

      const nextStatut = data?.user?.statut || (isActive ? 'Suspendu' : 'Actif');
      setUtilisateurs((prev) => prev.map((u) => (u.id === user.id ? { ...u, statut: nextStatut } : u)));
      setUiMessage({ type: 'success', text: data.message || 'Statut mis a jour.' });
    } catch {
      setUiMessage({ type: 'danger', text: 'Erreur technique pendant la mise a jour.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;

    setUiMessage(null);
    setDeleteLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/users/${deleteModalUser.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setUiMessage({ type: 'danger', text: data.message || 'Suppression impossible.' });
        return;
      }

      setUtilisateurs((prev) => prev.filter((u) => u.id !== deleteModalUser.id));
      setDeleteModalUser(null);
      setUiMessage({ type: 'success', text: data.message || 'Utilisateur archive avec succes.' });
    } catch {
      setUiMessage({ type: 'danger', text: 'Erreur technique pendant la suppression.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return utilisateurs.filter((u) => {
      const matchRole = roleFilter === 'Tous les roles' || String(u.role || '').toLowerCase() === roleFilter.toLowerCase();
      const matchSearch = !q || String(u.nom || '').toLowerCase().includes(q) || String(u.email || '').toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [utilisateurs, search, roleFilter]);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-white">Gestion des utilisateurs</h4>
          <span style={{ color: '#8a9b92' }} className="small">{filteredUsers.length} element(s)</span>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text border-0" style={{ background: '#0e261a' }}>
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-0 text-white"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: '#0e261a', fontSize: '0.9rem' }}
            />
          </div>

          <select
            className="form-select form-select-sm border-0 text-white"
            style={{ background: '#0e261a', width: 'auto' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>Tous les roles</option>
            <option>Acheteur</option>
            <option>Transformateur</option>
          </select>
        </div>
      </div>

      {uiMessage && (
        <div className={`alert alert-${uiMessage.type} d-flex justify-content-between align-items-center mb-4`} role="alert">
          <span>{uiMessage.text}</span>
          <button type="button" className="btn-close" aria-label="Fermer" onClick={() => setUiMessage(null)}></button>
        </div>
      )}

      <div className="card border-0 rounded-4 overflow-hidden shadow-lg" style={{ background: '#0a1d13' }}>
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle" style={{ background: 'transparent', '--bs-table-bg': 'transparent', '--bs-table-hover-bg': '#0e261a' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #183827' }}>
                <th className="ps-4 fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Nom</th>
                <th className="fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Role</th>
                <th className="fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Departement</th>
                <th className="fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Statut</th>
                <th className="fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Inscription</th>
                <th className="pe-4 text-end fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => {
                const isActive = String(u.statut || '').toLowerCase() === 'actif';
                const isLoading = actionLoadingId === u.id;

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #183827' }}>
                    <td className="ps-4">
                      <div className="fw-bold text-white">{u.nom}</div>
                      <div className="text-muted small">{u.email}</div>
                    </td>
                    <td><span className="text-white small">{u.role}</span></td>
                    <td><span className="text-muted small">{u.dept}</span></td>
                    <td><StatusBadge statut={u.statut} /></td>
                    <td><span className="text-muted small">{u.date}</span></td>
                    <td className="pe-4 text-end">
                      <div className="d-flex gap-2 justify-content-end align-items-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isLoading || deleteLoading}
                          className={`btn btn-sm rounded-pill px-3 fw-bold small d-inline-flex align-items-center ${isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        >
                          {isLoading ? (
                            'Traitement...'
                          ) : isActive ? (
                            <><UserX size={14} className="me-1" />Suspendre</>
                          ) : (
                            <><UserCheck size={14} className="me-1" />Reactiver</>
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm d-inline-flex align-items-center justify-content-center rounded-circle"
                          style={{ width: '36px', height: '36px', background: 'rgba(239,68,68,0.18)', color: '#f87171', border: '1px solid rgba(248,113,113,0.45)' }}
                          title="Supprimer (archiver)"
                          onClick={() => setDeleteModalUser(u)}
                          disabled={deleteLoading || isLoading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModalUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Confirmer la suppression</h5>
                <button type="button" className="btn-close" aria-label="Fermer" onClick={() => !deleteLoading && setDeleteModalUser(null)}></button>
              </div>

              <div className="modal-body pt-2">
                <p className="mb-2 text-dark">
                  Vous allez supprimer le compte de <strong>{deleteModalUser.nom}</strong>.
                </p>
                <p className="mb-0 text-muted small">
                  Cette action est une suppression douce: le compte est archive, deconnecte et masque des listes actives. L'historique reste conserve.
                </p>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  onClick={() => setDeleteModalUser(null)}
                  disabled={deleteLoading}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 d-inline-flex align-items-center gap-2"
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                >
                  <Trash2 size={15} /> {deleteLoading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionUtilisateurs;
