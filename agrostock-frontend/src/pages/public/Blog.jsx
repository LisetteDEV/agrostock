import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
            <div className="position-relative overflow-hidden mb-5" style={{ background: '#0a1d13', paddingTop: '150px', paddingBottom: '90px' }}>
                <div className="position-absolute bg-success rounded-circle" style={{ width: '400px', height: '400px', filter: 'blur(100px)', opacity: 0.15, top: '20%', left: '-10%' }}></div>
                <div className="position-absolute bg-success rounded-circle" style={{ width: '500px', height: '500px', filter: 'blur(120px)', opacity: 0.1, bottom: '-20%', right: '-10%' }}></div>
                
                <div className="container position-relative z-1">
                    <div className="row justify-content-center text-center">
                        <div className="col-lg-8">
                            <motion.span 
                                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                className="badge bg-success bg-opacity-25 text-success rounded-pill px-4 py-2 mb-4 fw-bold" style={{ letterSpacing: '2px', fontSize: '0.8rem' }}
                            >
                                ACTUALITES & RESSOURCES
                            </motion.span>
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="display-3 fw-bold mb-4 text-white" style={{ letterSpacing: '-1px' }}
                            >
                                Le Hub de <span style={{ color: '#1ab273' }}>l'Agro-Innovation</span>
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="lead mx-auto" style={{ maxWidth: '700px', color: '#8a9b92', lineHeight: '1.8' }}
                            >
                                Decryptez les tendances du marche, decouvrez nos conseils exclusifs en qualite et packaging, et suivez la revolution de l'agroalimentaire au Benin.
                            </motion.p>
                        </div>
                    </div>
                </div>
            </div>

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

