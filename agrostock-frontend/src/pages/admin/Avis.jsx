import React, { useEffect, useState } from 'react';
import { Search, Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/config';
const SectionAvis = () => {
    const { token } = useAuth();
    const [avis, setAvis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [uiMessage, setUiMessage] = useState(null);
    const [deleteAvisId, setDeleteAvisId] = useState(null);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/admin/avis`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                setAvis(data.avis || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const toggleVisibility = async (id) => {
        try {
            const res = await fetch(`${API_URL}/admin/avis/${id}/toggle-visibility`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setAvis(prev => prev.map(a => a.id === id ? { ...a, statut: data.statut } : a));
            }
        } catch { /* ignore */ }
    };

    const handleDelete = (id) => {
        setUiMessage(null);
        setDeleteAvisId(id);
    };

    const confirmDeleteAvis = async () => {
        if (!deleteAvisId) return;
        try {
            const res = await fetch(`${API_URL}/admin/avis/${deleteAvisId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                setAvis(prev => prev.filter(a => a.id !== deleteAvisId));
                setUiMessage({ type: 'success', text: 'Avis supprime avec succes.' });
            } else {
                setUiMessage({ type: 'danger', text: 'Impossible de supprimer cet avis.' });
            }
        } catch {
            setUiMessage({ type: 'danger', text: 'Erreur technique lors de la suppression.' });
        } finally {
            setDeleteAvisId(null);
        }
    };

    const filteredAvis = avis.filter(a => 
        a.acheteur_nom.toLowerCase().includes(search.toLowerCase()) || 
        a.transformateur_nom.toLowerCase().includes(search.toLowerCase()) ||
        a.commentaire.toLowerCase().includes(search.toLowerCase())
    );

    return (
    <div>
        {uiMessage && <div className={`alert alert-${uiMessage.type} border-0 rounded-3`}>{uiMessage.text}</div>}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
                <h4 className="fw-bold mb-1 text-white">Avis & Moderation</h4>
                <span style={{ color: '#8a9b92' }} className="small">{avis.length} avis au total</span>
            </div>
            <div className="d-flex gap-2 flex-wrap">
                <div className="input-group" style={{ maxWidth: '300px' }}>
                    <span className="input-group-text border-0" style={{ background: '#0e261a' }}><Search size={16} className="text-muted" /></span>
                    <input type="text" className="form-control border-0 text-white" placeholder="Rechercher..."
                           style={{ background: '#0e261a', fontSize: '0.9rem' }} 
                           value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>
        </div>

        {loading ? (
            <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <div className="text-muted mt-2">Chargement des avis...</div>
            </div>
        ) : (
            <div className="row g-4">
                {filteredAvis.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">Aucun avis trouve.</div>
                ) : (
                    filteredAvis.map(a => (
                        <div className="col-lg-6" key={a.id}>
                            <div className="card border-0 rounded-4 p-4 h-100 shadow-lg position-relative" style={{ background: '#0a1d13', borderLeft: a.signale ? '3px solid #f97316' : '3px solid #183827' }}>
                                {a.signale && <span className="position-absolute top-0 end-0 m-3 badge bg-danger bg-opacity-15 text-danger rounded-pill small fw-bold px-3">Signale</span>}
                                {a.statut === 'masque' && <span className="position-absolute top-0 end-0 m-3 badge bg-secondary bg-opacity-15 text-secondary rounded-pill small fw-bold px-3">Masque</span>}
                                
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="fw-bold text-white">{a.acheteur_nom}</span>
                                    <span className="text-muted">-</span>
                                    <span className="text-muted small">Pour : {a.transformateur_nom}</span>
                                    <span className="text-muted small ms-auto">{new Date(a.date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="d-flex gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < a.note ? '#f59e0b' : 'transparent'} color={i < a.note ? '#f59e0b' : '#555'} />)}
                                </div>
                                <p className="text-white mb-3 small" style={{ lineHeight: 1.6, opacity: a.statut === 'masque' ? 0.5 : 1 }}>"{a.commentaire}"</p>
                                <div className="d-flex gap-2">
                                    <button onClick={() => toggleVisibility(a.id)}
                                        className={`btn btn-sm rounded-pill px-3 fw-bold small ${a.statut === 'visible' ? 'btn-outline-warning' : 'btn-outline-success'}`}>
                                        {a.statut === 'visible' ? <><EyeOff size={14} className="me-1" /> Masquer</> : <><Eye size={14} className="me-1" /> Afficher</>}
                                    </button>
                                    <button onClick={() => handleDelete(a.id)}
                                        className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold small">
                                        <Trash2 size={14} className="me-1" /> Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
        {deleteAvisId && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title fw-bold">Confirmer la suppression</h5>
                            <button type="button" className="btn-close" onClick={() => setDeleteAvisId(null)}></button>
                        </div>
                        <div className="modal-body text-muted">Voulez-vous vraiment supprimer cet avis definitivement ?</div>
                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setDeleteAvisId(null)}>Annuler</button>
                            <button type="button" className="btn btn-danger rounded-pill px-4" onClick={confirmDeleteAvis}>Supprimer</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default SectionAvis;



