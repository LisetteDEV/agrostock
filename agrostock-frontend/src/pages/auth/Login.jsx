import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginRequest(form);
      login(result.token, result.user);

      if (result.user.role === 'admin') navigate('/admin/dashboard');
      else if (result.user.role === 'transformateur') navigate('/dashboard-transformateur');
      else navigate('/dashboard-acheteur');
    } catch (err) {
      setError(err.message || 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fcfdfc', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '50px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0 shadow-lg rounded-5 p-5 bg-white">
              <div className="text-center mb-5">
                <h1 className="fw-bold mb-2">Bienvenue</h1>
                <p className="text-muted">Connectez-vous à votre espace</p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger py-2">{error}</div>}

                <div className="mb-3">
                  <input
                    type="text"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light"
                    placeholder="Email ou téléphone"
                    required
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="form-control rounded-pill border-0 shadow-sm px-4 py-3 bg-light"
                    placeholder="Mot de passe"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success w-100 rounded-pill py-3 fw-bold mb-4"
                  style={{ background: '#1ab273', border: 'none' }}
                >
                  {loading ? 'Connexion...' : 'Connexion'}
                </button>

                <div className="text-center">
                  <span className="text-muted small">Nouveau sur AgroStock ? </span>
                  <Link to="/register" className="text-success text-decoration-none fw-bold small">Créer un compte</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

