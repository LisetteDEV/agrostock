import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerRequest } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const initialState = {
  role: 'acheteur',
  nom_complet: '',
  email: '',
  telephone: '',
  password: '',
  confirmPassword: '',
  type_acheteur: 'particulier',
  entreprise: '',
  departement: '',
  commune: '',
  type_entreprise: 'artisan',
  categorie: '',
  description: '',
  mode_vente: 'detail',
  numero_ifu: '',
  pj_identite: null,
  pj_atelier: null,
  pj_rccm: null,
};

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isTransformateur = form.role === 'transformateur';

  const requiredMissing = useMemo(() => {
    const commonMissing = !form.nom_complet || !form.email || !form.telephone || !form.password;
    if (commonMissing) return true;

    if (!isTransformateur) return !form.type_acheteur;

    return (
      !form.entreprise ||
      !form.type_entreprise ||
      !form.categorie ||
      !form.mode_vente ||
      !form.departement ||
      !form.commune ||
      !form.numero_ifu ||
      !form.pj_identite ||
      !form.pj_atelier
    );
  }, [form, isTransformateur]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] ?? null }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (requiredMissing) {
      setError('Veuillez remplir les champs obligatoires.');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('role', form.role);
      payload.append('nom_complet', form.nom_complet);
      payload.append('email', form.email);
      payload.append('telephone', form.telephone);
      payload.append('password', form.password);

      if (isTransformateur) {
        payload.append('entreprise', form.entreprise);
        payload.append('type_entreprise', form.type_entreprise);
        payload.append('categorie', form.categorie);
        payload.append('description', form.description);
        payload.append('mode_vente', form.mode_vente);
        payload.append('departement', form.departement);
        payload.append('commune', form.commune);
        payload.append('numero_ifu', form.numero_ifu);
        payload.append('pj_identite', form.pj_identite);
        payload.append('pj_atelier', form.pj_atelier);
        if (form.pj_rccm) payload.append('pj_rccm', form.pj_rccm);
      } else {
        payload.append('type_acheteur', form.type_acheteur);
        payload.append('entreprise', form.entreprise);
        payload.append('departement', form.departement);
        payload.append('commune', form.commune);
      }

      const result = await registerRequest(payload);
      login(result.token, result.user);

      if (result.user.role === 'transformateur') navigate('/dashboard-transformateur');
      else navigate('/dashboard-acheteur');
    } catch (err) {
      setError(err.message || 'Inscription impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fcfdfc', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '50px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-lg rounded-5 p-5 bg-white">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Créer un compte</h2>
                <p className="text-muted">Rejoignez la communauté AgroStock</p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger py-2">{error}</div>}

                <div className="mb-3">
                  <label className="form-label fw-bold small text-uppercase">Je suis un :</label>
                  <div className="d-flex gap-3">
                    <button type="button" onClick={() => setForm((p) => ({ ...p, role: 'acheteur' }))} className={`btn flex-grow-1 rounded-pill py-2 ${form.role === 'acheteur' ? 'btn-success' : 'btn-light border'}`}>
                      Acheteur
                    </button>
                    <button type="button" onClick={() => setForm((p) => ({ ...p, role: 'transformateur' }))} className={`btn flex-grow-1 rounded-pill py-2 ${form.role === 'transformateur' ? 'btn-success' : 'btn-light border'}`}>
                      Transformateur
                    </button>
                  </div>
                </div>

                <div className="mb-3"><input name="nom_complet" value={form.nom_complet} onChange={handleChange} type="text" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Nom complet" required /></div>
                <div className="mb-3"><input name="email" value={form.email} onChange={handleChange} type="email" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Email" required /></div>
                <div className="mb-3"><input name="telephone" value={form.telephone} onChange={handleChange} type="tel" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Téléphone" required /></div>
                <div className="mb-3"><input name="password" value={form.password} onChange={handleChange} type="password" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Mot de passe" required /></div>
                <div className="mb-3"><input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type="password" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Confirmer mot de passe" required /></div>

                {!isTransformateur && (
                  <>
                    <div className="mb-3">
                      <select name="type_acheteur" value={form.type_acheteur} onChange={handleChange} className="form-select rounded-pill px-4 py-3 bg-light border-0">
                        <option value="particulier">Particulier</option>
                        <option value="grossiste">Grossiste</option>
                        <option value="detaillant">Détaillant</option>
                        <option value="restaurateur">Restaurateur</option>
                      </select>
                    </div>
                    <div className="mb-3"><input name="entreprise" value={form.entreprise} onChange={handleChange} type="text" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Entreprise (optionnel)" /></div>
                    <div className="mb-3"><input name="departement" value={form.departement} onChange={handleChange} type="text" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Département" /></div>
                    <div className="mb-3"><input name="commune" value={form.commune} onChange={handleChange} type="text" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Commune" /></div>
                  </>
                )}

                {isTransformateur && (
                  <>
                    <div className="mb-3"><input name="entreprise" value={form.entreprise} onChange={handleChange} type="text" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Nom entreprise" required /></div>
                    <div className="mb-3">
                      <select name="type_entreprise" value={form.type_entreprise} onChange={handleChange} className="form-select rounded-pill px-4 py-3 bg-light border-0" required>
                        <option value="artisan">Artisan</option>
                        <option value="pme">PME</option>
                        <option value="cooperative">Coopérative</option>
                      </select>
                    </div>
                    <div className="mb-3"><input name="categorie" value={form.categorie} onChange={handleChange} type="text" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Catégorie" required /></div>
                    <div className="mb-3"><textarea name="description" value={form.description} onChange={handleChange} className="form-control rounded-4 border-0 shadow-sm px-4 py-3 bg-light" placeholder="Description" /></div>
                    <div className="mb-3">
                      <select name="mode_vente" value={form.mode_vente} onChange={handleChange} className="form-select rounded-pill px-4 py-3 bg-light border-0" required>
                        <option value="detail">Détail</option>
                        <option value="gros">Gros</option>
                        <option value="les_deux">Les deux</option>
                      </select>
                    </div>
                    <div className="mb-3"><input name="departement" value={form.departement} onChange={handleChange} type="text" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Département" required /></div>
                    <div className="mb-3"><input name="commune" value={form.commune} onChange={handleChange} type="text" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Commune" required /></div>
                    <div className="mb-3"><input name="numero_ifu" value={form.numero_ifu} onChange={handleChange} type="text" className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light" placeholder="Numéro IFU" required /></div>
                    <div className="mb-3"><label className="small d-block mb-1">Pièce identité</label><input name="pj_identite" onChange={handleChange} type="file" className="form-control" accept="image/*" required /></div>
                    <div className="mb-3"><label className="small d-block mb-1">Photo atelier</label><input name="pj_atelier" onChange={handleChange} type="file" className="form-control" accept="image/*" required /></div>
                    <div className="mb-3"><label className="small d-block mb-1">RCCM (optionnel)</label><input name="pj_rccm" onChange={handleChange} type="file" className="form-control" accept="image/*,.pdf" /></div>
                  </>
                )}

                <button type="submit" disabled={loading} className="btn btn-success w-100 rounded-pill py-3 fw-bold mb-4" style={{ background: '#1ab273', border: 'none' }}>
                  {loading ? 'Inscription...' : "S'inscrire"}
                </button>

                <p className="text-center mt-3 mb-0 small">
                  <span className="text-muted">Déjà membre ? </span>
                  <Link to="/login" className="text-success text-decoration-none fw-bold">Connectez-vous</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

