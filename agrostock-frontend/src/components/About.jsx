import React from 'react';

const About = () => {
    return (
        <section id="apropos" className="py-5" style={{ background: '#ffffff', overflow: 'hidden' }}>
            <div className="container py-5 mt-md-4">
                <div className="row align-items-center mb-5">
                    
                    {/* Left: Illustrations / Image Placeholder */}
                    <div className="col-12 col-lg-5 mb-5 mb-lg-0 position-relative">
                        {/* Decorative background blob */}
                        <div 
                            className="position-absolute rounded-circle"
                            style={{
                                width: '300px',
                                height: '300px',
                                background: 'rgba(26, 178, 115, 0.08)',
                                top: '-20px',
                                left: '-20px',
                                zIndex: 0
                            }}
                        />
                        <div className="position-relative" style={{ zIndex: 1 }}>
                            {/* Main Image Box */}
                            <div 
                                className="rounded-4 overflow-hidden shadow-lg"
                                style={{
                                    height: '420px',
                                    background: 'linear-gradient(135deg, #105c38 0%, #1ab273 100%)',
                                    position: 'relative'
                                }}
                            >
                                {/* Abstract pattern or wait for real image */}
                                <svg className="w-100 h-100 opacity-25" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                                    <defs>
                                        <pattern id="lines" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <path d="M 20 0 L 0 20 M 0 0 L 20 20" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#lines)" />
                                </svg>

                                <div className="position-absolute bottom-0 start-0 w-100 bg-white p-4" style={{ borderTopRightRadius: '30px' }}>
                                    <h4 className="fw-bold mb-0" style={{ color: '#1A1C19' }}>Qualite & Origine</h4>
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>100% transforme au Benin.</p>
                                </div>
                            </div>
                            
                            {/* Floating "Experience" Box */}
                            <div 
                                className="position-absolute bg-white rounded-4 shadow-lg p-3 d-flex align-items-center gap-3"
                                style={{
                                    bottom: '60px',
                                    right: '-30px',
                                    border: '1px solid #f1f5f9'
                                }}
                            >
                                <div 
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{ width: '50px', height: '50px', background: '#e0f2e9', color: '#105c38' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                    </svg>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-0" style={{ color: '#1A1C19' }}>Verifie</h5>
                                    <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>Producteurs certifies</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="col-12 col-lg-6 offset-lg-1">
                        <div 
                            className="d-inline-flex align-items-center justify-content-center px-3 py-1 mb-3 rounded-pill"
                            style={{ background: 'rgba(26, 178, 115, 0.1)', color: '#105c38', fontWeight: '600', fontSize: '0.9rem' }}
                        >
                            A Propos de Nous
                        </div>
                        
                        <h2 className="fw-bold mb-4" style={{ color: '#1A1C19', fontSize: '2.5rem', lineHeight: '1.2' }}>
                            Nous valorisons l'excellence de l'<span style={{ color: '#1ab273' }}>agroalimentaire</span> Beninois.
                        </h2>
                        
                        <p style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.7' }}>
                            AgroStock Benin est ne d'une vision simple : connecter directement les transformateurs locaux talentueux avec les acheteurs, supermarches et exportateurs, sans intermediaires superflus. Nous croyons au potentiel du "Made in Benin".
                        </p>

                        <div className="d-flex flex-column gap-4 mb-5">
                            {[
                                { 
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.809c0-.859-.652-1.61-1.492-1.736L12 6.5l-7.758 1.573c-.84.17-1.492.922-1.492 1.781V21M6 12.375h1.5m1.5 0h1.5m1.5 0h1.5m1.5 0h1.5" />,
                                    title: "Autonomisation locale",
                                    text: "Developper les capacites des cooperatives agroalimentaires du pays en facilitant la distribution de leurs produits."
                                },
                                {
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />,
                                    title: "Tracabilite & Qualite",
                                    text: "Assurer la securite alimentaire grace a un systeme rigoureux de verification et de certification de chaque vendeur."
                                }
                            ].map((item, index) => (
                                <div className="d-flex gap-3" key={index}>
                                    <div 
                                        className="d-flex flex-shrink-0 align-items-center justify-content-center rounded-circle"
                                        style={{ width: '48px', height: '48px', background: '#eefcf5', color: '#1ab273' }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            {item.icon}
                                        </svg>
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-1" style={{ color: '#1A1C19', fontSize: '1.15rem' }}>{item.title}</h5>
                                        <p className="mb-0 text-muted" style={{ fontSize: '0.95rem' }}>{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a 
                            href="/transformateurs" 
                            className="btn rounded-pill px-4 py-3"
                            style={{
                                background: '#105c38',
                                color: '#ffffff',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 8px 20px rgba(16, 92, 56, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Decouvrir nos transformateurs
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
