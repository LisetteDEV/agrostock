import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import EtoilesAvis from './EtoilesAvis';

const CarteTransformateur = ({ seller }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-100"
        >
            <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden transition-all hover-up bg-white">
                <div className="position-relative" style={{ height: '200px' }}>
                    <img src={seller.img} className="w-100 h-100 object-fit-cover" alt={seller.name} />
                    {seller.premium && (
                        <div className="position-absolute top-0 start-0 m-3">
                            <span className="badge rounded-pill px-3 py-2 shadow-lg" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#684501' }}>
                                Premium
                            </span>
                        </div>
                    )}
                </div>
                <div className="card-body p-4 text-center">
                    <h4 className="fw-bold mb-2">{seller.name}</h4>
                    <p className="text-muted small mb-3 d-flex align-items-center justify-content-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="me-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {seller.location}
                    </p>
                    
                    <div className="mb-4 d-flex justify-content-center">
                        <EtoilesAvis rating={seller.rating} />
                    </div>

                    <div className="d-flex justify-content-center gap-3 mb-4 bg-light p-3 rounded-4">
                        <div className="text-center">
                            <div className="fw-bold text-dark">{seller.products}</div>
                            <div className="text-muted x-small text-uppercase">Produits</div>
                        </div>
                        <div className="vr opacity-10"></div>
                        <div className="text-center">
                            <div className="fw-bold text-dark">{seller.specialty.split(' ')[0]}</div>
                            <div className="text-muted x-small text-uppercase">Specialite</div>
                        </div>
                    </div>

                    <div className="d-grid">
                        <Link to={`/transformateur/${seller.id}`} className="btn btn-outline-success rounded-pill py-2 fw-bold transition-all">
                            Visiter Boutique
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CarteTransformateur;
