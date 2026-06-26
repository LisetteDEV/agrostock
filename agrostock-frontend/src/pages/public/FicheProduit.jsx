import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { usePanier } from '../../context/PanierContext';
import { useAuth } from '../../context/AuthContext';
import { useFavoris } from '../../context/FavorisContext';
import { API_URL } from '../../services/config';

const API_BASE = `${API_URL}`;

const FicheProduit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToPanier } = usePanier();
    const { user } = useAuth();
    const { isFavori, toggleFavori } = useFavoris();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImg, setActiveImg] = useState(0);
    const [modeAchat, setModeAchat] = useState('detail');
    const [quantite, setQuantite] = useState(1);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/produits/publics/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Produit non trouve');
                return res.json();
            })
            .then((data) => {
                const loaded = data.produit;
                const defaultMode = loaded.mode_vente === 'gros' ? 'gros' : 'detail';
                setProduct(loaded);
                setModeAchat(defaultMode);
                setQuantite(defaultMode === 'gros' ? 20 : 1);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const formatPrice = (val) => (val ? Number(val).toLocaleString('fr-FR') + ' FCFA' : '-');

    const getStockInfo = (stock) => {
        if (!stock || stock === 0) return { label: 'Rupture de stock', color: '#dc3545', bg: '#fff0f0' };
        if (stock < 20) return { label: `Stock faible (${stock} restants)`, color: '#d97706', bg: '#fffbeb' };
        return { label: `En stock (${stock} ${product?.unite_mesure || 'unites'})`, color: '#16a34a', bg: '#f0fdf4' };
    };

    const modeVente = product?.mode_vente || 'les_deux';
    const minimumGros = Number(product?.quantite_min_gros || 20);
    const isGrosAllowed = modeVente === 'gros' || modeVente === 'les_deux';
    const isDetailAllowed = modeVente === 'detail' || modeVente === 'les_deux';
    const prixActif = modeAchat === 'gros' ? Number(product?.prix_gros || 0) : Number(product?.prix_unitaire || 0);
    const totalActif = prixActif * Number(quantite || 0);
    const stock = Number(product?.stock || 0);
    const hasEnoughForGros = modeAchat !== 'gros' || Number(quantite) >= minimumGros;

    const handleAddToPanier = () => {
        if (!product) return;
        if (modeAchat === 'gros' && !hasEnoughForGros) return;

        if (user) {
            addToPanier(product, Number(quantite), modeAchat);
            navigate('/panier');
            return;
        }

        window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }));
    };

    if (loading) {
        return (
            <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#f8fbf8' }} className="d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status" />
                    <p className="text-muted">Chargement du produit...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#f8fbf8' }} className="container py-5 text-center">
                <h2 className="mt-3 fw-bold">Produit introuvable</h2>
                <p className="text-muted">Ce produit n'existe pas ou a ete retire du catalogue.</p>
                <Link to="/catalogue" className="btn btn-success rounded-pill px-4 py-2 mt-2" style={{ background: '#1ab273', border: 'none' }}>
                    Retour au catalogue
                </Link>
            </div>
        );
    }

    const stockInfo = getStockInfo(product.stock);
    const images = product.images && product.images.length > 0 ? product.images : null;

    return (
        <div style={{ paddingTop: '90px', background: '#f8fbf8', minHeight: '100vh' }}>
            <div style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
                <div className="container py-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0 small">
                            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none" style={{ color: '#1ab273' }}>Accueil</Link></li>
                            <li className="breadcrumb-item"><Link to="/catalogue" className="text-decoration-none" style={{ color: '#1ab273' }}>Catalogue</Link></li>
                            <li className="breadcrumb-item active text-muted" aria-current="page">{product.nom}</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container py-5">
                <div className="row g-5">
                    <div className="col-lg-6">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                            <div style={{ borderRadius: '20px', overflow: 'hidden', background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {images ? (
                                    <img src={images[activeImg]} alt={product.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div className="text-center text-muted">
                                        <p className="mt-2">Aucune photo disponible</p>
                                    </div>
                                )}
                            </div>

                            {images && images.length > 1 && (
                                <div className="d-flex gap-2 mt-3">
                                    {images.map((img, i) => (
                                        <div key={i} onClick={() => setActiveImg(i)} style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: activeImg === i ? '2px solid #1ab273' : '2px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    <div className="col-lg-6">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                            {product.categorie && <span className="badge rounded-pill px-3 py-2 mb-3 d-inline-block" style={{ background: 'rgba(26,178,115,0.1)', color: '#1ab273', fontWeight: '600' }}>{product.categorie}</span>}

                            <h1 className="fw-bold mb-3" style={{ fontSize: '2rem', lineHeight: '1.2' }}>{product.nom}</h1>

                            <div className="mb-4">
                                <div className="d-flex align-items-baseline gap-3 flex-wrap">
                                    <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1ab273' }}>{formatPrice(prixActif)}</span>
                                    {product.unite_mesure && <span className="text-muted fw-medium">/ {product.unite_mesure}</span>}
                                </div>
                                {product.prix_gros && <div className="mt-1"><span className="badge bg-warning text-dark rounded-pill px-3 py-1" style={{ fontSize: '0.8rem' }}>Prix de gros : {formatPrice(product.prix_gros)}</span></div>}
                            </div>

                            <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4" style={{ background: stockInfo.bg, color: stockInfo.color, fontWeight: '600', fontSize: '0.9rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stockInfo.color }} />
                                {stockInfo.label}
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-12">
                                    <label className="form-label fw-bold">Mode d'achat</label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {isDetailAllowed && (
                                            <button type="button" className={`btn rounded-pill px-3 ${modeAchat === 'detail' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => { setModeAchat('detail'); if (quantite < 1) setQuantite(1); }}>
                                                Detail
                                            </button>
                                        )}
                                        {isGrosAllowed && (
                                            <button type="button" className={`btn rounded-pill px-3 ${modeAchat === 'gros' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => { setModeAchat('gros'); if (quantite < minimumGros) setQuantite(minimumGros); }}>
                                                Gros (min {minimumGros})
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-bold">Quantite</label>
                                    <input type="number" min={modeAchat === 'gros' ? minimumGros : 1} max={stock || undefined} className="form-control" value={quantite} onChange={(e) => setQuantite(Number(e.target.value || 0))} />
                                    {modeAchat === 'gros' && !hasEnoughForGros && <div className="text-danger small mt-1">Quantite minimum en gros: {minimumGros}.</div>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-bold">Total</label>
                                    <div className="form-control bg-light fw-bold text-success">{formatPrice(totalActif)}</div>
                                </div>
                            </div>

                            {product.description && (
                                <div className="mb-4">
                                    <h6 className="fw-bold text-dark mb-2">Description</h6>
                                    <p className="text-muted" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>{product.description}</p>
                                </div>
                            )}

                            <div className="d-flex gap-3 mb-5 flex-wrap">
                                <button
                                    onClick={handleAddToPanier}
                                    disabled={stock <= 0 || quantite <= 0 || (modeAchat === 'gros' && !hasEnoughForGros)}
                                    className="btn flex-grow-1 py-3 fw-bold rounded-pill"
                                    style={{ background: '#1ab273', color: '#fff', border: 'none', fontSize: '1rem', opacity: stock <= 0 ? 0.6 : 1 }}
                                >
                                    Ajouter au Panier
                                </button>
                                {user && (
                                    <button
                                        type="button"
                                        onClick={() => toggleFavori(product)}
                                        className="btn py-3 px-4 rounded-pill fw-bold d-flex align-items-center gap-2 border"
                                        style={{
                                            background: isFavori(product.id) ? '#fff0f0' : '#fff',
                                            color: isFavori(product.id) ? '#dc3545' : '#64748b',
                                            borderColor: isFavori(product.id) ? '#dc3545' : '#e2e8f0',
                                            transition: 'all 0.2s'
                                        }}
                                        title={isFavori(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                    >
                                        <Heart size={18} fill={isFavori(product.id) ? '#dc3545' : 'none'} color={isFavori(product.id) ? '#dc3545' : '#64748b'} />
                                        {isFavori(product.id) ? 'Favori' : 'Favoris'}
                                    </button>
                                )}
                            </div>

                            <hr style={{ borderColor: '#e8f5ee' }} />

                            <div className="d-flex align-items-center gap-3 p-4 rounded-4" style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                                <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold" style={{ width: '52px', height: '52px', background: '#1ab273', color: '#fff', fontSize: '1.1rem', flexShrink: 0 }}>
                                    {product.vendeur_initiales}
                                </div>
                                <div>
                                    <div className="fw-bold text-dark">{product.entreprise}</div>
                                    <div className="text-muted small">{[product.commune, product.departement].filter(Boolean).join(', ')} - Benin</div>
                                    {product.type_entreprise && <span className="badge mt-1 rounded-pill px-2 py-1" style={{ background: 'rgba(26,178,115,0.15)', color: '#1ab273', fontSize: '0.75rem' }}>{product.type_entreprise}</span>}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="mt-5 text-center">
                    <Link to="/catalogue" className="btn rounded-pill px-5 py-2" style={{ border: '1.5px solid #1ab273', color: '#1ab273', fontWeight: '600' }}>
                        Retour au catalogue
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FicheProduit;
