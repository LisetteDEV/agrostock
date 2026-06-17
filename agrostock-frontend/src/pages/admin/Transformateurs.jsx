import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, FileText, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { API_URL, STORAGE_URL } from '../../services/config';
const SectionTransformateurs = () => {
    const { token } = useAuth();
    const [motifRejet, setMotifRejet] = useState('');
    const [rejectingId, setRejectingId] = useState(null);
    const [approvingId, setApprovingId] = useState(null);
    const [pendingTrans, setPendingTrans] = useState([]);
    const [selectedDocs, setSelectedDocs] = useState(null);
    const [actionFeedback, setActionFeedback] = useState(null);

    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchPendingList = () => {
        fetch(`${API_URL}/admin/transformateurs/pending`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(Array.isArray(data)) setPendingTrans(data); })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchPendingList();
    }, [token]);

    const handleApprove = async (id) => {
        setIsActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/transformateurs/${id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setActionFeedback({ type: 'success', text: 'Transformateur approuve avec succes.' });
            setApprovingId(null);
            fetchPendingList();
            setTimeout(() => setActionFeedback(null), 3500);
        } catch (err) {
            setActionFeedback({ type: 'error', text: "Erreur lors de l'approbation" });
            setTimeout(() => setActionFeedback(null), 3500);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async (id) => {
        if (!motifRejet) {
            setActionFeedback({ type: 'error', text: "Erreur : Veuillez saisir un motif de rejet" });
            setTimeout(() => setActionFeedback(null), 3500);
            return;
        }
        setIsActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/transformateurs/${id}/reject`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ motif: motifRejet })
            });
            setActionFeedback({ type: 'success', text: "Transformateur rejete." });
            setRejectingId(null);
            setMotifRejet('');
            fetchPendingList();
            setTimeout(() => setActionFeedback(null), 3500);
        } catch (err) {
            setActionFeedback({ type: 'error', text: "Erreur lors du rejet" });
            setTimeout(() => setActionFeedback(null), 3500);
        } finally {
            setIsActionLoading(false);
        }
    };

    const getDocUrl = (path) => path ? `${STORAGE_URL}/${path}` : null;

    return (
        <div className={isActionLoading ? 'opacity-50' : ''}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h4 className="fw-bold mb-1 text-white">Transformateurs en attente</h4>
                    <span style={{ color: '#8a9b92' }} className="small">{pendingTrans.length} element(s) en attente</span>
                </div>
                <div className="input-group" style={{ maxWidth: '300px' }}>
                    <span className="input-group-text border-0" style={{ background: '#0e261a' }}><Search size={16} className="text-muted" /></span>
                    <input type="text" className="form-control border-0 text-white" placeholder="Rechercher..."
                           style={{ background: '#0e261a', fontSize: '0.9rem' }} />
                </div>
            </div>

            {/* Notification Toast */}
            {actionFeedback && (
                <div className={`alert ${actionFeedback.type === 'success' ? 'alert-success' : 'alert-danger'} border-0 rounded-4 shadow-lg py-3`} style={{ background: actionFeedback.type === 'success' ? '#0f5132' : '#842029', color: '#fff' }}>
                    <div className="d-flex align-items-center gap-2 fw-bold">
                        {actionFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        {actionFeedback.text}
                    </div>
                </div>
            )}

            <div className="row g-4">
                {pendingTrans.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">Aucun transformateur en attente de validation.</div>
                ) : (
                    pendingTrans.map(t => {
                        const docCount = [t.piece_identite, t.registre_commerce, t.photo_atelier].filter(d => d).length;
                        return (
                        <div className="col-12" key={t.id}>
                            <div className="card border-0 rounded-4 p-4 shadow-lg" style={{ background: '#0a1d13' }}>
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-warning bg-opacity-15 text-warning rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '50px', height: '50px' }}>
                                            {t.nom.charAt(0)}
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-white mb-0">{t.nom}</h6>
                                            <span className="text-muted small">{t.email} - {t.type} - <span className="text-success">{t.entreprise}</span></span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <span className="text-muted small me-2"><Calendar size={14} className="me-1" />{t.date}</span>
                                        <span className="badge bg-secondary bg-opacity-25 text-white rounded-pill px-3 py-1">
                                            <FileText size={12} className="me-1" />{docCount} document(s)
                                        </span>
                                        <button className="btn btn-sm btn-outline-light rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                                                onClick={() => setSelectedDocs(t)}>
                                            <Eye size={14} /> Voir docs
                                        </button>
                                        <button className="btn btn-sm btn-success rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                                                onClick={() => { setApprovingId(approvingId === t.id ? null : t.id); setRejectingId(null) }}>
                                            <CheckCircle2 size={14} /> Approuver
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                                                onClick={() => { setRejectingId(rejectingId === t.id ? null : t.id); setApprovingId(null) }}>
                                            <XCircle size={14} /> Rejeter
                                        </button>
                                    </div>
                                </div>
                                {approvingId === t.id && (
                                    <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(26,178,115,0.1)' }}>
                                        <label className="form-label small text-success fw-bold d-flex align-items-center gap-2">
                                            <CheckCircle2 size={16} /> Confirmer l'approbation
                                        </label>
                                        <p className="text-white small mb-3">Voulez-vous vraiment valider ce compte et l'autoriser a publier ses produits ?</p>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-sm btn-success rounded-pill px-4 fw-bold"
                                                    onClick={() => handleApprove(t.id)}>
                                                Oui, valider
                                            </button>
                                            <button className="btn btn-sm btn-outline-light rounded-pill px-4"
                                                    onClick={() => setApprovingId(null)}>
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {rejectingId === t.id && (
                                    <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(239,68,68,0.1)' }}>
                                        <label className="form-label small text-danger fw-bold d-flex align-items-center gap-2">
                                            <XCircle size={16} /> Motif du rejet
                                        </label>
                                        <textarea className="form-control border-0 text-white mb-2" rows={2} placeholder="Expliquez la raison du rejet (ex: RCCM expire)..."
                                                  style={{ background: 'rgba(0,0,0,0.3)' }} value={motifRejet} onChange={e => setMotifRejet(e.target.value)} />
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-sm btn-danger rounded-pill px-4 fw-bold"
                                                    onClick={() => handleReject(t.id)}>
                                                Confirmer le rejet
                                            </button>
                                            <button className="btn btn-sm btn-outline-light rounded-pill px-4"
                                                    onClick={() => setRejectingId(null)}>
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )})
                )}
            </div>

            {/* Modal de visualisation des documents */}
            {selectedDocs && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ zIndex: 2000, background: 'rgba(0,0,0,0.85)' }}>
                    <div className="card border-0 rounded-4 w-100 shadow-xl" style={{ maxWidth: '900px', background: '#0a1d13', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="card-header p-4 d-flex justify-content-between align-items-center border-bottom border-light border-opacity-10" style={{ background: '#0e261a' }}>
                            <h5 className="mb-0 text-white fw-bold">Documents : {selectedDocs.entreprise}</h5>
                            <button className="btn btn-link text-white p-0" onClick={() => setSelectedDocs(null)}><XCircle size={28} /></button>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-4">
                                {[
                                    { label: 'Piece d\'identite', path: selectedDocs.piece_identite },
                                    { label: 'RCCM / Registre', path: selectedDocs.registre_commerce },
                                    { label: 'Photo de l\'atelier', path: selectedDocs.photo_atelier },
                                ].map((doc, idx) => (
                                    <div key={idx} className="col-md-4">
                                        <label className="form-label small text-muted text-uppercase fw-bold mb-2">{doc.label}</label>
                                        <div className="rounded-3 overflow-hidden border border-light border-opacity-10 bg-black bg-opacity-20 d-flex align-items-center justify-content-center" style={{ aspectRatio: '4/3' }}>
                                            {doc.path ? (
                                                doc.path.endsWith('.pdf') ? (
                                                    <div className="text-center p-3">
                                                        <FileText size={48} className="text-danger mb-2" />
                                                        <a href={getDocUrl(doc.path)} target="_blank" rel="noreferrer" className="btn btn-sm btn-light rounded-pill px-3 fw-bold">Ouvrir PDF</a>
                                                    </div>
                                                ) : (
                                                    <img src={getDocUrl(doc.path)} alt={doc.label} className="img-fluid w-100 h-100 object-fit-cover" 
                                                         style={{ cursor: 'zoom-in' }} onClick={() => window.open(getDocUrl(doc.path), '_blank')} />
                                                )
                                            ) : (
                                                <span className="text-muted small">Non fourni</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionTransformateurs;

