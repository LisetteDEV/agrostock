import React from 'react';
import { Link } from 'react-router-dom';
import { usePanier } from '../../context/PanierContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

const Panier = () => {
    const { panier, removeFromPanier, updateQuantite, totalPanier, getPrixByMode } = usePanier();
    const { user } = useAuth();

    const formatPrice = (val) => (val ? Number(val).toLocaleString('fr-FR') + ' FCFA' : '0 FCFA');
    const invalidGrossItems = panier.filter((item) => item.mode_achat === 'gros' && Number(item.quantite) < 20);
    const canCheckout = invalidGrossItems.length === 0;

    return (
        <div style={{ paddingTop: '90px', background: '#f8fbf8', minHeight: '100vh', paddingBottom: '80px' }}>
            <div className="container py-5">
                <h2 className="fw-bold mb-4" style={{ color: '#0f3a23' }}>Votre Panier</h2>

                {panier.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                        <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3" style={{ width: '80px', height: '80px' }}>
                            <ShoppingBag size={40} className="text-muted" />
                        </div>
                        <h4 className="fw-bold">Votre panier est vide</h4>
                        <p className="text-muted mb-4">Decouvrez nos produits locaux et remplissez votre panier.</p>
                        <Link to="/catalogue" className="btn text-white rounded-pill px-4 py-2 fw-bold" style={{ background: 'linear-gradient(135deg, #1ab273 0%, #105c38 100%)' }}>
                            Aller au catalogue
                        </Link>
                    </div>
                ) : (
                    <div className="row g-4">
                        <div className="col-lg-8">
                            <div className="bg-white rounded-4 shadow-sm p-4">
                                {panier.map((item) => {
                                    const linePrice = getPrixByMode(item);
                                    const minGros = Number(item.quantite_min_gros || 20);
                                    return (
                                        <motion.div
                                            key={item.panier_key}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 mb-3 border rounded-3 gap-3"
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', background: '#edf7f2', flexShrink: 0 }}>
                                                    {item.image_url || (item.images && item.images.length > 0) ? (
                                                        <img src={item.image_url || item.images[0]} alt={item.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">IMG</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>{item.nom}</h5>
                                                    <p className="text-success fw-bold mb-1">{formatPrice(linePrice)} {item.unite_mesure ? `/ ${item.unite_mesure}` : ''}</p>
                                                    <span className={`badge rounded-pill ${item.mode_achat === 'gros' ? 'bg-warning text-dark' : 'bg-success-subtle text-success'}`}>
                                                        {item.mode_achat === 'gros' ? `Gros (min ${minGros})` : 'Detail'}
                                                    </span>
                                                    {item.mode_achat === 'gros' && Number(item.quantite) < minGros && (
                                                        <div className="small text-danger mt-1">Quantite minimum requise: {minGros}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between gap-3 w-100 w-md-auto mt-2 mt-md-0" style={{ maxWidth: '350px' }}>
                                                <div className="d-flex align-items-center bg-light rounded-pill px-2 py-1">
                                                    <button onClick={() => updateQuantite(item.panier_key, item.quantite - 1)} className="btn btn-sm btn-link text-dark p-1 text-decoration-none"><Minus size={16} /></button>
                                                    <span className="fw-bold px-3">{item.quantite}</span>
                                                    <button onClick={() => updateQuantite(item.panier_key, item.quantite + 1)} className="btn btn-sm btn-link text-dark p-1 text-decoration-none"><Plus size={16} /></button>
                                                </div>
                                                <span className="fw-bold text-end" style={{ minWidth: '90px' }}>{formatPrice(linePrice * item.quantite)}</span>
                                                <button onClick={() => removeFromPanier(item.panier_key)} className="btn btn-link text-danger p-2 hover-bg-danger rounded-circle flex-shrink-0">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="bg-white rounded-4 shadow-sm p-4 position-sticky" style={{ top: '100px' }}>
                                <h5 className="fw-bold mb-4">Resume de la commande</h5>
                                <div className="d-flex justify-content-between mb-3 text-muted">
                                    <span>Sous-total des produits</span>
                                    <span>{formatPrice(totalPanier)}</span>
                                </div>
                                <hr className="text-secondary opacity-25" />
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="fw-bold text-dark fs-5">Total estimé</span>
                                    <span className="fw-bolder text-success fs-5">{formatPrice(totalPanier)}</span>
                                </div>

                                {invalidGrossItems.length > 0 && (
                                    <div className="alert alert-warning small py-2">
                                        Corrigez les quantites en gros (minimum 20) avant de commander.
                                    </div>
                                )}

                                {user ? (
                                    <Link
                                        to={canCheckout ? '/checkout' : '#'}
                                        onClick={(e) => { if (!canCheckout) e.preventDefault(); }}
                                        className="btn text-white w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                        style={{ background: canCheckout ? 'linear-gradient(135deg, #1ab273 0%, #105c38 100%)' : '#9ca3af', pointerEvents: canCheckout ? 'auto' : 'none' }}
                                    >
                                        Passer la commande <ArrowRight size={20} />
                                    </Link>
                                ) : (
                                    <button onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }))} className="btn btn-dark w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm">
                                        Se connecter pour commander <LogIn size={20} />
                                    </button>
                                )}
                                <div className="mt-3 text-center">
                                    <Link to="/catalogue" className="text-muted text-decoration-none small fw-bold">Continuer mes achats</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .hover-bg-danger:hover {
                    background-color: rgba(220, 53, 69, 0.1);
                }
            `}</style>
        </div>
    );
};

export default Panier;
