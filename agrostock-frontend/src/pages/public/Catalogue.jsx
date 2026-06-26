import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
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
                setError('Impossible de charger les donnees.');
                setLoading(false);
            });
    }, []);

    const formatPrice = (val) => {
        if (val === null || val === undefined || val === '') return '-';
        return `${Number(val).toLocaleString('fr-FR')} FCFA`;
    };

    const getStockBadge = (stock) => {
        const qty = Number(stock || 0);
        if (qty <= 0) return { label: 'Rupture', bg: '#fde8e8', color: '#b42318' };
        if (qty < 20) return { label: 'Stock faible', bg: '#fff4e5', color: '#b54708' };
        return { label: 'En stock', bg: '#eaf7f0', color: '#166534' };
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
        <div style={{ background: '#f8fbf8', minHeight: '100vh', paddingTop: '80px' }}>
            <section
                className="position-relative d-flex align-items-center rounded-bottom-5 overflow-hidden shadow-sm"
                style={{
                    height: '40vh',
                    minHeight: '350px',
                    background: 'linear-gradient(135deg, rgba(5,46,22,0.56) 0%, rgba(6,95,70,0.50) 100%), url(/images/background_agro.jpg) center/cover no-repeat'
                }}
            >
                <div className="position-absolute w-100 h-100 top-0 start-0" style={{ opacity: 0.14 }}>
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid-catalogue" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid-catalogue)" />
                    </svg>
                </div>

                <div className="container position-relative text-center text-white" style={{ zIndex: 2 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="badge rounded-pill px-4 py-2 mb-4 bg-white text-success fw-bold shadow-sm" style={{ letterSpacing: '2px', fontSize: '0.9rem' }}>
                            CATALOGUE AGROSTOCK
                        </span>
                        <h1 className="fw-bold mb-3 display-4" style={{ letterSpacing: '-2px' }}>
                            Decouvrez des <span className="text-warning">produits agroalimentaires locaux</span>
                        </h1>
                        <p className="mb-0" style={{ maxWidth: '760px', margin: '0 auto', color: 'rgba(255,255,255,0.9)' }}>
                            Parcourez les offres des transformateurs verifies et commandez selon vos besoins, en gros ou en detail.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container py-5">
                <div className="card border-0 rounded-4 shadow-sm p-3 p-md-4 mb-4">
                    <div className="row g-3 align-items-center">
                        <div className="col-lg-6">
                            <label className="form-label fw-semibold text-dark mb-2">Recherche</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="form-control rounded-pill"
                                placeholder="Nom du produit ou entreprise"
                            />
                        </div>
                        <div className="col-lg-6">
                            <label className="form-label fw-semibold text-dark mb-2">Categories</label>
                            <div className="d-flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill ${activeCat === null ? 'btn-success' : 'btn-outline-success'}`}
                                    onClick={() => setActiveCat(null)}
                                >
                                    Toutes
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`btn btn-sm rounded-pill ${Number(activeCat) === Number(cat.id) ? 'btn-success' : 'btn-outline-success'}`}
                                        onClick={() => setActiveCat(cat.id)}
                                    >
                                        {cat.nom}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success mb-3" role="status" />
                        <p className="text-muted mb-0">Chargement des produits...</p>
                    </div>
                )}

                {error && !loading && <div className="alert alert-danger">{error}</div>}

                {!loading && !error && (
                    <p className="text-muted mb-4">
                        <strong className="text-dark">{filteredProducts.length}</strong> produit{filteredProducts.length > 1 ? 's' : ''} trouve{filteredProducts.length > 1 ? 's' : ''}
                    </p>
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                        <h4 className="fw-bold mb-2">Aucun produit trouve</h4>
                        <p className="text-muted mb-0">
                            {search ? `Aucun resultat pour "${search}".` : 'Aucun produit disponible pour le moment.'}
                        </p>
                    </div>
                )}

                {!loading && !error && filteredProducts.length > 0 && (
                    <div className="row g-4">
                        {filteredProducts.map((product, index) => {
                            const stock = getStockBadge(product.stock);
                            const mode = product.mode_vente === 'les_deux'
                                ? 'Gros et detail'
                                : product.mode_vente === 'gros'
                                    ? 'En gros'
                                    : product.mode_vente === 'detail'
                                        ? 'En detail'
                                        : '-';

                            return (
                                <div className="col-sm-6 col-lg-4" key={product.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.04, duration: 0.25 }}
                                        className="card border-0 rounded-4 h-100 shadow-sm overflow-hidden"
                                        style={{ background: '#fff' }}
                                    >
                                        <div className="position-relative" style={{ height: '210px', background: '#eef7f2' }}>
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.nom}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-success fw-bold">
                                                    Pas d'image
                                                </div>
                                            )}
                                            <span
                                                className="position-absolute top-0 start-0 m-3 badge rounded-pill"
                                                style={{ background: stock.bg, color: stock.color }}
                                            >
                                                {stock.label}
                                            </span>
                                            {/* BOUTON FAVORI */}
                                            {user && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); toggleFavori(product); }}
                                                    className="position-absolute top-0 end-0 m-2 border-0 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm favori-btn"
                                                    style={{ width: '36px', height: '36px', transition: 'transform 0.2s' }}
                                                    title={isFavori(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                                >
                                                    <Heart
                                                        size={18}
                                                        fill={isFavori(product.id) ? '#dc3545' : 'none'}
                                                        color={isFavori(product.id) ? '#dc3545' : '#94a3b8'}
                                                        style={{ transition: 'all 0.2s' }}
                                                    />
                                                </button>
                                            )}
                                        </div>

                                        <div className="card-body d-flex flex-column">
                                            <h5 className="fw-bold text-dark mb-1">{product.nom}</h5>
                                            <p className="text-muted small mb-2">{product.entreprise || 'Entreprise non renseignee'}</p>

                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <div className="text-success fw-bold" style={{ fontSize: '1.15rem' }}>{formatPrice(product.prix_unitaire)}</div>
                                                    <div className="text-muted small">{product.unite_mesure ? `Par ${product.unite_mesure}` : 'Prix unitaire'}</div>
                                                </div>
                                                <span className="badge text-bg-light border">{mode}</span>
                                            </div>

                                            {product.mode_vente !== 'detail' && product.quantite_min_gros && product.prix_gros && (
                                                <div className="small text-muted mb-3">
                                                    Gros: a partir de {product.quantite_min_gros} unites a {formatPrice(product.prix_gros)}
                                                </div>
                                            )}

                                            <div className="mt-auto">
                                                <Link to={`/produit/${product.id}`} className="btn btn-outline-success rounded-pill w-100 fw-semibold">
                                                    Voir le produit
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Catalogue;




