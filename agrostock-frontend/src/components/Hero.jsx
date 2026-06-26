import React, { useState, useEffect } from 'react';
import { ShoppingBag, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const heroImages = [
    '/images/hero/slide1.jpg',
    '/images/hero/slide2.jpg',
    '/images/hero/slide3.png',
    '/images/hero/slide4.jpg',
];

const statsData = [
    { value: '150+', label: 'Transformateurs' },
    { value: '1 200+', label: 'Produits' },
    { value: '500+', label: 'Commandes' },
    { value: '12', label: 'Departements' },
];

const marqueeItems = [
    'Paiement securise en escrow',
    'Retrait avec code + OTP',
    'Produits locaux certifies',
    'Livraison organisee rapidement',
    'Support et gestion des litiges',
];

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loadedImages, setLoadedImages] = useState(() => new Set([0]));
    const navigate = useNavigate();

    useEffect(() => {
        heroImages.forEach((src, index) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                setLoadedImages((prev) => {
                    if (prev.has(index)) return prev;
                    const next = new Set(prev);
                    next.add(index);
                    return next;
                });
            };
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="accueil" className="position-relative overflow-hidden" style={{ minHeight: '90vh', background: '#000' }}>
            {/* Slideshow background */}
            {heroImages.map((img, index) => {
                const isActive = index === currentSlide;
                const isLoaded = loadedImages.has(index);

                return (
                    <motion.div
                        key={img}
                        initial={false}
                        animate={{
                            opacity: isActive ? 1 : 0,
                            scale: isActive ? 1 : 1.04,
                        }}
                        transition={{ duration: 0.65, ease: 'easeInOut' }}
                        className="position-absolute w-100 h-100"
                        style={{
                            backgroundImage: `url(${img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            zIndex: 0,
                            visibility: isLoaded || isActive ? 'visible' : 'hidden',
                        }}
                    />
                );
            })}

            {/* Premium Overlays */}
            <div className="position-absolute w-100 h-100 bg-black/60" style={{ zIndex: 1 }} />
            <div
                className="position-absolute w-100 h-100"
                style={{
                    zIndex: 2,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.9) 100%)'
                }}
            />
            <div
                className="position-absolute w-100 h-100"
                style={{
                    zIndex: 2,
                    background: 'linear-gradient(to bottom, transparent 40%, rgba(10, 26, 18, 0.9) 100%)'
                }}
            />
            {/* Content Container */}
            <div className="container position-relative h-100 d-flex flex-column justify-content-center py-5 pt-lg-0" style={{ zIndex: 10, minHeight: '90vh', paddingBottom: '96px' }}>
                <div className="row justify-content-center text-center">
                    <div className="col-lg-10 col-xl-9 mt-5 mt-lg-5">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <h1 className="fw-bold text-white mb-4 lh-sm px-md-5" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                                La plateforme des produits <span className="text-success">agroalimentaires</span> transformés au Benin.
                            </h1>

                            <p className="lead text-white mb-5 mx-auto px-md-5" style={{ maxWidth: '850px', lineHeight: '1.7', textShadow: '0 2px 8px rgba(0,0,0,0.6)', fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', fontWeight: '500', opacity: 0.95 }}>
                                Commandez directement aupres des transformateurs locaux certifies :  jus, farines, huiles, conserves et bien plus.
                            </p>

                            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 gap-md-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/catalogue')}
                                    className="btn btn-success btn-lg w-100 w-sm-auto px-4 px-md-5 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg text-break-anywhere"
                                >
                                    <ShoppingBag size={20} />
                                    Decouvrir le Catalogue
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'register' } }))}
                                    className="btn btn-outline-light btn-lg w-100 w-sm-auto px-4 px-md-5 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 backdrop-blur-md text-break-anywhere"
                                >
                                    Creer votre Boutique
                                    <UserPlus size={20} />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Stats Bottom Strip - Refined version inside the container */}
                <div className="mt-auto pb-5 pt-4">
                    <div className="row g-4 justify-content-center">
                        {statsData.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                className="col-6 col-md-3"
                            >
                                <div className="p-3 p-md-4 rounded-4 bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 transition-all cursor-default shadow-lg">
                                    <h3 className="display-6 fw-bold text-success mb-1">{stat.value}</h3>
                                    <p className="text-white text-uppercase mb-0 fw-bold small tracking-widest">{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Bottom Marquee */}
            <div className="hero-marquee" style={{ zIndex: 20 }}>
                <div className="hero-marquee__track">
                    {[...marqueeItems, ...marqueeItems].map((item, index) => (
                        <span key={`${item}-${index}`} className="hero-marquee__item">
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <style>{`
                .hero-marquee {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                    border-top: 1px solid rgba(255,255,255,0.18);
                    background: linear-gradient(90deg, rgba(8, 32, 21, 0.95), rgba(18, 74, 48, 0.9));
                    backdrop-filter: blur(6px);
                    box-shadow: 0 -6px 24px rgba(26, 178, 115, 0.28), inset 0 1px 0 rgba(255,255,255,0.14);
                    isolation: isolate;
                }

                .hero-marquee::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -30%;
                    width: 30%;
                    height: 100%;
                    background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.42) 50%, transparent 100%);
                    filter: blur(2px);
                    animation: marqueeShine 4.8s ease-in-out infinite;
                    z-index: 1;
                }

                .hero-marquee__track {
                    width: max-content;
                    display: flex;
                    align-items: center;
                    gap: 2.5rem;
                    white-space: nowrap;
                    padding: 0.85rem 0;
                    animation: heroMarquee 26s linear infinite;
                    position: relative;
                    z-index: 2;
                }

                .hero-marquee__item {
                    color: #d9fbe8;
                    font-size: 0.86rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    position: relative;
                    padding-left: 1.2rem;
                    text-shadow: 0 0 8px rgba(64, 241, 157, 0.42), 0 0 16px rgba(64, 241, 157, 0.22);
                }

                .hero-marquee__item::before {
                    content: '';
                    width: 0.42rem;
                    height: 0.42rem;
                    border-radius: 999px;
                    background: #1ab273;
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    box-shadow: 0 0 0 4px rgba(26, 178, 115, 0.16);
                }

                @keyframes heroMarquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }


                @keyframes marqueeShine {
                    0% { transform: translateX(0); opacity: 0; }
                    15% { opacity: 0.9; }
                    55% { opacity: 0.35; }
                    100% { transform: translateX(460%); opacity: 0; }
                }
            `}</style>
        </section>
    );
};

export default Hero;
