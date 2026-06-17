import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/config';
const StatusBadge = ({ statut }) => {
    // Normalize status string
    let st = String(statut).trim();
    if (st === 'en_attente') st = 'En attente';
    if (st === 'actif' || st === 'Valide') st = 'Actif';
    if (st === 'rejete') st = 'Rejete';

    let color = '#ef4444'; 
    let bg = 'rgba(239,68,68,0.15)';
    if (st === 'Actif') { color = '#34d399'; bg = 'rgba(52,211,153,0.15)'; } // Brighter green
    if (st === 'En attente') { color = '#fbbf24'; bg = 'rgba(251,191,36,0.15)'; } // Brighter warning

    return (
        <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ color: color, backgroundColor: bg, border: `1px solid ${color}` }}>
            {st}
        </span>
    );
};

const SectionProduits = () => {
    const { token } = useAuth();
    const [produits, setProduits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uiMessage, setUiMessage] = useState(null);
    const [deleteProductId, setDeleteProductId] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/admin/produits`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setProduits(data);
            setIsLoading(false);
        })
        .catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, [token]);

    const handleAction = (id, action) => {
        if (action !== 'delete') return;
        setUiMessage(null);
        setDeleteProductId(id);
    };

    const confirmDeleteProduct = async () => {
        if (!deleteProductId) return;
        try {
            const res = await fetch(`${API_URL}/admin/produits/${deleteProductId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setProduits(produits.filter(p => String(p.id) !== String(deleteProductId)));
                setUiMessage({ type: 'success', text: 'Produit supprime avec succes.' });
            } else {
                setUiMessage({ type: 'danger', text: 'Une erreur est survenue.' });
            }
        } catch (err) {
            console.error(err);
            setUiMessage({ type: 'danger', text: 'Erreur reseau.' });
        } finally {
            setDeleteProductId(null);
        }
    };

    return (
    <div>
        {uiMessage && <div className={`alert alert-${uiMessage.type} border-0 rounded-3`}>{uiMessage.text}</div>}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
                <h4 className="fw-bold mb-1 text-white">Gestion des Produits</h4>
                <span style={{ color: '#8a9b92' }} className="small">{produits.length} element(s)</span>
            </div>
            <div className="d-flex gap-2 flex-wrap">
                <div className="input-group" style={{ maxWidth: '300px' }}>
                    <span className="input-group-text border-0" style={{ background: '#0e261a' }}><Search size={16} className="text-muted" /></span>
                    <input type="text" className="form-control border-0 text-white" placeholder="Rechercher..."
                           style={{ background: '#0e261a', fontSize: '0.9rem' }} />
                </div>
            </div>
        </div>

        <div className="card border-0 rounded-4 overflow-hidden shadow-lg" style={{ background: '#0a1d13' }}>
            <div className="table-responsive">
                <table className="table table-dark table-hover mb-0 align-middle" style={{ background: 'transparent', '--bs-table-bg': 'transparent', '--bs-table-hover-bg': '#0e261a' }}>
                    <thead><tr style={{ borderBottom: '1px solid #183827' }}>
                        <th className="ps-4 fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Produit</th>
                        <th className="fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Transformateur</th>
                        <th className="fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Categorie</th>
                        <th className="fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Prix</th>
                        <th className="fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Statut</th>
                        <th className="pe-4 text-end fw-bold small text-uppercase" style={{ color: '#8a9b92' }}>Actions</th>
                    </tr></thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="6" className="text-center py-5 text-muted">Chargement...</td></tr>
                        ) : produits.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-5 text-muted">Aucun produit a afficher.</td></tr>
                        ) : (
                            produits.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #183827' }}>
                                    <td className="ps-4 fw-bold text-white">{p.nom}</td>
                                    <td className="text-muted small">
                                        <div className="fw-bold text-white">{p.entreprise}</div>
                                        <div>{p.transformateur}</div>
                                    </td>
                                    <td><span className="badge bg-secondary bg-opacity-25 text-white rounded-pill">{p.categorie}</span></td>
                                    <td className="text-white fw-bold small">{p.prix} FCFA</td>
                                    <td><StatusBadge statut={p.statut} /></td>
                                    <td className="pe-4 text-end">
                                        <div className="d-flex gap-2 justify-content-end">
                                            <button onClick={() => handleAction(p.id, 'delete')} className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold small"><Trash2 size={14} className="me-1" />Supprimer</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        {deleteProductId && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title fw-bold">Confirmer la suppression</h5>
                            <button type="button" className="btn-close" onClick={() => setDeleteProductId(null)}></button>
                        </div>
                        <div className="modal-body text-muted">Etes-vous sur de vouloir supprimer ce produit ?</div>
                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setDeleteProductId(null)}>Annuler</button>
                            <button type="button" className="btn btn-danger rounded-pill px-4" onClick={confirmDeleteProduct}>Supprimer</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default SectionProduits;



