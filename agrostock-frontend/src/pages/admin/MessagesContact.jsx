import React, { useEffect, useMemo, useState } from 'react';
import { Mail, CheckCircle2, Clock3, Search, Phone, User, MessageSquare, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/config';

const ContactMessages = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('tous');
  const [alert, setAlert] = useState(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/contact/messages`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        setAlert({ type: 'danger', text: data.message || 'Impossible de charger les messages.' });
        setLoading(false);
        return;
      }
      setMessages(data.messages || []);
    } catch {
      setAlert({ type: 'danger', text: 'Erreur reseau lors du chargement.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadMessages();
  }, [token]);

  const handleMarkHandled = async (id) => {
    setSavingId(id);
    setAlert(null);
    try {
      const res = await fetch(`${API_URL}/admin/contact/messages/${id}/traiter`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setAlert({ type: 'danger', text: data.message || 'Mise a jour impossible.' });
        return;
      }
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, statut: 'traite' } : m)));
      setAlert({ type: 'success', text: data.message || 'Message traite.' });
    } catch {
      setAlert({ type: 'danger', text: 'Erreur technique.' });
    } finally {
      setSavingId(null);
    }
  };

  const filteredMessages = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((m) => {
      const statusOk = filter === 'tous' || m.statut === filter;
      const searchOk =
        !q ||
        String(m.nom || '').toLowerCase().includes(q) ||
        String(m.email || '').toLowerCase().includes(q) ||
        String(m.sujet || '').toLowerCase().includes(q) ||
        String(m.message || '').toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [messages, query, filter]);

  const stats = useMemo(() => {
    const nouveaux = messages.filter((m) => m.statut === 'nouveau').length;
    return { total: messages.length, nouveaux, traites: messages.length - nouveaux };
  }, [messages]);

  return (
    <div>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-white">Messages de contact</h4>
          <span style={{ color: '#8a9b92' }} className="small">Suivez et traitez les demandes recues depuis la page Contact.</span>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <div className="input-group" style={{ maxWidth: '290px' }}>
            <span className="input-group-text border-0" style={{ background: '#0e261a' }}><Search size={16} className="text-muted" /></span>
            <input
              type="text"
              className="form-control border-0 text-white"
              style={{ background: '#0e261a' }}
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select className="form-select border-0 text-white" style={{ background: '#0e261a', width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="tous">Tous</option>
            <option value="nouveau">Nouveaux</option>
            <option value="traite">Traites</option>
          </select>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total', value: stats.total, color: '#1ab273' },
          { label: 'Nouveaux', value: stats.nouveaux, color: '#f59e0b' },
          { label: 'Traites', value: stats.traites, color: '#3b82f6' },
        ].map((card) => (
          <div className="col-4" key={card.label}>
            <div className="rounded-4 p-3" style={{ background: '#0a1d13', border: `1px solid ${card.color}44` }}>
              <div className="small" style={{ color: '#8a9b92' }}>{card.label}</div>
              <div className="fw-bold" style={{ color: card.color, fontSize: '1.35rem' }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} d-flex justify-content-between align-items-center mb-4`} role="alert">
          <span>{alert.text}</span>
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      <div className="card border-0 rounded-4 shadow-lg" style={{ background: '#0a1d13' }}>
        <div className="card-body p-0">
          {loading ? (
            <div className="p-5 text-center text-muted">Chargement des messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-5 text-center text-muted">Aucun message trouve.</div>
          ) : (
            <div className="d-flex flex-column">
              {filteredMessages.map((m) => {
                const isNew = m.statut === 'nouveau';
                return (
                  <div key={m.id} className="p-4" style={{ borderBottom: '1px solid #183827' }}>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                          <span className="badge rounded-pill" style={{ background: isNew ? 'rgba(245,158,11,0.15)' : 'rgba(26,178,115,0.15)', color: isNew ? '#f59e0b' : '#1ab273' }}>
                            {isNew ? 'Nouveau' : 'Traite'}
                          </span>
                          <span className="text-white fw-bold">{m.sujet}</span>
                        </div>

                        <div className="d-flex flex-wrap gap-3 small mb-2" style={{ color: '#8a9b92' }}>
                          <span className="d-inline-flex align-items-center gap-1"><User size={14} /> {m.nom}</span>
                          <span className="d-inline-flex align-items-center gap-1"><Mail size={14} /> {m.email}</span>
                          {m.telephone && <span className="d-inline-flex align-items-center gap-1"><Phone size={14} /> {m.telephone}</span>}
                          <span className="d-inline-flex align-items-center gap-1"><Clock3 size={14} /> {new Date(m.date).toLocaleString('fr-FR')}</span>
                        </div>

                        <p className="mb-0" style={{ color: '#d7e5de', whiteSpace: 'pre-wrap' }}>{m.message}</p>
                      </div>

                      <div>
                        {isNew ? (
                          <button
                            onClick={() => handleMarkHandled(m.id)}
                            disabled={savingId === m.id}
                            className="btn btn-sm btn-outline-success rounded-pill px-3 d-inline-flex align-items-center gap-2 fw-bold"
                          >
                            <CheckCircle2 size={15} /> {savingId === m.id ? 'Traitement...' : 'Marquer traite'}
                          </button>
                        ) : (
                          <span className="small" style={{ color: '#1ab273' }}>Deja traite</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;
