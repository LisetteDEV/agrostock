import React from 'react';
import { Heart, ShoppingBag, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavoris } from '../../context/FavorisContext';

const Favoris = () => {
    const { favoris, toggleFavori, clearFavoris } = useFavoris();

    const formatPrice = (val) => val ? `${Number(val).toLocaleString('fr-FR')} FCFA` : '-';
    const formatDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            {/* HEADER */}
            <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
                <div>
                    <h4 className="fw-bolder text-dark mb-1 d-flex align-items-center gap-2">
                        <Heart size={22} className="text-danger" fill="#dc3545" />
                        Mes Favoris
                    </h4>
                    <p className="text-muted small mb-0">
                        {favoris.length === 0
                            ? 'Aucun produit enregistré pour l\'instant.'
                            : `${favoris.length} produit${favoris.length > 1 ? 's' : ''} sauvegardé${favoris.length > 1 ? 's' : ''}`
                        }
                    </p>
                </div>
                {favoris.length > 0 && (
                    <button
                        type="button"
                        onClick={clearFavoris}
                        className="btn btn-sm btn-outline-danger rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                    >
                        <Trash2 size={14} /> Tout vider
                    </button>
                )}
            </div>

            {/* ETAT VIDE */}
            {favoris.length === 0 && (
                <div className="bg-white rounded-4 p-5 text-center shadow-sm border">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                         style={{ width: '80px', height: '80px', background: 'rgba(220,53,69,0.08)' }}>
                        <Heart size={40} className="text-danger" fill="#dc3545" />
                    </div>
                    <h5 className="fw-bold text-dark mb-2">Votre liste de favoris est vide</h5>
                    <p className="text-muted mb-4" style={{ maxWidth: '440px', margin: '0 auto' }}>
                        Parcourez notre catalogue et cliquez sur l'icône ❤️ pour enregistrer vos produits préférés.
                    </p>
                    <Link to="/catalogue" className="btn btn-success px-5 py-3 rounded-pill fw-bold d-inline-flex align-items-center gap-2 shadow-sm border-0">
                        <ShoppingBag size={18} /> Explorer le catalogue
                    </Link>
                </div>
            )}

            {/* GRILLE DES FAVORIS */}
            {favoris.length > 0 && (
                <div className="row g-3">
                    {favoris.map((produit) => (
                        <div key={produit.id} className="col-sm-6 col-lg-4">
                            <div className="bg-white rounded-4 shadow-sm border hover-up overflow-hidden h-100 d-flex flex-column">
                                {/* IMAGE */}
                                <div className="position-relative" style={{ height: '180px', background: '#eef7f2', flexShrink: 0 }}>
                                    {produit.image_url ? (
                                        <img src={produit.image_url} alt={produit.nom}
                                             style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted opacity-50">
                                            <ShoppingBag size={40} />
                                        </div>
                                    )}
                                    {/* BOUTON RETIRER */}
                                    <button
                                        type="button"
                                        onClick={() => toggleFavori(produit)}
                                        className="position-absolute top-0 end-0 m-2 border-0 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                        style={{ width: '36px', height: '36px', cursor: 'pointer' }}
                                        title="Retirer des favoris"
                                    >
                                        <Heart size={18} fill="#dc3545" color="#dc3545" />
                                    </button>
                                </div>

                                {/* INFOS */}
                                <div className="p-3 d-flex flex-column flex-grow-1">
                                    <h6 className="fw-bolder text-dark mb-1">{produit.nom}</h6>
                                    <p className="text-muted small mb-2">{produit.entreprise || 'Transformateur'}</p>

                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div>
                                            <span className="fw-bolder text-success">{formatPrice(produit.prix_unitaire)}</span>
                                        </div>
                                        <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill" style={{ fontSize: '10px' }}>
                                            <Heart size={10} fill="#dc3545" className="me-1" />Favori
                                        </span>
                                    </div>

                                    <p className="text-muted" style={{ fontSize: '10px' }}>
                                        Ajouté le {formatDate(produit.ajouteA)}
                                    </p>

                                    <div className="mt-auto">
                                        <Link
                                            to={`/produit/${produit.id}`}
                                            className="btn btn-outline-success rounded-pill w-100 fw-bold small d-flex align-items-center justify-content-center gap-2"
                                        >
                                            <ExternalLink size={14} /> Voir le produit
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .hover-up { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .hover-up:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important; }
            `}</style>
        </div>
    );
};

export default Favoris;
