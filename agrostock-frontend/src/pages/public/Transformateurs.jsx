import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck } from 'lucide-react';
import { API_URL } from '../../services/config';

const API_BASE = `${API_URL}`;

const Transformateurs = () => {
    const [transformateurs, setTransformateurs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/transformateurs/publics`)
            .then((r) => r.json())
            .then((data) => {
                setTransformateurs(data.transformateurs || []);
                setLoading(false);
            })
            .catch(() => {
                setError('Impossible de charger les transformateurs.');
                setLoading(false);
            });
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return transformateurs.filter((t) => {
            const nom = (t.nom_entreprise || '').toLowerCase();
            const commune = (t.commune || '').toLowerCase();
            const departement = (t.departement || '').toLowerCase();
            return !q || nom.includes(q) || commune.includes(q) || departement.includes(q);
        });
    }, [transformateurs, search]);

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
                            <pattern id="grid-transformateurs" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid-transformateurs)" />
                    </svg>
                </div>

                <div className="container position-relative text-center text-white" style={{ zIndex: 2 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="badge rounded-pill px-4 py-2 mb-4 bg-white text-success fw-bold shadow-sm" style={{ letterSpacing: '2px', fontSize: '0.9rem' }}>
                            RESEAU DE TRANSFORMATEURS
                        </span>
                        <h1 className="fw-bold mb-3 display-4" style={{ letterSpacing: '-2px' }}>
                            Nos <span className="text-warning">Transformateurs locaux</span>
                        </h1>
                        <p className="mb-0" style={{ maxWidth: '760px', margin: '0 auto', color: 'rgba(255,255,255,0.9)' }}>
                            Rencontrez les ateliers et cooperatives qui valorisent les richesses agricoles du Benin.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container py-5">
                <div className="card border-0 rounded-4 shadow-sm p-3 p-md-4 mb-4">
                    <label className="form-label fw-semibold text-dark mb-2">Recherche</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="form-control rounded-pill"
                        placeholder="Nom entreprise, commune ou departement"
                    />
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status" />
                        <p className="text-muted">Chargement des transformateurs...</p>
                    </div>
                )}

                {error && <div className="alert alert-danger">{error}</div>}

                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                        <h4 className="fw-bold text-dark">Aucun transformateur trouve</h4>
                        <p className="text-muted mb-0">{search ? `Aucun resultat pour "${search}".` : 'Aucun transformateur disponible pour le moment.'}</p>
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <>
                        <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                            <strong className="text-dark">{filtered.length}</strong> transformateur{filtered.length > 1 ? 's' : ''} trouve{filtered.length > 1 ? 's' : ''}
                        </p>

                        <div className="row g-4">
                            {filtered.map((t, index) => (
                                <div key={t.id} className="col-md-6 col-lg-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.35, delay: index * 0.05 }}
                                        className="h-100"
                                    >
                                        <div
                                            className="card h-100 border-0 rounded-4 overflow-hidden"
                                            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
                                        >
                                            <div style={{ height: '130px', background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)', position: 'relative', overflow: 'hidden' }}>
                                                {t.atelier_url && (
                                                    <img src={t.atelier_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                                                )}
                                                <div className="position-absolute top-0 end-0 p-3">
                                                    <span
                                                        className="badge rounded-pill d-flex align-items-center gap-1"
                                                        style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(6px)', fontSize: '0.75rem', padding: '5px 10px' }}
                                                    >
                                                        <ShieldCheck size={12} />
                                                        {t.statut_verification === 'verifie' ? 'Verifie' : 'En cours'}
                                                    </span>
                                                </div>
                                                <div style={{ position: 'absolute', bottom: '-36px', left: '50%', transform: 'translateX(-50%)' }}>
                                                    <div
                                                        className="rounded-circle border border-4 border-white shadow d-flex align-items-center justify-content-center fw-bold"
                                                        style={{ width: '72px', height: '72px', background: '#f0fdf4', color: '#166534', fontSize: '1.3rem', overflow: 'hidden' }}
                                                    >
                                                        {t.logo_url
                                                            ? <img src={t.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            : t.initiales}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card-body pt-5 px-4 pb-4 text-center">
                                                <h4 className="fw-bold mb-1 mt-2" style={{ fontSize: '1rem' }}>{t.nom_entreprise}</h4>
                                                {t.type_entreprise && (
                                                    <span className="badge rounded-pill px-3 py-1 mb-2 d-inline-block" style={{ background: 'rgba(26,178,115,0.1)', color: '#1ab273', fontSize: '0.72rem' }}>
                                                        {t.type_entreprise}
                                                    </span>
                                                )}

                                                <div className="d-flex align-items-center justify-content-center gap-1 text-muted small mb-3">
                                                    <MapPin size={13} className="text-success" />
                                                    {[t.commune, t.departement].filter(Boolean).join(', ')}
                                                </div>

                                                <div className="d-flex justify-content-center gap-4 py-3 rounded-3 mb-4" style={{ background: '#f8fbf8' }}>
                                                    <div className="text-center">
                                                        <div className="fw-bold text-dark">{t.nb_produits}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Produits</div>
                                                    </div>
                                                    {t.mode_vente && (
                                                        <>
                                                            <div style={{ width: '1px', background: '#e5e5e5' }} />
                                                            <div className="text-center">
                                                                <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                                                    {t.mode_vente === 'les_deux' ? 'Gros & Detail' : t.mode_vente === 'gros' ? 'En gros' : t.mode_vente === 'detail' ? 'En detail' : t.mode_vente}
                                                                </div>
                                                                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Mode vente</div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <Link
                                                    to={`/transformateur/${t.id}`}
                                                    className="btn btn-outline-success rounded-pill py-2 fw-bold w-100"
                                                    style={{ fontSize: '0.9rem' }}
                                                >
                                                    Voir le profil
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Transformateurs;




