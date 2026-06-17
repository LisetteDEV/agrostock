import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/config';
const SectionBlog = () => {
    const { token } = useAuth();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, titre: '', categorie: 'actualite', extrait: '', contenu: '', statut: 'publie' });
    const [selectedImage, setSelectedImage] = useState(null);
    const [uiMessage, setUiMessage] = useState(null);
    const [deleteArticleId, setDeleteArticleId] = useState(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = () => {
        fetch(`${API_URL}/admin/blog`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setArticles(data.articles || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('titre', formData.titre);
        data.append('categorie', formData.categorie);
        data.append('extrait', formData.extrait);
        data.append('contenu', formData.contenu);
        data.append('statut', formData.statut);
        if (selectedImage) data.append('image', selectedImage);

        const isEdit = formData.id !== null;
        let url = `${API_URL}/admin/blog`;
        if (isEdit) {
            url += `/${formData.id}`;
            // Pour Laravel FormData avec method PUT on uiliste post avec champ _method
            // mais ici on peut simplement utiliser POST api et gerer _method dans la route
        }

        try {
            const res = await fetch(url, {
                method: 'POST', // POST is used for both create and update due to FormData (multipart form). Route update handles POST /{id}.
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });
            if (res.ok) {
                fetchArticles();
                closeModal();
            } else {
                setUiMessage({ type: 'danger', text: 'Erreur lors de la sauvegarde.' });
            }
        } catch (error) {
            console.error("Erreur", error);
        }
    };

    const handleDelete = (id) => {
        setUiMessage(null);
        setDeleteArticleId(id);
    };

    const confirmDeleteArticle = async () => {
        if (!deleteArticleId) return;
        try {
            const res = await fetch(`${API_URL}/admin/blog/${deleteArticleId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setUiMessage({ type: 'success', text: 'Article supprime avec succes.' });
                fetchArticles();
            } else {
                setUiMessage({ type: 'danger', text: 'Impossible de supprimer cet article.' });
            }
        } catch {
            setUiMessage({ type: 'danger', text: 'Erreur technique lors de la suppression.' });
        } finally {
            setDeleteArticleId(null);
        }
    };

    const openModal = (article = null) => {
        if (article) {
            setFormData({
                id: article.id,
                titre: article.titre,
                categorie: article.categorie,
                extrait: article.extrait || '',
                contenu: article.contenu,
                statut: article.statut
            });
        } else {
            setFormData({ id: null, titre: '', categorie: 'actualite', extrait: '', contenu: '', statut: 'publie' });
        }
        setSelectedImage(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ id: null, titre: '', categorie: 'actualite', extrait: '', contenu: '', statut: 'publie' });
        setSelectedImage(null);
    };

    return (
        <div>
            {uiMessage && <div className={`alert alert-${uiMessage.type} border-0 rounded-3`}>{uiMessage.text}</div>}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h4 className="fw-bold mb-1 text-white">Gestion du Blog</h4>
                    <span style={{ color: '#8a9b92' }} className="small">{articles.length} articles</span>
                </div>
                <button onClick={() => openModal()} className="btn btn-success rounded-pill px-4 fw-bold d-flex align-items-center gap-2">
                    <Plus size={16} /> Nouvel article
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status"></div>
                </div>
            ) : articles.length === 0 ? (
                <div className="card border-0 rounded-4 p-5 text-center shadow-lg" style={{ background: '#0a1d13' }}>
                    <FileText size={48} className="text-muted mx-auto mb-3 opacity-25" />
                    <h6 className="text-white fw-bold">Aucun article pour le moment</h6>
                    <p className="text-muted small">Creez votre premier article de blog pour informer vos utilisateurs.</p>
                </div>
            ) : (
                <div className="card border-0 rounded-4 overflow-hidden shadow-lg" style={{ background: '#0a1d13' }}>
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0 align-middle" style={{ backgroundColor: '#0a1d13' }}>
                            <thead>
                                <tr style={{ background: '#0e261a' }}>
                                    <th className="border-0 p-3 text-muted small text-uppercase" style={{ minWidth: '300px' }}>Article</th>
                                    <th className="border-0 p-3 text-muted small text-uppercase">Categorie</th>
                                    <th className="border-0 p-3 text-muted small text-uppercase">Statut</th>
                                    <th className="border-0 p-3 text-muted small text-uppercase">Vues</th>
                                    <th className="border-0 p-3 text-muted small text-uppercase text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map(a => (
                                    <tr key={a.id} className="border-bottom border-light border-opacity-10">
                                        <td className="p-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-3 flex-shrink-0" style={{ width: '40px', height: '40px', background: a.image_couverture ? `url(${a.image_couverture}) center/cover` : '#0e261a' }}>
                                                    {!a.image_couverture && <FileText className="m-2 text-success opacity-50" size={20} />}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-white text-truncate" style={{ maxWidth: '300px' }}>{a.titre}</div>
                                                    <div className="small text-muted">{a.date} - {a.auteur}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-muted small">{a.categorie}</td>
                                        <td className="p-3">
                                            <span className={`badge ${a.statut === 'publie' ? 'bg-success' : 'bg-warning'} bg-opacity-25 text-${a.statut === 'publie' ? 'success' : 'warning'} rounded-pill px-3 mx-1`}>
                                                {a.statut === 'publie' ? 'Publie' : 'Brouillon'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-muted small"><Eye size={12} className="me-1"/>{a.vues}</td>
                                        <td className="p-3 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button onClick={() => openModal(a)} className="btn btn-sm btn-outline-warning rounded-circle" style={{ width: '32px', height: '32px' }}>
                                                    <Edit size={14} className="m-auto" />
                                                </button>
                                                <button onClick={() => handleDelete(a.id)} className="btn btn-sm btn-outline-danger rounded-circle" style={{ width: '32px', height: '32px' }}>
                                                    <Trash2 size={14} className="m-auto" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {deleteArticleId && (
                <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.7)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Confirmer la suppression</h5>
                                <button type="button" className="btn-close" onClick={() => setDeleteArticleId(null)} />
                            </div>
                            <div className="modal-body text-muted">Voulez-vous vraiment supprimer cet article ?</div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setDeleteArticleId(null)}>Annuler</button>
                                <button type="button" className="btn btn-danger rounded-pill px-4" onClick={confirmDeleteArticle}>Supprimer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal CRUD Article */}
            {showModal && (
                <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.8)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow-lg" style={{ background: '#0a1d13' }}>
                            <div className="modal-header border-bottom border-light border-opacity-10 py-3">
                                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                                    <FileText size={20} className="text-success" />
                                    {formData.id ? 'Modifier l\'article' : 'Nouvel article'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={closeModal} />
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-8">
                                            <label className="form-label text-muted small fw-bold">TITRE DE L'ARTICLE *</label>
                                            <input type="text" className="form-control border-0 text-white" 
                                                   style={{ background: '#0e261a' }} required
                                                   name="titre" value={formData.titre} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label text-muted small fw-bold">CATEGORIE *</label>
                                            <select className="form-select border-0 text-white" 
                                                    style={{ background: '#0e261a' }} required
                                                    name="categorie" value={formData.categorie} onChange={handleInputChange}>
                                                <option value="actualite">Actualite</option>
                                                <option value="conseil">Conseil</option>
                                                <option value="marche">Marche</option>
                                                <option value="plateforme">Plateforme</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label text-muted small fw-bold">IMAGE DE COUVERTURE</label>
                                            <input type="file" className="form-control border-0 text-white" 
                                                   style={{ background: '#0e261a' }} accept="image/*" onChange={handleFileChange} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label text-muted small fw-bold">COURT EXTRAIT (Optionnel)</label>
                                            <textarea className="form-control border-0 text-white" rows="2" 
                                                      style={{ background: '#0e261a', resize: 'none' }}
                                                      name="extrait" value={formData.extrait} onChange={handleInputChange}></textarea>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label text-muted small fw-bold">CONTENU COMPLET *</label>
                                            <textarea className="form-control border-0 text-white" rows="8" required
                                                      style={{ background: '#0e261a', resize: 'none' }}
                                                      name="contenu" value={formData.contenu} onChange={handleInputChange}></textarea>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label text-muted small fw-bold">STATUT *</label>
                                            <select className="form-select border-0 text-white" style={{ background: '#0e261a' }}
                                                    name="statut" value={formData.statut} onChange={handleInputChange}>
                                                <option value="publie">Publie immediatement</option>
                                                <option value="brouillon">Enregistrer comme brouillon</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-light border-opacity-10">
                                        <button type="button" className="btn btn-outline-light rounded-pill px-4" onClick={closeModal}>Annuler</button>
                                        <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">Enregistrer l'article</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionBlog;



