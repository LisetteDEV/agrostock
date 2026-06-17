import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favoris = () => {
    return (
        <div className="bg-light min-vh-100 pb-5" style={{ paddingTop: '100px' }}>
            <div className="container">
                <h2 className="fw-bold mb-4" style={{ color: '#0f3a23' }}>Mes Favoris</h2>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-4 shadow-sm text-center border" style={{ borderColor: '#e1e9e4' }}>
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: '80px', height: '80px', background: 'rgba(220, 53, 69, 0.1)' }}>
                        <Heart size={40} className="text-danger" fill="#dc3545" />
                    </div>
                    <h4 className="fw-bold text-dark">Votre liste de favoris est vide</h4>
                    <p className="text-muted mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
                        Retrouvez ici tous les produits que vous avez enregistres pour les acheter plus tard. 
                        Parcourez notre catalogue et cliquez sur l'icone cÅ“ur pour commencer.
                    </p>
                    <Link to="/catalogue" className="btn btn-success px-5 py-3 rounded-pill fw-bold d-inline-flex align-items-center gap-2 shadow-sm">
                        <ShoppingBag size={20} /> Explorer le catalogue
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Favoris;
