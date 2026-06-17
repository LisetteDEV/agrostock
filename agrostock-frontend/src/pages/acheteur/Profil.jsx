import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Lock, Camera, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const Profil = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uiMessage, setUiMessage] = useState('');
    
    // Simulate states
    const [nom, setNom] = useState(user?.nom_complet || 'Acheteur AgroStock');
    const [telephone, setTelephone] = useState(user?.telephone || '+229 01 01 01 01');
    const [email, setEmail] = useState(user?.email || 'acheteur@example.com');
    const [adresse, setAdresse] = useState('Non renseigne');

    const handleSave = (e) => {
        e.preventDefault();
        setUiMessage('');
        setLoading(true);
        setTimeout(() => {
            setUiMessage('Profil mis a jour avec succes.');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="bg-light min-vh-100 pb-5" style={{ paddingTop: '100px' }}>
            <div className="container">
                <h2 className="fw-bold mb-4" style={{ color: '#0f3a23' }}>Mon Profil</h2>
                {uiMessage && (
                    <div className="alert alert-success border-0 rounded-3 shadow-sm">{uiMessage}</div>
                )}
                
                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="bg-white rounded-4 p-4 shadow-sm text-center border" style={{ borderColor: '#e1e9e4' }}>
                            <div className="position-relative d-inline-block mb-3">
                                <div className="bg-success bg-opacity-10 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '120px', height: '120px' }}>
                                    <User size={50} className="text-success" />
                                </div>
                                <button className="btn btn-success rounded-circle position-absolute bottom-0 end-0 p-2 shadow" style={{ transform: 'translate(10%, 10%)' }}>
                                    <Camera size={16} />
                                </button>
                            </div>
                            <h5 className="fw-bold text-dark">{nom}</h5>
                            <p className="text-muted small mb-0">Membre depuis Juin 2026</p>
                            <span className="badge bg-success bg-opacity-10 text-success mt-2 rounded-pill px-3">Compte Acheteur</span>
                        </div>
                    </div>
                    
                    <div className="col-lg-8">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-4 p-4 shadow-sm border" style={{ borderColor: '#e1e9e4' }}>
                            <h5 className="fw-bold mb-4 border-bottom pb-3">Informations Personnelles</h5>
                            <form onSubmit={handleSave}>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold">Nom Complet</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><User size={18} className="text-muted" /></span>
                                            <input type="text" className="form-control border-start-0 ps-0" value={nom} onChange={e => setNom(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold">Adresse Email</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted" /></span>
                                            <input type="email" className="form-control border-start-0 ps-0" value={email} onChange={e => setEmail(e.target.value)} readOnly />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold">Telephone</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><Phone size={18} className="text-muted" /></span>
                                            <input type="tel" className="form-control border-start-0 ps-0" value={telephone} onChange={e => setTelephone(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold">Adresse de livraison par defaut</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><MapPin size={18} className="text-muted" /></span>
                                            <input type="text" className="form-control border-start-0 ps-0" value={adresse} onChange={e => setAdresse(e.target.value)} />
                                        </div>
                                    </div>
                                    
                                    <div className="col-12 mt-5">
                                        <h5 className="fw-bold mb-4 border-bottom pb-3">Securite</h5>
                                    </div>
                                    
                                    <div className="col-md-6 mt-0">
                                        <label className="form-label text-muted small fw-bold">Nouveau mot de passe</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted" /></span>
                                            <input type="password" className="form-control border-start-0 ps-0" placeholder="********" />
                                        </div>
                                    </div>
                                    
                                    <div className="col-12 text-end mt-4">
                                        <button type="submit" disabled={loading} className="btn btn-success px-4 py-2 rounded-pill fw-bold d-inline-flex align-items-center gap-2">
                                            {loading ? <span className="spinner-border spinner-border-sm" /> : <Save size={18} />}
                                            Enregistrer les modifications
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profil;


