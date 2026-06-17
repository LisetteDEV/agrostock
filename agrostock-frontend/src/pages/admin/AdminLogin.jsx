import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../../services/config';
const AdminLogin = () => {
    const navigate = useNavigate();
    const { login: authenticate } = useAuth();
    
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!loginData.email || !loginData.password) {
            setError('Veuillez remplir tous les champs.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.message || 'Identifiants incorrects.');
            } else {
                // Verification de securite stricte frontend (le backend devrait idealement le faire aussi)
                if (result.user.role !== 'admin') {
                    setError('Acces refuse. Vous n\'avez pas les droits d\'administrateur.');
                    return;
                }

                authenticate(result.token, result.user);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: '#060f0a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            {/* Background elements */}
            <div className="position-absolute top-0 start-50 translate-middle-x w-100 h-100 overflow-hidden" style={{ zIndex: 0, pointerEvents: 'none' }}>
                <div className="position-absolute top-0 start-50 translate-middle-x" style={{ width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(26,178,115,0.05) 0%, rgba(0,0,0,0) 70%)' }}></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="shadow-lg position-relative" 
                style={{ background: '#0a1d13', border: '1px solid #183827', borderRadius: '1.2rem', width: '100%', maxWidth: '420px', zIndex: 1 }}
            >
                <div className="p-4 p-md-5">
                    <div className="text-center mb-5">
                        <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '60px', height: '60px' }}>
                            <ShieldAlert size={30} />
                        </div>
                        <h3 className="fw-bold text-white mb-1">Acces Restreint</h3>
                        <p className="small" style={{ color: '#8a9b92' }}>Portail d'administration AgroStock</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="alert alert-danger small p-3 text-center rounded-3 bg-danger bg-opacity-10 text-danger border-0 mb-4">
                                <strong>Erreur :</strong> {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="form-label small fw-bold text-uppercase" style={{ letterSpacing: '1px', color: '#8a9b92' }}>Adresse Email</label>
                            <div className="input-group rounded-3 overflow-hidden" style={{ border: '1px solid #183827' }}>
                                <span className="input-group-text border-0" style={{ background: '#0e261a', color: '#8a9b92' }}><Mail size={18} /></span>
                                <input 
                                    type="email" 
                                    name="email" 
                                    className="form-control admin-input border-0 py-3 shadow-none text-white" 
                                    style={{ background: '#0e261a' }}
                                    placeholder="admin@agrostock.bj" 
                                    value={loginData.email} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="form-label small fw-bold text-uppercase d-flex justify-content-between" style={{ letterSpacing: '1px', color: '#8a9b92' }}>
                                Mot de passe
                            </label>
                            <div className="input-group rounded-3 overflow-hidden" style={{ border: '1px solid #183827' }}>
                                <span className="input-group-text border-0" style={{ background: '#0e261a', color: '#8a9b92' }}><Lock size={18} /></span>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    className="form-control admin-input border-0 py-3 shadow-none text-white" 
                                    style={{ background: '#0e261a' }}
                                    placeholder="********" 
                                    value={loginData.password} 
                                    onChange={handleChange} 
                                />
                                <button 
                                    type="button" 
                                    className="input-group-text border-0 px-3 cursor-pointer" 
                                    style={{ background: '#0e261a', color: '#8a9b92', cursor: 'pointer' }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-success w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                <>Authentification <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                    
                    <div className="text-center mt-5">
                        <span className="small fw-medium" style={{ color: '#5a7566' }}>IP Locale Enregistree - Echanges Chiffres</span>
                    </div>
                </div>
            </motion.div>
            
            <style>{`
                input.admin-input:-webkit-autofill,
                input.admin-input:-webkit-autofill:focus {
                    transition: background-color 600000s 0s, color 600000s 0s;
                }
                .admin-input::placeholder {
                    color: #5a7566 !important;
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;

