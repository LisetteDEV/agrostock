import React from 'react';

const Newsletter = () => {
    return (
        <section className="py-5" style={{ background: '#ffffff' }}>
            <div className="container py-2 py-md-4">
                <div 
                    className="row align-items-center p-4 p-md-5 mx-0"
                    style={{ 
                        background: '#0e4b2d',
                        borderRadius: '24px',
                        boxShadow: '0 15px 35px rgba(14, 75, 45, 0.15)'
                    }}
                >
                    {/* Text Section */}
                    <div className="col-12 col-lg-6 mb-4 mb-lg-0 text-center text-lg-start">
                        <h2 className="fw-bold mb-2" style={{ color: '#ffffff', fontSize: '1.8rem' }}>
                            Restez informe des nouveautes
                        </h2>
                        <p className="mb-0" style={{ color: '#a0c4b2', fontSize: '1.05rem', lineHeight: '1.5' }}>
                            Recevez les nouvelles offres, produits et actualites<br className="d-none d-lg-block" />
                            directement dans votre boite mail.
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="col-12 col-lg-6">
                        <form 
                            className="d-flex flex-column flex-sm-row gap-3 justify-content-lg-end justify-content-center"
                            onSubmit={(e) => { e.preventDefault(); }}
                        >
                            <input 
                                type="email" 
                                placeholder="Votre adresse email" 
                                className="form-control"
                                style={{ 
                                    background: '#ffffff', 
                                    border: '1px solid #dee2e6',
                                    borderRadius: '8px',
                                    padding: '0.8rem 1.2rem',
                                    maxWidth: '350px',
                                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                                    color: '#212529'
                                }}
                                required
                            />
                            <button 
                                type="submit" 
                                className="btn fw-bold"
                                style={{
                                    background: '#105c38',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    padding: '0.8rem 1.8rem',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#1ab273';
                                    e.currentTarget.style.borderColor = '#1ab273';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#105c38';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                }}
                            >
                                S'abonner
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
