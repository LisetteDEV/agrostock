import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Info,
    LayoutGrid,
    Users,
    FileText,
    Phone,
    ShoppingCart,
    Menu,
    X,
} from 'lucide-react';

import RegisterModal from '../auth/RegisterModal';
import { useAuth } from '../../context/AuthContext';
import { usePanier } from '../../context/PanierContext';

const GREEN_GRADIENT = 'linear-gradient(135deg, #1ab273 0%, #105c38 100%)';
const DASHBOARD_GRADIENT = 'linear-gradient(90deg, #1ab273 0%, #f5b518 50%, #de3e30 100%)';

const Navbar = () => {
    const { user } = useAuth();
    const { countPanier } = usePanier();
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState('register');
    const location = useLocation();

    const openAuth = (mode) => {
        setAuthMode(mode);
        setIsAuthOpen(true);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    useEffect(() => {
        const handleOpenAuth = (e) => {
            openAuth(e.detail?.mode || 'register');
        };
        window.addEventListener('openAuthModal', handleOpenAuth);
        return () => window.removeEventListener('openAuthModal', handleOpenAuth);
    }, []);

    const navLinks = [
        { label: 'Accueil', to: '/', icon: <Home size={18} /> },
        { label: 'A Propos', to: '/a-propos', icon: <Info size={18} /> },
        { label: 'Catalogue', to: '/catalogue', icon: <LayoutGrid size={18} /> },
        { label: 'Transformateurs', to: '/transformateurs', icon: <Users size={18} /> },
        { label: 'Blog', to: '/blog', icon: <FileText size={18} /> },
        { label: 'Contact', to: '/contact', icon: <Phone size={18} /> },
    ];

    return (
        <nav
            className={`navbar navbar-expand-lg fixed-top transition-all duration-500 navbar-glow ${
                scrolled ? 'py-2' : 'py-3'
            }`}
            style={{
                zIndex: 1000,
                position: 'fixed',
                background: scrolled ? 'rgba(255, 255, 255, 0.97)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(16, 92, 56, 0.16)',
                overflow: 'hidden',
            }}
        >
            <div className="navbar-grid-glow" aria-hidden="true"></div>
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center p-0" to="/">
                    <img
                        src="/images/logoAgro.png"
                        alt="AgroStock"
                        className="img-fluid"
                        style={{ height: '55px', width: 'auto' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="text-success fw-bold fs-3">AS</span>';
                        }}
                    />
                </Link>

                <div className="d-flex align-items-center gap-2 d-lg-none">
                    <Link to="/panier" className="btn btn-link p-2 position-relative nav-green-icon">
                        <ShoppingCart size={22} strokeWidth={2} />
                        {countPanier > 0 && <span className="position-absolute top-1 start-100 translate-middle badge rounded-circle bg-danger" style={{ fontSize: '10px' }}>{countPanier}</span>}
                    </Link>
                    <button
                        className="btn btn-link p-2 nav-green-icon"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarContent">
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-xl-2">
                        {navLinks.map((item) => {
                            const isActive = location.pathname === item.to;
                            return (
                                <li className="nav-item" key={item.label}>
                                    <Link
                                        className={`nav-link px-3 d-flex align-items-center gap-1 gap-xl-2 rounded-pill transition-all nav-item-hover ${
                                            isActive ? 'nav-active' : ''
                                        }`}
                                        to={item.to}
                                        style={{
                                            fontSize: 'clamp(0.8rem, 1vw, 0.95rem)',
                                            whiteSpace: 'nowrap',
                                            fontWeight: isActive ? '700' : '600',
                                            position: 'relative',
                                        }}
                                    >
                                        <span className="nav-green-icon d-flex align-items-center">
                                            {React.cloneElement(item.icon, { size: 16 })}
                                        </span>
                                        <span className="nav-link-label">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="d-none d-lg-flex align-items-center gap-3">
                        <Link to="/panier" className="btn btn-link p-2 position-relative nav-green-icon me-2 rounded-circle">
                            <ShoppingCart size={20} strokeWidth={2} />
                            {countPanier > 0 && <span className="position-absolute top-1 start-100 translate-middle badge rounded-circle bg-danger" style={{ fontSize: '10px' }}>{countPanier}</span>}
                        </Link>

                        {user ? (
                            <Link
                                to={user.role === 'admin' ? '/admin/dashboard' : (user.role === 'transformateur' ? '/dashboard-transformateur' : '/dashboard-acheteur')}
                                className="btn dashboard-btn d-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-bold border-0 transition-all"
                                style={{ background: DASHBOARD_GRADIENT }}
                            >
                                <LayoutGrid size={18} /> Tableau de bord
                            </Link>
                        ) : (
                            <button
                                className="btn green-btn d-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-bold border-0 transition-all"
                                style={{ background: GREEN_GRADIENT }}
                                onClick={() => openAuth('login')}
                            >
                                Connexion
                            </button>
                        )}
                    </div>

                    {isOpen && (
                        <div className="d-lg-none mt-3 pb-3 border-top pt-3" style={{ borderColor: 'rgba(16, 92, 56, 0.2)' }}>
                            <div className="d-grid gap-2">
                                {user ? (
                                    <Link
                                        to={user.role === 'admin' ? '/admin/dashboard' : (user.role === 'transformateur' ? '/dashboard-transformateur' : '/dashboard-acheteur')}
                                        className="btn dashboard-btn rounded-pill py-2.5 fw-bold"
                                        style={{ background: DASHBOARD_GRADIENT }}
                                    >
                                        Tableau de bord
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => openAuth('register')}
                                            className="btn green-btn rounded-pill py-2.5 fw-bold"
                                            style={{ background: GREEN_GRADIENT }}
                                        >
                                            S'inscrire
                                        </button>
                                        <button
                                            onClick={() => openAuth('login')}
                                            className="btn green-btn-outline rounded-pill py-2.5 fw-bold"
                                        >
                                            Se connecter
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
                    .navbar-grid-glow {
                        position: absolute;
                        inset: 0;
                        z-index: 0;
                        pointer-events: none;
                        background-image:
                            linear-gradient(rgba(26, 178, 115, 0.14) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(26, 178, 115, 0.14) 1px, transparent 1px);
                        background-size: 34px 34px;
                        background-position: 0 0;
                        opacity: 0.55;
                        animation: navbarGridMove 18s linear infinite;
                    }
                    .navbar-grid-glow::after {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(112deg, transparent 32%, rgba(255, 255, 255, 0.36) 50%, transparent 68%);
                        transform: translateX(-130%);
                        filter: blur(3px);
                        animation: navbarGridShine 5.2s ease-in-out infinite;
                    }
                    .navbar-glow > .container {
                        position: relative;
                        z-index: 2;
                    }
                    .navbar-glow {
                        box-shadow:
                            0 0 0 1px rgba(26, 178, 115, 0.08),
                            0 12px 35px rgba(26, 178, 115, 0.2),
                            0 18px 40px rgba(16, 92, 56, 0.16);
                    }
                    .navbar-glow::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: radial-gradient(circle at 18% 28%, rgba(26, 178, 115, 0.22), transparent 42%), radial-gradient(circle at 82% 68%, rgba(26, 178, 115, 0.18), transparent 46%);
                        z-index: 0;
                        pointer-events: none;
                    }
                    .navbar-glow::after {
                        content: '';
                        position: absolute;
                        left: 0;
                        right: 0;
                        bottom: -1px;
                        height: 3px;
                        background: linear-gradient(90deg, #1ab273 0%, #105c38 100%);
                        filter: drop-shadow(0 0 10px rgba(26, 178, 115, 0.62));
                        opacity: 0.95;
                    }
                    .nav-item-hover {
                        transition: all 0.3s ease;
                    }
                    .nav-item-hover:hover {
                        background-color: rgba(26, 178, 115, 0.08);
                        box-shadow:
                            0 0 0 1px rgba(26, 178, 115, 0.2),
                            0 7px 18px rgba(26, 178, 115, 0.16);
                        transform: translateY(-1px);
                    }
                    .nav-active {
                        background-color: rgba(26, 178, 115, 0.12);
                        box-shadow:
                            inset 0 0 0 1px rgba(26, 178, 115, 0.24),
                            0 6px 16px rgba(26, 178, 115, 0.2);
                    }
                    .nav-link-label {
                        color: #105c38;
                        text-shadow: 0 0 10px rgba(26, 178, 115, 0.2);
                    }
                    .nav-green-icon {
                        color: #1ab273;
                        filter: drop-shadow(0 0 6px rgba(26, 178, 115, 0.35));
                    }
                    .green-btn {
                        color: #fff !important;
                        box-shadow:
                            0 8px 22px rgba(26, 178, 115, 0.28),
                            0 12px 30px rgba(16, 92, 56, 0.2);
                        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.28);
                    }
                    .green-btn:hover {
                        filter: saturate(1.06) brightness(1.03);
                        transform: translateY(-1px);
                    }
                    .green-btn-outline {
                        border: 1px solid #1ab273;
                        background: rgba(26, 178, 115, 0.06);
                        color: #105c38;
                        box-shadow: 0 6px 18px rgba(26, 178, 115, 0.12);
                    }
                    .green-btn-outline:hover {
                        color: #0b3b27;
                        transform: translateY(-1px);
                        background: rgba(26, 178, 115, 0.11);
                    }
                    .dashboard-btn {
                        color: #fff !important;
                        box-shadow:
                            0 8px 22px rgba(26, 178, 115, 0.28),
                            0 10px 28px rgba(245, 181, 24, 0.22),
                            0 12px 32px rgba(222, 62, 48, 0.24);
                        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.28);
                    }
                    .dashboard-btn:hover {
                        filter: saturate(1.1) brightness(1.03);
                        transform: translateY(-1px);
                    }
                `}
            </style>

            <RegisterModal
                key={authMode}
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialMode={authMode}
            />
        </nav>
    );
};

export default Navbar;


