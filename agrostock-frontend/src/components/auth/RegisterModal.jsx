import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, User, Store, ArrowRight, ShieldCheck, Mail, Lock, 
    Building2, CheckCircle2, ChevronRight, ChevronDown, Upload, 
    FileText, Image as ImageIcon, Briefcase, Smartphone, Eye, EyeOff, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/config';
// Password input with toggle visibility
const PasswordInput = ({ placeholder = '••••••••', value, onChange, name }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="input-group pro-input-group">
            <span className="input-group-text border-0 ps-3 pe-2">
                <Lock size={18} className="input-icon" />
            </span>
            <input 
                type={show ? 'text' : 'password'} 
                name={name}
                className="form-control border-0 py-3 px-2 shadow-none fw-medium" 
                placeholder={placeholder} 
                value={value} 
                onChange={onChange}
                style={{ fontSize: '0.95rem' }}
            />
            <button 
                type="button" 
                className="btn btn-link border-0 pe-3 ps-2" 
                onClick={() => setShow(!show)}
                style={{ textDecoration: 'none', color: '#94a3b8' }}
                tabIndex="-1"
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
};

// Premium custom select dropdown
const CustomSelect = ({ name, value, onChange, options, placeholder = 'Sélectionnez...', error }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    const selected = options.find(o => o.value === value);

    React.useEffect(() => {
        const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    return (
        <div ref={ref} className="position-relative">
            <div
                onClick={() => setOpen(!open)}
                className={`d-flex align-items-center justify-content-between px-3 ${error ? 'border-danger' : ''}`}
                style={{
                    cursor: 'pointer',
                    border: open ? '1.5px solid #105c38' : '1.5px solid #e8edf5',
                    borderRadius: '14px',
                    background: open ? '#fff' : '#f7f9fc',
                    padding: '14px 16px',
                    transition: 'all 0.25s ease',
                    boxShadow: open ? '0 4px 16px rgba(16,92,56,0.1)' : 'none',
                }}
            >
                <span style={{ fontSize: '0.95rem', fontWeight: selected ? 500 : 400, color: selected ? '#1a2d1f' : '#aab5c0' }}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown size={18} style={{ color: '#6b7280', transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="position-absolute w-100 bg-white overflow-auto"
                        style={{
                            zIndex: 9999,
                            marginTop: '6px',
                            borderRadius: '14px',
                            border: '1.5px solid #e8edf5',
                            boxShadow: '0 12px 36px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                            maxHeight: '220px',
                        }}
                    >
                        {options.map((opt, i) => (
                            <div
                                key={opt.value}
                                onClick={() => { onChange({ target: { name, value: opt.value } }); setOpen(false); }}
                                className="d-flex align-items-center justify-content-between"
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    fontSize: '0.93rem',
                                    fontWeight: value === opt.value ? 600 : 400,
                                    color: value === opt.value ? '#105c38' : '#374151',
                                    background: value === opt.value ? '#f0faf5' : 'transparent',
                                    borderBottom: i < options.length - 1 ? '1px solid #f3f4f6' : 'none',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => { if (value !== opt.value) e.currentTarget.style.background = '#f9fafb'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = value === opt.value ? '#f0faf5' : 'transparent'; }}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && <CheckCircle2 size={16} className="text-success" />}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const COUNTRIES = [
    { code: '+229', iso: 'bj', name: 'Bénin' },
    { code: '+228', iso: 'tg', name: 'Togo' },
    { code: '+225', iso: 'ci', name: "Côte d'Ivoire" },
    { code: '+226', iso: 'bf', name: 'Burkina Faso' },
    { code: '+227', iso: 'ne', name: 'Niger' },
    { code: '+221', iso: 'sn', name: 'Sénégal' },
    { code: '+223', iso: 'ml', name: 'Mali' },
    { code: '+234', iso: 'ng', name: 'Nigeria' },
    { code: '+237', iso: 'cm', name: 'Cameroun' },
];

const CustomCountrySelect = ({ value, onChange, name }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

    React.useEffect(() => {
        const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    return (
        <div ref={ref} className="position-relative h-100" style={{ minWidth: '110px', cursor: 'pointer' }}>
            <div
                onClick={() => setOpen(!open)}
                className="d-flex align-items-center justify-content-between h-100 px-3 py-3"
                style={{ background: '#eef2f6', borderRight: '1px solid #e8edf5', transition: 'background 0.2s', borderTopLeftRadius: '14px', borderBottomLeftRadius: '14px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e4e9f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#eef2f6'; }}
            >
                <div className="d-flex align-items-center gap-2">
                    <img src={`https://flagcdn.com/w20/${selected.iso}.png`} width="20" alt={selected.name} style={{ borderRadius: '2px', boxShadow: '0 0 2px rgba(0,0,0,0.15)' }} />
                    <span className="fw-bold" style={{ fontSize: '0.9rem', color: '#1a2d1f' }}>{selected.code}</span>
                </div>
                <ChevronDown size={14} className="text-muted ms-2 transition-all" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="position-absolute bg-white overflow-auto shadow-lg"
                        style={{
                            top: '100%', left: 0, zIndex: 9999, marginTop: '8px',
                            borderRadius: '12px', border: '1px solid #e8edf5', maxHeight: '250px', width: '230px'
                        }}
                    >
                        {COUNTRIES.map(c => (
                            <div
                                key={c.code}
                                onClick={() => { onChange({ target: { name, value: c.code } }); setOpen(false); }}
                                className="d-flex align-items-center gap-3 px-3 py-2.5 transition-all"
                                style={{
                                    background: value === c.code ? '#f0faf5' : 'transparent',
                                    borderBottom: '1px solid #f3f4f6'
                                }}
                                onMouseEnter={(e) => { if (value !== c.code) e.currentTarget.style.background = '#f9fafb'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = value === c.code ? '#f0faf5' : 'transparent'; }}
                            >
                                <img src={`https://flagcdn.com/w20/${c.iso}.png`} width="20" alt={c.name} style={{ borderRadius: '2px', boxShadow: '0 0 2px rgba(0,0,0,0.15)' }} />
                                <div className="d-flex flex-column" style={{ lineHeight: '1.3' }}>
                                    <span className="fw-medium" style={{ fontSize: '0.85rem', color: value === c.code ? '#105c38' : '#1f2937' }}>{c.name}</span>
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{c.code}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const RegisterModal = ({ isOpen, onClose, initialMode = 'register' }) => {
    const navigate = useNavigate();
    const { login: authenticate } = useAuth();
    const [mode, setMode] = useState(initialMode);
    const [role, setRole] = useState(null);
    const [step, setStep] = useState(0);
    const [errors, setErrors] = useState({});

    // Acheteur form data
    const [acheteur, setAcheteur] = useState({
        nom: '', email: '', indicatif: '+229', telephone: '', password: '', confirmPassword: '',
        typeAcheteur: '', entreprise: '', departement: '', commune: '', cgu: false
    });

    // Transformateur form data
    const [transformateur, setTransformateur] = useState({
        nom: '', email: '', indicatif: '+229', telephone: '', password: '', confirmPassword: '',
        entreprise: '', type: '', categorie: [], description: '', modeVente: '', departement: '', commune: '',
        ifu: '', pj_identite: null, pj_rccm: null, pj_atelier: null, cgu: false
    });

    // Login form data
    const [login, setLogin] = useState({ email: '', password: '' });

    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    if (!isOpen) return null;

    const totalSteps = role === 'acheteur' ? 3 : 4;
    const data = role === 'acheteur' ? acheteur : transformateur;
    const setData = role === 'acheteur' ? setAcheteur : setTransformateur;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => { const n = {...prev}; delete n[name]; return n; });
        }
    };

    const toggleCategory = (cat) => {
        setTransformateur(prev => {
            const categories = prev.categorie || [];
            const newCats = categories.includes(cat) 
                ? categories.filter(c => c !== cat)
                : [...categories, cat];
            return { ...prev, categorie: newCats };
        });
        if (errors.categorie) {
            setErrors(prev => { const n = { ...prev }; delete n.categorie; return n; });
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setData(prev => ({ ...prev, [name]: files[0] }));
            setSubmitError('');
            if (errors[name]) {
                setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
            }
        }
    };

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLogin(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => { const n = {...prev}; delete n[name]; return n; });
        }
    };

    // Validation per step
    const validateStep = () => {
        const newErrors = {};

        if (step === 1) {
            if (!data.nom.trim()) newErrors.nom = 'Champ requis';
            if (!data.email.trim()) newErrors.email = 'Champ requis';
            if (!data.telephone.trim()) {
                newErrors.telephone = 'Champ requis';
            } else {
                const phoneFixed = data.telephone.replace(/\s+/g, '');
                if (data.indicatif === '+229' || role === 'transformateur') {
                    if (!/^01\d{8}$/.test(phoneFixed)) {
                        newErrors.telephone = 'Doit commencer par 01 et avoir 10 chiffres (Bénin)';
                    }
                } else {
                    if (!/^\d{8,15}$/.test(phoneFixed)) {
                        newErrors.telephone = 'Format invalide';
                    }
                }
            }
            if (!data.password) newErrors.password = 'Champ requis';
            if (data.password.length > 0 && data.password.length < 6) newErrors.password = 'Minimum 6 caracteres';
            if (data.password !== data.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        if (step === 2) {
            if (role === 'acheteur') {
                if (!data.typeAcheteur) newErrors.typeAcheteur = 'Champ requis';
                if (data.indicatif === '+229') {
                    if (!data.departement) newErrors.departement = 'Champ requis';
                }
                if (!data.commune.trim()) newErrors.commune = 'Champ requis';
            } else {
                if (!data.entreprise.trim()) newErrors.entreprise = 'Champ requis';
                if (!data.type) newErrors.type = 'Champ requis';
                if (!data.categorie || data.categorie.length === 0) newErrors.categorie = 'Choisissez au moins une categorie';
                if (!data.modeVente) newErrors.modeVente = 'Champ requis';
                if (!data.departement) newErrors.departement = 'Champ requis';
                if (!data.commune.trim()) newErrors.commune = 'Champ requis';
            }
        }

        if (step === 3 && role === 'transformateur') {
            if (!data.ifu.trim()) newErrors.ifu = 'Champ requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const nextStep = () => {
        if (validateStep()) setStep(prev => prev + 1);
    };
    const prevStep = () => { setErrors({}); setStep(prev => prev - 1); };

    const handleSubmit = async () => {
        if (!validateFinalStep()) return;
        
        setIsLoading(true);
        setSubmitError('');

        const formData = new FormData();
        
        // Append all data fields
        Object.keys(data).forEach(key => {
            if (key === 'categorie') {
                formData.append(key, data[key].join(', '));
            } else if (data[key] instanceof File) {
                formData.append(key, data[key]);
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        formData.append('role', role);
        formData.append('nom_complet', data.nom);

        if (role === 'transformateur') {
            const modeMap = {
                'Vente en gros': 'gros',
                'Vente au detail': 'detail',
                'Les deux': 'les_deux'
            };
            formData.append('mode_vente', modeMap[data.modeVente]);
            formData.append('numero_ifu', data.ifu);
            formData.append('type_entreprise', data.type.toLowerCase());
        } else {
            formData.append('type_acheteur', data.typeAcheteur.toLowerCase());
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                const firstValidationError = result?.errors
                    ? Object.values(result.errors).flat()[0]
                    : null;
                setSubmitError(firstValidationError || result.message || 'Une erreur est survenue lors de l\'inscription.');
                console.error('Validation/Server errors:', result.errors);
            } else {
                // Success
                authenticate(result.token, result.user);
                onClose();
                if (result.user.role === 'acheteur') navigate('/dashboard-acheteur');
                else if (result.user.role === 'transformateur') navigate('/dashboard-transformateur');
                else navigate('/'); 
            }
        } catch (error) {
            setSubmitError('Erreur de connexion au serveur.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwitchMode = (newMode) => {
        setMode(newMode);
        setRole(null);
        setStep(0);
        setErrors({});
        setSubmitError('');
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!login.email || !login.password) {
            setSubmitError('Veuillez remplir tous les champs.');
            return;
        }

        setIsLoading(true);
        setSubmitError('');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(login)
            });

            const result = await response.json();

            if (!response.ok) {
                setSubmitError(result.message || 'Identifiants incorrects.');
            } else {
                authenticate(result.token, result.user);
                onClose();
                if (result.user.role === 'admin') navigate('/admin/dashboard');
                else if (result.user.role === 'acheteur') navigate('/dashboard-acheteur');
                else if (result.user.role === 'transformateur') navigate('/dashboard-transformateur');
                else navigate('/');
            }
        } catch (error) {
            setSubmitError('Erreur de connexion au serveur.');
        } finally {
            setIsLoading(false);
        }
    };

    const canSubmitFinalStep = () => {
        if (!data.cgu) return false;
        if (role === 'transformateur' && (!data.pj_identite || !data.pj_atelier)) return false;
        return true;
    };

    const validateFinalStep = () => {
        const newErrors = {};

        if (!data.cgu) {
            newErrors.cgu = 'Vous devez accepter les conditions.';
        }

        if (role === 'transformateur') {
            if (!data.pj_identite) newErrors.pj_identite = 'Piece d\'identite requise';
            if (!data.pj_atelier) newErrors.pj_atelier = 'Photo de l\'atelier requise';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            setSubmitError(Object.values(newErrors)[0]);
            return false;
        }

        return true;
    };

    // Field error helper
    const fieldError = (name) => errors[name] ? (
        <div className="text-danger small mt-1">{errors[name]}</div>
    ) : null;

    // Progress Indicator
    const ProgressIndicator = () => (
        <div className="d-flex justify-content-between mb-4 position-relative px-3">
            <div className="position-absolute w-100 bg-light" style={{ height: '2px', top: '20px', left: 0, zIndex: 1 }}></div>
            {[...Array(totalSteps)].map((_, i) => (
                <div key={i} className="position-relative" style={{ zIndex: 2 }}>
                    <div 
                        className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                            step > i + 1 ? 'bg-success text-white' : step === i + 1 ? 'bg-success text-white shadow' : 'bg-white border text-muted'
                        }`}
                        style={{ width: '38px', height: '38px', fontSize: '14px' }}
                    >
                        {step > i + 1 ? <CheckCircle2 size={18} /> : i + 1}
                    </div>
                    <span className="position-absolute top-100 start-50 translate-middle-x small mt-2 fw-bold text-muted" style={{ fontSize: '9px', whiteSpace: 'nowrap' }}>
                        {role === 'acheteur' 
                            ? ['Compte', 'Profil', 'Fin'][i]
                            : ['Compte', 'Entreprise', 'Documents', 'Fin'][i]
                        }
                    </span>
                </div>
            ))}
        </div>
    );

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 p-md-4"
                    style={{ zIndex: 10000, background: 'rgba(10, 26, 18, 0.85)', backdropFilter: 'blur(10px)', overflowY: 'auto' }}
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.92, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 40 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="overflow-hidden my-auto"
                        style={{ 
                            width: '100%', 
                            maxWidth: (mode === 'login' || (mode === 'register' && step === 0)) ? '850px' : '580px', 
                            position: 'relative',
                            background: '#ffffff',
                            borderRadius: '24px',
                            border: '1px solid rgba(16, 92, 56, 0.08)',
                            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            className="btn position-absolute d-flex align-items-center justify-content-center border-0 shadow-none" 
                            onClick={onClose} 
                            style={{ zIndex: 10, top: '16px', right: '16px', width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', color: '#6b7280', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#1f2937'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>

                        <div className="row g-0">
                            {/* LOGIN */}
                            {mode === 'login' && (
                                <div className="col-12">
                                    <div className="row g-0 align-items-stretch" style={{ minHeight: '520px' }}>
                                        {/* Côté gauche : Marque et Fond Premium (Desktop uniquement) */}
                                        <div className="col-md-5 d-none d-md-flex flex-column justify-content-between p-4 p-lg-5 text-white position-relative overflow-hidden" 
                                             style={{ background: '#0a1d13', borderTopLeftRadius: 'calc(1.5rem - 1px)', borderBottomLeftRadius: 'calc(1.5rem - 1px)' }}>
                                            {/* Pattern géométrique en fond */}
                                            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                                            {/* Glows */}
                                            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: '#1ab273', filter: 'blur(90px)', borderRadius: '50%', opacity: 0.5 }}></div>
                                            <div style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: '250px', height: '250px', background: '#f5b518', filter: 'blur(90px)', borderRadius: '50%', opacity: 0.25 }}></div>

                                            <div className="position-relative z-1 mb-5">
                                                <div className="bg-white rounded-4 d-inline-flex px-3 py-2 shadow-sm align-items-center gap-2">
                                                    <div className="bg-success rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '36px', height: '36px' }}>
                                                        <Package size={20} className="text-white" strokeWidth={2.5} />
                                                    </div>
                                                    <div className="d-flex flex-column justify-content-center lh-1">
                                                        <span style={{ color: '#0a1d13', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: '"Outfit", system-ui, sans-serif' }}>
                                                            Agro<span className="text-success">Stock</span>
                                                        </span>
                                                        <span className="text-success" style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', paddingLeft: '1px' }}>
                                                            Bénin
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="position-relative z-1 mb-4 my-auto">
                                                <h3 className="fw-bold mb-3 text-white" style={{ fontSize: '1.9rem', lineHeight: '1.1', letterSpacing: '-0.5px' }}>
                                                    Reprenez <br/>le contrôle.
                                                </h3>
                                                <p style={{ color: '#a7f3d0', fontSize: '0.95rem', lineHeight: '1.6', opacity: 0.9 }}>
                                                    Gérez vos stocks, développez votre réseau et accélérez votre business agroalimentaire.
                                                </p>
                                            </div>

                                            <div className="position-relative z-1 mt-auto pt-4">
                                                <div className="d-flex align-items-center gap-2" style={{ color: '#6ee7b7', fontSize: '0.8rem', fontWeight: '500' }}>
                                                    <ShieldCheck size={16} /> <span>Plateforme chiffrée de bout en bout</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Côté droit : Formulaire épuré */}
                                        <div className="col-12 col-md-7 p-4 p-md-5 bg-white d-flex flex-column justify-content-center h-100" style={{ borderTopRightRadius: 'calc(1.5rem - 1px)', borderBottomRightRadius: 'calc(1.5rem - 1px)' }}>
                                            {/* Logo mobile */}
                                            <div className="d-md-none text-center mb-4 d-flex align-items-center justify-content-center gap-2">
                                                <div className="bg-success rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                                                    <Package size={22} className="text-white" strokeWidth={2.5}/>
                                                </div>
                                                <div className="d-flex flex-column justify-content-center lh-1 text-start">
                                                    <span style={{ color: '#0a1d13', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: '"Outfit", system-ui, sans-serif' }}>
                                                        Agro<span className="text-success">Stock</span>
                                                    </span>
                                                    <span className="text-success" style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', paddingLeft: '2px' }}>
                                                        Bénin
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Bon retour 👋</h2>
                                                <p className="text-muted small">Veuillez renseigner vos informations d'identification</p>
                                            </div>
                                            
                                            <form onSubmit={handleLoginSubmit}>
                                                {submitError && (
                                                    <div className="alert alert-danger d-flex align-items-center gap-2 small mb-4 py-2 px-3 border-0 rounded-3" style={{ background: '#fef2f2', color: '#ef4444' }}>
                                                        <ShieldCheck size={18} /> {submitError}
                                                    </div>
                                                )}

                                                
                                                
                                                <div className="mb-4">
                                                    <label className="form-label premium-label">Email ou Téléphone</label>
                                                    <div className="input-group pro-input-group">
                                                        <span className="input-group-text border-0 ps-3 pe-2"><Mail size={18} className="input-icon" /></span>
                                                        <input type="text" name="email" className="form-control border-0 py-3 px-2 shadow-none fw-medium" placeholder="votre@email.com / +229..." value={login.email} onChange={handleLoginChange} style={{ fontSize: '0.95rem' }} />
                                                    </div>
                                                </div>

                                                <div className="mb-5">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <label className="form-label premium-label mb-0">Mot de passe</label>
                                                        <a href="#" className="text-decoration-none fw-bold" style={{ fontSize: '0.82rem', color: '#1ab273' }}>Mot de passe oublié ?</a>
                                                    </div>
                                                    <PasswordInput name="password" value={login.password} onChange={handleLoginChange} />
                                                </div>

                                                <button type="submit" className="btn pro-btn btn-lg w-100 py-3 d-flex align-items-center justify-content-center gap-2 mb-4" disabled={isLoading} style={{ fontSize: '0.95rem' }}>
                                                    {isLoading ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Connexion en cours...</> : <>Connexion <ArrowRight size={18} /></>}
                                                </button>

                                                <p className="text-center mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
                                                    <span className="text-muted">Pas encore de compte ? </span>
                                                    <button type="button" onClick={() => handleSwitchMode('register')} className="btn btn-link p-0 fw-bold text-decoration-none" style={{ color: '#1ab273', verticalAlign: 'baseline' }}>
                                                        Créez-en un ici
                                                    </button>
                                                </p>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* REGISTER */}
                            {mode === 'register' && (
                                <div className="col-12">
                                    {/* Role Selection */}
                                    {step === 0 && (
                                        <div className="p-4 p-md-5 text-center">
                                            <div className="text-center mb-4 d-flex align-items-center justify-content-center gap-2" style={{ marginBottom: '16px' }}>
                                                <div className="bg-success rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '56px', height: '56px' }}>
                                                    <Package size={30} className="text-white" strokeWidth={2.5}/>
                                                </div>
                                                <div className="d-flex flex-column justify-content-center lh-1 text-start">
                                                    <span style={{ color: '#0a1d13', fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-1px', fontFamily: '"Outfit", system-ui, sans-serif' }}>
                                                        Agro<span className="text-success">Stock</span>
                                                    </span>
                                                    <span className="text-success" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase', paddingLeft: '3px' }}>
                                                        Bénin
                                                    </span>
                                                </div>
                                            </div>
                                            <h2 className="fw-bold mb-2">Rejoindre AgroStock</h2>
                                            <p className="text-muted mb-4">Quel est votre profil</p>
                                            <div className="row g-3 mt-1">
                                                <div className="col-6">
                                                    <div 
                                                        className="p-4 h-100 rounded-4 text-center position-relative"
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            border: '2px solid #e8f5ee',
                                                            background: '#f0faf5',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onClick={() => { setRole('acheteur'); setStep(1); }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1ab273'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,178,115,0.15)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8f5ee'; e.currentTarget.style.boxShadow = 'none'; }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #1ab273, #105c38)', margin: '0 auto' }}>
                                                            <User size={28} className="text-white" />
                                                        </div>
                                                        <h5 className="fw-bold mb-1" style={{ color: '#0a1d13' }}>Acheteur</h5>
                                                        <p className="small mb-0" style={{ color: '#6b7280' }}>Grossiste, détaillant, restaurateur ou particulier.</p>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div 
                                                        className="p-4 h-100 rounded-4 text-center"
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            border: '2px solid #e8f5ee',
                                                            background: '#f0faf5',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onClick={() => { setRole('transformateur'); setStep(1); }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1ab273'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,178,115,0.15)'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8f5ee'; e.currentTarget.style.boxShadow = 'none'; }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #f5b518, #e09010)', margin: '0 auto' }}>
                                                            <Store size={28} className="text-white" />
                                                        </div>
                                                        <h5 className="fw-bold mb-1" style={{ color: '#0a1d13' }}>Transformateur</h5>
                                                        <p className="small mb-0" style={{ color: '#6b7280' }}>PME, coopérative ou artisan agroalimentaire.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-center mt-4 mb-0 small">
                                                <span className="text-muted">Déjà membre ? </span>
                                                <button type="button" onClick={() => handleSwitchMode('login')} className="btn btn-link p-0 fw-bold text-decoration-none" style={{ color: '#1ab273', verticalAlign: 'baseline' }}>Connectez-vous</button>
                                            </p>
                                        </div>
                                    )}

                                    {/* Multi-Step Form */}
                                    {step > 0 && (
                                        <div>
                                            {/* Premium gradient header */}
                                            <div className="px-4 px-md-5 pt-4 pb-3" style={{ background: 'linear-gradient(135deg, #f0faf5, #e8f5ee)', borderBottom: '1px solid #d1e8db' }}>
                                                <div className="d-flex align-items-center gap-3 mb-3">
                                                    <div className="d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #1ab273, #105c38)', flexShrink: 0 }}>
                                                        {role === 'acheteur' ? <User size={22} className="text-white" /> : <Building2 size={22} className="text-white" />}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h5 className="fw-bold mb-0" style={{ color: '#0a1d13', fontSize: '1.15rem' }}>Inscription {role === 'acheteur' ? 'Acheteur' : 'Transformateur'}</h5>
                                                        <p className="mb-0" style={{ color: '#6b7c70', fontSize: '0.85rem' }}>Étape {step} sur {totalSteps}</p>
                                                    </div>
                                                </div>
                                                <ProgressIndicator />
                                            </div>

                                            <div className="p-4 p-md-5">
                                            <form className="mt-2" onSubmit={(e) => e.preventDefault()}>

                                                {/* STEP 1: Compte */}
                                                {step === 1 && (
                                                    <>
                                                        <div className="mb-3">
                                                            <label className="form-label premium-label">{role === 'transformateur' ? 'Nom complet du responsable' : 'Nom complet'} <span className="text-danger">*</span></label>
                                                            <div className={`input-group pro-input-group ${errors.nom ? 'border-danger' : ''}`}>
                                                                <span className="input-group-text border-0"><User size={18} className="input-icon" /></span>
                                                                <input type="text" name="nom" className="form-control border-0 py-3 shadow-none fw-medium" placeholder="Ex: Jean Gbadamassi" value={data.nom} onChange={handleChange} style={{ fontSize: '0.95rem' }} />
                                                            </div>
                                                            {fieldError('nom')}
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label premium-label">Email <span className="text-danger">*</span></label>
                                                            <div className={`input-group pro-input-group ${errors.email ? 'border-danger' : ''}`}>
                                                                <span className="input-group-text border-0"><Mail size={18} className="input-icon" /></span>
                                                                <input type="email" name="email" className="form-control border-0 py-3 shadow-none fw-medium" placeholder="contact@exemple.com" value={data.email} onChange={handleChange} style={{ fontSize: '0.95rem' }} />
                                                            </div>
                                                            {fieldError('email')}
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label premium-label">Téléphone <span className="text-danger">*</span></label>
                                                            <div className={`input-group pro-input-group p-0 overflow-visible ${errors.telephone ? 'border-danger' : ''}`}>
                                                                {role === 'transformateur' ? (
                                                                    <div className="d-flex align-items-center px-3 py-3 gap-2" style={{ background: '#eef2f6', borderRight: '1px solid #e8edf5', borderTopLeftRadius: '14px', borderBottomLeftRadius: '14px', minWidth: '110px' }}>
                                                                        <img src="https://flagcdn.com/w20/bj.png" width="20" alt="Bénin" style={{ borderRadius: '2px', boxShadow: '0 0 2px rgba(0,0,0,0.15)' }} />
                                                                        <span className="fw-bold" style={{ fontSize: '0.9rem', color: '#1a2d1f' }}>+229</span>
                                                                    </div>
                                                                ) : (
                                                                    <CustomCountrySelect 
                                                                        name="indicatif" 
                                                                        value={data.indicatif} 
                                                                        onChange={handleChange} 
                                                                    />
                                                                )}
                                                                <input 
                                                                    type="tel" 
                                                                    name="telephone" 
                                                                    className="form-control border-0 py-3 shadow-none fw-medium" 
                                                                    placeholder="01 00 00 00 00"
                                                                    value={data.telephone} 
                                                                    onChange={handleChange} 
                                                                    style={{ fontSize: '0.95rem' }} 
                                                                />
                                                            </div>
                                                            {fieldError('telephone')}
                                                        </div>
                                                        <div className="row g-3">
                                                            <div className="col-md-6">
                                                                <label className="form-label premium-label">Mot de passe <span className="text-danger">*</span></label>
                                                                <PasswordInput name="password" value={data.password} onChange={handleChange} />
                                                                {fieldError('password')}
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label premium-label">Confirmation <span className="text-danger">*</span></label>
                                                                <PasswordInput name="confirmPassword" value={data.confirmPassword} onChange={handleChange} />
                                                                {fieldError('confirmPassword')}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {/* STEP 2: Profil / Entreprise */}
                                                {step === 2 && (
                                                    <>
                                                        {role === 'acheteur' ? (
                                                            <>
                                                                <div className="mb-3">
                                                                    <label className="form-label premium-label">Type d'acheteur <span className="text-danger">*</span></label>
                                                                    <CustomSelect
                                                                        name="typeAcheteur"
                                                                        value={data.typeAcheteur}
                                                                        onChange={handleChange}
                                                                        error={errors.typeAcheteur}
                                                                        options={[
                                                                            { value: 'grossiste', label: 'Grossiste' },
                                                                            { value: 'detaillant', label: 'Détaillant / Revendeur' },
                                                                            { value: 'restaurateur', label: 'Restaurateur / Hôtelier' },
                                                                            { value: 'particulier', label: 'Particulier' },
                                                                        ]}
                                                                    />
                                                                    {fieldError('typeAcheteur')}
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label premium-label">Nom de l'entreprise <span className="text-muted fw-normal" style={{ textTransform: 'none' }}>(optionnel)</span></label>
                                                                    <div className="input-group pro-input-group">
                                                                        <span className="input-group-text border-0 ps-3"><Building2 size={18} className="input-icon" /></span>
                                                                        <input type="text" name="entreprise" className="form-control border-0 py-3 shadow-none fw-medium" placeholder="Nom de votre structure" value={data.entreprise} onChange={handleChange} style={{ fontSize: '0.95rem' }} />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="mb-3">
                                                                    <label className="form-label premium-label">Nom de la boutique / Marque / PME <span className="text-danger">*</span></label>
                                                                    <p className="text-muted small mb-2" style={{ fontSize: '0.8rem', marginTop: '-2px' }}>📍 Ce nom sera affiché publiquement sur le catalogue et vos produits.</p>
                                                                    <input type="text" name="entreprise" className={`form-control premium-input py-3 px-3 ${errors.entreprise ? 'border-danger' : ''}`} placeholder="Ex: BioSav du Bénin, Chez Marie Bio..." value={data.entreprise} onChange={handleChange} />
                                                                    {fieldError('entreprise')}
                                                                </div>
                                                                <div className="row g-3 mb-3">
                                                                    <div className="col-md-6">
                                                                        <label className="form-label premium-label">Type <span className="text-danger">*</span></label>
                                                                        <CustomSelect
                                                                            name="type"
                                                                            value={data.type}
                                                                            onChange={handleChange}
                                                                            error={errors.type}
                                                                            options={[
                                                                                { value: 'pme', label: 'PME' },
                                                                                { value: 'cooperative', label: 'Coopérative' },
                                                                                { value: 'artisan', label: 'Artisan' },
                                                                            ]}
                                                                        />
                                                                        {fieldError('type')}
                                                                    </div>
                                                                    <div className="col-12 mt-3">
                                                                        <label className="form-label premium-label">Catégories <span className="text-danger">*</span></label>
                                                                        <div className="d-flex flex-wrap gap-2 mt-1">
                                                                            {['Jus', 'Farines', 'Huiles', 'Conserves', 'Epices', 'Autres'].map(cat => (
                                                                                <button 
                                                                                    key={cat}
                                                                                    type="button"
                                                                                    onClick={() => toggleCategory(cat)}
                                                                                    className={`btn btn-sm rounded-pill px-3 py-2 fw-bold transition-all ${data.categorie.includes(cat) ? 'btn-success shadow-sm' : 'btn-outline-secondary'}`}
                                                                                    style={{ fontSize: '0.75rem' }}
                                                                                >
                                                                                    {cat}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                        {fieldError('categorie')}
                                                                    </div>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label premium-label">Description courte</label>
                                                                    <textarea name="description" className="form-control premium-input p-3" rows="2" placeholder="Decrivez vos produits..." value={data.description} onChange={handleChange}></textarea>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label premium-label">Mode de vente <span className="text-danger">*</span></label>
                                                                    <div className="d-flex gap-3 flex-wrap">
                                                                        {['Vente en gros', 'Vente au detail', 'Les deux'].map((opt) => (
                                                                            <div key={opt} className="form-check">
                                                                                <input 
                                                                                    className="form-check-input" 
                                                                                    type="radio" 
                                                                                    name="modeVente" 
                                                                                    id={`mode-${opt}`} 
                                                                                    value={opt} 
                                                                                    checked={data.modeVente === opt} 
                                                                                    onChange={handleChange} 
                                                                                />
                                                                                <label className="form-check-label small" htmlFor={`mode-${opt}`}>{opt}</label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    {fieldError('modeVente')}
                                                                </div>
                                                            </>
                                                        )}
                                                        <div className="row g-3">
                                                            {(data.indicatif === '+229' || role === 'transformateur') && (
                                                                <div className="col-md-6">
                                                                    <label className="form-label premium-label">Département <span className="text-danger">*</span></label>
                                                                    <CustomSelect
                                                                        name="departement"
                                                                        value={data.departement}
                                                                        onChange={handleChange}
                                                                        error={errors.departement}
                                                                        options={[
                                                                            { value: 'alibori', label: 'Alibori' },
                                                                            { value: 'atacora', label: 'Atacora' },
                                                                            { value: 'atlantique', label: 'Atlantique' },
                                                                            { value: 'borgou', label: 'Borgou' },
                                                                            { value: 'collines', label: 'Collines' },
                                                                            { value: 'couffo', label: 'Couffo' },
                                                                            { value: 'donga', label: 'Donga' },
                                                                            { value: 'littoral', label: 'Littoral' },
                                                                            { value: 'mono', label: 'Mono' },
                                                                            { value: 'oueme', label: 'Ouémé' },
                                                                            { value: 'plateau', label: 'Plateau' },
                                                                            { value: 'zou', label: 'Zou' },
                                                                        ]}
                                                                    />
                                                                    {fieldError('departement')}
                                                                </div>
                                                            )}
                                                            <div className={data.indicatif === '+229' || role === 'transformateur' ? 'col-md-6' : 'col-md-12'}>
                                                                <label className="form-label premium-label">
                                                                    {data.indicatif === '+229' || role === 'transformateur' ? 'Commune / Ville' : 'Ville / Région'} <span className="text-danger">*</span>
                                                                </label>
                                                                <input 
                                                                    type="text" 
                                                                    name="commune" 
                                                                    className={`form-control premium-input py-3 px-3 ${errors.commune ? 'border-danger' : ''}`} 
                                                                    placeholder={data.indicatif === '+229' || role === 'transformateur' ? 'Ex: Cotonou' : 'Ex: Abidjan, Bamako...'} 
                                                                    value={data.commune} 
                                                                    onChange={handleChange} 
                                                                />
                                                                {fieldError('commune')}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {/* STEP 3: Verification (Transformateur) / Finalisation (Acheteur) */}
                                                {step === 3 && (
                                                    <>
                                                        {role === 'transformateur' ? (
                                                            <>
                                                                <div className="mb-3">
                                                                    <label className="form-label premium-label">Numéro IFU <span className="text-danger">*</span></label>
                                                                    <input type="text" name="ifu" className={`form-control premium-input py-3 px-3 ${errors.ifu ? 'border-danger' : ''}`} placeholder="N° IFU a 13 chiffres" value={data.ifu} onChange={handleChange} />
                                                                    {fieldError('ifu')}
                                                                </div>
                                                                <div className="row g-3 mb-3">
                                                                    <div className="col-6">
                                                                        <label className="form-label premium-label d-block text-center">Pièce d'identité <span className="text-danger">*</span></label>
                                                                        <label className={`d-block p-3 border rounded-4 text-center transition-all ${data.pj_identite ? 'border-success bg-success bg-opacity-10' : ''}`} style={{ cursor: 'pointer', borderStyle: 'dashed' }}>
                                                                            {data.pj_identite ? <CheckCircle2 size={22} className="text-success mb-1" /> : <Upload size={22} className="text-success mb-1" />}
                                                                            <p className="small mb-0 text-muted text-truncate">{data.pj_identite ? data.pj_identite.name : 'Charger l\'ID'}</p>
                                                                            <input type="file" name="pj_identite" accept="image/*" className="d-none" onChange={handleFileChange} />
                                                                        </label>
                                                                    </div>
                                                                    <div className="col-6">
                                                                        <label className="form-label premium-label d-block text-center">RCCM (Opt.)</label>
                                                                        <label className={`d-block p-3 border rounded-4 text-center transition-all ${data.pj_rccm ? 'border-info bg-info bg-opacity-10' : ''}`} style={{ cursor: 'pointer', borderStyle: 'dashed' }}>
                                                                            {data.pj_rccm ? <CheckCircle2 size={22} className="text-info mb-1" /> : <FileText size={22} className="text-info mb-1" />}
                                                                            <p className="small mb-0 text-muted text-truncate">{data.pj_rccm ? data.pj_rccm.name : 'Charger RCCM'}</p>
                                                                            <input type="file" name="pj_rccm" accept="image/*,.pdf" className="d-none" onChange={handleFileChange} />
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-4">
                                                                    <label className="form-label premium-label d-block text-center">Photo atelier <span className="text-danger">*</span></label>
                                                                    <label className={`d-block p-3 border rounded-4 text-center transition-all ${data.pj_atelier ? 'border-warning bg-warning bg-opacity-10' : ''}`} style={{ cursor: 'pointer', borderStyle: 'dashed' }}>
                                                                        {data.pj_atelier ? <CheckCircle2 size={22} className="text-warning mb-1" /> : <ImageIcon size={22} className="text-warning mb-1" />}
                                                                        <p className="small mb-0 text-muted text-truncate">{data.pj_atelier ? data.pj_atelier.name : 'Charger une photo'}</p>
                                                                        <input type="file" name="pj_atelier" accept="image/*" className="d-none" onChange={handleFileChange} />
                                                                    </label>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            /* Acheteur Final Step */
                                                            <div className="text-center py-3">
                                                                <div className="bg-success text-white p-4 rounded-circle d-inline-flex mb-4 shadow"><CheckCircle2 size={44} /></div>
                                                                <h5 className="fw-bold mb-3">Pret a commencer</h5>
                                                                <p className="text-muted small mb-4">Derniere etape avant de decouvrir nos produits.</p>
                                                                <div className="form-check text-start p-3 bg-light rounded-3">
                                                                    <input className="form-check-input" type="checkbox" name="cgu" id="cguAcheteur" checked={data.cgu} onChange={handleChange} />
                                                                    <label className="form-check-label small ms-2" htmlFor="cguAcheteur">
                                                                        J'accepte les <a href="#" className="text-success fw-bold">Conditions Generales d'Utilisation</a> et la politique de confidentialite.
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* STEP 4: Finalisation Transformateur */}
                                                {step === 4 && role === 'transformateur' && (
                                                    <div className="text-center py-3">
                                                        <div className="bg-success text-white p-4 rounded-circle d-inline-flex mb-4 shadow"><Briefcase size={44} /></div>
                                                        <h5 className="fw-bold mb-3">Soumission pour verification</h5>
                                                        <p className="text-muted small mb-4 px-2">Votre dossier sera examine en 24-48h. Un email de confirmation vous sera envoye.</p>
                                                        <div className="form-check text-start p-3 bg-light rounded-3">
                                                            <input className="form-check-input" type="checkbox" name="cgu" id="cguTrans" checked={data.cgu} onChange={handleChange} />
                                                            <label className="form-check-label small ms-2" htmlFor="cguTrans">
                                                                Je certifie l'exactitude de mes informations et accepte les <a href="#" className="text-success fw-bold">CGU</a>.
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Navigation Buttons */}
                                                {submitError && (
                                                    <div className="alert alert-danger small mt-3 p-2 mb-0 text-center">
                                                        {submitError}
                                                    </div>
                                                )}
                                                <div className="d-flex gap-3 mt-5">
                                                    <button type="button" className="btn px-4 py-3 fw-bold d-flex align-items-center justify-content-center" style={{ flex: '0 0 35%', borderRadius: '14px', background: '#f1f5f2', color: '#374151', border: 'none', transition: 'all 0.2s' }} onClick={prevStep} disabled={isLoading}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#e5ebe7'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f2'}
                                                    >
                                                        Retour
                                                    </button>
                                                    {step < totalSteps ? (
                                                        <button type="button" className="btn pro-btn px-4 py-3 d-flex align-items-center justify-content-center gap-2" style={{ flex: '1' }} onClick={nextStep}>
                                                            Suivant <ChevronRight size={18} />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            type="button" 
                                                            className="btn pro-btn px-4 py-3" 
                                                            style={{ flex: '1', opacity: canSubmitFinalStep() && !isLoading ? 1 : 0.5 }}
                                                            disabled={isLoading}
                                                            onClick={handleSubmit}
                                                        >
                                                            {isLoading ? (
                                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            ) : (
                                                                role === 'acheteur' ? 'Créer mon compte' : 'Soumettre le dossier'
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default RegisterModal;









