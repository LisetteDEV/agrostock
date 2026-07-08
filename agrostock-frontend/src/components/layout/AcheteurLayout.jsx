import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  Heart, 
  Star, 
  LogOut, 
  User,
  LayoutDashboard,
  History,
  Store,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AcheteurLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { path: '/dashboard-acheteur', label: 'Tableau de Bord', icon: <LayoutDashboard size={20} /> },
        { path: '/', label: 'Boutique (Plateforme)', icon: <Store size={20} /> },
        { path: '/mes-commandes', label: 'Mes commandes', icon: <History size={20} /> },
        { path: '/favoris', label: 'Produits Favoris', icon: <Heart size={20} /> },
        { path: '/historique-avis', label: 'Mes Avis', icon: <Star size={20} /> },
        { path: '/profil', label: 'Mon Profil', icon: <User size={20} /> },
    ];

    if (!user) return null;

    return (
        <div className="d-flex" style={{ background: "#f8fafc", minHeight: "100vh" }}>
            
            {/* OVERLAY FOR MOBILE SIDEBAR */}
            {isSidebarOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" 
                     style={{ zIndex: 1060 }} onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* VERTICAL SIDEBAR */}
            <div className={`sidebar-wrapper flex-column flex-shrink-0 p-4 text-white position-fixed h-100 shadow-lg ${isSidebarOpen ? 'show' : ''}`} 
                 style={{ width: "280px", background: "linear-gradient(180deg, #0f3a23 0%, #051a0f 100%)", zIndex: 1100 }}>
                
                <div className="d-flex align-items-center justify-content-between mb-5 px-2">
                    <Link to="/" className="d-flex align-items-center text-white text-decoration-none gap-3">
                        <div className="bg-success rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm">
                            <Package size={24} />
                        </div>
                        <span className="fs-3 fw-bolder" style={{ letterSpacing: "-1.5px" }}>AgroStock</span>
                    </Link>
                    <button className="btn text-white d-lg-none p-0" onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <ul className="nav nav-pills flex-column mb-auto gap-2">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <li key={link.path} className="nav-item">
                                <Link to={link.path} 
                                      onClick={() => setIsSidebarOpen(false)}
                                      className={`a-nav-link ${isActive ? 'active' : ''}`}
                                      style={isActive ? { background: "rgba(26, 178, 115, 0.2)", border: "1px solid rgba(26, 178, 115, 0.3)" } : {}}>
                                    {link.icon}
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-auto pt-4 border-top border-white border-opacity-10">
                    <button type="button" 
                            onClick={(e) => { e.preventDefault(); handleLogout(); }} 
                            className="btn btn-success w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg transform-hover border-0">
                        <LogOut size={18} /> Déconnexion
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-grow-1 main-content">
                {/* TOOLBAR */}
                <div className="container-fluid bg-white border-bottom py-3 px-3 px-md-5 d-flex align-items-center justify-content-between sticky-top" style={{ zIndex: 999 }}>
                    <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-light rounded-3 p-2 d-lg-none" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} className="text-success" />
                        </button>
                        <span className="fs-5 fw-bold text-success d-lg-none ms-1">AgroStock</span>
                        <p className="text-muted small mb-0 fw-bold text-uppercase d-none d-md-block" style={{ letterSpacing: '1px' }}>
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <div className="d-flex align-items-center gap-2 gap-md-4">
                        <Link to="/" className="btn btn-light btn-sm rounded-pill px-3 fw-bold d-none d-md-flex align-items-center gap-2">
                            <Store size={16} className="text-success" /> Plateforme
                        </Link>
                        <div className="text-end d-none d-md-block">
                            <span className="fw-bold d-block small">{user.nom_complet}</span>
                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill" style={{ fontSize: '10px' }}>Acheteur Vérifié</span>
                        </div>
                        <div className="position-relative">
                           <img 
                               src={`https://ui-avatars.com/api/?name=${user.nom_complet}&background=0f3a23&color=fff`} 
                               className="rounded-circle shadow-sm border border-light" 
                               alt="avatar"
                               style={{ width: '35px', height: '35px' }}
                           />
                           <span className="position-absolute bottom-0 end-0 bg-success border border-white border-2 rounded-circle" style={{ width: '10px', height: '10px' }}></span>
                        </div>
                    </div>
                </div>

                {/* DYNAMIC CONTENT */}
                <main className="container-fluid py-4 px-2 px-md-5">
                    <Outlet />
                </main>
            </div>

            {/* MOBILE BOTTOM NAVIGATION (Quick Access) */}
            <div className="bottom-nav d-lg-none shadow-lg">
                {[
                    { path: '/dashboard-acheteur', icon: <LayoutDashboard size={22} />, label: 'Home' },
                    { path: '/mes-commandes', icon: <History size={22} />, label: 'Orders' },
                    { path: '/favoris', icon: <Heart size={22} />, label: 'Favs' },
                    { path: '/profil', icon: <User size={22} />, label: 'Profile' }
                ].map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link key={link.path} to={link.path} className={`nav-tab ${isActive ? 'active' : ''}`}>
                            {link.icon}
                            <span>{link.label}</span>
                        </Link>
                    )
                })}
            </div>

            <style>{`
                .sidebar-wrapper { left: 0; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .main-content { padding-left: 280px; transition: padding 0.3s ease; }
                .nav-link.active { color: white !important; }
                .a-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 12px;
                    color: rgba(255,255,255,0.7);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                }
                .a-nav-link:hover { background: rgba(255,255,255,0.07); color: #fff; }
                .a-nav-link.active { color: #fff !important; }
                .transform-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
                
                @media (max-width: 991.98px) {
                    .sidebar-wrapper { transform: translateX(-100%); width: 280px !important; }
                    .sidebar-wrapper.show { transform: translateX(0); }
                    .main-content { padding-left: 0 !important; }
                    main { padding-bottom: 90px !important; }
                    .bottom-nav { display: flex !important; }
                }

                .bottom-nav {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 70px;
                    background: white;
                    border-top: 1px solid #f1f5f9;
                    z-index: 1050;
                    padding-bottom: env(safe-area-inset-bottom);
                    justify-content: space-around;
                    align-items: center;
                }

                .nav-tab {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    color: #94a3b8;
                    font-size: 11px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                .nav-tab.active { color: #1ab273; }
                .nav-tab span { margin-top: 5px; font-size: 10px; }
                .shadow-lg { box-shadow: 0 -5px 20px rgba(0,0,0,0.05) !important; }
            `}</style>
        </div>
    );
};

export default AcheteurLayout;
