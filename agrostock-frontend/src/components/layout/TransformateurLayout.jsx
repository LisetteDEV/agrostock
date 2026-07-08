import React, { useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LogOut, Package, ShoppingCart, BarChart3, 
    LayoutDashboard, Settings, User, Search,
    Menu, X
} from 'lucide-react';

const TransformateurLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const tabs = [
        { id: 'dashboard', label: 'Tableau de bord',   icon: <LayoutDashboard size={20} />, path: '/dashboard-transformateur' },
        { id: 'produits',  label: 'Mes Produits',       icon: <Package size={20} />,         path: '/dashboard-transformateur/produits' },
        { id: 'commandes', label: 'Commandes',          icon: <ShoppingCart size={20} />,    path: '/dashboard-transformateur/commandes' },
        { id: 'stats',     label: 'Statistiques',       icon: <BarChart3 size={20} />,       path: '/dashboard-transformateur/stats' },
        { id: 'profil',    label: 'Profil Entreprise',  icon: <User size={20} />,            path: '/dashboard-transformateur/profil' },
        { id: 'parametres',label: 'Paramètres',         icon: <Settings size={20} />,        path: '/dashboard-transformateur/parametres' },
    ];

    if (!user) return <div className="p-5 text-center">Chargement...</div>;

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#f8faf9' }}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="position-fixed top-0 start-0 w-100 h-100"
                     style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
                     onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar — drawer sur mobile, fixe sur desktop */}
            <aside style={{
                width: '280px',
                background: '#0a1d13',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1050,
                display: 'flex',
                flexDirection: 'column',
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div className="p-4 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid #183827' }}>
                    <Link to="/" className="d-flex align-items-center text-white text-decoration-none gap-2">
                        <div className="bg-success rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px' }}>
                            <Package size={20} className="text-white" strokeWidth={2.5}/>
                        </div>
                        <div className="d-flex flex-column justify-content-center lh-1">
                            <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: '"Outfit", system-ui, sans-serif' }}>
                                Agro<span className="text-success">Stock</span>
                            </span>
                            <span className="text-success" style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', paddingLeft: '1px' }}>
                                Bénin
                            </span>
                        </div>
                    </Link>
                    <button type="button" className="btn btn-link text-white p-0 d-lg-none" onClick={() => setSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-grow-1 px-3 py-3" style={{ overflowY: 'auto' }}>
                    <div className="d-flex flex-column gap-1">
                        {tabs.map(tab => (
                            <Link key={tab.id} to={tab.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`t-nav-link ${location.pathname === tab.path ? 'active' : ''}`}>
                                {tab.icon}
                                <span className="flex-grow-1">{tab.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="p-3" style={{ borderTop: '1px solid #183827' }}>
                    <div className="d-flex align-items-center gap-3 mb-3 p-2">
                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                             style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                            {user.nom_complet?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-white small fw-bold text-truncate">{user.entreprise || user.nom_complet}</div>
                            <div style={{ color: '#8a9b92', fontSize: '0.7rem' }}>Partenaire Vérifié</div>
                        </div>
                    </div>
                    <button type="button" onClick={handleLogout}
                        className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 fw-bold border-0">
                        <LogOut size={18} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Spacer desktop (décale le contenu principal) */}
            <div className="d-none d-lg-block flex-shrink-0" style={{ width: '280px' }}></div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
                {/* Top Header */}
                <header className="sticky-top d-flex align-items-center justify-content-between px-3 px-md-4 py-3 bg-white shadow-sm" style={{ zIndex: 1030 }}>
                    <div className="d-flex align-items-center gap-3">
                        <button type="button" className="btn btn-light rounded-3 p-2 d-lg-none" onClick={() => setSidebarOpen(true)}>
                            <Menu size={20} className="text-success" />
                        </button>
                        <h5 className="fw-bold text-dark mb-0 d-none d-md-block">
                            {tabs.find(t => t.path === location.pathname)?.label || 'Espace Pro'}
                        </h5>
                        <span className="fw-bold text-success d-md-none">AgroStock</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 gap-md-3">
                        <div className="input-group d-none d-md-flex shadow-sm rounded-pill overflow-hidden" style={{ width: '220px' }}>
                            <span className="input-group-text bg-light border-0 ps-3"><Search size={16} className="text-muted" /></span>
                            <input type="text" className="form-control bg-light border-0" placeholder="Rechercher..." style={{ fontSize: '0.85rem' }} />
                        </div>

                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm flex-shrink-0"
                             style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}>
                            {user.nom_complet?.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="p-3 p-md-4 p-lg-5">
                    <Outlet />
                </main>
            </div>

            <style>{`
                .t-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 16px;
                    border-radius: 8px;
                    color: #8a9b92;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .t-nav-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
                .t-nav-link.active {
                    background: linear-gradient(135deg, #105c38, #1ab273);
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(26,178,115,0.2);
                }
                @media (min-width: 992px) {
                    aside { transform: translateX(0) !important; }
                }
            `}</style>
        </div>
    );
};

export default TransformateurLayout;
