import React, { useState } from 'react';
import Hero from '../../components/Hero';
import HowItWorks from '../../components/HowItWorks';
import Products from '../../components/Products';
import Processors from '../../components/Processors';
import MapSection from '../../components/MapSection';
import Testimonials from '../../components/Testimonials';
import Newsletter from '../../components/Newsletter';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Award, ChevronDown, MessageCircleQuestion } from 'lucide-react';

const PremiumSection = () => {
    const features = [
        'Catalogue illimite de vos produits',
        'Badge Premium et affichage prioritaire',
        'Statistiques avancees des vues',
        'Gestion automatisee des stocks',
        'Export commandes (CSV/PDF)',
        'Codes promos et offres limitees',
        'Assistant IA pour votre FAQ',
        'Certification qualite verifiee',
        'Analyse comparative du marche',
    ];

    return (
        <section className="py-5 px-3 px-md-4" style={{ background: '#f0f2f1' }}>
            <div style={{ background: '#0a1a12', color: 'white', borderRadius: '32px', overflow: 'hidden', position: 'relative', maxWidth: '100%' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none' }}>
                    <div
                        className="position-absolute"
                        style={{
                            top: '-10%', left: '-5%', width: '500px', height: '500px',
                            background: 'radial-gradient(circle, rgba(26, 178, 115, 0.15) 0%, transparent 70%)',
                            borderRadius: '50%'
                        }}
                    />
                    <div
                        className="position-absolute"
                        style={{
                            bottom: '-10%', right: '-5%', width: '600px', height: '600px',
                            background: 'radial-gradient(circle, rgba(26, 178, 115, 0.1) 0%, transparent 70%)',
                            borderRadius: '50%'
                        }}
                    />
                </div>

                <div className="container py-5 position-relative" style={{ zIndex: 1 }}>
                    <div className="row align-items-center g-5">
                        <div className="col-lg-7">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="fw-bold mb-4" style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}>
                                    Propulsez votre activite au <span style={{ color: '#1ab273' }}>Niveau Premium</span>
                                </h2>
                                <p className="lead mb-5 border-start border-3 border-success ps-4 py-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Accedez a des outils de pointe pour transformer votre petite entreprise en leader de l'agroalimentaire.
                                </p>

                                <div className="row g-3">
                                    {features.map((feature, index) => (
                                        <div key={index} className="col-md-6 col-lg-4">
                                            <div className="d-flex align-items-center gap-2 p-2 rounded-3">
                                                <div className="text-success">
                                                    <CheckCircle size={18} />
                                                </div>
                                                <span className="small fw-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{feature}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <div className="col-lg-5">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="card border-0 p-5 rounded-5 shadow-lg position-relative overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(5,46,22,0.88) 0%, rgba(6,95,70,0.72) 100%), url(/images/hero/slide4.png) center/cover',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                <div className="position-absolute top-0 end-0 p-4 opacity-25">
                                    <Award size={96} strokeWidth={1} />
                                </div>

                                <div className="text-center position-relative" style={{ zIndex: 1, textShadow: '0 2px 5px rgba(0,0,0,0.6)' }}>
                                    <h3 className="fw-bold mb-2 text-uppercase small" style={{ color: '#e2e8f0', letterSpacing: '0.12em' }}>AgroStock Pro</h3>
                                    <div className="d-flex justify-content-center align-items-baseline mb-4">
                                        <span className="display-2 fw-bold text-success">5.000</span>
                                        <span className="fs-5 ms-1 fw-bold" style={{ color: '#e2e8f0' }}>FCFA / mois</span>
                                    </div>

                                    <div className="mb-4 text-start small fw-bold" style={{ color: '#f8fafc', lineHeight: '2' }}>
                                        <p className="mb-2 d-flex align-items-center gap-2"><span className="text-success">+</span> Support prioritaire 24/7</p>
                                        <p className="mb-2 d-flex align-items-center gap-2"><span className="text-success">+</span> Sans engagement</p>
                                        <p className="mb-4 d-flex align-items-center gap-2"><span className="text-success">+</span> 15 jours d'essai gratuits</p>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'register' } }))}
                                        className="btn btn-success btn-lg w-100 py-3 rounded-pill fw-bold shadow-lg"
                                    >
                                        S'abonner maintenant
                                    </motion.button>
                                    <p className="mt-4 mb-0 fw-bold small" style={{ color: '#f8fafc' }}>
                                        Paiement securise via Mobile Money ou carte bancaire
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const FAQSection = () => {
    const faqs = [
        {
            q: 'Comment passer une commande sur AgroStock ?',
            a: 'Ajoutez vos produits au panier, choisissez le mode de livraison, puis validez le paiement simule. Le vendeur confirme ensuite la commande dans son dashboard.'
        },
        {
            q: 'Quelle est la difference entre achat en gros et en detail ?',
            a: 'Le mode gros applique le prix de gros et demande une quantite minimale de 20 unites. Le mode detail utilise le prix unitaire standard.'
        },
        {
            q: 'Le paiement est-il securise sur la plateforme ?',
            a: 'Oui. Le flux est simule comme un paiement Mobile Money, puis les fonds sont traces jusqu a la confirmation de reception.'
        },
        {
            q: 'Puis-je suivre ma commande en temps reel ?',
            a: 'Oui. Les statuts evoluent dans votre espace acheteur: en attente, confirmee, en cours de livraison, livree, puis recue.'
        },
        {
            q: 'Comment devenir transformateur et publier mes produits ?',
            a: 'Creez un compte transformateur, completez le profil entreprise, puis publiez vos produits avec prix, stock, photos et mode de vente.'
        },
        {
            q: 'Est-ce que je peux modifier le stock et les prix apres publication ?',
            a: 'Oui. Depuis le dashboard transformateur, vous pouvez modifier prix detail, prix gros, stock et informations du produit a tout moment.'
        },
        {
            q: 'Que faire en cas de litige sur une commande ?',
            a: 'Un litige peut etre ouvert depuis votre espace de commande. L administration analyse le dossier et applique la resolution adaptee.'
        },
        {
            q: 'AgroStock est-il reserve au Benin ?',
            a: 'La plateforme est concue pour le marche local beninois, avec une logique operationnelle adaptee aux acheteurs et transformateurs du pays.'
        }
    ];

    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section id="faq" className="py-5" style={{ background: 'linear-gradient(180deg, #f6faf7 0%, #eef5f1 100%)' }}>
            <div className="faq-marquee">
                <div className="faq-marquee__track">
                    {[
                        'FAQ AGROSTOCK',
                        'ACHAT SECURISE',
                        'SUIVI DES COMMANDES',
                        'LITIGES GERES',
                        'VENTE EN GROS ET DETAIL',
                        'SUPPORT REACTIF'
                    ].concat([
                        'FAQ AGROSTOCK',
                        'ACHAT SECURISE',
                        'SUIVI DES COMMANDES',
                        'LITIGES GERES',
                        'VENTE EN GROS ET DETAIL',
                        'SUPPORT REACTIF'
                    ]).map((item, idx) => (
                        <span key={`${item}-${idx}`} className="faq-marquee__item">{item}</span>
                    ))}
                </div>
            </div>

            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-5"
                >
                    <span className="badge rounded-pill px-3 py-2 mb-3" style={{ background: 'rgba(26,178,115,0.15)', color: '#0f5a39' }}>
                        <MessageCircleQuestion size={14} className="me-1" /> FAQ
                    </span>
                    <h2 className="fw-bold" style={{ color: '#102e1e' }}>Questions frequentes</h2>
                    <p className="text-muted mb-0">Tout ce qu il faut savoir pour acheter, vendre et gerer vos commandes sur AgroStock.</p>
                </motion.div>

                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="d-grid gap-3">
                            {faqs.map((item, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <motion.div
                                        key={item.q}
                                        initial={{ opacity: 0, y: 14 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.04 }}
                                        className="rounded-4 border overflow-hidden"
                                        style={{
                                            background: '#ffffff',
                                            borderColor: isOpen ? 'rgba(26,178,115,0.55)' : '#dbe7e0',
                                            boxShadow: isOpen ? '0 16px 36px rgba(16,46,30,0.10)' : '0 8px 20px rgba(16,46,30,0.05)'
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                            className="w-100 bg-transparent border-0 p-4 text-start d-flex align-items-center justify-content-between"
                                        >
                                            <span className="fw-semibold pe-3" style={{ color: '#153626', fontSize: '1.03rem' }}>{item.q}</span>
                                            <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                <ChevronDown size={20} color="#1ab273" />
                                            </motion.span>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    key="answer"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.22 }}
                                                >
                                                    <div className="px-4 pb-4 pt-0 text-muted" style={{ lineHeight: '1.75' }}>
                                                        {item.a}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .faq-marquee {
                    overflow: hidden;
                    border-top: 1px solid rgba(16,46,30,0.08);
                    border-bottom: 1px solid rgba(16,46,30,0.08);
                    background: linear-gradient(90deg, #123625, #1a5a3b, #123625);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 18px rgba(16,46,30,0.1);
                    margin-bottom: 2.2rem;
                }

                .faq-marquee__track {
                    width: max-content;
                    display: flex;
                    align-items: center;
                    gap: 2.2rem;
                    padding: 0.72rem 0;
                    white-space: nowrap;
                    animation: faqMarquee 24s linear infinite;
                }

                .faq-marquee__item {
                    color: #e7fff2;
                    font-weight: 800;
                    font-size: 0.78rem;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    position: relative;
                    padding-left: 1rem;
                    text-shadow: 0 0 8px rgba(26,178,115,0.45);
                }

                .faq-marquee__item::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 0.38rem;
                    height: 0.38rem;
                    border-radius: 999px;
                    background: #73f2b9;
                    box-shadow: 0 0 0 4px rgba(115,242,185,0.2);
                }

                @keyframes faqMarquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </section>
    );
};

const Accueil = () => {
    return (
        <div style={{ paddingTop: '85px' }}>
            <Hero />
            <HowItWorks />
            <Products />
            <Processors />
            <PremiumSection />
            <MapSection />
            <Testimonials />
            <FAQSection />
            <Newsletter />
        </div>
    );
};

export default Accueil;


