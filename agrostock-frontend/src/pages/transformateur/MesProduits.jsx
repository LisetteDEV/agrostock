import React, { useState, useRef, useEffect } from 'react';
import { 
    Plus, Search, Edit2, Trash2, Eye, Package, AlertCircle, 
    CheckCircle2, Clock, ChevronDown, Check, Image as ImageIcon, X
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL, STORAGE_URL } from '../../services/config';
const API = `${API_URL}`;


const statuts = ['Tous les statuts', 'en_attente', 'actif', 'rupture'];
const statutLabels = { 'Tous les statuts': 'Tous les statuts', 'en_attente': 'En attente', 'actif': 'Actif', 'rupture': 'Rupture' };

const CustomDropdown = ({ label, value, options, isOpen, onToggle, onSelect, dropdownRef: ref }) => (
    <div ref={ref} className="position-relative">
        <div
            className="form-control rounded-3 py-2 d-flex align-items-center justify-content-between bg-white"
            style={{ cursor: 'pointer', minHeight: '42px' }}
            onClick={onToggle}>
            <span className={value === label ? 'text-muted' : 'text-dark'} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px', fontSize: '0.9rem' }}>
                {value}
            </span>
            <ChevronDown size={16} className={`text-muted flex-shrink-0 ${isOpen ? 'arrow-open' : ''}`} />
        </div>
        {isOpen && (
            <div className="position-absolute top-100 start-0 w-100 bg-white border rounded-3 shadow-lg mt-1 custom-dropdown-list" style={{ zIndex: 100 }}>
                {options.map((opt, i) => (
                    <div key={i}
                        className={`px-3 py-2 d-flex align-items-center gap-2 dropdown-item-custom ${value === opt ? 'dropdown-item-selected' : ''}`}
                        onClick={() => onSelect(opt)}>
                        {value === opt && <Check size={14} className="text-success flex-shrink-0" />}
                        <span>{opt}</span>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const MesProduits = () => {
    const { token, user } = useAuth();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    
    // Ouvrir la modale automatiquement si on vient du dashboard
    const [showPublishModal, setShowPublishModal] = useState(location.state?.openPublishModal || false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [deleteProductId, setDeleteProductId] = useState(null);

    // Form state
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ nom: '', categorie: '', prix: '', prix_gros: '', mode_vente: 'les_deux', quantite_min_gros: 10, unite_mesure: 'kg', delai_livraison: '', description: '', stock: '' });
    const [productImage, setProductImage] = useState(null);
    const [productImagePreview, setProductImagePreview] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Filter state
    const [filterCategory, setFilterCategory] = useState('Toutes les categories');
    const [showFilterCatDropdown, setShowFilterCatDropdown] = useState(false);
    const [filterStatus, setFilterStatus] = useState('Tous les statuts');
    const [showFilterStatusDropdown, setShowFilterStatusDropdown] = useState(false);

    const fileInputRef = useRef(null);
    const catDropdownRef = useRef(null);
    const filterCatRef = useRef(null);
    const filterStatusRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) setShowCategoryDropdown(false);
            if (filterCatRef.current && !filterCatRef.current.contains(e.target)) setShowFilterCatDropdown(false);
            if (filterStatusRef.current && !filterStatusRef.current.contains(e.target)) setShowFilterStatusDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API}/categories`, {
                    headers: { 'Accept': 'application/json' }
                });
                const data = await res.json();
                setCategories(Array.isArray(data.categories) ? data.categories : []);
            } catch (e) {
                console.error(e);
            }
        };

        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterCategory !== 'Toutes les categories') {
                const cat = categories.find(c => c.nom === filterCategory);
                if (cat?.id) params.append('categorie_id', cat.id);
            }
            if (filterStatus !== 'Tous les statuts') params.append('statut', filterStatus);

            const res = await fetch(`${API}/produits?${params.toString()}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            setProducts(data.produits || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchProducts();
    }, [token, filterCategory, filterStatus, categories]);

    const handleSubmit = async () => {
        if (!formData.nom || !selectedCategory || !formData.prix) {
            setErrorMsg('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        if ((formData.mode_vente === 'gros' || formData.mode_vente === 'les_deux') && !formData.prix_gros) {
            setErrorMsg('Le prix de gros est obligatoire pour ce mode de vente.');
            return;
        }
        setShowPublishModal(false);
        setSuccessMsg(editingId ? 'Mise à jour du produit...' : 'Publication du produit...');
        setErrorMsg('');

        const fd = new FormData();
        fd.append('nom', formData.nom);

        // Use the real category ID loaded from backend
        const selectedCatObj = categories.find(c => c.nom === selectedCategory);
        if (!selectedCatObj) {
            setSubmitting(false);
            setErrorMsg('Categorie invalide. Rechargez la page et reessayez.');
            return;
        }
        fd.append('categorie_id', selectedCatObj.id);

        fd.append('prix_unitaire', formData.prix);
        if (formData.prix_gros) fd.append('prix_gros', formData.prix_gros);
        fd.append('mode_vente', formData.mode_vente);
        fd.append('quantite_min_gros', formData.quantite_min_gros || 1);
        fd.append('unite_mesure', formData.unite_mesure);
        if (formData.delai_livraison) fd.append('delai_livraison', formData.delai_livraison);
        fd.append('description', formData.description);
        fd.append('stock', formData.stock || 0);
        if (productImage) fd.append('photo', productImage);

        try {
            const url = editingId ? `${API}/produits/${editingId}` : `${API}/produits`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: fd
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg(editingId ? 'Produit mis a jour !' : 'Produit publie avec succes !');
                setShowPublishModal(false);
                setEditingId(null);
                setFormData({ nom: '', categorie: '', prix: '', prix_gros: '', mode_vente: 'les_deux', quantite_min_gros: 10, unite_mesure: 'kg', delai_livraison: '', description: '', stock: '' });
                setSelectedCategory('');
                setProductImage(null);
                setProductImagePreview(null);
                fetchProducts();
                setTimeout(() => setSuccessMsg(''), 4000);
            } else {
                const firstValidationError = data?.errors
                    ? Object.values(data.errors).flat()[0]
                    : null;
                setErrorMsg(firstValidationError || data.message || 'Une erreur est survenue.');
            setShowPublishModal(true);
            setSuccessMsg('');
            }
        } catch (e) {
            setErrorMsg('Erreur de connexion au serveur.');
            setShowPublishModal(true);
            setSuccessMsg('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (p) => {
        setEditingId(p.id);
        const cat = categories.find(c => c.id === p.categorie_id);
        setSelectedCategory(cat ? cat.nom : '');
        setFormData({
            nom: p.nom || '',
            prix: p.prix_unitaire || '',
            prix_gros: p.prix_gros || '',
            mode_vente: p.mode_vente || 'les_deux',
            quantite_min_gros: Number(p.quantite_min_gros || 10),
            unite_mesure: p.unite_mesure || 'kg',
            delai_livraison: p.delai_livraison || '',
            description: p.description || '',
            stock: p.stock || ''
        });
        
        let initialPreview = null;
        if (p.photos) {
            const parsed = Array.isArray(p.photos) ? p.photos : JSON.parse(p.photos);
            if (parsed.length > 0) initialPreview = `${STORAGE_URL}/${parsed[0]}`;
        }
        setProductImagePreview(initialPreview);
        setProductImage(null);
        setErrorMsg('');
        setShowPublishModal(true);
    };

    const handleDelete = (id) => {
        setDeleteProductId(id);
        setErrorMsg('');
    };

    const confirmDeleteProduct = async () => {
        if (!deleteProductId) return;
        try {
            await fetch(`${API}/produits/${deleteProductId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            setSuccessMsg('Produit supprime avec succes.');
            setDeleteProductId(null);
            fetchProducts();
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (e) {
            console.error(e);
            setErrorMsg('Erreur de suppression du produit.');
            setDeleteProductId(null);
        }
    };

    const filteredProducts = products;

    return (
        <div>
            {/* Success banner */}
            {successMsg && (
                <div className="alert alert-success border-0 rounded-4 shadow-sm d-flex align-items-center gap-2 mb-4">
                    <CheckCircle2 size={18} /> {successMsg}
                </div>
            )}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Mes Produits</h2>
                    <p className="text-muted mb-0">Gerez votre catalogue de produits transformes</p>
                </div>
                <button className="btn btn-success rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                        onClick={() => setShowPublishModal(true)}>
                    <Plus size={20} /> Nouveau Produit
                </button>
            </div>

            {/* Filters */}
            <div className="card border-0 rounded-4 shadow-sm mb-4">
                <div className="card-body p-3">
                    <div className="row g-3 align-items-end">
                        <div className="col-12 col-md-6">
                            <div className="input-group overflow-hidden rounded-3 bg-light">
                                <span className="input-group-text bg-transparent border-0 ps-3"><Search size={18} className="text-muted" /></span>
                                <input type="text" className="form-control border-0 bg-transparent py-2" placeholder="Rechercher un produit..." />
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <CustomDropdown
                                label="Toutes les categories"
                                value={filterCategory}
                                options={['Toutes les categories', ...categories.map(c => c.nom)]}
                                isOpen={showFilterCatDropdown}
                                onToggle={() => { setShowFilterCatDropdown(v => !v); setShowFilterStatusDropdown(false); }}
                                onSelect={(v) => { setFilterCategory(v); setShowFilterCatDropdown(false); }}
                                dropdownRef={filterCatRef}
                            />
                        </div>
                        <div className="col-6 col-md-3">
                            <CustomDropdown
                                label="Tous les statuts"
                                value={statutLabels[filterStatus] || filterStatus}
                                options={statuts.map(s => statutLabels[s])}
                                isOpen={showFilterStatusDropdown}
                                onToggle={() => { setShowFilterStatusDropdown(v => !v); setShowFilterCatDropdown(false); }}
                                onSelect={(v) => {
                                    const key = Object.keys(statutLabels).find(k => statutLabels[k] === v);
                                    setFilterStatus(key || v);
                                    setShowFilterStatusDropdown(false);
                                }}
                                dropdownRef={filterStatusRef}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE CARDS (visible < lg) */}
            <div className="d-lg-none">
                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-success" /></div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-4 p-5 text-center shadow-sm">
                        <div className="opacity-25 mb-3"><Package size={50} /></div>
                        <p className="text-muted fw-medium">Aucun produit dans votre catalogue.</p>
                        <button className="btn btn-outline-success btn-sm rounded-pill px-4 mt-2" onClick={() => setShowPublishModal(true)}>
                            <Plus size={16} /> Ajouter mon premier produit
                        </button>
                    </div>
                ) : (
                    <div className="row g-3">
                        {filteredProducts.map(p => {
                            const photos = p.photos ? (Array.isArray(p.photos) ? p.photos : JSON.parse(p.photos)) : [];
                            const cat = categories.find(c => c.id === p.categorie_id);
                            return (
                                <div key={p.id} className="col-12 col-sm-6">
                                    <div className="bg-white rounded-4 shadow-sm border p-3 h-100 flex-column d-flex">
                                        <div className="d-flex gap-3 align-items-start">
                                            <div className="bg-light rounded-3 overflow-hidden flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                                {photos.length > 0
                                                    ? <img src={`${STORAGE_URL}/${photos[0]}`} className="w-100 h-100 object-fit-cover" alt={p.nom} />
                                                    : <div className="w-100 h-100 d-flex align-items-center justify-content-center"><Package size={24} className="text-muted opacity-50" /></div>
                                                }
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <h6 className="fw-bold text-dark mb-1 text-truncate">{p.nom}</h6>
                                                <span className="badge bg-light text-dark fw-normal rounded-pill px-2" style={{ fontSize: '0.72rem' }}>{cat?.nom || '-'}</span>
                                            </div>
                                        </div>
                                        <hr className="my-2 opacity-50" />
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="fw-bold text-success">{Number(p.prix_unitaire).toLocaleString()} FCFA</span>
                                            <span className={`small fw-medium ${p.stock <= 5 ? 'text-danger' : 'text-muted'}`}>{p.stock ?? '-'} unité(s)</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-auto">
                                            {p.statut === 'actif' ? (
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1" style={{ fontSize: '0.75rem' }}>Publié</span>
                                            ) : p.statut === 'rupture' ? (
                                                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-1" style={{ fontSize: '0.75rem' }}>Rupture</span>
                                            ) : (
                                                <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-1" style={{ fontSize: '0.75rem' }}>En attente</span>
                                            )}
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-light btn-sm rounded-circle text-primary border-0" onClick={() => handleEdit(p)}><Edit2 size={14} /></button>
                                                <button className="btn btn-light btn-sm rounded-circle text-danger border-0" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* DESKTOP TABLE (hidden < lg) */}
            <div className="card border-0 rounded-4 shadow-sm overflow-hidden d-none d-lg-block mb-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4 py-3 border-0 text-muted small text-uppercase">Produit</th>
                                <th className="border-0 text-muted small text-uppercase">Catégorie</th>
                                <th className="border-0 text-muted small text-uppercase">Prix</th>
                                <th className="border-0 text-muted small text-uppercase">Stock</th>
                                <th className="border-0 text-muted small text-uppercase">Statut</th>
                                <th className="pe-4 text-end border-0 text-muted small text-uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-success" /></td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="opacity-25 mb-3"><Package size={50} /></div>
                                        <p className="text-muted fw-medium">Aucun produit dans votre catalogue.</p>
                                    </td>
                                </tr>
                            ) : filteredProducts.map(p => (
                                <tr key={p.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3 py-2">
                                            <div className="bg-light rounded-3 d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                                            {(() => {
                                                const photos = p.photos ? (Array.isArray(p.photos) ? p.photos : JSON.parse(p.photos)) : [];
                                                return photos.length > 0
                                                    ? <img src={`${STORAGE_URL}/${photos[0]}`} className="w-100 h-100 object-fit-cover" alt={p.nom} />
                                                    : <Package className="text-muted opacity-50" size={24} />
                                            })()}
                                            </div>
                                            <div className="fw-bold text-dark">{p.nom}</div>
                                        </div>
                                    </td>
                                    <td><span className="badge bg-light text-dark fw-normal rounded-pill px-3" style={{ fontSize: '0.78rem' }}>{categories.find(c => c.id === p.categorie_id)?.nom || '-'}</span></td>
                                    <td className="fw-bold text-nowrap">{Number(p.prix_unitaire).toLocaleString()} FCFA</td>
                                    <td>
                                        <div className={`fw-medium text-nowrap ${p.stock <= 5 ? 'text-danger' : 'text-dark'}`}>
                                            {p.stock ?? '-'} unité(s)
                                            {p.stock <= 5 && p.stock !== null && <AlertCircle size={14} className="ms-1" />}
                                        </div>
                                    </td>
                                    <td>
                                        {p.statut === 'actif' ? (
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"><CheckCircle2 size={12} /> Publié</span>
                                        ) : p.statut === 'rupture' ? (
                                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"><X size={12} /> Rupture</span>
                                        ) : (
                                            <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"><Clock size={12} /> En attente</span>
                                        )}
                                    </td>
                                    <td className="pe-4 text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button className="btn btn-light btn-sm rounded-circle text-primary" onClick={() => handleEdit(p)}><Edit2 size={16} /></button>
                                            <button className="btn btn-light btn-sm rounded-circle text-danger" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Publier un Produit Premium */}
            {showPublishModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                     style={{ zIndex: 2000, background: 'rgba(10,29,19,0.7)', backdropFilter: 'blur(8px)' }}>
                    <div className="card shadow-lg overflow-hidden publish-modal-card border-0" style={{ maxWidth: '650px', width: '100%', borderRadius: '20px' }}>
                        {/* HEADER */}
                        <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center position-relative">
                            <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', background: 'linear-gradient(90deg, #10b981, #059669)'}}></div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '48px', height: '48px', background: '#ecfdf5', color: '#10b981' }}>
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
                                        {editingId ? 'Modifier le produit' : 'Nouveau produit'}
                                    </h5>
                                    <p className="text-muted small mb-0 fw-medium">Renseignez les details pour votre catalogue</p>
                                </div>
                            </div>
                            <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" onClick={() => {
                                setShowPublishModal(false); 
                                setEditingId(null);
                                setFormData({ nom: '', categorie: '', prix: '', prix_gros: '', mode_vente: 'les_deux', quantite_min_gros: 10, unite_mesure: 'kg', delai_livraison: '', description: '', stock: '' });
                                setSelectedCategory('');
                                setProductImage(null);
                                setProductImagePreview(null);
                            }} style={{ width: '36px', height: '36px' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="card-body p-0" style={{ overflowY: 'auto', flex: '1 1 auto', background: '#f8fafc' }}>
                            <div className="p-4">
                                {errorMsg && (
                                    <div className="alert border-0 rounded-4 mb-4 d-flex align-items-center gap-2" style={{ background: '#fef2f2', color: '#dc2626' }}>
                                        <AlertCircle size={18} /> {errorMsg}
                                    </div>
                                )}

                                <div className="premium-form-section bg-white p-4 rounded-4 shadow-sm mb-4 border" style={{ borderColor: '#e2e8f0' }}>
                                    <h6 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#10b981'}}></div>
                                        Informations generales
                                    </h6>
                                    
                                    <div className="row g-4">
                                        <div className="col-12 text-start">
                                            <label className="form-label fw-bold text-slate-700" style={{ fontSize: '0.85rem' }}>NOM DU PRODUIT <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control premium-input py-2" placeholder="Ex: Farine de Gari fortifiee"
                                                value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                                        </div>

                                        <div className="col-12 text-start" ref={catDropdownRef}>
                                            <label className="form-label fw-bold text-slate-700" style={{ fontSize: '0.85rem' }}>CATEGORIE <span className="text-danger">*</span></label>
                                            <div className="position-relative">
                                                <div
                                                    className="form-control premium-input py-2 d-flex align-items-center justify-content-between"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setShowCategoryDropdown(v => !v)}>
                                                    <span className={selectedCategory ? 'text-dark fw-medium' : 'text-muted'} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {selectedCategory || 'Selectionner une categorie'}
                                                    </span>
                                                    <ChevronDown size={18} className={`text-muted transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                                </div>
                                                {showCategoryDropdown && (
                                                    <div className="position-absolute top-100 start-0 w-100 bg-white border rounded-3 shadow-lg mt-1 custom-dropdown-list" style={{ zIndex: 10 }}>
                                                        {categories.map((cat, i) => (
                                                            <div key={i}
                                                                className={`px-3 py-2 d-flex align-items-center gap-2 dropdown-item-custom ${selectedCategory === cat.nom ? 'dropdown-item-selected' : ''}`}
                                                                onClick={() => { setSelectedCategory(cat.nom); setShowCategoryDropdown(false); }}>
                                                                {selectedCategory === cat.nom ? <Check size={16} className="text-emerald-500 flex-shrink-0" /> : <div style={{width:'16px'}}></div>}
                                                                <span className={selectedCategory === cat.nom ? 'fw-bold text-emerald-700' : 'text-slate-600'}>{cat.nom}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="col-12 text-start">
                                            <label className="form-label fw-bold text-slate-700" style={{ fontSize: '0.85rem' }}>DESCRIPTION</label>
                                            <textarea className="form-control premium-input" rows="3" placeholder="Decrivez votre produit pour attirer les clients..."
                                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="premium-form-section bg-white p-4 rounded-4 shadow-sm mb-4 border" style={{ borderColor: '#e2e8f0' }}>
                                    <h6 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#3b82f6'}}></div>
                                        Tarifs et Stocks
                                    </h6>
                                    
                                    <div className="row g-4 text-start">
                                        <div className="col-sm-6">
                                            <label className="form-label fw-bold text-slate-700" style={{ fontSize: '0.85rem' }}>PRIX DETAIL <span className="text-danger">*</span></label>
                                            <div className="input-group premium-input-group overflow-hidden rounded-3">
                                                <input type="number" className="form-control premium-input border-0 bg-transparent py-2 shadow-none" placeholder="0"
                                                    value={formData.prix} onChange={e => setFormData({...formData, prix: e.target.value})} />
                                                <span className="input-group-text bg-transparent border-0 text-muted fw-bold">FCFA</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <label className="form-label fw-bold text-slate-700" style={{ fontSize: '0.85rem' }}>PRIX DE GROS</label>
                                            <div className="input-group premium-input-group overflow-hidden rounded-3">
                                                <input type="number" className="form-control premium-input border-0 bg-transparent py-2 shadow-none" placeholder="Optionnel"
                                                    value={formData.prix_gros} onChange={e => setFormData({...formData, prix_gros: e.target.value})} />
                                                <span className="input-group-text bg-transparent border-0 text-muted fw-bold">FCFA</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <label className="form-label fw-bold text-slate-700" style={{ fontSize: '0.85rem' }}>MODE DE VENTE</label>
                                            <select className="form-select premium-input py-2 fw-medium text-dark rounded-3" value={formData.mode_vente} onChange={e => setFormData({...formData, mode_vente: e.target.value})}>
                                                <option value="les_deux">Gros et detail</option>
                                                <option value="detail">Detail uniquement</option>
                                                <option value="gros">Gros uniquement</option>
                                            </select>
                                        </div>
                                        <div className="col-sm-6">
                                            <label className="form-label fw-bold text-slate-700" style={{ fontSize: '0.85rem' }}>QTE MIN GROS</label>
                                            <input
                                                type="number"
                                                min="10"
                                                className="form-control premium-input py-2 fw-medium text-dark rounded-3 shadow-none"
                                                placeholder="Ex: 10"
                                                value={formData.quantite_min_gros}
                                                onChange={e => setFormData({...formData, quantite_min_gros: e.target.value})}
                                                disabled={formData.mode_vente === 'detail'}
                                            />
                                            {formData.mode_vente === 'detail' && <small className="text-muted">Non applicable en vente au détail</small>}
                                        </div>
                                        <div className="col-sm-4">
                                            <label className="form-label fw-bold text-slate-700" style={{ fontSize: '0.85rem' }}>UNITE MESURE</label>
                                            <select className="form-select premium-input py-2 fw-medium text-dark rounded-3" value={formData.unite_mesure} onChange={e => setFormData({...formData, unite_mesure: e.target.value})}>
                                                <option value="kg">Kilogramme (kg)</option>
                                                <option value="g">Gramme (g)</option>
                                                <option value="litre">Litre (L)</option>
                                                <option value="bouteille">Bouteille</option>
                                                <option value="sac">Sac</option>
                                                <option value="carton">Carton</option>
                                                <option value="unite">Unite</option>
                                            </select>
                                        </div>
                                        <div className="col-sm-4">
                                            <label className="form-label fw-bold text-slate-700" style={{ fontSize: '0.85rem' }}>STOCK</label>
                                            <input type="number" className="form-control premium-input py-2 fw-medium text-dark rounded-3 shadow-none" placeholder="0"
                                                value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                                        </div>
                                        <div className="col-sm-4">
                                            <label className="form-label fw-bold text-slate-700" style={{ fontSize: '0.85rem' }}>DELAI (JRS)</label>
                                            <input type="number" className="form-control premium-input py-2 fw-medium text-dark rounded-3 shadow-none" placeholder="Ex: 2"
                                                value={formData.delai_livraison} onChange={e => setFormData({...formData, delai_livraison: e.target.value})} />
                                        </div>
                                    </div>
                                </div>

                                <div className="premium-form-section bg-white p-4 rounded-4 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
                                    <h6 className="fw-bold mb-4 d-flex align-items-center gap-2 text-start" style={{ color: '#0f172a' }}>
                                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#8b5cf6'}}></div>
                                        Photo du produit
                                    </h6>
                                    
                                    <input type="file" ref={fileInputRef} accept="image/*" className="d-none"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) { setProductImage(file); setProductImagePreview(URL.createObjectURL(file)); }
                                        }} />
                                        
                                    <div className="upload-zone rounded-4 p-5 text-center position-relative overflow-hidden"
                                        style={{ cursor: 'pointer', background: productImagePreview ? '#000' : '#f8fafc', border: productImagePreview ? 'none' : '2px dashed #cbd5e1', transition: 'all 0.3s' }} 
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {productImagePreview ? (
                                            <>
                                                <img src={productImagePreview} alt="Apercu" className="w-100 h-100 object-fit-cover position-absolute top-0 start-0 opacity-50" />
                                                <div className="position-relative z-1 d-flex flex-column align-items-center justify-content-center h-100">
                                                    <div className="bg-white rounded-circle p-2 shadow mb-2"><CheckCircle2 size={24} className="text-emerald-500" /></div>
                                                    <p className="fw-bold text-white mb-0 mt-2 text-shadow-sm">{productImage?.name || 'Image selectionnee'}</p>
                                                    <span className="badge bg-dark bg-opacity-75 mt-2 fw-medium px-3 py-2">Cliquer pour remplacer</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="d-flex flex-column align-items-center">
                                                <div className="bg-white rounded-circle p-3 shadow-sm mb-3">
                                                    <ImageIcon className="text-indigo-500" size={32} />
                                                </div>
                                                <h6 className="fw-bold text-slate-700 mb-1">Glissez une image ou Parcourez</h6>
                                                <p className="small text-slate-500 mb-0">Formats supportes: JPG, PNG, WEBP (Max 5 Mo)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="p-4 bg-white border-top d-flex flex-column flex-sm-row justify-content-end gap-3 align-items-center">
                            <button className="btn fw-bold text-slate-500 hover-text-slate-800" onClick={() => {
                                setShowPublishModal(false); 
                                setEditingId(null);
                                setFormData({ nom: '', categorie: '', prix: '', prix_gros: '', mode_vente: 'les_deux', quantite_min_gros: 10, unite_mesure: 'kg', delai_livraison: '', description: '', stock: '' });
                                setSelectedCategory('');
                                setProductImage(null);
                                setProductImagePreview(null);
                            }} disabled={submitting} style={{ background: 'transparent' }}>
                                Annuler
                            </button>
                            <button className="btn btn-success py-2 px-5 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 premium-btn-submit"
                                onClick={handleSubmit} disabled={submitting} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', fontSize: '1rem' }}>
                                {submitting ? <><span className="spinner-border spinner-border-sm"></span> Traitement...</> : (editingId ? 'Mettre a jour' : 'Publier le produit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteProductId && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 2200, background: 'rgba(0,0,0,0.55)' }}>
                    <div className="card border-0 rounded-4 shadow-lg p-4" style={{ width: '100%', maxWidth: '460px' }}>
                        <h5 className="fw-bold mb-2">Confirmer la suppression</h5>
                        <p className="text-muted mb-4">Voulez-vous vraiment supprimer ce produit ?</p>
                        <div className="d-flex justify-content-end gap-2">
                            <button className="btn btn-light rounded-pill px-4" onClick={() => setDeleteProductId(null)}>Annuler</button>
                            <button className="btn btn-danger rounded-pill px-4" onClick={confirmDeleteProduct}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .custom-dropdown-list { max-height: 220px; overflow-y: auto; }
                .dropdown-item-custom {
                    cursor: pointer; font-size: 0.9rem;
                    transition: background 0.15s;
                    border-bottom: 1px solid #f0f0f0;
                }
                .dropdown-item-custom:last-child { border-bottom: none; }
                .dropdown-item-custom:hover { background-color: #f0faf5; }
                .dropdown-item-selected { background-color: #e8f8f0 !important; font-weight: 600; }
                .dropdown-item-custom span { word-break: normal; white-space: normal; line-height: 1.4; }
                .publish-modal-card { display: flex; flex-direction: column; }
                @media (min-width: 768px) {
                    .publish-modal-card { max-height: 90vh; height: auto !important; }
                }
                @media (max-width: 767px) {
                    .publish-modal-card { height: 100%; border-radius: 0 !important; }
                }

                /* ---- PREMIUM UI CSS CLASSES ---- */
                .premium-input {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #0f172a;
                    font-weight: 500;
                    transition: all 0.2s;
                    box-shadow: none !important;
                }
                .premium-input:focus {
                    background: #ffffff;
                    border-color: #10b981 !important;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15) !important;
                }
                .premium-input-group {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s;
                }
                .premium-input-group:focus-within {
                    background: #ffffff;
                    border-color: #10b981;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
                }
                .upload-zone:hover {
                    border-color: #10b981 !important;
                    background: #f1f5f9;
                }
                .text-shadow-sm { text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
                .text-slate-500 { color: #64748b; }
                .text-slate-600 { color: #475569; }
                .text-slate-700 { color: #334155; }
                .text-emerald-500 { color: #10b981; }
                .text-emerald-700 { color: #047857; }
                .text-indigo-500 { color: #6366f1; }
                .hover-text-slate-800:hover { color: #1e293b !important; }
                .premium-btn-submit { transition: transform 0.2s, box-shadow 0.2s; }
                .premium-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16,185,129,0.3) !important; color: white !important; }
                .rotate-180 { transform: rotate(180deg); }
                .transition-transform { transition: transform 0.2s; }
            `}</style>


        </div>
    );
};

export default MesProduits;
















