import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import EtoilesAvis from './EtoilesAvis';

const CarteProduit = ({ product }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-100"
        >
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative transition-all hover-up bg-white">
                <Link to={`/produit/${product.id}`} className="text-decoration-none text-dark">
                    <div className="position-relative" style={{ height: '220px' }}>
                        <img src={product.img} className="w-100 h-100 object-fit-cover" loading="lazy" alt={product.name} />
                        <div className="position-absolute top-0 end-0 m-3">
                            <span className="badge bg-white text-dark shadow-sm rounded-pill px-3 py-2 border-0">{product.category}</span>
                        </div>
                    </div>
                    <div className="card-body p-4">
                        <p className="small text-muted mb-1 text-uppercase fw-semibold" style={{ letterSpacing: '0.5px' }}>{product.provider}</p>
                        <h5 className="fw-bold mb-2 text-truncate" title={product.name}>{product.name}</h5>
                        
                        <div className="mb-3">
                            <EtoilesAvis rating={product.rating || 4.5} />
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="fw-bold text-success fs-5">{product.price}</span>
                            <button className="btn btn-sm rounded-pill px-3 py-2" style={{ background: 'rgba(26, 178, 115, 0.1)', color: '#1ab273', border: 'none' }}>
                                Details
                            </button>
                        </div>
                    </div>
                </Link>
                
                {/* Add to cart bubble */}
                <button 
                    className="position-absolute btn btn-success shadow-sm rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ width: '40px', height: '40px', bottom: '110px', right: '20px', background: '#1ab273', border: 'none', transform: 'translateY(50%)', zIndex: 10 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
            </div>
        </motion.div>
    );
};

export default CarteProduit;
