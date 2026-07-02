import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Search, SlidersHorizontal, Package, ChevronRight, CheckCircle2, Info } from 'lucide-react';
import { API_URL } from '../../services/config';
import { useFavoris } from '../../context/FavorisContext';
import { useAuth } from '../../context/AuthContext';

const API_BASE = `${API_URL}`;

const Catalogue = () => {
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isFavori, toggleFavori } = useFavoris();
    const { user } = useAuth();

    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE}/produits/publics`).then((r) => r.json()),
            fetch(`${API_BASE}/categories`).then((r) => r.json()),
        ])
            .then(([prodData, catData]) => {
                setProducts(prodData.produits || []);
                setCategories(catData.categories || []);
                setLoading(false);
            })
            .catch(() => {
                setError('Impossible de charger les données.');
                setLoading(false);
            });
    }, []);

    const formatPrice = (val) => {
        if (val === null || val === undefined || val === '') return '-';
        return `${Number(val).toLocaleString('fr-FR')} FCFA`;
    };

    const getStockBadge = (stock) => {
        const qty = Number(stock || 0);
        if (qty <= 0) return { label: 'Rupture', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' };
        if (qty < 20) return { label: 'Stock faible', bg: '#fffbeb', color: '#92400e', border: '#fde68a' };
        return { label: 'En stock', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' };
    };

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const nom = (p.nom || '').toLowerCase();
            const entreprise = (p.entreprise || '').toLowerCase();
            const keyword = search.trim().toLowerCase();
            const matchSearch = !keyword || nom.includes(keyword) || entreprise.includes(keyword);
            const matchCat = activeCat === null || Number(p.categorie_id) === Number(activeCat);
            return matchSearch && matchCat;
        });
    }, [products, search, activeCat]);

    return (
        <div style={{ background: '#f4f7f5', minHeight: '100vh' }}>
            {/* HERO SECTION PREMIUM */}
            <section
                className="position-relative overflow-hidden"
                style={{
                    padding: '120px 0 80px 0',
                    background: 'linear-gradient(135deg, rgba(15,46,28,0.85) 0%, rgba(23,84,50,0.85) 100%), url(/images/hero/slide1.jpg) center/cover no-repeat',
                }}
            >
                {/* Decorative UI elements */}
                <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ pointerEvents: 'none', opacity: 0.6 }}>
                    <div className="position-absolute" style={{ top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(26, 178, 115, 0.4) 0%, transparent 60%)', borderRadius: '50%' }} />
                    <div className="position-absolute" style={{ bottom: '-20%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, transparent 60%)', borderRadius: '50%' }} />
                </div>
                
                <div className="container position-relative z-1">
                    <div className="row justify-content-center text-center">
                        <div className="col-lg-8">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                                <span className="badge rounded-pill px-4 py-2 mb-4 shadow-sm" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', letterSpacing: '1px', backdropFilter: 'blur(10px)' }}>
                                    <Package size={14} className="me-2" />
                                    CATALOGUE DES PRODUITS
                                </span>
                                <h1 className="fw-bold text-white mb-4 display-4" style={{ letterSpacing: '-1px' }}>
                                    Pépite de l'<span style={{ color: '#4ade80' }}>agroalimentaire</span> local
                                </h1>
                                <p className="lead mx-auto mb-0" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '600px' }}>
                                    Parcourez les produits de qualité certifiée de nos transformateurs. Achetez en gros ou au détail en toute confiance.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
                {/* SEARCH AND FILTERS CARD */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="card border-0 shadow-lg rounded-5 p-4 p-md-5 mb-5"
                    style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)' }}
                >
                    <div className="row g-4 align-items-center">
                        <div className="col-lg-5">
                            <div className="position-relative">
                                <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted">
                                    <Search size={22} color="#a0aec0" />
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="form-control form-control-lg rounded-pill border-0 bg-light w-100"
                                    style={{ paddingLeft: '3.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', fontSize: '1rem' }}
                                    placeholder="Rechercher un produit, une entreprise..."
                                />
                            </div>
                        </div>
                        <div className="col-lg-7 d-flex align-items-center border-lg-start ps-lg-4">
                            <div className="me-3 text-muted d-none d-lg-block">
                                <SlidersHorizontal size={22} color="#a0aec0" />
                            </div>
                            <div className="d-flex overflow-auto pb-2 pb-lg-0 gap-2 hide-scrollbar w-100">
                                <button
                                    className={`btn btn-sm rounded-pill px-4 fw-medium flex-shrink-0 transition-all ${activeCat === null ? 'btn-success shadow-sm' : 'bg-light text-dark border-0 hover-bg-gray'}`}
                                    onClick={() => setActiveCat(null)}
                                    style={{ height: '42px' }}
                                >
                                    Toutes catégories
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        className={`btn btn-sm rounded-pill px-4 fw-medium flex-shrink-0 transition-all ${Number(activeCat) === Number(cat.id) ? 'btn-success shadow-sm' : 'bg-light text-dark border-0 hover-bg-gray'}`}
                                        onClick={() => setActiveCat(cat.id)}
                                        style={{ height: '42px' }}
                                    >
                                        {cat.nom}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {loading && (
                    <div className="text-center py-5 my-5">
                        <div className="spinner-grow text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3 fw-medium">Chargement du catalogue...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="alert alert-danger rounded-4 py-4 d-flex align-items-center mb-5">
                        <Info size={24} className="me-3" />
                        <div>{error}</div>
                    </div>
                )}

                {/* RESULTS AREA */}
                {!loading && !error && (
                    <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                        <h4 className="fw-bold mb-0 text-dark">
                            Résultats <span className="badge bg-success rounded-pill ms-2 fs-6 pb-1">{filteredProducts.length}</span>
                        </h4>
                    </div>
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-5 bg-white rounded-5 shadow-sm border border-light"
                    >
                        <div className="mb-4 text-muted mx-auto" style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Search size={32} />
                        </div>
                        <h4 className="fw-bold text-dark">Aucun produit trouvé</h4>
                        <p className="text-muted mb-0">
                            {search ? `Votre recherche "${search}" n'a donné aucun résultat.` : "Aucun produit n'est disponible actuellement dans cette catégorie."}
                        </p>
                    </motion.div>
                )}

                {/* PRODUCT GRID - PREMIUM */}
                {!loading && !error && filteredProducts.length > 0 && (
                    <div className="row g-4 pb-5">
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => {
                                const stock = getStockBadge(product.stock);
                                
                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="col-12 col-md-6 col-lg-4 col-xl-3" 
                                        key={product.id}
                                    >
                                        <div className="card h-100 border-0 rounded-4 shadow-sm product-card-premium overflow-hidden bg-white text-decoration-none">
                                            {/* IMG SECTION */}
                                            <Link to={`/produit/${product.id}`} className="position-relative d-block" style={{ height: '220px', background: '#f8fafc', overflow: 'hidden' }}>
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.nom}
                                                        className="w-100 h-100 object-fit-cover product-img-hover"
                                                    />
                                                ) : (
                                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted fw-medium fs-5 bg-light">
                                                        <Package size={40} className="mb-2 opacity-25" />
                                                    </div>
                                                )}

                                                {/* Gradient overlay on bottom of img */}
                                                <div className="position-absolute bottom-0 start-0 w-100 h-50" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
                                                
                                                {/* Badges on top */}
                                                <div className="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-between align-items-start">
                                                    <span 
                                                        className="badge rounded-pill fw-semibold shadow-sm" 
                                                        style={{ background: stock.bg, color: stock.color, border: `1px solid ${stock.border}`, fontSize: '0.75rem' }}
                                                    >
                                                        {stock.label}
                                                    </span>
                                                    
                                                    {user && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavori(product); }}
                                                            className="border-0 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm hover-scale"
                                                            style={{ width: '38px', height: '38px', transition: 'all 0.2s', zIndex: 10 }}
                                                        >
                                                            <Heart
                                                                size={20}
                                                                fill={isFavori(product.id) ? '#ef4444' : 'none'}
                                                                color={isFavori(product.id) ? '#ef4444' : '#94a3b8'}
                                                            />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Price overlay */}
                                                <div className="position-absolute bottom-0 start-0 p-3 text-white">
                                                    <div className="fw-bold fs-5 shadow-sm text-shadow-sm">{formatPrice(product.prix_unitaire)}</div>
                                                </div>
                                            </Link>

                                            {/* CONTENT SECTION */}
                                            <div className="card-body p-4 d-flex flex-column">
                                                <Link to={`/produit/${product.id}`} className="text-decoration-none text-dark">
                                                    <h5 className="fw-bold mb-1 fs-6 title-hover-green text-truncate">{product.nom}</h5>
                                                </Link>
                                                
                                                <div className="mb-3">
                                                    {product.transformateur_id ? (
                                                        <Link 
                                                            to={`/transformateur/${product.transformateur_id}`}
                                                            className="text-decoration-none small text-muted d-flex align-items-center gap-1 hover-text-success"
                                                            style={{ transition: 'color 0.2s' }}
                                                        >
                                                            <CheckCircle2 size={12} color="#1ab273" />
                                                            <span className="fw-medium text-truncate">{product.entreprise || 'Entreprise non renseignée'}</span>
                                                        </Link>
                                                    ) : (
                                                        <div className="small text-muted d-flex align-items-center gap-1">
                                                            <span className="fw-medium text-truncate">{product.entreprise || 'Entreprise non renseignée'}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="d-flex flex-wrap gap-2 mb-4 mt-auto">
                                                    <span className="badge rounded-pill text-dark fw-medium" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: '0.7rem' }}>
                                                        {product.mode_vente === 'les_deux' ? 'Gros & Détail' : product.mode_vente === 'gros' ? 'Gros' : 'Détail'}
                                                    </span>
                                                    {product.mode_vente !== 'detail' && product.quantite_min_gros && (
                                                        <span className="badge rounded-pill text-success fw-medium" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '0.7rem' }}>
                                                            Min {product.quantite_min_gros} unités
                                                        </span>
                                                    )}
                                                </div>

                                                <Link to={`/produit/${product.id}`} className="btn btn-light w-100 rounded-pill fw-semibold border btn-hover-success d-flex align-items-center justify-content-center gap-2 transition-all">
                                                    Voir détails <ChevronRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Premium Styles for Document */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;  
                    scrollbar-width: none;  
                }
                .hover-bg-gray:hover {
                    background-color: #e2e8f0 !important;
                }
                .product-card-premium {
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    border: 1px solid rgba(0,0,0,0.04) !important;
                }
                .product-card-premium:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
                    border-color: rgba(26, 178, 115, 0.2) !important;
                }
                .product-img-hover {
                    transition: transform 0.5s ease;
                }
                .product-card-premium:hover .product-img-hover {
                    transform: scale(1.05);
                }
                .hover-scale:hover {
                    transform: scale(1.1);
                }
                .text-shadow-sm {
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }
                .title-hover-green {
                    transition: color 0.2s;
                }
                .product-card-premium:hover .title-hover-green {
                    color: #1ab273 !important;
                }
                .btn-hover-success:hover {
                    background-color: #1ab273 !important;
                    color: white !important;
                    border-color: #1ab273 !important;
                }
                .hover-text-success:hover {
                    color: #1ab273 !important;
                }
            `}</style>
        </div>
    );
};

export default Catalogue;
