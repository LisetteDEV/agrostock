import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, Package, ArrowLeft, Star } from 'lucide-react';
import { API_URL } from '../../services/config';
const API_BASE = `${API_URL}`;

const ProfilTransformateur = () => {
    const { id } = useParams();
    const [transformateur, setTransformateur] = useState(null);
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avis, setAvis] = useState([]);

    useEffect(() => {
        // Charger transformateur + tous les produits publics en parallele
        Promise.all([
            fetch(`${API_BASE}/transformateurs/publics`).then(r => r.json()),
            fetch(`${API_BASE}/produits/publics`).then(r => r.json()),
        ])
            .then(([transData, prodData]) => {
                const t = (transData.transformateurs || []).find(t => String(t.id) === String(id));
                if (!t) { setError('Transformateur introuvable.'); setLoading(false); return; }
                setTransformateur(t);
                const ses_produits = (prodData.produits || []).filter(p => String(p.transformateur_id) === String(t.id) ||
                    (p.entreprise && p.entreprise === t.nom_entreprise));
                setProduits(ses_produits);
                setLoading(false);

                // Charger les avis publics depuis l'API
                fetch(`${API_BASE}/avis/transformateur/${t.id}`, {
                    headers: { 'Accept': 'application/json' }
                })
                    .then(r => r.ok ? r.json() : Promise.reject())
                    .then(data => setAvis(data.avis || []))
                    .catch(() => {});
            })
            .catch(() => { setError('Erreur lors du chargement.'); setLoading(false); });
    }, [id]);

    const formatPrice = (val) => val ? Number(val).toLocaleString('fr-FR') + ' FCFA' : '-';

    if (loading) return (
        <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#f8fbf8' }} className="d-flex align-items-center justify-content-center">
            <div className="text-center">
                <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status" />
                <p className="text-muted">Chargement du profil...</p>
            </div>
        </div>
    );

    if (error) return (
        <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#f8fbf8' }} className="container py-5 text-center">
            <div style={{ width: '72px', height: '72px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>
            <h2 className="fw-bold text-dark">Profil introuvable</h2>
            <p className="text-muted">Ce transformateur n'existe pas ou a ete retire de la plateforme.</p>
            <Link to="/transformateurs" className="btn rounded-pill px-4 py-2 mt-2 fw-bold" style={{ background: '#1ab273', color: '#fff', border: 'none' }}>
                Retour aux transformateurs
            </Link>
        </div>
    );

    const t = transformateur;
    const lieu = [t.commune, t.departement].filter(Boolean).join(', ');
    const heroBackgroundImage = t.atelier_url || '/images/background_agro.jpg';

    return (
        <div style={{ background: '#f8fbf8', minHeight: '100vh' }}>

            {/* Section */}
            <div style={{ position: 'relative', height: '320px', background: `linear-gradient(135deg, rgba(5,46,22,0.56) 0%, rgba(6,95,70,0.50) 100%), url("${heroBackgroundImage}") center/cover no-repeat`, overflow: 'hidden', paddingTop: '70px' }}>
                {/* Grille subtile */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />
                {/* Degrade bas */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />

                {/* Retour */}
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <Link to="/transformateurs" className="d-inline-flex align-items-center gap-2 text-white mb-4" style={{ opacity: 0.8, textDecoration: 'none', fontSize: '0.9rem' }}>
                        <ArrowLeft size={16} /> Tous les transformateurs
                    </Link>
                </div>

                {/* Infos bas de banniere */}
                <div className="container" style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, width: '100%' }}>
                    <div className="d-flex align-items-end gap-4">
                        {/* Avatar */}
                        <div
                            className="rounded-circle border border-4 border-white shadow-lg d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                            style={{ width: '96px', height: '96px', background: '#f0fdf4', color: '#166534', fontSize: '1.6rem', overflow: 'hidden', marginBottom: '-48px' }}
                        >
                            {t.logo_url
                                ? <img src={t.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : t.initiales
                            }
                        </div>
                        {/* Nom & localisation */}
                        <div className="text-white pb-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <h1 className="fw-bold mb-0" style={{ fontSize: '1.7rem' }}>{t.nom_entreprise}</h1>
                                {t.statut_verification === 'verifie' && (
                                    <span className="badge d-flex align-items-center gap-1 rounded-pill px-3 py-1" style={{ background: 'rgba(26,178,115,0.25)', border: '1px solid rgba(26,178,115,0.5)', color: '#6ee7b7', fontSize: '0.75rem' }}>
                                        <ShieldCheck size={12} /> Verifie
                                    </span>
                                )}
                            </div>
                            <div className="d-flex align-items-center gap-2 opacity-75" style={{ fontSize: '0.9rem' }}>
                                <MapPin size={14} />
                                <span>{lieu || 'Benin'}</span>
                                {t.type_entreprise && <><span>-</span><span>{t.type_entreprise}</span></>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section */}
            <div className="container py-5 mt-4">
                <div className="row g-4">

                    {/* Section */}
                    <div className="col-lg-4">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>

                            {/* A propos */}
                            <div className="card border-0 rounded-4 p-4 mb-4" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
                                <h5 className="fw-bold mb-3">A propos</h5>
                                {t.description
                                    ? <p className="text-muted mb-0" style={{ lineHeight: '1.7', fontSize: '0.92rem' }}>{t.description}</p>
                                    : <p className="text-muted mb-0 fst-italic" style={{ fontSize: '0.9rem' }}>Aucune description fournie.</p>
                                }
                            </div>

                            {/* Infos pratiques */}
                            <div className="card border-0 rounded-4 p-4 mb-4" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
                                <h5 className="fw-bold mb-3">Informations</h5>
                                <div className="d-flex flex-column gap-3">

                                    {lieu && (
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '36px', height: '36px', background: '#f0fdf4' }}>
                                                <MapPin size={17} color="#1ab273" />
                                            </div>
                                            <div>
                                                <div className="small text-muted">Localisation</div>
                                                <div className="fw-semibold text-dark" style={{ fontSize: '0.92rem' }}>{lieu}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="d-flex align-items-start gap-3">
                                        <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '36px', height: '36px', background: '#f0fdf4' }}>
                                            <Package size={17} color="#1ab273" />
                                        </div>
                                        <div>
                                            <div className="small text-muted">Produits disponibles</div>
                                            <div className="fw-semibold text-dark" style={{ fontSize: '0.92rem' }}>{t.nb_produits} produit{t.nb_produits !== 1 ? 's' : ''}</div>
                                        </div>
                                    </div>

                                    {t.mode_vente && (
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '36px', height: '36px', background: '#f0fdf4' }}>
                                                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#1ab273" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="small text-muted">Mode de vente</div>
                                                <div className="fw-semibold text-dark" style={{ fontSize: '0.92rem' }}>
                                                    {t.mode_vente === 'les_deux' ? 'En gros et en detail' : t.mode_vente === 'gros' ? 'En gros' : t.mode_vente === 'detail' ? 'En detail' : t.mode_vente}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="d-flex align-items-start gap-3">
                                        <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '36px', height: '36px', background: '#f0fdf4' }}>
                                            <ShieldCheck size={17} color="#1ab273" />
                                        </div>
                                        <div>
                                            <div className="small text-muted">Statut</div>
                                            <div className="fw-semibold text-dark" style={{ fontSize: '0.92rem' }}>
                                                {t.statut_verification === 'verifie' ? 'Verifie par AgroStock' : 'Verification en cours'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </div>

                    {/* Section */}
                    <div className="col-lg-8">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold mb-0">
                                    Catalogue de la boutique
                                    <span className="ms-2 badge rounded-pill" style={{ background: 'rgba(26,178,115,0.1)', color: '#1ab273', fontSize: '0.75rem', fontWeight: '600' }}>
                                        {produits.length} produit{produits.length !== 1 ? 's' : ''}
                                    </span>
                                </h4>
                            </div>

                            {produits.length === 0 ? (
                                <div
                                    className="text-center py-5 rounded-4"
                                    style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                                >
                                    <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
                                        <Package size={28} color="#1ab273" />
                                    </div>
                                    <h5 className="fw-bold text-dark">Aucun produit publies</h5>
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Ce transformateur n'a pas encore publie de produits.</p>
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {produits.map((p, idx) => (
                                        <div key={p.id} className="col-sm-6 col-xl-4">
                                            <motion.div
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <Link to={`/produit/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                    <div
                                                        className="card border-0 rounded-4 overflow-hidden"
                                                        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.07)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)'; }}
                                                    >
                                                        {/* Image */}
                                                        <div style={{ height: '160px', background: '#edf7f2', overflow: 'hidden' }}>
                                                            {p.image_url
                                                                ? <img src={p.image_url} alt={p.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                : (
                                                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                                                                        <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#1ab273" strokeWidth={1.5}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 8.25h16.5M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5a1.5 1.5 0 001.5 1.5z" />
                                                                        </svg>
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                        {/* Infos */}
                                                        <div className="p-3">
                                                            <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: '0.9rem' }}>{p.nom}</h6>
                                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                                <span className="fw-bold" style={{ color: '#1ab273', fontSize: '0.95rem' }}>
                                                                    {formatPrice(p.prix_unitaire)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Section */}
                {avis.length > 0 && (
                    <div className="mt-5 pt-3">
                        <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                            <Star size={20} style={{ color: '#f59e0b' }} /> Avis clients
                            <span className="badge rounded-pill ms-1" style={{ background: 'rgba(26,178,115,0.1)', color: '#1ab273', fontSize: '0.75rem' }}>
                                {avis.length} avis
                            </span>
                        </h4>
                        <div className="row g-3">
                            {avis.map((a, i) => (
                                <div key={i} className="col-md-6 col-lg-4">
                                    <div className="card border-0 rounded-4 p-4 h-100" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
                                        <div className="d-flex gap-1 mb-3">
                                            {[1,2,3,4,5].map(s => (
                                                <svg key={s} xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                    fill={s <= a.note ? '#f59e0b' : '#e2e8f0'} viewBox="0 0 16 16">
                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-muted fst-italic mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>"{a.commentaire}"</p>
                                        <div className="d-flex align-items-center gap-2 mt-auto pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                                            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                                style={{ width: '36px', height: '36px', background: '#105c38', fontSize: '0.85rem', flexShrink: 0 }}>
                                                {a.acheteur_nom?.charAt(0).toUpperCase() || 'A'}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{a.acheteur_nom}</div>
                                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(a.date).toLocaleDateString('fr-FR')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilTransformateur;




