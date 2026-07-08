import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Factory, Package, ShoppingCart, CreditCard,
    MessageSquare, FileText, Settings, Bell, LogOut, ChevronRight, MailOpen,
    Search, Filter, MoreVertical, Clock, Shield, Star, Trash2,
    UserCheck, UserX, ChevronDown, Menu, X, ExternalLink, Download,
    BarChart3, PieChart, Calendar, MapPin
} from 'lucide-react';
import { API_URL } from '../../services/config';

const AdminLayout = () => {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({ pending_transformateurs: 0, flagged_reviews: 0, pending_contact_messages: 0 });
    const location = window.location.pathname;

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                setStats({
                    pending_transformateurs: data.pending_transformateurs || 0,
                    flagged_reviews: data.flagged_reviews || 0,
                    pending_contact_messages: data.pending_contact_messages || 0
                });
            })
            .catch(err => console.error("Sidebar stats error", err));
    }, [token]);

    const handleLogout = () => {
        navigate('/', { replace: true });
        // Un délai minime pour permettre la redirection avant que le contexte ne change
        setTimeout(() => {
            logout();
        }, 10);
    };

    const tabs = [
        { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
        { id: 'utilisateurs', label: 'Utilisateurs', icon: <Users size={20} />, path: '/admin/utilisateurs' },
        { id: 'transformateurs', label: 'Transformateurs', icon: <Factory size={20} />, path: '/admin/transformateurs', badge: stats.pending_transformateurs },
        { id: 'produits', label: 'Produits', icon: <Package size={20} />, path: '/admin/produits' },
        { id: 'commandes', label: 'Commandes', icon: <ShoppingCart size={20} />, path: '/admin/commandes' },
        { id: 'paiements', label: 'Paiements', icon: <CreditCard size={20} />, path: '/admin/transactions' },
        { id: 'avis', label: 'Avis & Moderation', icon: <MessageSquare size={20} />, path: '/admin/avis', badge: stats.flagged_reviews },
        { id: 'blog', label: 'Blog', icon: <FileText size={20} />, path: '/admin/blog' },
        { id: 'messages-contact', label: 'Messages Contact', icon: <MailOpen size={20} />, path: '/admin/messages-contact', badge: stats.pending_contact_messages },
        { id: 'parametres', label: 'Parametres', icon: <Settings size={20} />, path: '/admin/parametres' },
    ];

    const activeTab = tabs.find(t => t.path === location)?.id || 'dashboard';

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: '#060f0a' }}>
            {/* SIDEBAR overlay on mobile */}
            {sidebarOpen && <div className="position-fixed top-0 start-0 w-100 h-100 d-lg-none" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1040 }} onClick={() => setSidebarOpen(false)} />}

            {/* SIDEBAR */}
            <aside className={`${sidebarOpen ? 'd-flex position-fixed' : 'd-none d-lg-flex sticky-top'} flex-column flex-shrink-0`}
                   style={{ width: '260px', height: '100vh', top: 0, left: 0, background: '#0a1d13', zIndex: 1050, borderRight: '1px solid #183827', overflowY: 'auto' }}>
                <div className="p-4 d-flex align-items-center justify-content-between flex-shrink-0" style={{ borderBottom: '1px solid #183827' }}>
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-success rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px' }}>
                            <Package size={20} className="text-white" strokeWidth={2.5}/>
                        </div>
                        <div className="d-flex flex-column justify-content-center lh-1">
                            <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: '"Outfit", system-ui, sans-serif' }}>
                                Agro<span className="text-success">Stock</span>
                            </span>
                            <span className="text-success" style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', paddingLeft: '1px' }}>
                                ADMIN PANEL
                            </span>
                        </div>
                    </div>
                    <button className="btn btn-sm text-white d-lg-none p-0" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
                </div>

                <nav className="flex-grow-1 p-3 overflow-y-auto">
                    <div className="d-flex flex-column gap-1">
                        {tabs.map(tab => (
                            <Link key={tab.id} to={tab.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`w-100 text-decoration-none text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 border-0 position-relative fw-medium`}
                                style={{ 
                                    background: location === tab.path ? 'linear-gradient(135deg, #105c38, #1ab273)' : 'transparent',
                                    color: location === tab.path ? '#ffffff' : '#8a9b92',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease',
                                }}>
                                {tab.icon}
                                <span className="flex-grow-1">{tab.label}</span>
                                {tab.badge && (
                                    <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.65rem' }}>{tab.badge}</span>
                                )}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid #183827' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: '38px', height: '38px', fontSize: '0.85rem' }}>
                            AD
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                            <div className="text-white fw-bold small text-truncate">Administrateur</div>
                            <div className="text-muted small text-truncate" style={{ fontSize: '0.7rem' }}>admin@agrostock.bj</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, maxWidth: '100%' }}>
                <header className="sticky-top d-flex align-items-center justify-content-between px-4 py-3 bg-opacity-95"
                        style={{ background: '#0a1d13', backdropFilter: 'blur(20px)', borderBottom: '1px solid #183827', zIndex: 1030 }}>
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-sm text-white d-lg-none p-0 me-2" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
                        <h5 className="fw-bold text-white mb-0 d-none d-md-block">
                            {tabs.find(t => t.path === location)?.label || 'Tableau de bord'}
                        </h5>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-sm position-relative p-2 rounded-circle" style={{ background: '#0e261a' }}>
                            <Bell size={18} className="text-white" />
                            <span className="position-absolute top-0 end-0 badge rounded-circle bg-danger" style={{ fontSize: '0.55rem', padding: '3px 5px' }}>6</span>
                        </button>
                        <div className="d-none d-md-flex align-items-center gap-2 px-3 py-2 rounded-pill" style={{ background: '#0e261a' }}>
                            <div className="bg-success rounded-circle flex-shrink-0" style={{ width: '8px', height: '8px' }}></div>
                            <span className="text-white small fw-bold text-truncate">Admin</span>
                        </div>
                        <button onClick={handleLogout} className="btn btn-sm btn-outline-success rounded-pill px-3 d-flex align-items-center gap-2 fw-bold">
                            <LogOut size={16} /> <span className="d-none d-md-inline">Déconnexion</span>
                        </button>
                    </div>
                </header>

                <main className="p-4 p-md-5 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>

            <style>{`
                .text-muted { color: #8a9b92 !important; }
                .table-dark { --bs-table-color: #fff; --bs-table-striped-color: #fff; }
                .form-control:focus, .form-select:focus { box-shadow: 0 0 0 2px rgba(26,178,115,0.3); border-color: #1ab273; }
                .form-control::placeholder { color: #5a7566; }
                aside nav a:hover { background: rgba(255, 255, 255, 0.06) !important; color: #fff !important; }
            `}</style>
        </div>
    );
};

export default AdminLayout;

