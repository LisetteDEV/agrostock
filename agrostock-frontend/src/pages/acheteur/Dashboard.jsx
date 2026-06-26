import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, Package, Clock, Truck, CheckCircle2,
  Star, MessageSquarePlus, XCircle, CheckCircle,
  DollarSign, Heart, ArrowRight, ChevronDown, Search,
  ChevronRight, ChevronLeft
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/config";
import { useFavoris } from "../../context/FavorisContext";

const Dashboard = () => {
  const { user, token } = useAuth();
  const { favoris } = useFavoris();
  const [orders, setOrders] = useState([]);
  const [transformateurs, setTransformateurs] = useState([]);
  const [newAvis, setNewAvis] = useState({ transformateur_id: "", note: 5, commentaire: "" });
  const [avisLoading, setAvisLoading] = useState(false);
  const [uiMessage, setUiMessage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
        const [ordersRes, transRes] = await Promise.all([
          fetch(`${API_URL}/acheteur/commandes`, { headers }),
          fetch(`${API_URL}/transformateurs/publics`, { headers })
        ]);
        if (ordersRes.ok) { const d = await ordersRes.json(); setOrders(d.commandes || []); }
        if (transRes.ok) { const d = await transRes.json(); setTransformateurs(d.transformateurs || []); }
      } catch (err) { console.error("Fetch Error:", err); }
    };
    if (token) fetchData();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [token]);

  const handleSubmitAvis = async (e) => {
    e.preventDefault();
    setUiMessage(null);
    if (!newAvis.transformateur_id) return setUiMessage({ type: 'error', text: 'Veuillez choisir un transformateur.' });
    setAvisLoading(true);
    try {
      const res = await fetch(`${API_URL}/avis`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: JSON.stringify({ ...newAvis, acheteur_id: currentUserId })
      });
      const data = await res.json();
      if (res.ok) {
        setNewAvis({ transformateur_id: "", note: 5, commentaire: "" });
        setUiMessage({ type: 'success', text: 'Merci ! Votre avis a été publié.' });
        setTimeout(() => setUiMessage(null), 8000);
      } else {
        setUiMessage({ type: 'error', text: data.message || "Erreur lors de l'envoi." });
      }
    } catch { setUiMessage({ type: 'error', text: "Erreur technique." }); }
    finally { setAvisLoading(false); }
  };

  const selectedTransformateur = transformateurs.find(t => t.id == newAvis.transformateur_id);

  const stats = {
    terminees: orders.filter(o => o.statut === 'recue' || o.statut === 'livree').length,
    enCours: orders.filter(o => ['en_attente_confirmation','confirmee','en_attente_retrait_livreur','en_cours_livraison'].includes(o.statut)).length,
    totalDepense: orders.reduce((acc, o) => acc + (parseFloat(o.montant_total) || 0), 0),
    favoris: favoris.length
  };

  // Toutes les commandes actives (en cours de traitement ou de livraison)
  const activeTrackedOrders = orders.filter(o =>
    ['en_attente_confirmation','confirmee','en_attente_retrait_livreur','en_cours_livraison'].includes(o.statut)
  );

  // Correspondance statut backend → étape d'affichage (0 à 3)
  const statusToStep = {
    'en_attente_confirmation': 0,   // Validation : commande passée, en attente admin/transformateur
    'confirmee': 1,                  // Préparation : commande validée, le transformateur prépare le colis
    'en_attente_retrait_livreur': 1, // Préparation : colis prêt, en attente du livreur
    'en_cours_livraison': 2,         // En Route : le livreur est en chemin
    'livree': 3,                     // Livré : colis arrivé chez l'acheteur
    'recue': 3
  };

  const getStatusLabel = (statut) => {
    const labels = {
      'en_attente_confirmation': 'Validation en cours',
      'confirmee': 'Payée & Validée',
      'en_attente_retrait_livreur': 'Préparation colis',
      'en_cours_livraison': 'Colis expédié',
    };
    return labels[statut] || statut;
  };

  return (
    <div className="p-3 p-md-5" style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* HEADER */}
      <div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h4 className="fw-bolder text-dark mb-1">Bienvenue, {user?.nom_complet}</h4>
          <p className="text-muted small mb-0">Ravi de vous revoir sur AgroStock.</p>
        </div>
        <Link to="/" className="btn btn-success px-4 py-2 rounded-pill fw-bold small shadow-sm d-flex align-items-center gap-2 transform-hover border-0">
          <ShoppingBag size={16} /> Market
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="row g-2 g-md-3 mb-5">
        {[
          { label: 'Terminées', value: stats.terminees, color: 'primary', Icon: ShoppingBag },
          { label: 'En cours',  value: stats.enCours,   color: 'warning', Icon: Clock },
          { label: 'Dépensé',   value: `${stats.totalDepense.toLocaleString()} F`, color: 'success', Icon: DollarSign },
          { label: 'Favoris',   value: stats.favoris,   color: 'danger',  Icon: Heart },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="col-6 col-lg-3">
            <div className={`bg-white rounded-4 p-3 shadow-sm border-start border-4 border-${color} h-100 hover-up`}>
              <div className="d-flex align-items-center gap-2 gap-md-3">
                <div className={`bg-${color} bg-opacity-10 text-${color} rounded-3 p-2 d-flex align-items-center justify-content-center flex-shrink-0`}>
                  <Icon size={16} />
                </div>
                <div className="text-truncate">
                  <div className="text-muted text-uppercase" style={{ fontSize: '0.6rem', fontWeight: 700 }}>{label}</div>
                  <h5 className="fw-bolder mb-0 text-dark" style={{ fontSize: '1rem' }}>{value}</h5>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MULTI-TRACKING SECTION */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <span className="pulse-indicator"></span>
            Suivi de vos colis
            <span className="badge bg-success bg-opacity-10 text-success rounded-pill ms-1" style={{ fontSize: '11px' }}>
              {activeTrackedOrders.length}
            </span>
          </h6>
          {activeTrackedOrders.length > 1 && (
            <div className="d-flex gap-2">
              <button className="btn btn-light btn-sm rounded-circle shadow-sm p-1 border"><ChevronLeft size={16} /></button>
              <button className="btn btn-light btn-sm rounded-circle shadow-sm p-1 border"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>

        <div className="d-flex gap-4 overflow-auto pb-3 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
          {activeTrackedOrders.length === 0 ? (
            <div className="bg-white rounded-4 p-5 text-center shadow-sm w-100 border text-muted" style={{ borderStyle: 'dashed', opacity: 0.6 }}>
              <Package size={40} className="mb-3" />
              <p className="mb-0 fw-bold">Aucune commande en cours de livraison.</p>
            </div>
          ) : (
            activeTrackedOrders.map((order) => {
              const currentStepIdx = statusToStep[order.statut] ?? 0;
              const progress = ((currentStepIdx + 1) / 4) * 100;

              return (
                <div
                  key={order.id}
                  className={`flex-shrink-0 rounded-4 shadow-lg p-4 text-white ${activeTrackedOrders.length === 1 ? 'w-100' : ''}`}
                  style={{
                    minWidth: activeTrackedOrders.length === 1 ? 'auto' : '320px',
                    background: "linear-gradient(135deg, #0f3a23 0%, #051a0f 100%)",
                    scrollSnapAlign: 'start'
                  }}
                >
                  {/* En-tête de la carte */}
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <div className="text-success fw-bold mb-1" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                        Commande #{order.numero}
                      </div>
                      <h5 className="fw-bolder mb-0">{getStatusLabel(order.statut)}</h5>
                    </div>
                    <div className="bg-white rounded-pill px-3 py-1 small fw-bold text-dark" style={{ background: 'rgba(255,255,255,0.15)' }}>
                      {order.mode_livraison}
                    </div>
                  </div>

                  {/* Timeline des étapes */}
                  <div className="d-flex justify-content-between position-relative py-3">
                    {[
                      { icon: <Clock size={12} />,        label: "Validation",   desc: "Commande confirmée" },
                      { icon: <Package size={12} />,      label: "Préparation",  desc: "Colis en préparation" },
                      { icon: <Truck size={12} />,        label: "En Route",     desc: "Livreur en chemin" },
                      { icon: <CheckCircle2 size={12} />, label: "Livré",        desc: "Colis reçu" },
                    ].map((step, i) => (
                      <div key={i} className="text-center" style={{ zIndex: 1, flex: 1 }}>
                        <div
                          className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${i <= currentStepIdx ? 'bg-success text-white' : 'text-white'}`}
                          style={{
                            width: '32px', height: '32px',
                            background: i <= currentStepIdx ? undefined : 'rgba(255,255,255,0.1)',
                            boxShadow: i <= currentStepIdx ? '0 0 12px rgba(26,178,115,0.5)' : 'none'
                          }}
                        >
                          {step.icon}
                        </div>
                        <span style={{ fontSize: '9px' }} className={`fw-bold d-block ${i <= currentStepIdx ? 'text-success' : 'text-white opacity-30'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                    {/* Barre de progression */}
                    <div className="position-absolute top-50 start-0 w-100 bg-white bg-opacity-10"
                         style={{ height: '2px', marginTop: '-14px', zIndex: 0 }}>
                      <div className="bg-success h-100"
                           style={{ width: `${progress}%`, transition: 'width 0.5s ease', boxShadow: '0 0 8px rgba(26,178,115,0.6)' }}>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FORMULAIRE AVIS */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="border-top pt-5">
            <div className="d-flex align-items-center justify-content-between mb-5">
              <div className="d-flex align-items-center gap-2">
                <MessageSquarePlus size={22} className="text-success" />
                <h5 className="fw-bold mb-0 text-dark">Publier un Avis</h5>
              </div>
              <Link to="/historique-avis" className="text-success small fw-bold text-decoration-none d-flex align-items-center gap-1">
                Consulter l'historique <ArrowRight size={14} />
              </Link>
            </div>

            {uiMessage && (
              <div className={`alert p-3 rounded-4 mb-5 border-0 d-flex align-items-center gap-3 shadow-sm ${uiMessage.type === 'success' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                {uiMessage.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                <div className="fw-bold small">{uiMessage.text}</div>
              </div>
            )}

            <form onSubmit={handleSubmitAvis}>
              <div className="row g-4 mb-4">
                {/* CUSTOM SELECT */}
                <div className="col-12 col-md-6" ref={dropdownRef}>
                  <label className="form-label small fw-bold text-dark opacity-50 mb-2">Choisir un Transformateur</label>
                  <div className="position-relative">
                    <div
                      className={`bg-white rounded-4 px-4 shadow-sm border d-flex align-items-center justify-content-between cursor-pointer ${isDropdownOpen ? 'border-success' : 'border-light'}`}
                      style={{ minHeight: '60px', cursor: 'pointer' }}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div className="d-flex align-items-center gap-3 overflow-hidden">
                        {selectedTransformateur ? (
                          <>
                            <div className="bg-success bg-opacity-10 text-success rounded-circle p-1 flex-shrink-0"><Package size={14} /></div>
                            <span className="fw-bold text-dark text-truncate">{selectedTransformateur.nom_entreprise}</span>
                          </>
                        ) : (
                          <span className="text-muted fw-medium">Sélectionner...</span>
                        )}
                      </div>
                      <ChevronDown size={18} className="text-muted flex-shrink-0" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>

                    {isDropdownOpen && (
                      <div className="position-absolute start-0 w-100 mt-2 bg-white rounded-4 shadow border border-light overflow-hidden" style={{ zIndex: 100, animation: 'slideDown 0.2s ease-out' }}>
                        <div className="p-3 bg-light border-bottom d-flex align-items-center gap-2">
                          <Search size={14} className="text-muted" />
                          <input type="text" className="form-control form-control-sm border-0 bg-transparent shadow-none small" placeholder="Rechercher un transformateur..." />
                        </div>
                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                          {transformateurs.length === 0 ? (
                            <div className="p-4 text-center text-muted small">Aucun transformateur disponible</div>
                          ) : transformateurs.map(t => (
                            <div
                              key={t.id}
                              className={`px-4 py-3 d-flex align-items-center justify-content-between ${newAvis.transformateur_id == t.id ? 'bg-success bg-opacity-10' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={e => e.currentTarget.style.background = newAvis.transformateur_id == t.id ? '' : '#f8fafc'}
                              onMouseLeave={e => e.currentTarget.style.background = ''}
                              onClick={() => { setNewAvis(p => ({ ...p, transformateur_id: t.id })); setIsDropdownOpen(false); }}
                            >
                              <div className="d-flex align-items-center gap-3">
                                <Package size={14} className="text-muted opacity-50" />
                                <span className={`small ${newAvis.transformateur_id == t.id ? 'fw-bold text-success' : 'fw-medium text-dark'}`}>{t.nom_entreprise}</span>
                              </div>
                              {newAvis.transformateur_id == t.id && <CheckCircle size={14} className="text-success" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ÉTOILES */}
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark opacity-50 mb-2">Votre Appréciation</label>
                  <div className="bg-white rounded-4 px-4 shadow-sm border border-light d-flex align-items-center gap-3" style={{ minHeight: '60px' }}>
                    <span className="small fw-bold text-muted d-none d-sm-block">Note :</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={28} style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                            fill={s <= newAvis.note ? "#f59e0b" : "none"}
                            color={s <= newAvis.note ? "#f59e0b" : "#cbd5e1"}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={() => setNewAvis(p => ({ ...p, note: s }))} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-dark opacity-50 mb-2">Votre Commentaire</label>
                <textarea
                  className="form-control bg-white rounded-4 p-4 shadow-sm border border-light"
                  rows="4"
                  placeholder="Partagez les détails de votre expérience avec ce transformateur..."
                  value={newAvis.commentaire}
                  onChange={(e) => setNewAvis(p => ({ ...p, commentaire: e.target.value }))}
                  required
                  style={{ resize: 'none', fontSize: '15px' }}
                />
              </div>
              <button type="submit" disabled={avisLoading} className="btn btn-success w-100 py-3 fw-bolder rounded-pill shadow-lg border-0 transform-hover">
                {avisLoading ? <span className="spinner-border spinner-border-sm me-2" /> : "Publier mon avis"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .pulse-indicator { width: 8px; height: 8px; background: #1ab273; border-radius: 50%; display: inline-block; animation: pulse-min 2s infinite; flex-shrink: 0; }
        @keyframes pulse-min { 0% { box-shadow: 0 0 0 0 rgba(26,178,115,0.4); } 70% { box-shadow: 0 0 0 6px rgba(26,178,115,0); } 100% { box-shadow: 0 0 0 0 rgba(26,178,115,0); } }
        .hover-up:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05) !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .transform-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .transform-hover:hover { transform: translateY(-2px); filter: brightness(1.05); box-shadow: 0 15px 30px rgba(26,178,115,0.3) !important; }
      `}</style>
    </div>
  );
};

export default Dashboard;
