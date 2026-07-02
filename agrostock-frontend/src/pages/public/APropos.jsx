import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Target, TrendingUp, Globe, Users, ShieldCheck, Zap, Award, Store, Rocket } from 'lucide-react';

const APropos = () => {
    return (
        <div style={{ background: '#fcfdfc', minHeight: '100vh' }}>
            {/* Hero Section */}
            {/* Hero Section */}
            <section
                className="position-relative overflow-hidden"
                style={{
                    padding: '80px 0 50px 0',
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
                                    <Target size={14} className="me-2" />
                                    A PROPOS D'AGROSTOCK BENIN
                                </span>
                                <h1 className="fw-bold text-white mb-4 display-4" style={{ letterSpacing: '-1px' }}>
                                    Mettre la technologie au service <br className="d-none d-lg-block" /> des <span style={{ color: '#4ade80' }}>Transformateurs agroalimentaires locaux</span>
                                </h1>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="py-5" style={{ marginTop: '-60px', position: 'relative', zIndex: 3 }}>
                <div className="container">
                    <div className="card border-0 shadow-xl rounded-4 overflow-hidden mb-5">
                        <div className="p-4 p-lg-5 bg-white">
                            <div className="row g-5">
                                <div className="col-lg-12">
                                    <div className="mb-5">
                                        <h2 className="display-6 fw-bold mb-4" style={{ color: '#0e4b2d' }}>Notre Constat</h2>
                                        <p className="lead text-dark mb-4" style={{ lineHeight: '1.8' }}>
                                  Au Benin, des femmes, des cooperatives et des artisans transforment chaque jour des matieres premieres locales en produits de qualite tels que les  jus naturels, farines enrichies, huiles vegetales, conserves et autres. Pourtant leur visibilite reste limitee a leur quartier ou leur reseau de proximite. </p> 
                                        <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                                  Pendant ce temps, des acheteurs au Benin et a l'etranger cherchent exactement ces produits sans savoir ou les trouver. Le probleme n'est pas la qualite de la production , c'est l'absence d'un espace fiable pour connecter ces deux mondes.
                                                                               </p>
                                    </div>

                                    <div className="p-4 p-lg-5 rounded-4 mb-5" style={{ background: 'linear-gradient(135deg, #f0fbf5 0%, #ffffff 100%)', border: '1px solid rgba(26, 178, 115, 0.2)' }}>
                                        <h2 className="fw-bold mb-4" style={{ color: '#0e4b2d' }}>L'Innovation AgroStock</h2>
                                        <p className="text-dark mb-4" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                                            Face a cette realite, nous avons imagine <strong>AgroStock Benin</strong> : une plateforme numerique innovante qui met en relation directe les transformateurs agroalimentaires locaux et les acheteurs, qu'ils soient a Parakou, a Cotonou ou a l'international.
                                        </p>
                                        <p className="text-dark mb-4" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                                         Aujourd'hui de nombreux transformateurs utilisent Facebook et TikTok pour se faire connaitre . Mais ces outils ont leurs limites : pas de commandes structurees, pas de paiement securise, pas de suivi de livraison, pas de catalogue professionnel. On peut avoir des milliers de vues sur une video et rater une vente faute d'outil adapte. AgroStock Benin ne remplace pas les reseaux sociaux , elle les complete. Les transformateurs continuent d'attirer leur audience sur TikTok et Facebook, et redirigent leurs clients vers AgroStock pour commander, payer et etre livres en toute confiance.                                        </p>
                                        <p className="text-muted mb-0" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                                            Au-dela d'une simple marketplace, AgroStock Benin est un outil de valorisation du savoir-faire beninois, de promotion de la consommation locale et de developpement economique durable.
                                        </p>
                                    </div>

                                    <div className="mb-5">
                                        <h2 className="fw-bold mb-4" style={{ color: '#0e4b2d' }}>Notre Mission</h2>
                                        <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                                        Notre mission est simple : que chaque transformateur beninois, qu'il soit a Cotonou, a Natitingou ou a Lokossa, puisse vendre ses produits partout au Benin et au-dela des frontieres , et que chaque acheteur, local ou international, sache exactement ce qu'il commande, a qui, et pour quel prix. AgroStock Benin est la vitrine que le savoir-faire beninois meritait depuis longtemps.                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-5 text-center">
                        <h2 className="display-6 fw-bold mb-5" style={{ color: '#0e4b2d' }}>Nous oeuvrons pour :</h2>
                        <div className="row g-4 text-start">
                            {[
                                { text: "Valoriser les produits transformes localement", icon: <Award className="text-success" /> },
                                { text: "Accroitre la visibilite des PME, cooperatives et artisans agroalimentaires", icon: <Globe className="text-success" /> },
                                { text: "Favoriser la consommation des produits \"Made in Benin\"", icon: <Heart className="text-success" style={{ color: '#e63946' }} /> },
                                { text: "Renforcer les echanges commerciaux entre producteurs et acheteurs", icon: <Users className="text-success" /> },
                                { text: "Digitaliser les processus de vente et de paiement", icon: <Zap className="text-success" /> },
                                { text: "Contribuer a la creation de richesse et d'emplois dans le secteur agroalimentaire", icon: <TrendingUp className="text-success" /> },
                                { text: "Soutenir le developpement d'une economie locale plus forte et plus competitive", icon: <Rocket className="text-success" /> }
                            ].map((item, i) => (
                                <div className="col-lg-6 col-xl-4" key={i}>
                                    <motion.div 
                                        whileHover={{ y: -5 }}
                                        className="d-flex align-items-center gap-3 p-4 bg-white rounded-4 shadow-sm h-100"
                                        style={{ border: '1px solid rgba(0,0,0,0.03)' }}
                                    >
                                        <div className="bg-success/10 p-3 rounded-3 flex-shrink-0">
                                            {React.cloneElement(item.icon, { size: 24 })}
                                        </div>
                                        <span className="fw-medium text-dark lh-sm">{item.text}</span>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="py-5 mb-5 mt-4 position-relative overflow-hidden" style={{ 
                    background: 'linear-gradient(135deg, #0e4b2d 0%, #1ab273 100%)',
                    boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.1)',
                    width: '100%'
                }}>
                    <div className="position-absolute w-100 h-100 top-0 start-0" style={{ opacity: 0.14, zIndex: 1 }}>
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid-partners" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid-partners)" />
                        </svg>
                    </div>

                    <div className="container position-relative" style={{ zIndex: 2 }}>
                        <div className="text-center mb-5">
                            <h6 className="badge rounded-pill bg-white/20 text-white px-3 py-2 mb-3" style={{ fontSize: '0.75rem', letterSpacing: '2px' }}>ECOSYSTEME</h6>
                            <h2 className="fw-bold text-white display-6" style={{ letterSpacing: '-0.5px' }}>Nos Partenaires Strategiques</h2>
                        </div>
                    </div>

                    <div className="marquee-wrapper mt-4" style={{ position: 'relative', zIndex: 2, overflow: 'hidden' }}>
                        <div className="position-absolute h-100 w-25 top-0 start-0" style={{ background: 'linear-gradient(to right, #0e4b2d, transparent)', zIndex: 3, pointerEvents: 'none' }} />
                        <div className="position-absolute h-100 w-25 top-0 end-0" style={{ background: 'linear-gradient(to left, #179c65, transparent)', zIndex: 3, pointerEvents: 'none' }} />

                        <div className="marquee-content d-flex gap-5 align-items-center py-4">
                            {[...Array(2)].map((_, idx) => (
                                <div key={idx} className="marquee-track d-flex gap-5 align-items-center">
                                    {[
                                        { name: "MTN Mobile Money", icon: <Zap size={24} /> },
                                        { name: "Moov Money", icon: <ShieldCheck size={24} /> },
                                        { name: "CCIB Benin", icon: <Store size={24} /> },
                                        { name: "Ministere Agriculture", icon: <Award size={24} /> },
                                        { name: "Cooperatives Benin", icon: <Users size={24} /> },
                                        { name: "Logistique Benin", icon: <Globe size={24} /> }
                                    ].map((partner, i) => (
                                        <div 
                                            className="d-flex align-items-center gap-3 px-4 py-3 bg-white rounded-pill shadow-lg"
                                            style={{ border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}
                                            key={i}
                                        >
                                            <div className="text-success">{partner.icon}</div>
                                            <span className="fw-bold text-dark" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                                                {partner.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <style>
                        {`
                            .marquee-track { animation: scroll 40s linear infinite; }
                            .marquee-wrapper:hover .marquee-track { animation-play-state: paused; }
                            @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
                            .marquee-content { width: max-content; }
                        `}
                    </style>
                </div>

                <div className="container pb-5">
                    <div className="mt-5">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-5 rounded-5 text-center text-white shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #0e4b2d 0%, #1ab273 100%)' }}
                        >
                            <h2 className="fw-bold mb-4">Notre Vision</h2>
                            <p className="lead mx-auto mb-0" style={{ maxWidth: '800px', lineHeight: '1.8' }}>
                                Notre vision est de devenir la plateforme de reference pour la commercialisation des produits agroalimentaires transformes au Benin et, a terme, dans toute la sous-region ouest-africaine.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const Heart = ({ className, size, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);

export default APropos;






