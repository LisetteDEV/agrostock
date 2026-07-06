import React, { useEffect, useState } from 'react';
import { API_URL } from '../services/config';
const StarRating = ({ rating, size = 16 }) => (
    <div className="d-flex gap-1">
        {[1,2,3,4,5].map(i => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" width={size} height={size}
                fill={i <= rating ? "#f59e0b" : "#e2e8f0"} viewBox="0 0 16 16">
                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
            </svg>
        ))}
    </div>
);

const Testimonials = () => {
    const [avis, setAvis] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/avis/recents`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => setAvis(data.avis || []))
            .catch(() => setAvis([]));
    }, []);

    if (avis.length === 0) return null;

    return (
        <section id="avis" className="py-5" style={{ background: '#f0fdf4', borderTop: '1px solid #bbf7d0' }}>
            <div className="container py-5">
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center px-3 py-1 mb-3 rounded-pill"
                        style={{ background: 'rgba(26, 178, 115, 0.12)', color: '#105c38', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Avis Utilisateurs
                    </div>
                    <h2 className="fw-bold mb-3" style={{ color: '#0f172a', fontSize: '2.5rem', letterSpacing: '-0.5px' }}>
                        Ce que disent nos utilisateurs
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Témoignages vérifiés recueillis après des transactions sur la plateforme AgroStock Bénin.
                    </p>
                </div>

                <div className="row g-4">
                    {avis.map((a, i) => (
                        <div className="col-12 col-md-4" key={i}>
                            <div className="card h-100 p-4 position-relative overflow-hidden"
                                style={{ background: '#ffffff', border: '1px solid #d1fae5', borderRadius: '24px', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.1)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.2)'; e.currentTarget.style.borderColor = '#6ee7b7'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.1)'; e.currentTarget.style.borderColor = '#d1fae5'; }}>
                                <StarRating rating={a.note} />
                                <p style={{ color: '#4a5568', fontSize: '1rem', lineHeight: '1.6' }} className="fst-italic mt-3">
                                    "{a.commentaire}"
                                </p>
                                <div className="d-flex align-items-center gap-3 mt-auto pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                        style={{ width: '48px', height: '48px', background: '#105c38', fontSize: '1.1rem', flexShrink: 0 }}>
                                        {a.acheteur_nom?.charAt(0).toUpperCase() || 'A'}
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0" style={{ color: '#1A1C19' }}>{a.acheteur_nom || 'Acheteur'}</h6>
                                        <span style={{ color: '#1ab273', fontSize: '0.85rem', fontWeight: '500' }}>
                                            A propos de <strong>{a.transformateur_nom}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;

