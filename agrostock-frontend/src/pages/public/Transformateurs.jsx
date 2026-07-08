import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Search } from 'lucide-react';
import { API_URL } from '../../services/config';

const API_BASE = `${API_URL}`;

const Transformateurs = () => {
    const [transformateurs, setTransformateurs] = useState([]);
    const [search, setSearch] = useState('');
    const [activeDep, setActiveDep] = useState(null);
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

    const departments = useMemo(() => {
        const deps = new Set(transformateurs.map(t => t.departement).filter(Boolean));
        return Array.from(deps).sort();
    }, [transformateurs]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return transformateurs.filter((t) => {
            const nom = (t.nom_entreprise || '').toLowerCase();
            const commune = (t.commune || '').toLowerCase();
            const departement = (t.departement || '').toLowerCase();
            const matchSearch = !q || nom.includes(q) || commune.includes(q) || departement.includes(q);
            const matchDep = activeDep === null || t.departement === activeDep;
            return matchSearch && matchDep;
        });
    }, [transformateurs, search, activeDep]);

    return (
        <div style={{ background: '#f8fbf8', minHeight: '100vh' }}>
            <section
                className="position-relative overflow-hidden"
                style={{
                    padding: '80px 0 60px 0',
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
                                    <MapPin size={14} className="me-2" />
                                    RESEAU DE TRANSFORMATEURS
                                </span>
                                <h1 className="fw-bold text-white mb-4 display-4" style={{ letterSpacing: '-1px' }}>
                                    Nos <span style={{ color: '#4ade80' }}>Transformateurs locaux</span>
                                </h1>
                                <p className="lead mx-auto mb-0" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '600px' }}>
                                    Rencontrez les ateliers et coopératives qui valorisent les richesses agricoles du Bénin.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10, paddingBottom: '4rem' }}>
                <div className="row g-4">
                    {/* SIDEBAR FILTRES */}
                    <div className="col-12 col-lg-3">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="card border-0 shadow-lg rounded-4 p-4"
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.95)', 
                                backdropFilter: 'blur(20px)', 
                                border: '1px solid rgba(255,255,255,0.5)' 
                            }}
                        >
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-dark">
                                <Search size={20} className="text-success" />
                                Filtres
                            </h5>

                            {/* Recherche textuelle */}
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">Mots clés</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="form-control rounded-3 bg-light border-0"
                                    style={{ padding: '0.8rem 1rem' }}
                                    placeholder="Entreprise, commune..."
                                />
                            </div>

                            {/* Filtre Départements */}
                            {departments.length > 0 && (
                                <div className="mb-2">
                                    <label className="form-label small fw-bold text-muted text-uppercase tracking-wider mb-3">Départements</label>
                                    <div className="d-flex flex-column gap-2 custom-scrollbar" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '12px' }}>
                                        <button
                                            className={`btn w-100 text-start rounded-3 px-3 py-2 fw-medium transition-all ${activeDep === null ? 'btn-success shadow-sm' : 'bg-light text-dark border-0 hover-bg-gray'}`}
                                            onClick={() => setActiveDep(null)}
                                        >
                                            Tous les départements
                                        </button>
                                        {departments.map((dep, index) => (
                                            <button
                                                key={index}
                                                className={`btn w-100 text-start rounded-3 px-3 py-2 fw-medium transition-all ${activeDep === dep ? 'btn-success shadow-sm' : 'bg-light text-dark border-0 hover-bg-gray'}`}
                                                onClick={() => setActiveDep(dep)}
                                            >
                                                {dep}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* LISTE DES TRANSFORMATEURS */}
                    <div className="col-12 col-lg-9">
                        {loading && (
                            <div className="text-center py-5 my-5">
                                <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status" />
                                <p className="text-muted mt-3 fw-medium">Chargement des transformateurs...</p>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="alert alert-danger rounded-4 py-4 d-flex align-items-center mb-5">
                                <div>{error}</div>
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-4 py-3 px-3 bg-white rounded-4 shadow-sm border border-light">
                                    <h5 className="fw-bold mb-0 text-dark ps-2">
                                        Résultats <span className="badge bg-success rounded-pill ms-2 fs-6 pb-1">{filtered.length}</span>
                                    </h5>
                                </div>

                                {filtered.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="text-center py-5 bg-white rounded-5 shadow-sm border border-light"
                                    >
                                        <div className="mb-4 text-muted mx-auto" style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Search size={32} />
                                        </div>
                                        <h4 className="fw-bold text-dark">Aucun résultat</h4>
                                        <p className="text-muted mb-0">Modifiez vos critères pour explorer d'autres partenaires.</p>
                                    </motion.div>
                                ) : (
                                    <div className="row g-4">
                                        {filtered.map((t, index) => (
                                            <div key={t.id} className="col-12 col-md-6 col-xl-4">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.35, delay: index * 0.05 }}
                                                    className="h-100"
                                                >
                                                    <div
                                                        className="card h-100 border-0 rounded-4 overflow-hidden transformateur-card transition-all"
                                                        style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                                    >
                                                        <div style={{ height: '85px', background: 'linear-gradient(135deg, #1e3a2f 0%, #0d2118 100%)', position: 'relative' }}>
                                                            {t.atelier_url && (
                                                                <img src={t.atelier_url} alt="" className="w-100 h-100 object-fit-cover opacity-50" />
                                                            )}
                                                            <div className="position-absolute top-0 end-0 p-2">
                                                                <span className="badge rounded-pill fw-medium d-flex align-items-center gap-1" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(4px)', fontSize: '0.65rem' }}>
                                                                    <ShieldCheck size={12} />
                                                                    {t.statut_verification === 'verifie' ? 'Vérifié' : 'En cours'}
                                                                </span>
                                                            </div>
                                                            <div style={{ position: 'absolute', bottom: '-26px', left: '20px' }}>
                                                                <div
                                                                    className="rounded-circle border border-3 border-white shadow-sm d-flex align-items-center justify-content-center fw-bold bg-white text-success"
                                                                    style={{ width: '52px', height: '52px', fontSize: '1rem', overflow: 'hidden' }}
                                                                >
                                                                    {t.logo_url
                                                                        ? <img src={t.logo_url} alt="" className="w-100 h-100 object-fit-cover" />
                                                                        : (t.initiales || t.nom_entreprise?.charAt(0) || 'T')}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="card-body pt-4 px-3 pb-3 d-flex flex-column">
                                                            <div className="mb-2">
                                                                <h5 className="fw-bold mb-1 fs-6 text-dark text-truncate" title={t.nom_entreprise}>{t.nom_entreprise}</h5>
                                                                <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.75rem' }}>
                                                                    <MapPin size={12} className="text-success flex-shrink-0" />
                                                                    <span className="text-truncate">{[t.commune, t.departement].filter(Boolean).join(', ')}</span>
                                                                </div>
                                                            </div>

                                                            {t.type_entreprise && (
                                                                <div className="mb-3">
                                                                    <span className="badge rounded-pill fw-medium" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.65rem' }}>
                                                                        {t.type_entreprise}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div className="d-flex gap-3 pt-2 mt-auto mb-4 border-top">
                                                                <div>
                                                                    <div className="fw-bold text-dark lh-1" style={{ fontSize: '0.9rem' }}>{t.nb_produits || 0}</div>
                                                                    <div className="text-muted text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Produits</div>
                                                                </div>
                                                                {t.mode_vente && (
                                                                    <>
                                                                        <div style={{ width: '1px', background: '#f1f5f9' }} />
                                                                        <div>
                                                                            <div className="fw-bold text-dark lh-1" style={{ fontSize: '0.9rem' }}>
                                                                                {t.mode_vente === 'les_deux' ? 'Gros & Dét' : t.mode_vente === 'gros' ? 'Gros' : t.mode_vente === 'detail' ? 'Détail' : t.mode_vente}
                                                                            </div>
                                                                            <div className="text-muted text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Vente</div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>

                                                            <Link
                                                                to={`/transformateur/${t.id}`}
                                                                className="btn btn-light w-100 rounded-pill py-2 fw-semibold text-dark btn-hover-success border transition-all"
                                                                style={{ fontSize: '0.8rem' }}
                                                            >
                                                                Voir le profil
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                .transformateur-card {
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    border: 1px solid rgba(0,0,0,0.04) !important;
                }
                .transformateur-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important;
                    border-color: rgba(26, 178, 115, 0.2) !important;
                }
                .btn-hover-success:hover {
                    background-color: #1ab273 !important;
                    color: white !important;
                    border-color: #1ab273 !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(0,0,0,0.2);
                }
                .hover-bg-gray:hover {
                    background-color: #e2e8f0 !important;
                }
            `}</style>
        </div>
    );
};

export default Transformateurs;




