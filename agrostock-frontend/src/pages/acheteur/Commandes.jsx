import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Package, MapPin, Search, Clock, Truck, CheckCircle2, ShieldCheck, Gift } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from '../../services/config';

const Commandes = () => {
  const { token } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [uiMessage, setUiMessage] = useState(null);
  const [receptionConfirmId, setReceptionConfirmId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [fidelite, setFidelite] = useState({ points: 0, credit_remise: 0 });
  const [disputeCommandeId, setDisputeCommandeId] = useState(null);
  const [disputeMotif, setDisputeMotif] = useState("commande non recue");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  const loadCommandes = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/acheteur/commandes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCommandes(data.commandes || []);
        setFidelite(data.fidelite || { points: 0, credit_remise: 0 });
      }
    } catch (e) {
      console.error("Erreur chargement commandes", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    loadCommandes();
    const interval = setInterval(() => {
      loadCommandes();
    }, 15000);

    return () => clearInterval(interval);
  }, [token]);

  const handleConfirmReception = async (id) => {
    setUiMessage(null);
    setActionLoadingId(id);

    try {
      const res = await fetch(`${API_URL}/acheteur/commandes/${id}/reception`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUiMessage({ type: "danger", text: data.message || "Impossible de confirmer la reception." });
        return;
      }

      setCommandes((prev) => prev.map((c) => (c.id === id ? { ...c, statut: data.statut || "recue" } : c)));
      setUiMessage({ type: "success", text: "Reception confirmee." });
      await loadCommandes();
    } catch (e) {
      setUiMessage({ type: "danger", text: "Erreur technique lors de la confirmation de reception." });
    } finally {
      setActionLoadingId(null);
      setReceptionConfirmId(null);
    }
  };

  const confirmReceptionAction = async () => {
    if (!receptionConfirmId) return;
    await handleConfirmReception(receptionConfirmId);
  };

  const handleOpenDispute = (id) => {
    setUiMessage(null);
    setDisputeCommandeId(id);
    setDisputeMotif("commande non recue");
    setDisputeDescription("");
  };

  const closeDisputeModal = () => {
    if (disputeSubmitting) return;
    setDisputeCommandeId(null);
    setDisputeMotif("commande non recue");
    setDisputeDescription("");
  };

  const submitDispute = async () => {
    if (!disputeCommandeId) return;
    const motif = (disputeMotif || "").trim();
    const description = (disputeDescription || "").trim();

    if (!motif) {
      setUiMessage({ type: "danger", text: "Le motif du litige est obligatoire." });
      return;
    }

    setDisputeSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/acheteur/commandes/${disputeCommandeId}/litige`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ motif, description }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUiMessage({ type: "danger", text: data.message || "Impossible d'ouvrir le litige." });
        return;
      }

      setUiMessage({ type: "success", text: "Litige ouvert. L'administration va traiter votre dossier." });
      setCommandes((prev) => prev.map((c) => (c.id === disputeCommandeId ? { ...c, statut: "litige_ouvert" } : c)));
      closeDisputeModal();
    } catch {
      setUiMessage({ type: "danger", text: "Erreur technique lors de l'ouverture du litige." });
    } finally {
      setDisputeSubmitting(false);
    }
  };

    const shareBonRetrait = (cmd) => {
    const bon = cmd?.bon_retrait;
    if (!bon) return;

    const text = [
      "BON DE RETRAIT - AgroStock Benin",
      "---------------------------------",
      `Code commande : ${bon.code}`,
      `Vendeur : ${cmd.vendeur_nom || "-"}`,
      `Zone retrait : ${bon.zone_retrait || "-"}`,
      `Lien GPS : ${bon.gps_link || "-"}`,
      `OTP : ${bon.otp_code || "-"}`,
      "Votre livreur doit presenter ce bon pour recuperer la commande.",
    ].join("\n");

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadBonImage = (cmd) => {
    const bon = cmd?.bon_retrait;
    if (!bon) return;

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
      `Code commande  : ${bon.code || "-"}`,
      `Vendeur        : ${cmd.vendeur_nom || "-"}`,
      `Quartier       : ${bon.zone_retrait || "-"}`,
      `Lien GPS       : ${bon.gps_link || "-"}`,
      `OTP acheteur   : ${bon.otp_code || "-"}`,
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
    link.download = `${bon.code || "bon-retrait"}.png`;
    link.click();
  };
  const getStatusInfo = (status) => {
    switch (status) {
      case "en_attente_confirmation":
        return { label: "En attente", color: "secondary", icon: <Clock size={16} /> };
      case "confirmee":
        return { label: "Confirmee", color: "primary", icon: <CheckCircle2 size={16} /> };
      case "en_attente_retrait_livreur":
        return { label: "En attente retrait livreur", color: "warning", icon: <ShieldCheck size={16} /> };
      case "en_cours_livraison":
        return { label: "En cours de livraison", color: "warning", icon: <Truck size={16} /> };
      case "livree":
        return { label: "Livree", color: "success", icon: <CheckCircle2 size={16} /> };
      case "recue":
        return { label: "Reception confirmee", color: "success", icon: <CheckCircle2 size={16} /> };
      case "litige_ouvert":
        return { label: "Litige ouvert", color: "danger", icon: <ShieldCheck size={16} /> };
      case "remboursee":
        return { label: "Remboursee", color: "warning", icon: <CheckCircle2 size={16} /> };
      case "annulee_auto":
      case "annulee":
        return { label: "Annulee", color: "secondary", icon: <Package size={16} /> };
      default:
        return { label: status || "Traitement", color: "secondary", icon: <Package size={16} /> };
    }
  };


  const canShowBon = (cmd) => {
    const statut = cmd?.statut;
    return cmd?.logistique_mode === "livreur_propre" && ["en_attente_retrait_livreur", "en_cours_livraison", "livree"].includes(statut);
  };

  const filteredCommandes = commandes.filter((cmd) => String(cmd.numero || cmd.id).toLowerCase().includes(searchTerm.toLowerCase()));
  const formatPrice = (val) => Number(val || 0).toLocaleString("fr-FR") + " FCFA";

  return (
    <div className="bg-light min-vh-100 pb-5 p-4 p-lg-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#0f3a23" }}>Mes Commandes</h2>
            <p className="text-muted mb-0">Suivez l'etat reel de vos achats et livraisons</p>
          </div>
          <div className="bg-white border rounded-3 px-3 py-2 small">
            <div className="fw-bold d-flex align-items-center gap-2"><Gift size={16} className="text-success" /> Fidelite</div>
            <div>Points: <strong>{fidelite.points || 0}</strong></div>
            <div>Credit remise: <strong>{formatPrice(fidelite.credit_remise || 0)}</strong></div>
          </div>
        </div>

        <div className="alert alert-info small">
          Avantages AgroStock: paiement escrow, historique complet, gestion litiges, preuve de livraison, points fidelite et remises. Le contournement de la plateforme est interdit.
        </div>

        <div className="bg-white p-4 rounded-4 shadow-sm mb-4 border d-flex align-items-center" style={{ borderColor: "#e1e9e4" }}>
          <Search className="text-muted me-3" size={20} />
          <input type="text" className="form-control border-0 bg-transparent shadow-none" placeholder="Rechercher une commande" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {uiMessage && <div className={`alert alert-${uiMessage.type} mb-4`}>{uiMessage.text}</div>}

        {loading ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm border">Chargement des commandes...</div>
        ) : filteredCommandes.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
            <ShoppingBag size={60} className="text-muted opacity-25 mb-3" />
            <h4 className="fw-bold">Aucune commande trouvee</h4>
          </div>
        ) : (
          <div className="row g-4">
            {filteredCommandes.map((cmd, idx) => {
              const stat = getStatusInfo(cmd.statut);
              const bon = canShowBon(cmd) ? cmd.bon_retrait : null;
              return (
                <motion.div key={cmd.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="col-12">
                  <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                    <div className="card-header bg-white border-bottom p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
                      <div>
                        <h5 className="fw-bold mb-1">Commande #{cmd.numero || `CMD-${String(cmd.id).padStart(4, "0")}`}</h5>
                        <small className="text-muted">{new Date(cmd.date).toLocaleDateString("fr-FR")}</small>
                      </div>
                      <div className="text-end">
                        <div className={`badge bg-${stat.color} bg-opacity-10 text-${stat.color} px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2 mb-2`}>{stat.icon} {stat.label}</div>
                        <h5 className="fw-bold text-success mb-0">{formatPrice(cmd.montant_total)}</h5>
                      </div>
                    </div>

                    <div className="card-body p-4 bg-light bg-opacity-50">
                      <div className="row g-4 mb-3">
                        <div className="col-md-8">
                          <h6 className="fw-bold text-dark mb-3 text-uppercase" style={{ fontSize: "0.8rem" }}>Articles</h6>
                          <div className="d-flex flex-column gap-3">
                            {(cmd.items || []).map((item) => (
                              <div key={item.id} className="d-flex align-items-center gap-3 bg-white p-3 rounded-3 border">
                                <div className="bg-success bg-opacity-10 rounded d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "50px", height: "50px" }}>
                                  {item.image_url ? <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }} /> : <Package size={24} className="text-success" />}
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="fw-bold mb-0">{item.nom}</h6>
                                  <small className="text-muted">Quantite : {item.quantite} x {formatPrice(item.prix_unitaire)}</small>
                                </div>
                                <div className="fw-bold text-dark">{formatPrice(item.sous_total)}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="col-md-4">
                          <h6 className="fw-bold text-dark mb-3 text-uppercase" style={{ fontSize: "0.8rem" }}>Informations</h6>
                          <div className="bg-white p-3 rounded-3 border h-100">
                            <div className="d-flex align-items-start gap-2 mb-3">
                              <MapPin size={18} className="text-success mt-1 flex-shrink-0" />
                              <div>
                                <strong className="d-block small">{cmd.logistique_mode === 'livreur_propre' ? 'Retrait livreur propre' : 'Livraison domicile (simulation)'}</strong>
                                <span className="text-muted small">{cmd.adresse_livraison || "Adresse non renseignee"}</span>
                              </div>
                            </div>

                            {!!bon && (
                              <div className="border rounded-3 p-2 mb-3 small bg-light">
                                <div className="fw-bold mb-1">Bon de retrait</div>
                                <div>Code: <strong>{bon.code}</strong></div>
                                <div>OTP: <strong>{bon.otp_code || '******'}</strong></div>
                                <div>Zone: {bon.zone_retrait || '-'}</div>
                                {bon.gps_link && <a href={bon.gps_link} target="_blank" rel="noreferrer" className="small">Ouvrir GPS</a>}
                                <button onClick={() => shareBonRetrait(cmd)} className="btn btn-sm btn-outline-success w-100 rounded-pill mt-2">Partager au livreur (WhatsApp)</button>
                                <button onClick={() => downloadBonImage(cmd)} className="btn btn-sm btn-success w-100 rounded-pill mt-2">Telecharger le bon en image</button>
                              </div>
                            )}

                            <div className="small text-muted mb-3">
                              <div>Sous-total: <strong className="text-dark">{formatPrice(cmd.sous_total)}</strong></div>
                              <div>Remise: <strong className="text-dark">{formatPrice(cmd.remise_appliquee)}</strong></div>
                              <div>Livraison: <strong className="text-dark">{formatPrice(cmd.frais_livraison)}</strong></div>
                            </div>

                            {cmd.statut === "livree" ? (
                              <button onClick={() => setReceptionConfirmId(cmd.id)} disabled={actionLoadingId === cmd.id} className="btn btn-sm btn-success w-100 rounded-pill fw-bold">{actionLoadingId === cmd.id ? "Traitement..." : "Confirmer la reception"}</button>
                            ) : cmd.statut === "recue" ? (
                              <button className="btn btn-sm btn-outline-success w-100 rounded-pill fw-bold" disabled>Reception confirmee</button>
                            ) : (
                              <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill fw-bold" disabled>En cours</button>
                            )}

                            {!['recue', 'remboursee', 'annulee_auto', 'litige_ouvert'].includes(cmd.statut) && (
                              <button onClick={() => handleOpenDispute(cmd.id)} className="btn btn-sm btn-outline-danger w-100 rounded-pill fw-bold mt-2">Ouvrir un litige</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {receptionConfirmId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Confirmer la reception</h5>
                <button type="button" className="btn-close" aria-label="Fermer" onClick={() => setReceptionConfirmId(null)}></button>
              </div>
              <div className="modal-body pt-2"><p className="mb-0 text-muted">Confirmez-vous avoir bien recu cette commande ?</p></div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setReceptionConfirmId(null)}>Annuler</button>
                <button type="button" className="btn btn-success rounded-pill px-4" onClick={confirmReceptionAction} disabled={actionLoadingId === receptionConfirmId}>{actionLoadingId === receptionConfirmId ? "Traitement..." : "Oui, confirmer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {disputeCommandeId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Ouvrir un litige</h5>
                <button type="button" className="btn-close" aria-label="Fermer" onClick={closeDisputeModal}></button>
              </div>
              <div className="modal-body pt-2">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Motif</label>
                  <input
                    type="text"
                    className="form-control"
                    value={disputeMotif}
                    onChange={(e) => setDisputeMotif(e.target.value)}
                    placeholder="Ex: commande non recue"
                  />
                </div>
                <div>
                  <label className="form-label fw-semibold">Description (optionnel)</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    placeholder="Ajoutez des details utiles pour l'administration"
                  />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={closeDisputeModal} disabled={disputeSubmitting}>Annuler</button>
                <button type="button" className="btn btn-danger rounded-pill px-4" onClick={submitDispute} disabled={disputeSubmitting}>
                  {disputeSubmitting ? "Envoi..." : "Envoyer le litige"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commandes;












