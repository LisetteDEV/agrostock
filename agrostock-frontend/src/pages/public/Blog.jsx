import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { API_URL } from '../../services/config';
const API_BASE = `${API_URL}`;

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/blog/publics`, { headers: { 'Accept': 'application/json' } })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setPosts(data.articles || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '80px' }}>
            {/* HERO SECTION PREMIUM */}
            <section
                className="position-relative overflow-hidden mb-5"
                style={{
                    padding: '100px 0 80px 0',
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
                                    <Newspaper size={14} className="me-2" />
                                    ACTUALITÉS & RESSOURCES
                                </span>
                                <h1 className="fw-bold text-white mb-4 display-4" style={{ letterSpacing: '-1px' }}>
                                    Le Hub de <span style={{ color: '#4ade80' }}>l'Agro-Innovation</span>
                                </h1>
                                <p className="lead mx-auto mb-0" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '700px' }}>
                                    Décryptez les tendances du marché, découvrez nos conseils exclusifs en qualité et packaging, et suivez la révolution de l'agroalimentaire au Bénin.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container">
                {loading ? (
                    <div className="text-center py-5 mt-5">
                        <div className="spinner-border text-success" role="status"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-5 mt-5 text-muted">
                        Aucun article n'est disponible pour le moment.
                    </div>
                ) : (
                    <div className="row g-4">
                        {posts.map((post, index) => (
                            <motion.div 
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                                className="col-lg-4"
                            >
                                <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden transition-all hover-up bg-white">
                                    <div className="position-relative" style={{ height: '240px', background: '#e9ecef' }}>
                                        {post.image_couverture ? (
                                            <img src={post.image_couverture} className="w-100 h-100 object-fit-cover" alt={post.titre} />
                                        ) : (
                                            <div className="d-flex w-100 h-100 align-items-center justify-content-center text-muted h6 mb-0">
                                                AgroStock
                                            </div>
                                        )}
                                        <div className="position-absolute top-0 start-0 m-3">
                                            <span className="badge bg-white text-success rounded-pill px-3 py-2 shadow-sm fw-bold">
                                                {post.categorie.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-body p-4 p-xl-5 d-flex flex-column">
                                        <div className="mb-3 small text-success fw-bold">
                                            {post.date}
                                        </div>
                                        <h4 className="fw-bold mb-3" style={{ lineHeight: '1.4', fontSize: '1.25rem' }}>{post.titre}</h4>
                                        <p className="text-muted small mb-4" style={{ lineHeight: '1.6' }}>{post.extrait}</p>
                                        <div className="mt-auto">
                                            <Link to={`/blog/${post.slug}`} className="text-success fw-bold text-decoration-none d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
                                                LIR L'ARTICLE 
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} className="ms-2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                .hover-up:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
                }
            `}</style>
        </div>
    );
};

export default Blog;

