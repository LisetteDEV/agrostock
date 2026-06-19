import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePanier } from "../../context/PanierContext";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, CheckCircle2, ShieldCheck, Smartphone, CreditCard } from "lucide-react";
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

  const fraisLivraison = logistiqueMode === "livreur_propre" ? 0 : 2000;
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
    ctx.font = "bold 52px Arial";
    ctx.fillText("BON DE RETRAIT - AgroStock Benin", 70, 120);

    ctx.strokeStyle = "#1ab273";
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 170, 960, 1040);

    ctx.fillStyle = "#162b20";
    ctx.font = "38px Arial";
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
    ctx.font = "31px Arial";
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

    if (!ville.trim() || !quartier.trim() || !adresse.trim() || !telephone.trim()) {
      setSubmitError("Veuillez remplir toutes les informations de livraison.");
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

    const invalidGross = panier.find((item) => item.mode_achat === "gros" && Number(item.quantite) < Number(item.quantite_min_gros || 20));
    if (invalidGross) {
      setSubmitError(`Le produit ${invalidGross.nom} doit etre commande en gros avec minimum 20.`);
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
          const data = await processPayment(
            {
              panier: panierPayload,
              mode_livraison: modeLivraison,
              logistique_mode: logistiqueMode,
              adresse_livraison: `${adresse} (Q. ${quartier})`,
              ville_livraison: ville,
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
          setSuccessData(data);
          setShowSimulation(false);
        } catch (error) {
          setSubmitError(error.message || "Impossible de creer la commande.");
          setShowSimulation(false);
        } finally {
          setLoading(false);
        }
      }, 1500);
    }, 2200);
  };

  if (panier.length === 0) {
    return (
      <div className="container text-center" style={{ paddingTop: "140px", minHeight: "100vh" }}>
        <AlertCircle size={56} className="text-warning mb-3" />
        <h2 className="fw-bold">Votre panier est vide.</h2>
        <p className="text-muted">Ajoutez des articles avant de passer commande.</p>
        <button onClick={() => navigate("/catalogue")} className="btn btn-success rounded-pill px-4 py-2">
          Retourner au catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "110px", paddingBottom: "60px" }}>
      {showSimulation && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, background: "rgba(0,0,0,0.55)" }}>
          <div className="bg-white rounded-4 p-4 text-center" style={{ maxWidth: "420px", width: "92%" }}>
            {simulationState === "waiting" ? (
              <>
                <div className="spinner-border text-success mb-3" role="status" />
                <h5 className="fw-bold">Paiement en attente</h5>
                <p className="small text-muted mb-0">
                  {typePaiement === "mobile_money" 
                    ? `Validation en cours sur ${operateur} pour le numero ${numeroMobile}...` 
                    : `Validation securisée en cours pour votre carte bancaire...`}
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 size={56} className="text-success mb-3" />
                <h5 className="fw-bold text-success">Paiement reussi</h5>
                <p className="small text-muted mb-0">Creation de la commande en cours...</p>
              </>
            )}
          </div>
        </div>
      )}

      {successData ? (
        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 text-center mx-auto" style={{ maxWidth: "760px" }}>
          <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-3" style={{ width: "72px", height: "72px" }}>
            <CheckCircle2 size={36} />
          </div>
          <h3 className="fw-bold mb-2">Commande validee</h3>
          <p className="text-muted">Vos commandes ont ete enregistrees.</p>

          {(successData.bons_retrait || []).length > 0 && (
            <div className="alert alert-success text-start">
              <div className="fw-bold mb-2">Bon de retrait genere</div>
                            {(successData.bons_retrait || []).map((bon) => (
                <div key={bon.commande_id} className="small border-top pt-2 mt-2">
                  <div>Commande: #CMD-{String(bon.commande_id).padStart(4, "0")}</div>
                  <div>Code retrait: <strong>{bon.code}</strong></div>
                  <div>OTP: <strong>{bon.otp_code}</strong></div>
                  <div>Zone: {bon.zone_retrait || "-"}</div>
                  {bon.gps_link && (
                    <a href={bon.gps_link} target="_blank" rel="noreferrer" className="d-inline-block mt-1">
                      Ouvrir la localisation
                    </a>
                  )}
                  <button type="button" onClick={() => downloadBonImage(bon)} className="btn btn-sm btn-success rounded-pill mt-2">
                    Telecharger le bon en image
                  </button>
                </div>
              ))}
              <div className="small mt-2">Partagez ce bon avec votre livreur (WhatsApp ou capture).</div>
            </div>
          )}

          <div className="bg-light rounded-3 p-3 text-start mb-4">
            {(successData.commandes_id || []).map((id) => (
              <div key={id} className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-bold">#CMD-{String(id).padStart(4, "0")}</span>
                <span className="badge bg-secondary">En attente</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/dashboard-acheteur") } className="btn btn-success rounded-pill px-4 py-2">
            Suivre mes commandes
          </button>
        </div>
      ) : (
        <form onSubmit={handleConfirm} className="row g-4">
          <div className="col-lg-7">
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">Livraison</h5>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Mode de prise en charge</label>
                  <div className="d-flex gap-3 flex-wrap">
                    <label className="form-check border rounded-3 px-3 py-2">
                      <input className="form-check-input" type="radio" value="livreur_propre" checked={logistiqueMode === "livreur_propre"} onChange={(e) => setLogistiqueMode(e.target.value)} />
                      <span className="ms-2 fw-medium">J'ai mon propre livreur</span>
                    </label>
                    <label className="form-check border rounded-3 px-3 py-2">
                      <input className="form-check-input" type="radio" value="gozem" checked={logistiqueMode === "gozem"} onChange={(e) => setLogistiqueMode(e.target.value)} />
                      <span className="ms-2 fw-medium">Besoin d'un livreur</span>
                    </label>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Ville</label>
                  <input className="form-control" value={ville} onChange={(e) => setVille(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Quartier</label>
                  <input className="form-control" value={quartier} onChange={(e) => setQuartier(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Telephone destinataire</label>
                  <input className="form-control" value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Adresse complete</label>
                  <textarea className="form-control" rows="2" value={adresse} onChange={(e) => setAdresse(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">Moyen de paiement</h5>
              
              <div className="d-flex gap-3 mb-4">
                <label className={`form-check px-3 py-2 rounded-3 d-flex align-items-center gap-2 m-0 cursor-pointer flex-fill border ${typePaiement === 'mobile_money' ? 'border-success bg-success bg-opacity-10' : ''}`} style={{ cursor: 'pointer' }}>
                  <input className="form-check-input m-0" type="radio" value="mobile_money" checked={typePaiement === "mobile_money"} onChange={(e) => setTypePaiement(e.target.value)} />
                  <span className="fw-bold" style={{ color: typePaiement === 'mobile_money' ? '#105c38' : '#64748b' }}><Smartphone size={18}/> Mobile Money</span>
                </label>
                <label className={`form-check px-3 py-2 rounded-3 d-flex align-items-center gap-2 m-0 cursor-pointer flex-fill border ${typePaiement === 'carte' ? 'border-success bg-success bg-opacity-10' : ''}`} style={{ cursor: 'pointer' }}>
                  <input className="form-check-input m-0" type="radio" value="carte" checked={typePaiement === "carte"} onChange={(e) => setTypePaiement(e.target.value)} />
                  <span className="fw-bold" style={{ color: typePaiement === 'carte' ? '#105c38' : '#64748b' }}><CreditCard size={18}/> Carte Bancaire</span>
                </label>
              </div>

              {typePaiement === "mobile_money" ? (
                <>
                  <div className="d-flex gap-3 gap-md-4 mb-3 flex-wrap">
                    <label className="form-check border px-3 py-2 rounded-3 d-flex align-items-center gap-2 m-0 cursor-pointer" style={{ cursor: 'pointer' }}>
                      <input className="form-check-input m-0" type="radio" value="MTN" checked={operateur === "MTN"} onChange={(e) => setOperateur(e.target.value)} /> <span className="fw-medium">MTN</span>
                    </label>
                    <label className="form-check border px-3 py-2 rounded-3 d-flex align-items-center gap-2 m-0 cursor-pointer" style={{ cursor: 'pointer' }}>
                      <input className="form-check-input m-0" type="radio" value="Moov" checked={operateur === "Moov"} onChange={(e) => setOperateur(e.target.value)} /> <span className="fw-medium">Moov</span>
                    </label>
                    <label className="form-check border px-3 py-2 rounded-3 d-flex align-items-center gap-2 m-0 cursor-pointer" style={{ cursor: 'pointer' }}>
                      <input className="form-check-input m-0" type="radio" value="Celtis" checked={operateur === "Celtis"} onChange={(e) => setOperateur(e.target.value)} /> <span className="fw-medium">Celtis</span>
                    </label>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Numero a debiter</label>
                      <div className="input-group">
                        <span className="input-group-text"><Smartphone size={16} /></span>
                        <input className="form-control" value={numeroMobile} onChange={(e) => setNumeroMobile(e.target.value)} required={typePaiement === "mobile_money"} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Confirmer le numero</label>
                      <input className={`form-control ${confirmNumero && confirmNumero !== numeroMobile ? "is-invalid" : ""}`} value={confirmNumero} onChange={(e) => setConfirmNumero(e.target.value)} required={typePaiement === "mobile_money"} />
                      {confirmNumero && confirmNumero !== numeroMobile && <div className="invalid-feedback">Les numeros ne correspondent pas.</div>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Numero de carte</label>
                    <div className="input-group">
                      <span className="input-group-text"><CreditCard size={16} /></span>
                      <input className="form-control" placeholder="0000 0000 0000 0000" value={numeroCarte} onChange={(e) => setNumeroCarte(e.target.value)} required={typePaiement === "carte"} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date d'expiration</label>
                    <input className="form-control" placeholder="MM/AA" value={dateExp} onChange={(e) => setDateExp(e.target.value)} required={typePaiement === "carte"} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">CVC / CVV</label>
                    <input className="form-control" placeholder="123" type="password" maxLength={3} value={cvc} onChange={(e) => setCvc(e.target.value)} required={typePaiement === "carte"} />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-4 shadow-sm p-4">
              <h6 className="fw-bold mb-3">Pourquoi rester sur AgroStock ?</h6>
              <ul className="small text-muted mb-0" style={{ lineHeight: "1.8" }}>
                <li>Paiement protege en escrow jusqu'a reception.</li>
                <li>Historique de commandes et preuve de livraison.</li>
                <li>Gestion de litige et arbitrage plateforme.</li>
                <li>Points fidelite + credit remise sur prochaines commandes.</li>
                <li>Clause anti-contournement active: sanctions possibles en cas de vente hors plateforme.</li>
              </ul>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="bg-white rounded-4 shadow-sm p-4">
              <h5 className="fw-bold mb-3">Recapitulatif</h5>
              <div className="mb-3" style={{ maxHeight: "250px", overflowY: "auto" }}>
                {panier.map((item) => (
                  <div key={item.panier_key} className="d-flex justify-content-between border-bottom py-2">
                    <div>
                      <div className="fw-bold">{item.nom}</div>
                      <small className="text-muted">Quantite: {item.quantite} | {item.mode_achat === "gros" ? "Gros" : "Detail"}</small>
                    </div>
                    <div className="fw-bold text-success">{formatPrice(getPrixByMode(item) * item.quantite)}</div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between text-muted mb-2">
                <span>Sous-total</span>
                <span>{formatPrice(totalPanier)}</span>
              </div>
              <div className="d-flex justify-content-between text-muted mb-3">
                <span>Frais livraison</span>
                <span>{formatPrice(fraisLivraison)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-3">
                <span className="fw-bold">Total</span>
                <span className="fw-bold text-success fs-4">{formatPrice(totalPayable)}</span>
              </div>

              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="termsCheck" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                <label className="form-check-label" htmlFor="termsCheck">Je confirme la commande, les CGU et la clause anti-contournement.</label>
              </div>

              {!accepted && <div className="alert alert-warning small py-2">Cochez la confirmation pour activer le paiement.</div>}
              {submitError && <div className="alert alert-danger small py-2">{submitError}</div>}
              <button type="submit" disabled={loading} className="btn btn-success w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2">
                {loading ? <span className="spinner-border spinner-border-sm" /> : <><ShieldCheck size={18} /> Payer {formatPrice(totalPayable)}</>}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Checkout;





