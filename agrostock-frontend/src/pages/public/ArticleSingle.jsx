import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, Tag } from 'lucide-react';
import { API_URL } from '../../services/config';
const API_BASE = `${API_URL}`;

const ArticleSingle = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/blog/publics/${slug}`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setArticle(data.article);
                setLoading(false);
            })
            .catch(() => {
                setError("Article introuvable.");
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return (
            <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#fcfdfc' }} className="d-flex align-items-center justify-content-center">
                <div className="spinner-border text-success" role="status"></div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#fcfdfc' }} className="d-flex flex-column align-items-center justify-content-center">
                <h2 className="text-muted fw-bold">Oups !</h2>
                <p className="text-muted mb-4">{error}</p>
                <Link to="/blog" className="btn btn-success rounded-pill px-4">Retour au blog</Link>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '100px', background: '#fcfdfc', minHeight: '100vh' }}>
            {article.image_couverture && (
                <div className="w-100" style={{ height: '400px', background: `url(${article.image_couverture}) center/cover no-repeat` }}>
                    <div className="w-100 h-100" style={{ background: 'rgba(0,0,0,0.5)' }}></div>
                </div>
            )}
            
            <div className="container py-5" style={{ marginTop: article.image_couverture ? '-150px' : '0', position: 'relative', zIndex: 10 }}>
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <Link to="/blog" className={`btn btn-link text-decoration-none p-0 mb-4 fw-bold ${article.image_couverture ? 'text-white' : 'text-success'}`}>
                            <ArrowLeft size={16} className="me-2" /> Retour au blog
                        </Link>
                        
                        <div className="card border-0 rounded-4 shadow-lg p-4 p-md-5" style={{ background: '#fff' }}>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">
                                    <Tag size={12} className="me-1" /> {article.categorie}
                                </span>
                            </div>
                            
                            <h1 className="fw-bold mb-4" style={{ color: '#1A1C19', lineHeight: '1.2' }}>{article.titre}</h1>
                            
                            <div className="d-flex flex-wrap align-items-center gap-4 py-3 border-top border-bottom border-light mb-5">
                                <div className="d-flex align-items-center gap-2 text-muted small">
                                    <User size={16} /> <span>Par <strong>{article.auteur}</strong></span>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted small">
                                    <Clock size={16} /> <span>{article.date}</span>
                                </div>
                                <div className="text-muted small ms-auto">
                                    {article.vues} vues
                                </div>
                            </div>

                            <div className="article-content" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#4a5568' }}
                                 dangerouslySetInnerHTML={{ __html: article.contenu.replace(/\n/g, '<br/>') }}>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleSingle;

