import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePanier } from "../../context/PanierContext";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, CheckCircle2, ShieldCheck, Smartphone, CreditCard, MapPin, Truck, ChevronRight, Lock } from "lucide-react";
import { processPayment } from "../../services/paiementService";

const Checkout = () => {
  const navigate = useNavigate();
  const { panier, totalPanier, clearPanier, getPrixByMode } = usePanier();
  const { user, token } = useAuth();

  const [ville, setVille] = useState("");
  const [quartier, setQuartier] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState(user?.telephone || "");

  const [operateur, setOperateur] = useState("MTN");
  const [numeroMobile, setNumeroMobile] = useState("");
  const [confirmNumero, setConfirmNumero] = useState("");
  const [logistiqueMode, setLogistiqueMode] = useState("livreur_propre");
  
  const [typePaiement, setTypePaiement] = useState("mobile_money");
  const [numeroCarte, setNumeroCarte] = useState("");
  const [dateExp, setDateExp] = useState("");
  const [cvc, setCvc] = useState("");

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationState, setSimulationState] = useState("waiting");
  const [submitError, setSubmitError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const fraisLivraison = 0; // Tarif variable ou défini ultérieurement
  const totalPayable = Number(totalPanier) + fraisLivraison;

  const formatPrice = (value) => `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;

  const downloadBonImage = (bon) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#f4f8f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f3a23";
    ctx.font = "bold 52px Inter, sans-serif";
    ctx.fillText("BON DE RETRAIT - AgroStock Benin", 70, 120);

    ctx.strokeStyle = "#1ab273";
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 170, 960, 1040);

    ctx.fillStyle = "#162b20";
    ctx.font = "38px Inter, sans-serif";
    const lines = [
      `Code commande  : ${bon.code || '-'}`,
      `Vendeur        : ${bon.vendeur_nom || '-'}`,
      `Quartier       : ${bon.zone_retrait || '-'}`,
      `Lien GPS       : ${bon.gps_link || '-'}`,
      `OTP acheteur   : ${bon.otp_code || '-'}`,
    ];

    let y = 280;
    lines.forEach((textLine) => {
      ctx.fillText(textLine, 95, y);
      y += 95;
    });

    ctx.fillStyle = "#334155";
    ctx.font = "31px Inter, sans-serif";
    ctx.fillText("Votre livreur doit presenter ce bon pour recuperer la commande.", 95, 860);

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${bon.code || 'bon-retrait'}.png`;
    link.click();
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!token) {
      setSubmitError("Session expiree. Reconnectez-vous puis reessayez.");
      return;
    }

    if (logistiqueMode === 'gozem' && (!ville.trim() || !quartier.trim() || !adresse.trim())) {
      setSubmitError("Veuillez remplir toutes les informations de livraison (ville, quartier, adresse).");
      return;
    }

    if (!telephone.trim()) {
      setSubmitError("Veuillez renseigner un numéro de contact pour la réception.");
      return;
    }

    if (typePaiement === "mobile_money") {
      if (!numeroMobile.trim() || numeroMobile !== confirmNumero) {
        setSubmitError("Le numero Mobile Money et sa confirmation doivent correspondre.");
        return;
      }
    } else {
      if (!numeroCarte.trim() || !dateExp.trim() || !cvc.trim()) {
        setSubmitError("Veuillez remplir toutes les informations de votre carte bancaire.");
        return;
      }
    }

    const invalidGross = panier.find((item) => item.mode_achat === "gros" && Number(item.quantite) < Number(item.quantite_min_gros || 10));
    if (invalidGross) {
      setSubmitError(`Le produit ${invalidGross.nom} doit etre commande en gros avec minimum ${invalidGross.quantite_min_gros || 10}.`);
      return;
    }

    if (!accepted) {
      setSubmitError("Veuillez accepter les conditions pour continuer.");
      return;
    }

    const panierPayload = panier
      .map((item) => ({
        id: Number(item.id),
        quantite: Number(item.quantite),
        mode_achat: item.mode_achat === "gros" ? "gros" : "detail",
      }))
      .filter((item) => Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.quantite) && item.quantite > 0);

    if (panierPayload.length === 0) {
      setSubmitError("Votre panier est invalide. Rafraichissez la page et reessayez.");
      return;
    }

    setLoading(true);
    setShowSimulation(true);
    setSimulationState("waiting");

    setTimeout(() => {
      setSimulationState("success");

      setTimeout(async () => {
        try {
          const modeLivraison = logistiqueMode === "livreur_propre" ? "retrait" : "domicile";
          const isLivreurPropre = logistiqueMode === "livreur_propre";
          const data = await processPayment(
            {
              panier: panierPayload,
              mode_livraison: modeLivraison,
              logistique_mode: logistiqueMode,
              adresse_livraison: isLivreurPropre ? "Retrait avec livreur propre" : `${adresse} (Q. ${quartier})`,
              ville_livraison: isLivreurPropre ? "Retrait / Livreur propre" : ville,
              telephone_livraison: telephone,
              paiement_operateur: typePaiement === "mobile_money" ? operateur : "Carte Bancaire",
              numero_mobile: typePaiement === "mobile_money" ? numeroMobile : "Carte terminee par " + numeroCarte.slice(-4),
            },
            token,
          );

          if (!Array.isArray(data.commandes_id) || data.commandes_id.length === 0) {
            throw new Error("Aucune commande n'a ete creee.");
          }

          clearPanier();
          // Réinitialiser le formulaire
          setVille(''); setQuartier(''); setAdresse('');
          setNumeroMobile(''); setConfirmNumero('');
          setNumeroCarte(''); setDateExp(''); setCvc('');
          setAccepted(false);
          setSuccessData(data);
          setShowSimulation(false);
          // Redirection vers le dashboard après 3 secondes
          setTimeout(() => navigate('/dashboard-acheteur'), 3000);
        } catch (error) {
          setSubmitError(error.message || "Impossible de creer la commande.");
          setShowSimulation(false);
        } finally {
          setLoading(false);
        }
      }, 1500);
    }, 2200);
  };

  const premiumCardStyle = {
    background: "#ffffff",
    borderRadius: "28px",
    boxShadow: "0 24px 60px -15px rgba(26, 178, 115, 0.08)",
    border: "1px solid rgba(26, 178, 115, 0.15)",
    padding: "3rem",
    marginBottom: "2rem"
  };

  const inputStyle = {
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    backgroundColor: "#f8fafc"
  };

  if (panier.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <div className="text-center" style={{ ...premiumCardStyle, maxWidth: "500px", width: "90%" }}>
          <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: "80px", height: "80px" }}>
            <AlertCircle size={40} className="text-warning" />
          </div>
          <h3 className="fw-bold mb-3" style={{ color: "#0f172a" }}>Votre panier est vide</h3>
          <p className="text-muted mb-4 fs-5">Il semble que vous n'ayez pas encore ajouté d'articles à votre panier.</p>
          <button onClick={() => navigate("/catalogue")} className="btn btn-success rounded-pill px-5 py-3 fw-bold shadow-sm w-100" style={{ fontSize: "1.1rem", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Découvrir nos produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(135deg, #f8fbf8 0%, #edf2f0 100%)", minHeight: "100vh" }}>
      {/* Simulation Overlay */}
      {showSimulation && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(5px)" }}>
          <div className="bg-white rounded-5 p-5 text-center shadow-lg" style={{ maxWidth: "450px", width: "92%", transform: "scale(1.05)", transition: "all 0.3s ease-out" }}>
            {simulationState === "waiting" ? (
               <>
                 <div className="position-relative d-inline-flex mb-4">
                   <div className="spinner-border text-success" style={{ width: "4rem", height: "4rem", borderWidth: "0.25rem" }} role="status" />
                   <ShieldCheck size={28} className="text-success position-absolute top-50 start-50 translate-middle" />
                 </div>
                 <h4 className="fw-bold mb-2 text-dark">Paiement sécurisé en cours</h4>
                 <p className="text-muted mb-0 fs-6">
                   {typePaiement === "mobile_money" 
                     ? `Validation sur ${operateur} pour le numéro ${numeroMobile}...` 
                     : `Vérification cryptée pour votre carte bancaire...`}
                 </p>
               </>
            ) : (
               <>
                 <div className="mb-4" style={{ animation: "pulse 1s infinite" }}>
                   <CheckCircle2 size={80} className="text-success mx-auto" />
                 </div>
                 <h4 className="fw-bold text-success mb-2">Paiement Réussi</h4>
                 <p className="text-muted mb-0 fs-6">Génération de vos bons de retrait...</p>
               </>
            )}
          </div>
        </div>
      )}

      {/* Success View */}
      {successData ? (
        <div className="container py-5" style={{ paddingTop: "120px" }}>
          <div className="mx-auto" style={{ ...premiumCardStyle, maxWidth: "800px", padding: "3rem" }}>
            <div className="text-center mb-5">
              <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle shadow mb-4" style={{ width: "90px", height: "90px" }}>
                <CheckCircle2 size={46} />
              </div>
              <h2 className="fw-bolder" style={{ color: "#0f172a" }}>Commande validée !</h2>
              <p className="text-muted fs-5">Félicitations, votre commande a été traitée avec succès.</p>
            </div>

            {(successData.bons_retrait || []).length > 0 && (
              <div className="bg-success bg-opacity-10 border border-success rounded-4 p-4 mb-5">
                <h5 className="fw-bold text-success mb-3 d-flex align-items-center gap-2"><Lock size={20}/> Vos Bons de Retrait</h5>
                <div className="row g-4">
                  {(successData.bons_retrait || []).map((bon) => (
                    <div key={bon.commande_id} className="col-md-6">
                      <div className="bg-white rounded-3 p-3 shadow-sm h-100 border border-light">
                        <div className="text-muted small mb-1">Commande #CMD-{String(bon.commande_id).padStart(4, "0")}</div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                           <span className="text-secondary">Code:</span>
                           <strong className="fs-5 text-dark">{bon.code}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                           <span className="text-secondary">OTP:</span>
                           <strong className="fs-5 text-success">{bon.otp_code}</strong>
                        </div>
                        <div className="small text-muted mb-3"><MapPin size={14} className="me-1"/> Zone: {bon.zone_retrait || "-"}</div>
                        <div className="d-flex flex-column gap-2">
                          {bon.gps_link && (
                            <a href={bon.gps_link} target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm rounded-pill w-100">
                              Voir la carte
                            </a>
                          )}
                          <button type="button" onClick={() => downloadBonImage(bon)} className="btn btn-success btn-sm rounded-pill w-100 fw-medium shadow-sm">
                            Télécharger le Bon
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-light rounded-4 p-4 mb-5">
               <h6 className="fw-bold text-dark mb-3">Résumé des commandes</h6>
              {(successData.commandes_id || []).map((id) => (
                <div key={id} className="d-flex justify-content-between align-items-center bg-white p-3 rounded-3 mb-2 shadow-sm border border-light">
                  <span className="fw-bold text-dark">#CMD-{String(id).padStart(4, "0")}</span>
                  <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-medium">En attente</span>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <button onClick={() => navigate("/dashboard-acheteur") } className="btn btn-dark rounded-pill px-5 py-3 fw-bold fs-5 shadow-lg w-100 w-md-auto" style={{ transition: "all 0.3s" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Suivre mes commandes <ChevronRight size={20} className="ms-2" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
          
          <div className="d-flex align-items-center justify-content-between mb-5">
            <div>
              <h2 className="fw-bolder mb-2" style={{ color: "#0f3a23", fontSize: "2.8rem", letterSpacing: "-1.5px" }}>Finalisation</h2>
              <p className="text-muted mb-0 fs-5" style={{ fontWeight: "500" }}>Réglez votre commande en toute sécurité.</p>
            </div>
            <div className="d-none d-md-flex align-items-center text-success bg-white px-4 py-3 rounded-pill shadow-sm fw-bold border border-success border-opacity-25" style={{ fontSize: "1.1rem" }}>
               <ShieldCheck size={24} className="me-2" />
               Paiement Garanti à 100%
            </div>
          </div>

          <form onSubmit={handleConfirm} className="row g-4">
            
            <div className="col-lg-7">
              {/* Delivery Info */}
              <div style={premiumCardStyle}>
                <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-4">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center text-success">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h4 className="fw-bolder mb-1" style={{ color: "#0f3a23", letterSpacing: "-0.5px" }}>Logistique & Livraison</h4>
                    <p className="text-muted small mb-0">Définissez vos préférences de réception</p>
                  </div>
                </div>
                
                <div className="row g-4">
                  <div className="col-12 mb-3">
                    <div className="d-flex gap-3 flex-column flex-md-row">
                      <label className={`form-check flex-fill p-3 rounded-4 position-relative ${logistiqueMode === 'livreur_propre' ? 'bg-success bg-opacity-10' : 'bg-white'}`} style={{ cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: logistiqueMode === 'livreur_propre' ? '2px solid #1ab273' : '2px solid #e2e8f0', transform: logistiqueMode === 'livreur_propre' ? 'translateY(-4px)' : 'none', boxShadow: logistiqueMode === 'livreur_propre' ? '0 10px 20px -5px rgba(26,178,115,0.15)' : 'none' }}>
                        <div className="d-flex align-items-center">
                          <input className="form-check-input mt-0 me-3" style={{ width: "24px", height: "24px", cursor: "pointer" }} type="radio" value="livreur_propre" checked={logistiqueMode === "livreur_propre"} onChange={(e) => setLogistiqueMode(e.target.value)} />
                          <div className="d-flex flex-column">
                            <span className={`fw-bold fs-6 mb-1 ${logistiqueMode === 'livreur_propre' ? 'text-success' : 'text-dark'}`} style={{ letterSpacing: "-0.2px" }}>J'ai mon propre livreur</span>
                            <span className="text-muted small fw-medium">Aucun frais logistique appliqué</span>
                          </div>
                        </div>
                        {logistiqueMode === 'livreur_propre' && <CheckCircle2 size={24} className="text-success position-absolute top-50 translate-middle-y end-0 me-4 opacity-50" />}
                      </label>
                      <label className={`form-check flex-fill p-3 rounded-4 position-relative ${logistiqueMode === 'gozem' ? 'bg-success bg-opacity-10' : 'bg-white'}`} style={{ cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: logistiqueMode === 'gozem' ? '2px solid #1ab273' : '2px solid #e2e8f0', transform: logistiqueMode === 'gozem' ? 'translateY(-4px)' : 'none', boxShadow: logistiqueMode === 'gozem' ? '0 10px 20px -5px rgba(26,178,115,0.15)' : 'none' }}>
                        <div className="d-flex align-items-center">
                          <input className="form-check-input mt-0 me-3" style={{ width: "24px", height: "24px", cursor: "pointer" }} type="radio" value="gozem" checked={logistiqueMode === "gozem"} onChange={(e) => setLogistiqueMode(e.target.value)} />
                          <div className="d-flex flex-column">
                            <span className={`fw-bold fs-6 mb-1 ${logistiqueMode === 'gozem' ? 'text-success' : 'text-dark'}`} style={{ letterSpacing: "-0.2px" }}>Besoin d'un livreur ?</span>
                            <span className="text-muted small fw-medium">Tarif selon votre zone</span>
                          </div>
                        </div>
                        {logistiqueMode === 'gozem' && <CheckCircle2 size={24} className="text-success position-absolute top-50 translate-middle-y end-0 me-4 opacity-50" />}
                      </label>
                    </div>
                  </div>

                  {logistiqueMode === 'gozem' && (
                    <>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input type="text" className="form-control shadow-none fw-medium" id="villeInput" placeholder="Ville" value={ville} onChange={(e) => setVille(e.target.value)} required style={{ borderRadius: "12px", border: "2px solid #e2e8f0" }} onFocus={e=>e.target.style.borderColor="#1ab273"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                          <label htmlFor="villeInput" className="text-muted">Ville</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input type="text" className="form-control shadow-none fw-medium" id="quartierInput" placeholder="Quartier" value={quartier} onChange={(e) => setQuartier(e.target.value)} required style={{ borderRadius: "12px", border: "2px solid #e2e8f0" }} onFocus={e=>e.target.style.borderColor="#1ab273"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                          <label htmlFor="quartierInput" className="text-muted">Quartier</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-floating">
                          <textarea className="form-control shadow-none fw-medium" id="adresseInput" placeholder="Adresse complète" style={{ height: "100px", borderRadius: "12px", border: "2px solid #e2e8f0", resize: "none" }} value={adresse} onChange={(e) => setAdresse(e.target.value)} required onFocus={e=>e.target.style.borderColor="#1ab273"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}></textarea>
                          <label htmlFor="adresseInput" className="text-muted">Adresse détaillée complète</label>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input type="tel" className="form-control shadow-none fw-medium" id="telInput" placeholder="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} required style={{ borderRadius: "12px", border: "2px solid #e2e8f0" }} onFocus={e=>e.target.style.borderColor="#1ab273"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                      <label htmlFor="telInput" className="text-muted">Numéro de Contact (Réception)</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div style={premiumCardStyle}>
                <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-4">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center text-success">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h4 className="fw-bolder mb-1" style={{ color: "#0f3a23", letterSpacing: "-0.5px" }}>Paiement Sécurisé</h4>
                    <p className="text-muted small mb-0">Toutes les transactions sont chiffrées de bout en bout</p>
                  </div>
                </div>
                
                <div className="d-flex gap-3 mb-5 p-2 bg-light rounded-4 border border-light shadow-sm">
                  <button type="button" className={`btn flex-fill fw-bolder rounded-3 py-3 border-0 transition-all ${typePaiement === 'mobile_money' ? 'bg-white shadow text-success' : 'text-secondary bg-transparent hover-bg-white'}`} style={{ transition: "all 0.3s ease" }} onClick={() => setTypePaiement("mobile_money")}>
                    <Smartphone size={20} className="me-2"/> Mobile Money
                  </button>
                  <button type="button" className={`btn flex-fill fw-bolder rounded-3 py-3 border-0 transition-all ${typePaiement === 'carte' ? 'bg-white shadow text-success' : 'text-secondary bg-transparent hover-bg-white'}`} style={{ transition: "all 0.3s ease" }} onClick={() => setTypePaiement("carte")}>
                    <CreditCard size={20} className="me-2"/> Carte Bancaire
                  </button>
                </div>

                <div className="bg-white rounded-4 border p-4 shadow-sm" style={{ borderColor: "#f1f5f9" }}>
                  {typePaiement === "mobile_money" ? (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex gap-3 mb-4 flex-wrap">
                        {[
                          { name: 'MTN', logo: '/mtn_logo.png', color: '#FFCB00', desc: 'Mobile Money MTN' },
                          { name: 'Moov', logo: '/moov_logo.png', color: '#005BAC', desc: 'Moov Africa Money' },
                          { name: 'Celtis', logo: '/celtis_logo.png', color: '#f97316', desc: 'Celtis Mobile' },
                        ].map(op => (
                          <label key={op.name} className={`form-check flex-fill text-center p-3 rounded-4 cursor-pointer position-relative ${operateur === op.name ? 'shadow-sm' : 'bg-white'}`}
                            style={{ cursor: 'pointer', transition: "all 0.2s", border: operateur === op.name ? `2px solid ${op.color}` : '2px solid #e2e8f0', background: operateur === op.name ? `${op.color}18` : '#fff', transform: operateur === op.name ? 'scale(1.03) translateY(-2px)' : 'none' }}>
                            <input className="form-check-input mt-0 visually-hidden" type="radio" value={op.name} checked={operateur === op.name} onChange={(e) => setOperateur(e.target.value)} />
                            <div className="d-flex flex-column align-items-center gap-2">
                              <img
                                src={op.logo}
                                alt={op.name}
                                width="48"
                                height="48"
                                style={{ borderRadius: '10px', objectFit: 'contain', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                              <div style={{ display: 'none', width: '48px', height: '48px', borderRadius: '10px', background: op.color, alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.85rem' }}>
                                {op.name.slice(0, 3)}
                              </div>
                              <span className="fw-bold" style={{ fontSize: '0.85rem', color: operateur === op.name ? op.color : '#374151' }}>{op.name}</span>
                              <span className="text-muted" style={{ fontSize: '0.7rem' }}>{op.desc}</span>
                            </div>
                            {operateur === op.name && <CheckCircle2 size={16} className="position-absolute top-0 end-0 mt-2 me-2" style={{ color: op.color }} />}
                          </label>
                        ))}
                      </div>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input type="text" className="form-control shadow-none fw-medium text-dark fs-6" id="mobileInput" placeholder="Numéro Mobile Money" value={numeroMobile} onChange={(e) => setNumeroMobile(e.target.value)} required={typePaiement === "mobile_money"} style={{ borderRadius: "12px", border: "2px solid #e2e8f0", letterSpacing: "1px" }} onFocus={e=>e.target.style.borderColor="#1ab273"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                            <label htmlFor="mobileInput" className="text-muted">Numéro à débiter</label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating position-relative">
                            <input type="text" className={`form-control shadow-none fw-medium fs-6 ${confirmNumero && confirmNumero !== numeroMobile ? "is-invalid" : ""}`} id="confirmMobileInput" placeholder="Confirmation" value={confirmNumero} onChange={(e) => setConfirmNumero(e.target.value)} required={typePaiement === "mobile_money"} style={{ borderRadius: "12px", border: "2px solid #e2e8f0", letterSpacing: "1px", color: confirmNumero === numeroMobile && confirmNumero !== "" ? "#1ab273" : "#212529" }} onFocus={e=>{if(!e.target.classList.contains('is-invalid')) e.target.style.borderColor="#1ab273"}} onBlur={e=>{if(!e.target.classList.contains('is-invalid')) e.target.style.borderColor="#e2e8f0"}} />
                            <label htmlFor="confirmMobileInput" className="text-muted">Confirmer le numéro</label>
                            {confirmNumero === numeroMobile && confirmNumero !== "" && (
                               <CheckCircle2 size={20} className="text-success position-absolute" style={{ top: "18px", right: "15px" }} />
                            )}
                          </div>
                          {confirmNumero && confirmNumero !== numeroMobile && <div className="text-danger small mt-2 fw-medium px-2">Les numéros ne correspondent pas.</div>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate__animated animate__fadeIn row g-4">
                      <div className="col-12">
                        <div className="form-floating position-relative">
                          <input type="text" className="form-control shadow-none fw-medium fs-6 text-dark" id="carteInput" placeholder="0000 0000 0000 0000" value={numeroCarte} onChange={(e) => setNumeroCarte(e.target.value)} required={typePaiement === "carte"} style={{ borderRadius: "12px", border: "2px solid #e2e8f0", letterSpacing: "2px", paddingLeft: "3rem" }} onFocus={e=>e.target.style.borderColor="#1ab273"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                          <label htmlFor="carteInput" className="text-muted ms-4">Numéro de carte bancaire</label>
                          <CreditCard size={20} className="text-muted position-absolute" style={{ top: "18px", left: "15px" }} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input type="text" className="form-control shadow-none fw-medium fs-6 text-center text-dark" id="expInput" placeholder="MM/AA" value={dateExp} onChange={(e) => setDateExp(e.target.value)} required={typePaiement === "carte"} style={{ borderRadius: "12px", border: "2px solid #e2e8f0", letterSpacing: "1px" }} onFocus={e=>e.target.style.borderColor="#1ab273"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                          <label htmlFor="expInput" className="text-muted w-100 text-center">Date d'expiration</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input type="password" maxLength={3} className="form-control shadow-none fw-medium fs-6 text-center text-dark" id="cvcInput" placeholder="***" value={cvc} onChange={(e) => setCvc(e.target.value)} required={typePaiement === "carte"} style={{ borderRadius: "12px", border: "2px solid #e2e8f0", letterSpacing: "2px" }} onFocus={e=>e.target.style.borderColor="#1ab273"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                          <label htmlFor="cvcInput" className="text-muted w-100 text-center">CVC / CVV</label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Trust badges */}
              <div className="d-flex align-items-center justify-content-center gap-5 mt-2 opacity-75">
                 <div className="d-flex align-items-center text-secondary fw-medium"><Lock size={16} className="me-2"/> Certifié SSL 256-bit</div>
                 <div className="d-flex align-items-center text-secondary fw-medium"><ShieldCheck size={16} className="me-2"/> Protection AgroEscrow</div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="col-lg-5">
              <div className="sticky-top" style={{ top: "100px", zIndex: 10 }}>
                <div style={{ ...premiumCardStyle, padding: "0" }} className="overflow-hidden">
                  <div className="p-4" style={{ backgroundColor: "#0f3a23", color: "#fff" }}>
                    <h5 className="fw-bolder mb-0 d-flex align-items-center gap-2">
                       <CheckCircle2 size={24} className="text-success" /> Résumé de la commande
                    </h5>
                  </div>
                  
                  <div className="p-4 bg-white" style={{ maxHeight: "320px", overflowY: "auto" }}>
                    {panier.map((item) => (
                      <div key={item.panier_key} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-light">
                        <div className="pe-3">
                          <h6 className="fw-bolder mb-1 text-dark text-truncate" style={{ maxWidth: "200px" }}>{item.nom}</h6>
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <span className="badge bg-light text-secondary border px-2 py-1">x{item.quantite}</span>
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">{item.mode_achat === "gros" ? "Lot Gros" : "Unité Détail"}</span>
                          </div>
                        </div>
                        <div className="fw-bolder text-dark fs-6 text-end">
                          {formatPrice(getPrixByMode(item) * item.quantite)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-light border-top border-bottom border-light">
                    <div className="d-flex justify-content-between text-muted mb-3 fs-6">
                      <span className="fw-medium">Sous-total des produits</span>
                      <span className="fw-bold text-dark">{formatPrice(totalPanier)}</span>
                    </div>
                    {fraisLivraison > 0 && (
                      <div className="d-flex justify-content-between text-muted mb-3 fs-6">
                        <span className="fw-medium">Frais logistiques</span>
                        <span className="fw-bold text-dark">{formatPrice(fraisLivraison)}</span>
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center pt-4 border-top border-secondary border-opacity-10 mt-2">
                      <span className="fw-bolder text-dark fs-6">Total à régler</span>
                      <span className="fw-bolder text-success" style={{ fontSize: "1.6rem", letterSpacing: "-1px" }}>{formatPrice(totalPayable)}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <label className="d-flex align-items-center gap-3 p-3 bg-white rounded-4 border shadow-sm cursor-pointer mb-4" style={{ cursor: "pointer", border: accepted ? "2px solid #1ab273" : "2px solid #e2e8f0", transition: "all 0.2s" }}>
                      <input className="form-check-input m-0 shadow-none border-secondary" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} style={{ width: "24px", height: "24px", cursor: "pointer" }} />
                      <span className="text-secondary small lh-sm fw-medium">
                        J'accepte les <strong>CGU</strong>, la <strong>Politique de Remboursement</strong> et valide ma commande.
                      </span>
                    </label>

                    {!accepted && <div className="alert bg-warning bg-opacity-10 text-warning-emphasis py-2 px-3 small fw-bold border-0 d-flex align-items-center rounded-3"><AlertCircle size={16} className="me-2"/>Veuillez valider les conditions (CGU).</div>}
                    {submitError && <div className="alert bg-danger bg-opacity-10 text-danger py-2 px-3 small fw-bold border-0 d-flex align-items-center rounded-3"><AlertCircle size={16} className="me-2"/>{submitError}</div>}
                    
                    <button type="submit" disabled={loading} className={`btn w-100 rounded-pill py-3 px-4 fw-bolder fs-5 d-flex align-items-center justify-content-center shadow-lg text-white ${accepted ? 'btn-success' : 'btn-secondary opacity-50'}`} style={{ transition: "all 0.3s", transform: accepted && !loading ? 'translateY(-2px)' : 'none' }} onMouseOver={e => {if(accepted && !loading) e.currentTarget.style.boxShadow = '0 15px 30px -10px rgba(26,178,115,0.5)'}} onMouseOut={e => {if(accepted && !loading) e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'}}>
                      {loading ? (
                         <><span className="spinner-border spinner-border-sm me-3 border-2" style={{ width: "1.5rem", height: "1.5rem" }} /> Finalisation...</>
                      ) : (
                         <><Lock size={22} className="me-2" /> Payer {formatPrice(totalPayable)}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Checkout;






