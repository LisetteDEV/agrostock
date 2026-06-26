import React, { useEffect, useState } from 'react';
import { Star, Trash2, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/config';

const HistoriqueAvis = () => {
    const { token } = useAuth();
    const [avis, setAvis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uiMessage, setUiMessage] = useState(null);

    useEffect(() => {
        const fetchAvis = async () => {
            try {
                const res = await fetch(`${API_URL}/avis/mes-avis`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAvis(data.avis || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchAvis();
    }, [token]);

    const handleDelete = async (id) => {
        setUiMessage(null);
        try {
            const res = await fetch(`${API_URL}/avis/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAvis(prev => prev.filter(a => a.id !== id));
                setUiMessage({ type: 'success', text: 'Votre avis a été supprimé avec succès.' });
                setTimeout(() => setUiMessage(null), 5000);
            } else {
                setUiMessage({ type: 'error', text: 'Impossible de supprimer cet avis.' });
            }
        } catch (err) {
            setUiMessage({ type: 'error', text: 'Erreur lors de la communication avec le serveur.' });
        }
    };

    return (
        <div className="p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                <div>
                    <h2 className="fw-bolder text-dark mb-1">Historique des Avis</h2>
                    <p className="text-muted small mb-0">Tous les témoignages que vous avez partagés sur la plateforme.</p>
                </div>
                <div className="bg-success rounded-pill px-4 py-2 text-white fw-bold small shadow-sm">
                    {avis.length} Avis
                </div>
            </div>

            {/* REAL UI MESSAGE (Styled Card) */}
            {uiMessage && (
                <div className={`alert p-4 rounded-4 mb-5 border-0 d-flex align-items-center gap-3 shadow-sm transition-all ${uiMessage.type === 'success' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                    {uiMessage.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                    <div className="fw-bold">{uiMessage.text}</div>
                    <button type="button" className="btn-close ms-auto shadow-none" onClick={() => setUiMessage(null)}></button>
                </div>
            )}

            {loading ? (
                <div className="py-5 text-center">
                    <div className="spinner-border text-success spinner-border-sm" role="status"></div>
                    <span className="ms-2 text-muted fw-bold">Chargement de votre historique...</span>
                </div>
            ) : (
                <div className="row g-4">
                    {avis.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <div className="bg-light rounded-circle p-4 d-inline-flex mb-4">
                               <Star size={40} className="text-muted opacity-30" />
                            </div>
                            <h4 className="fw-bolder text-dark">Aucun avis trouvé</h4>
                            <p className="text-muted">Vous n'avez pas encore publié d'avis sur vos transformateurs.</p>
                        </div>
                    ) : (
                        avis.map(a => (
                            <div key={a.id} className="col-lg-6">
                                <div className="card border-0 rounded-5 shadow-sm p-4 h-100 bg-white hover-up transition-all">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-success bg-opacity-10 text-success rounded-4 p-3 fw-bolder">
                                                {a.transformateur_nom?.charAt(0) || 'T'}
                                            </div>
                                            <div>
                                                <h6 className="fw-bold text-dark mb-0">{a.transformateur_nom}</h6>
                                                <div className="d-flex gap-1 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={11} fill={i < a.note ? "#f59e0b" : "none"} color={i < a.note ? "#f59e0b" : "#ddd"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(a.id)} 
                                                className="btn btn-light btn-sm rounded-circle p-2 text-danger opacity-50 hover-opacity-100 shadow-none border-0" 
                                                title="Supprimer mon avis">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-muted mb-4 lh-base small">"{a.commentaire}"</p>
                                    <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top border-light opacity-75">
                                        <span className="text-muted d-flex align-items-center gap-2" style={{ fontSize: '11px' }}>
                                            <Calendar size={14} /> {new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                        <span className={`badge rounded-pill px-3 py-1 small italic fw-bold ${a.statut === 'visible' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                                            {a.statut === 'visible' ? '• Public' : '• Masqué'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            <style>{`
                .hover-up:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.06) !important; }
                .hover-opacity-100:hover { opacity: 1 !important; background: #fee2e2 !important; }
            `}</style>
        </div>
    );
};

export default HistoriqueAvis;
