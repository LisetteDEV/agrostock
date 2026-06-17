import React, { useEffect, useState } from 'react';
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_URL } from '../services/config';
const API_BASE = `${API_URL}`;

const Processors = () => {
    const [processors, setProcessors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/transformateurs/publics`)
            .then(r => r.json())
            .then(data => {
                setProcessors(data.transformateurs || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return null; // section invisible pendant le chargement

    if (processors.length === 0) return null; // on n'affiche rien si vide

    return (
        <section id="transformateurs" className="py-5" style={{ background: '#f0f4f2' }}>
            <div className="container py-5">
                {/* Header */}
                <div className="row align-items-end mb-5">
                    <div className="col-lg-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            
                            <h2 className="display-5 fw-bold mb-0 text-dark">
                                Transformateurs <span className="text-success">en vedette</span>
                            </h2>
                            <p className="lead text-muted mt-3 mb-0">
                                Decouvrez l'excellence de l'agro-transformation locale a travers nos producteurs certifies.
                            </p>
                        </motion.div>
                    </div>
                    <div className="col-lg-6 text-lg-end d-none d-lg-block">
                        <Link to="/transformateurs" className="btn btn-outline-success rounded-pill px-4 py-2 fw-bold">
                            Voir tous les transformateurs
                        </Link>
                    </div>
                </div>

                {/* Cards */}
                <div className="row g-4">
                    {processors.slice(0, 3).map((proc, index) => (
                        <div className="col-lg-4 col-md-6" key={proc.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="card border-0 h-100 overflow-hidden shadow-sm rounded-4"
                                style={{ background: '#fff' }}
                            >
                                {/* Header colore */}
                                <div className="position-relative" style={{ height: '140px', background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)', overflow: 'hidden' }}>
                                    {proc.atelier_url && (
                                        <img src={proc.atelier_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
                                    )}
                                    {/* Badge verifie */}
                                    <div className="position-absolute top-0 end-0 p-3">
                                        <div className="badge text-white rounded-pill px-3 py-1 d-flex align-items-center gap-1" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', fontSize: '0.78rem' }}>
                                            <ShieldCheck size={13} />
                                            {proc.statut_verification === 'verifie' ? 'Verifie' : 'En cours'}
                                        </div>
                                    </div>

                                    {/* Avatar initiales */}
                                    <div className="position-absolute start-50 translate-middle-x" style={{ bottom: '-38px' }}>
                                        <div
                                            className="rounded-circle border border-4 border-white shadow d-flex align-items-center justify-content-center fw-bold"
                                            style={{ width: '76px', height: '76px', background: '#f0fdf4', color: '#166534', fontSize: '1.4rem' }}
                                        >
                                            {proc.logo_url
                                                ? <img src={proc.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                : proc.initiales
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="card-body pt-5 text-center px-4 pb-4">
                                    <h4 className="fw-bold mb-1 mt-2" style={{ fontSize: '1.05rem' }}>{proc.nom_entreprise}</h4>
                                    {proc.type_entreprise && (
                                        <span className="badge rounded-pill px-3 py-1 mb-2 d-inline-block" style={{ background: 'rgba(26,178,115,0.1)', color: '#1ab273', fontSize: '0.75rem' }}>
                                            {proc.type_entreprise}
                                        </span>
                                    )}
                                    <div className="d-flex align-items-center justify-content-center gap-1 text-muted small mb-3">
                                        <MapPin size={13} className="text-success" />
                                        {[proc.commune, proc.departement].filter(Boolean).join(', ')}
                                    </div>

                                    {/* Stats */}
                                    <div className="d-flex justify-content-center gap-4 mb-4 py-3 rounded-3" style={{ background: '#f8fbf8' }}>
                                        <div className="text-center">
                                            <div className="fw-bold text-dark">{proc.nb_produits}</div>
                                            <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Produits</div>
                                        </div>
                                        {proc.mode_vente && (
                                            <>
                                                <div style={{ width: '1px', background: '#e5e5e5' }} />
                                                <div className="text-center">
                                                    <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                                        {proc.mode_vente === 'les_deux' ? 'Gros & Detail' : proc.mode_vente === 'gros' ? 'En gros' : proc.mode_vente === 'detail' ? 'En detail' : proc.mode_vente}
                                                    </div>
                                                    <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Vente</div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <Link
                                        to={`/transformateur/${proc.id}`}
                                        className="btn btn-outline-success rounded-pill py-2 fw-bold w-100 d-flex align-items-center justify-content-center gap-1"
                                    >
                                        Voir le profil <ArrowRight size={15} />
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Bouton mobile */}
                <div className="text-center mt-5 d-lg-none">
                    <Link to="/transformateurs" className="btn btn-success rounded-pill px-5 py-3 fw-bold shadow-lg" style={{ background: '#1ab273', border: 'none' }}>
                        Voir tous les transformateurs
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Processors;

