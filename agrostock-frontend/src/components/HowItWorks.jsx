import React from 'react';
import { 
    Store, Package, Handshake, Search, MessageSquare, 
    ShoppingCart, ArrowRight, CheckCircle2, UserCheck, 
    TrendingUp, ShieldCheck, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
    const navigate = useNavigate();
    return (
        <section id="comment-ca-marche" className="py-5" style={{ background: '#f0f2f1' }}>
            <div className="container py-4 py-lg-5">
                {/* Header Section */}
                <div className="row justify-content-center text-center mb-5">
                    <div className="col-lg-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-success fw-bold text-uppercase ls-2 small mb-2 d-block">Guide d'utilisation</span>
                            <h2 className="fw-bold mb-4" style={{ 
                                color: '#1b4332', 
                                fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
                                letterSpacing: '-1px'
                            }}>
                                Une solution unique pour <span className="text-success">chaque acteur</span>
                            </h2>
                            <p className="text-muted mx-auto px-2" style={{ maxWidth: '650px', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
                                Un processus simple et structure guide Transformateur et Acheteur dans l'utilisation de la plateforme
                            </p>
                        </motion.div>
                    </div>
                </div>

                <div className="row g-4 g-lg-5">
                    {/* Transformateur Pillar */}
                    <div className="col-lg-6 d-flex">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="card border-0 h-100 shadow-lg overflow-hidden w-100"
                            style={{ 
                                borderRadius: 'clamp(24px, 4vw, 40px)',
                                background: 'linear-gradient(135deg, #1b4332 0%, #081c15 100%)',
                                color: '#fff'
                            }}
                        >
                            <div className="card-body p-4 p-xl-5 d-flex flex-column">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-success/20 p-2 p-md-3 rounded-4">
                                        <Store size={window.innerWidth < 768 ? 24 : 32} className="text-success" />
                                    </div>
                                    <h3 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>Transformateur</h3>
                                </div>
                                
                                <p className="text-white/60 mb-4 mb-lg-5 small fw-medium">Exposez votre savoir-faire et atteignez de nouveaux marches.</p>
                                
                                <ul className="list-unstyled mb-5 flex-grow-1">
                                    {[
                                        { icon: <UserCheck size={20} />, title: "Profil Entreprise", desc: "Creez votre compte et completez votre fiche (Logo, Contact)." },
                                        { icon: <Package size={20} />, title: "Vitrine Digitale", desc: "Publiez vos produits avec prix, photos et quantites." },
                                        { icon: <TrendingUp size={20} />, title: "Tableau de Bord", desc: "Gerez vos commandes et repondez aux avis clients." }
                                    ].map((item, i) => (
                                        <li key={i} className="d-flex gap-3 gap-md-4 mb-4">
                                            <div className="mt-1 text-success flex-shrink-0">{item.icon}</div>
                                            <div>
                                                <h6 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>{item.title}</h6>
                                                <p className="extra-small text-white/50 mb-0" style={{ fontSize: '0.85rem' }}>{item.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                
                                <button onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'register' } }))} className="btn btn-success btn-lg w-100 rounded-pill py-3 fw-bold mt-auto shadow-success shadow-lg">
                                    Creer votre Boutique
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Acheteur Pillar */}
                    <div className="col-lg-6 d-flex">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="card h-100 shadow-lg border-0 w-100"
                            style={{ 
                                borderRadius: 'clamp(24px, 4vw, 40px)',
                                background: '#ffffff',
                                border: '1px solid rgba(0,0,0,0.08)'
                            }}
                        >
                            <div className="card-body p-4 p-xl-5 d-flex flex-column">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-success/10 p-2 p-md-3 rounded-4">
                                        <ShoppingCart size={window.innerWidth < 768 ? 24 : 32} className="text-success" />
                                    </div>
                                    <h3 className="fw-bold mb-0 text-dark" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>Acheteur</h3>
                                </div>
                                
                                <p className="text-muted mb-4 mb-lg-5 small fw-medium">Sourcez les meilleurs produits transformes du Benin.</p>
                                
                                <ul className="list-unstyled mb-5 flex-grow-1">
                                    {[
                                        { icon: <Search size={20} />, title: "Exploration Libre", desc: "Consultez le catalogue et les profils sans engagement." },
                                        { icon: <Zap size={20} />, title: "Inscription & Commande", desc: "Inscrivez-vous pour activer votre panier et payer par Mobile Money." },
                                        { icon: <ShieldCheck size={20} />, title: "Suivi & Garantie", desc: "Suivez vos commandes en temps reel et notez vos fournisseurs." }
                                    ].map((item, i) => (
                                        <li key={i} className="d-flex gap-3 gap-md-4 mb-4">
                                            <div className="mt-1 text-success flex-shrink-0">{item.icon}</div>
                                            <div>
                                                <h6 className="fw-bold mb-1" style={{ color: '#1b4332', fontSize: '1rem' }}>{item.title}</h6>
                                                <p className="extra-small text-muted mb-0" style={{ fontSize: '0.85rem' }}>{item.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                
                                <button onClick={() => navigate('/catalogue')} className="btn btn-outline-success btn-lg w-100 rounded-pill py-3 fw-bold mt-auto border-2">
                                    Explorer le catalogue
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
