import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../services/config';
const API_BASE = `${API_URL}`;

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/produits/publics`)
            .then(res => res.json())
            .then(data => {
                setProducts(data.produits || []);
                setLoading(false);
            })
            .catch(() => {
                setError('Impossible de charger les produits.');
                setLoading(false);
            });
    }, []);

    const formatPrice = (val) => {
        if (!val) return '-';
        return Number(val).toLocaleString('fr-FR') + ' F CFA';
    };

    const getStockBadge = (stock) => {
        if (!stock || stock === 0) return { label: 'Rupture', bg: '#fce8e8', color: '#a00' };
        if (stock < 20) return { label: 'Stock faible', bg: '#fdf3e1', color: '#845e22' };
        return { label: 'En stock', bg: '#e0f2e9', color: '#105c38' };
    };

    return (
        <section id="catalogue" className="py-5" style={{ background: '#0a0a0a' }}>
            <div className="container py-5">
                {/* Section Header */}
                <div className="d-flex flex-wrap justify-content-between align-items-end mb-5">
                    <div>
                        <div
                            className="d-inline-flex align-items-center justify-content-center px-3 py-1 mb-3 rounded-pill"
                            style={{ background: 'rgba(26, 178, 115, 0.1)', color: '#1ab273', fontWeight: '600', fontSize: '0.9rem' }}
                        >
                            Produits disponibles
                        </div>
                        <h2 className="fw-bold mb-0" style={{ color: '#ffffff', fontSize: '2.4rem' }}>
                            Catalogue de <span style={{ color: '#1ab273' }}>Produits</span>
                        </h2>
                    </div>
                    <Link
                        to="/catalogue"
                        className="btn mt-3 mt-md-0"
                        style={{
                            color: '#e0e0e0',
                            fontWeight: '600',
                            border: '1px solid #444',
                            borderRadius: '30px',
                            padding: '0.6rem 1.5rem',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#222';
                            e.currentTarget.style.borderColor = '#1ab273';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = '#444';
                        }}
                    >
                        Voir tout le catalogue -&gt;
                    </Link>
                </div>

                {/* States */}
                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success" role="status" />
                        <p className="text-muted mt-3">Chargement des produits...</p>
                    </div>
                )}
                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-5">
                        <p style={{ color: '#888' }}>Aucun produit disponible pour le moment.</p>
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && (
                    <div className="row g-4">
                        {products.slice(0, 6).map((product) => {
                            const stock = getStockBadge(product.stock);
                            return (
                                <div className="col-12 col-md-6 col-lg-4" key={product.id}>
                                    <div
                                        className="border-0 product-card"
                                        style={{
                                            background: '#1A1C19',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                            cursor: 'pointer',
                                            border: '1px solid #2a2a2a'
                                        }}
                                    >
                                        {/* Image */}
                                        <div
                                            className="position-relative w-100"
                                            style={{
                                                height: '200px',
                                                backgroundColor: '#2a2a2a',
                                                borderTopLeftRadius: '12px',
                                                borderTopRightRadius: '12px',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.nom}
                                                    loading="lazy"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                                                    <span style={{ fontSize: '0.95rem', color: '#999' }}>Image indisponible</span>
                                                </div>
                                            )}
                                            {/* Stock Badge */}
                                            <div
                                                className="position-absolute"
                                                style={{
                                                    top: '12px', left: '12px',
                                                    backgroundColor: stock.bg,
                                                    color: stock.color,
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontWeight: '700',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {stock.label}
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-3">
                                            <div className="mb-3">
                                                <h5 className="fw-bold mb-1" style={{ color: '#ffffff', fontSize: '1.1rem' }}>{product.nom}</h5>
                                                <div style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>
                                                    {/* unite_mesure removed */}
                                                </div>
                                            </div>

                                            {/* Entreprise Info */}
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <div
                                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                                    style={{
                                                        width: '26px', height: '26px',
                                                        backgroundColor: '#eefcf5',
                                                        color: '#105c38',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {product.vendeur_initiales}
                                                </div>
                                                {product.transformateur_id ? (
                                                    <Link
                                                        to={`/transformateur/${product.transformateur_id}`}
                                                        style={{ color: '#1ab273', fontSize: '0.85rem', fontWeight: '500', textDecoration: 'none', transition: 'color 0.2s' }}
                                                        onMouseEnter={(e) => e.target.style.color = '#148b59'}
                                                        onMouseLeave={(e) => e.target.style.color = '#1ab273'}
                                                    >
                                                        {product.entreprise}
                                                    </Link>
                                                ) : (
                                                    <span style={{ color: '#1ab273', fontSize: '0.85rem', fontWeight: '500' }}>
                                                        {product.entreprise}
                                                    </span>
                                                )}
                                                {product.commune && (
                                                    <>
                                                        <div style={{ width: '4px', height: '4px', backgroundColor: '#1ab273', borderRadius: '50%' }} />
                                                        <div className="d-flex align-items-center gap-1" style={{ color: '#e0e0e0', fontSize: '0.85rem' }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                                            </svg>
                                                            {product.commune}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Prix */}
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <span style={{ color: '#1ab273', fontWeight: '700', fontSize: '1.2rem' }}>
                                                        {formatPrice(product.prix_unitaire)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* CTA */}
                                            <Link
                                                to={`/produit/${product.id}`}
                                                className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #444',
                                                    color: '#ffffff',
                                                    borderRadius: '8px',
                                                    padding: '0.6rem',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem',
                                                    transition: 'background 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                Voir le produit -&gt;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Products;


