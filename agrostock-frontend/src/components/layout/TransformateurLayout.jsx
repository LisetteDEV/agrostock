import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LogOut, Package, ShoppingCart, BarChart3, Star, 
    Plus, Clock, ChevronRight, LayoutDashboard, Settings,
    FileText, User, Bell, Search, Filter, MoreVertical,
    Menu, X
} from 'lucide-react';

const TransformateurLayout = () => {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const tabs = [
        { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, path: '/dashboard-transformateur' },
        { id: 'produits', label: 'Mes Produits', icon: <Package size={20} />, path: '/dashboard-transformateur/produits' },
        { id: 'commandes', label: 'Commandes', icon: <ShoppingCart size={20} />, path: '/dashboard-transformateur/commandes' },
        { id: 'stats', label: 'Statistiques', icon: <BarChart3 size={20} />, path: '/dashboard-transformateur/stats' },
        { id: 'profil', label: 'Profil Entreprise', icon: <User size={20} />, path: '/dashboard-transformateur/profil' },
        { id: 'parametres', label: 'Parametres', icon: <Settings size={20} />, path: '/dashboard-transformateur/parametres' },
    ];

    if (!user) {
        return <div className="p-5 text-center">Chargement...</div>;
    }

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#f8faf9' }}>
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-lg-none" 
                     style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
                     onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'd-flex position-fixed' : 'd-none d-lg-flex'} flex-column bg-dark text-white`} 
                   style={{ 
                       width: '280px', 
                       background: '#0a1d13', 
                       height: '100vh', 
                       position: 'sticky', 
                       top: 0, 
                       zIndex: 1050,
                       transition: 'all 0.3s ease'
                   }}>
                <div className="p-4 mb-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <img src="/images/logoAgro.png" alt="Logo" style={{ height: '35px' }} />
                        <span className="fw-bold fs-5 text-white">AgroStock <span className="text-success">Benin</span></span>
                    </div>
                    <button className="btn btn-link text-white d-lg-none p-0" onClick={() => setSidebarOpen(false)}><X size={24} /></button>
                </div>

                <nav className="flex-grow-1 px-3 overflow-y-auto">
                    <div className="d-flex flex-column gap-1">
                        {tabs.map(tab => (
                            <Link key={tab.id} to={tab.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`nav-link-custom ${location.pathname === tab.path ? 'active' : ''}`}>
                                {tab.icon}
                                <span className="flex-grow-1">{tab.label}</span>
                                {tab.badge && <span className="badge bg-danger rounded-pill ms-auto">{tab.badge}</span>}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="p-3 mt-auto border-top border-white border-opacity-10">
                    <div className="d-flex align-items-center gap-3 mb-3 p-2">
                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                            {user.nom_complet?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-white small fw-bold text-truncate">{user.entreprise || user.nom_complet}</div>
                            <div className="text-muted small text-truncate" style={{ fontSize: '0.7rem' }}>Partenaire Verifie</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 border-0 hover:bg-danger/10 shadow-none">
                        <LogOut size={18} /> <span className="fw-bold">Deconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
                <header className="sticky-top d-flex align-items-center justify-content-between px-4 py-3 bg-white shadow-sm" style={{ zIndex: 1030 }}>
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-link text-dark d-lg-none p-0" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
                        <h5 className="fw-bold text-dark mb-0 d-none d-md-block">
                            {tabs.find(t => t.path === location.pathname)?.label || 'Espace Pro'}
                        </h5>
                    </div>
                    
                    <div className="d-flex align-items-center gap-3">
                        <div className="input-group d-none d-md-flex shadow-sm rounded-pill overflow-hidden" style={{ width: '250px' }}>
                            <span className="input-group-text bg-light border-0 ps-3"><Search size={18} className="text-muted" /></span>
                            <input type="text" className="form-control bg-light border-0" placeholder="Rechercher..." style={{ fontSize: '0.9rem' }} />
                        </div>
                        <button className="btn btn-light rounded-circle shadow-sm position-relative" style={{ width: '40px', height: '40px' }}>
                            <Bell size={18} className="text-dark" />
                        </button>
                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '40px', height: '40px' }}>
                            {user.nom_complet?.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="p-4 p-md-5">
                    <Outlet />
                </main>
            </div>

            <style>{`
                .nav-link-custom {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 16px;
                    border-radius: 8px;
                    color: #8a9b92;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }
                .nav-link-custom:hover {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                }
                .nav-link-custom.active {
                    background: linear-gradient(135deg, #105c38, #1ab273);
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(26, 178, 115, 0.2);
                }
                .btn-light { background: #f8faf9; border: 1px solid #eee; }
                .btn-light:hover { background: #fff; border-color: #1ab273; }
                .text-muted { color: #64748b !important; }
            `}</style>
        </div>
    );
};

export default TransformateurLayout;
