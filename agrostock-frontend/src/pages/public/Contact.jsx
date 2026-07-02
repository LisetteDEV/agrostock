import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock3, Send, Sparkles, MessageSquareQuote } from 'lucide-react';
import { API_URL } from '../../services/config';

const Contact = () => {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
        setAlert({ type: 'danger', message: firstError || data.message || 'Impossible d envoyer le message.' });
        return;
      }

      setAlert({ type: 'success', message: data.message || 'Message envoye avec succes.' });
      setForm({ nom: '', email: '', telephone: '', sujet: '', message: '' });
    } catch {
      setAlert({ type: 'danger', message: 'Erreur reseau. Verifiez votre connexion.' });
    } finally {
      setLoading(false);
    }
  };

  const contactCards = [
    { icon: <Phone size={18} />, title: 'Telephone', value: '+229 00 00 00 00' },
    { icon: <Mail size={18} />, title: 'Email', value: 'contact@agrostock.bj' },
    { icon: <MapPin size={18} />, title: 'Adresse', value: 'Cotonou, Benin' },
    { icon: <Clock3 size={18} />, title: 'Horaires', value: 'Lun - Sam | 8h00 - 19h00' },
  ];

  return (
    <div style={{ background: '#f8fbf7' }}>
      <section
        className="position-relative overflow-hidden"
        style={{
            padding: '80px 0 20px 0',
            background: 'linear-gradient(135deg, rgba(15,46,28,0.85) 0%, rgba(23,84,50,0.85) 100%), url(/images/hero/slide1.jpg) center/cover no-repeat',
            color: '#f3fbf6',
        }}
      >
        {/* Decorative UI elements */}
        <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ pointerEvents: 'none', opacity: 0.6 }}>
            <div className="position-absolute" style={{ top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(26, 178, 115, 0.4) 0%, transparent 60%)', borderRadius: '50%' }} />
            <div className="position-absolute" style={{ bottom: '-20%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, transparent 60%)', borderRadius: '50%' }} />
        </div>
        <div className="container position-relative z-1 pt-4 pb-2">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}>
                <Sparkles size={16} style={{ color: '#58d49a' }} />
                <span className="small fw-semibold">Service relation clients AgroStock</span>
              </div>
              <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.6rem)', letterSpacing: '-0.02em', lineHeight: 1.08, fontFamily: 'Poppins, Segoe UI, sans-serif' }}>
                Discutons de votre projet avec une equipe qui repond vite.
              </h1>
              <p className="mb-0" style={{ color: '#bdd8ca', maxWidth: '720px', fontSize: '1.04rem', lineHeight: 1.7 }}>
                Une question sur vos commandes, un besoin de partenariat ou un accompagnement pour votre entreprise?
                Envoyez votre message et nous revenons vers vous avec une reponse concrete.
              </p>
            </div>

            <div className="col-lg-5">
              <div className="p-4 p-md-5 rounded-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}>
                <div className="d-flex align-items-start gap-3">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-3" style={{ width: 46, height: 46, background: 'rgba(26,178,115,0.22)', color: '#67e0a6' }}>
                    <MessageSquareQuote size={20} />
                  </div>
                  <div>
                    <p className="mb-1 fw-semibold">AgroStock Support</p>
                    <p className="mb-0 small" style={{ color: '#cae4d7' }}>
                      "Chaque demande est analysee par une personne, pas un robot."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4 mb-4">
            {contactCards.map((card) => (
              <div className="col-12 col-sm-6 col-lg-3" key={card.title}>
                <div className="h-100 p-4 rounded-4" style={{ background: '#ffffff', border: '1px solid #e7efe9', boxShadow: '0 12px 30px rgba(13, 46, 30, 0.06)' }}>
                  <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: 42, height: 42, background: '#e7f7ef', color: '#157f52' }}>
                    {card.icon}
                  </div>
                  <p className="mb-1 small fw-bold text-uppercase" style={{ color: '#7c8e84', letterSpacing: '0.04em' }}>{card.title}</p>
                  <p className="mb-0 fw-semibold" style={{ color: '#12271d' }}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 align-items-start">
            <div className="col-lg-5">
              <div className="p-4 p-md-5 rounded-4 h-100" style={{ background: 'linear-gradient(160deg, #143b29 0%, #0f2d1f 100%)', color: '#e8f5ee', boxShadow: '0 16px 40px rgba(9, 32, 21, 0.35)' }}>
                <h3 className="fw-bold mb-3" style={{ fontFamily: 'Poppins, Segoe UI, sans-serif' }}>Pourquoi nous ecrire?</h3>
                <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                  <li>Accompagnement de transformateurs et acheteurs.</li>
                  <li>Signalement d un probleme de commande ou de paiement.</li>
                  <li>Demande de partenariat institutionnel ou commercial.</li>
                  <li>Questions generales sur la plateforme AgroStock Benin.</li>
                </ul>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="p-4 p-md-5 rounded-4" style={{ background: '#ffffff', border: '1px solid #e5eee8', boxShadow: '0 20px 45px rgba(18, 53, 36, 0.08)' }}>
                <h3 className="fw-bold mb-4" style={{ color: '#173527', fontFamily: 'Poppins, Segoe UI, sans-serif' }}>Envoyer un message</h3>

                {alert && (
                  <div className={`alert alert-${alert.type} border-0`} role="alert">
                    {alert.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small" style={{ color: '#355545' }}>Nom complet</label>
                    <input
                      className="form-control form-control-lg"
                      value={form.nom}
                      onChange={(e) => handleChange('nom', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small" style={{ color: '#355545' }}>Email</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small" style={{ color: '#355545' }}>Telephone (optionnel)</label>
                    <input
                      className="form-control form-control-lg"
                      value={form.telephone}
                      onChange={(e) => handleChange('telephone', e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small" style={{ color: '#355545' }}>Sujet</label>
                    <input
                      className="form-control form-control-lg"
                      value={form.sujet}
                      onChange={(e) => handleChange('sujet', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold small" style={{ color: '#355545' }}>Message</label>
                    <textarea
                      rows="6"
                      className="form-control form-control-lg"
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-lg px-4 py-3 rounded-pill fw-bold d-inline-flex align-items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #1ab273 0%, #0f6f46 100%)', color: '#fff', border: 'none' }}
                    >
                      <Send size={18} /> {loading ? 'Envoi en cours...' : 'Envoyer maintenant'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
