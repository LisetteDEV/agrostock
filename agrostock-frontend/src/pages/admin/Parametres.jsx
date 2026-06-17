import React, { useState, useEffect } from 'react';
import {
  Settings,
  DollarSign,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/config';

const API = `${API_URL}`;

const AlertMsg = ({ type, msg }) => {
  if (!msg) return null;
  const isSuccess = type === 'success';

  return (
    <div className={`d-flex align-items-center gap-2 p-3 rounded-3 mb-3 ${isSuccess ? 'bg-success' : 'bg-danger'} bg-opacity-15`}>
      {isSuccess ? (
        <CheckCircle size={16} className="text-success flex-shrink-0" />
      ) : (
        <AlertCircle size={16} className="text-danger flex-shrink-0" />
      )}
      <span className={`small fw-bold ${isSuccess ? 'text-success' : 'text-danger'}`}>{msg}</span>
    </div>
  );
};

const SectionParametres = () => {
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState('generales');

  const [generalForm, setGeneralForm] = useState({ nom_complet: '', email: '' });
  const [generalAlert, setGeneralAlert] = useState(null);
  const [generalSaving, setGeneralSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwAlert, setPwAlert] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  const [commissionForm, setCommissionForm] = useState({ commission_taux: 10 });
  const [commissionAlert, setCommissionAlert] = useState(null);
  const [commissionSaving, setCommissionSaving] = useState(false);

  const [notifForm, setNotifForm] = useState({
    notification_nouvelle_commande: true,
    notification_litige: true,
    notification_paiement: true,
    notification_email: true,
    notification_sms: false,
  });
  const [notifAlert, setNotifAlert] = useState(null);
  const [notifSaving, setNotifSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API}/admin/parametres/profile`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });

        const data = await res.json();
        if (!res.ok) return;

        setGeneralForm({
          nom_complet: data.nom_complet || '',
          email: data.email || '',
        });

        setCommissionForm({
          commission_taux: Number(data.settings?.commission_taux ?? 10),
        });

        setNotifForm({
          notification_nouvelle_commande: Boolean(data.settings?.notification_nouvelle_commande ?? true),
          notification_litige: Boolean(data.settings?.notification_litige ?? true),
          notification_paiement: Boolean(data.settings?.notification_paiement ?? true),
          notification_email: Boolean(data.settings?.notification_email ?? true),
          notification_sms: Boolean(data.settings?.notification_sms ?? false),
        });
      } catch {
        // no-op
      }
    };

    if (token) loadProfile();
  }, [token]);

  const saveGenerales = async (e) => {
    e.preventDefault();
    setGeneralSaving(true);
    setGeneralAlert(null);

    try {
      const res = await fetch(`${API}/admin/parametres/generales`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(generalForm),
      });

      const data = await res.json();
      setGeneralAlert({ type: res.ok ? 'success' : 'error', msg: data.message || 'Mise a jour impossible.' });
    } catch {
      setGeneralAlert({ type: 'error', msg: 'Erreur de connexion au serveur.' });
    }

    setGeneralSaving(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();

    if (pwForm.password !== pwForm.password_confirmation) {
      setPwAlert({ type: 'error', msg: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    setPwSaving(true);
    setPwAlert(null);

    try {
      const res = await fetch(`${API}/admin/parametres/password`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(pwForm),
      });

      const data = await res.json();
      if (res.ok) {
        setPwAlert({ type: 'success', msg: data.message || 'Mot de passe mis a jour.' });
        setPwForm({ current_password: '', password: '', password_confirmation: '' });
      } else {
        setPwAlert({ type: 'error', msg: data.message || 'Mise a jour impossible.' });
      }
    } catch {
      setPwAlert({ type: 'error', msg: 'Erreur de connexion au serveur.' });
    }

    setPwSaving(false);
  };

  const saveCommissions = async (e) => {
    e.preventDefault();
    setCommissionSaving(true);
    setCommissionAlert(null);

    try {
      const res = await fetch(`${API}/admin/parametres/commissions`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          commission_taux: Number(commissionForm.commission_taux),
        }),
      });

      const data = await res.json();
      setCommissionAlert({ type: res.ok ? 'success' : 'error', msg: data.message || 'Mise a jour impossible.' });
      if (res.ok && data.settings?.commission_taux !== undefined) {
        setCommissionForm({ commission_taux: Number(data.settings.commission_taux) });
      }
    } catch {
      setCommissionAlert({ type: 'error', msg: 'Erreur de connexion au serveur.' });
    }

    setCommissionSaving(false);
  };

  const saveNotifications = async (e) => {
    e.preventDefault();
    setNotifSaving(true);
    setNotifAlert(null);

    try {
      const res = await fetch(`${API}/admin/parametres/notifications`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(notifForm),
      });

      const data = await res.json();
      setNotifAlert({ type: res.ok ? 'success' : 'error', msg: data.message || 'Mise a jour impossible.' });
    } catch {
      setNotifAlert({ type: 'error', msg: 'Erreur de connexion au serveur.' });
    }

    setNotifSaving(false);
  };

  const toggleNotif = (key) => {
    setNotifForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      id: 'generales',
      title: 'Informations generales',
      desc: 'Nom affiche et adresse email du compte admin',
      icon: <Settings size={22} />,
      color: '#1ab273',
      content: (
        <form onSubmit={saveGenerales} className="mt-3">
          <AlertMsg type={generalAlert?.type} msg={generalAlert?.msg} />
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">NOM COMPLET</label>
              <input
                className="form-control border-0 text-white"
                style={{ background: '#0e261a' }}
                value={generalForm.nom_complet}
                onChange={(e) => setGeneralForm((p) => ({ ...p, nom_complet: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">EMAIL ADMIN</label>
              <input
                type="email"
                className="form-control border-0 text-white"
                style={{ background: '#0e261a' }}
                value={generalForm.email}
                onChange={(e) => setGeneralForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" disabled={generalSaving} className="btn btn-success rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2">
              <Save size={16} />
              {generalSaving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      ),
    },
    {
      id: 'securite',
      title: 'Securite',
      desc: 'Changer votre mot de passe administrateur',
      icon: <Shield size={22} />,
      color: '#3b82f6',
      content: (
        <form onSubmit={savePassword} className="mt-3">
          <AlertMsg type={pwAlert?.type} msg={pwAlert?.msg} />
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label text-muted small fw-bold">MOT DE PASSE ACTUEL</label>
              <div className="position-relative">
                <input
                  type={showPw.current ? 'text' : 'password'}
                  className="form-control border-0 text-white pe-5"
                  style={{ background: '#0e261a' }}
                  value={pwForm.current_password}
                  onChange={(e) => setPwForm((p) => ({ ...p, current_password: e.target.value }))}
                  required
                />
                <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-2" onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}>
                  {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">NOUVEAU MOT DE PASSE</label>
              <div className="position-relative">
                <input
                  type={showPw.next ? 'text' : 'password'}
                  className="form-control border-0 text-white pe-5"
                  style={{ background: '#0e261a' }}
                  value={pwForm.password}
                  onChange={(e) => setPwForm((p) => ({ ...p, password: e.target.value }))}
                  minLength={6}
                  required
                />
                <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-2" onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))}>
                  {showPw.next ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">CONFIRMATION</label>
              <div className="position-relative">
                <input
                  type={showPw.confirm ? 'text' : 'password'}
                  className="form-control border-0 text-white pe-5"
                  style={{ background: '#0e261a' }}
                  value={pwForm.password_confirmation}
                  onChange={(e) => setPwForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                  required
                />
                <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-2" onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}>
                  {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" disabled={pwSaving} className="btn btn-primary rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2">
              <Shield size={16} />
              {pwSaving ? 'Mise a jour...' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      ),
    },
    {
      id: 'commissions',
      title: 'Commissions',
      desc: 'Pourcentage preleve sur les ventes',
      icon: <DollarSign size={22} />,
      color: '#f59e0b',
      content: (
        <form onSubmit={saveCommissions} className="mt-3">
          <AlertMsg type={commissionAlert?.type} msg={commissionAlert?.msg} />
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label text-muted small fw-bold">TAUX DE COMMISSION (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className="form-control border-0 text-white"
                style={{ background: '#0e261a' }}
                value={commissionForm.commission_taux}
                onChange={(e) => setCommissionForm({ commission_taux: e.target.value })}
                required
              />
            </div>
            <div className="col-md-8">
              <div className="p-3 rounded-3" style={{ background: '#0e261a' }}>
                <span className="small text-muted">
                  Ce taux sera utilise par le systeme lors du calcul de la commission sur chaque commande payee.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" disabled={commissionSaving} className="btn btn-warning rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2">
              <Save size={16} />
              {commissionSaving ? 'Mise a jour...' : 'Enregistrer la commission'}
            </button>
          </div>
        </form>
      ),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      desc: 'Alertes automatiques de la plateforme',
      icon: <Bell size={22} />,
      color: '#8b5cf6',
      content: (
        <form onSubmit={saveNotifications} className="mt-3">
          <AlertMsg type={notifAlert?.type} msg={notifAlert?.msg} />
          <div className="d-flex flex-column gap-3">
            {[
              ['notification_nouvelle_commande', 'Nouvelle commande recue'],
              ['notification_litige', 'Nouveau litige ouvert'],
              ['notification_paiement', 'Paiement confirme'],
              ['notification_email', 'Envoyer aussi par email'],
              ['notification_sms', 'Envoyer aussi par SMS'],
            ].map(([key, label]) => (
              <label key={key} className="d-flex align-items-center justify-content-between rounded-3 p-3" style={{ background: '#0e261a', cursor: 'pointer' }}>
                <span className="text-white fw-medium">{label}</span>
                <div className="form-check form-switch m-0">
                  <input className="form-check-input" type="checkbox" checked={notifForm[key]} onChange={() => toggleNotif(key)} />
                </div>
              </label>
            ))}
          </div>

          <div className="mt-4">
            <button type="submit" disabled={notifSaving} className="btn btn-info rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2 text-white">
              <Save size={16} />
              {notifSaving ? 'Mise a jour...' : 'Enregistrer les notifications'}
            </button>
          </div>
        </form>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1 text-white">Parametres</h4>
        <span style={{ color: '#8a9b92' }} className="small">Gerez les parametres de la plateforme</span>
      </div>

      <div className="d-flex flex-column gap-3">
        {sections.map((s) => {
          const isOpen = activeSection === s.id;
          return (
            <div key={s.id} className="card border-0 rounded-4 shadow-lg overflow-hidden" style={{ background: '#0a1d13' }}>
              <button
                onClick={() => setActiveSection(isOpen ? null : s.id)}
                className="btn w-100 d-flex align-items-center gap-3 p-4 text-start"
                style={{ background: 'transparent', borderBottom: isOpen ? '1px solid #183827' : 'none' }}
              >
                <div className="p-3 rounded-circle flex-shrink-0" style={{ background: `${s.color}20`, color: s.color }}>
                  {s.icon}
                </div>
                <div className="flex-grow-1">
                  <h6 className="fw-bold text-white mb-1">{s.title}</h6>
                  <p className="text-muted small mb-0">{s.desc}</p>
                </div>
                <ChevronDown size={20} className="text-muted flex-shrink-0" style={{ transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              {isOpen && <div className="p-4">{s.content}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionParametres;
