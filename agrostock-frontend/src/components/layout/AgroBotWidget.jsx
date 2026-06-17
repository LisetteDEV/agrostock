import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { API_URL } from '../../services/config';
import { useAuth } from '../../context/AuthContext';

const roleLabel = {
    visiteur: 'Visiteur',
    acheteur: 'Acheteur',
    transformateur: 'Transformateur',
};

const quickByRole = {
    visiteur: [
        'Comment fonctionne AgroStock ?',
        'Comment m inscrire ?',
        'Comment se passe la livraison ?',
    ],
    acheteur: [
        'Comment suivre ma commande ?',
        'Comment laisser un avis ?',
        'Que faire en cas de paiement echoue ?',
    ],
    transformateur: [
        'Comment ajouter un produit ?',
        'Comment mettre a jour mon stock ?',
        'Comment gerer mes commandes ?',
    ],
};

const AgroBotWidget = () => {
    const { user, token } = useAuth();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesRef = useRef(null);

    const role = useMemo(() => {
        if (user?.role === 'acheteur') return 'acheteur';
        if (user?.role === 'transformateur') return 'transformateur';
        return 'visiteur';
    }, [user]);

    const [messages, setMessages] = useState([
        {
            id: 1,
            from: 'bot',
            text: `Bonjour, je suis AgroBot. Je vous assiste en mode ${roleLabel[role]}. Posez votre question.`,
        },
    ]);

    useEffect(() => {
        setMessages((prev) => {
            if (prev.length > 1) return prev;
            return [
                {
                    id: 1,
                    from: 'bot',
                    text: `Bonjour, je suis AgroBot. Je vous assiste en mode ${roleLabel[role]}. Posez votre question.`,
                },
            ];
        });
    }, [role]);

    useEffect(() => {
        if (!messagesRef.current) return;
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [messages, loading]);

    const pushMessage = (from, value) => {
        setMessages((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), from, text: value },
        ]);
    };

    const sendMessage = async (preset) => {
        const content = (preset ?? text).trim();
        if (!content || loading) return;

        pushMessage('user', content);
        setText('');
        setLoading(true);

        try {
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            if (token) headers.Authorization = `Bearer ${token}`;

            const res = await fetch(`${API_URL}/chatbot/message`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ message: content, role }),
            });

            const raw = await res.text();
            let data = null;
            try {
                data = raw ? JSON.parse(raw) : null;
            } catch {
                data = null;
            }

            if (!res.ok) {
                const apiError = data?.message || data?.error;
                pushMessage('bot', apiError || 'Je n ai pas pu repondre pour le moment. Reessayez dans un instant.');
                return;
            }

            pushMessage('bot', data?.reply || 'Je n ai pas pu repondre pour le moment.');
        } catch {
            pushMessage('bot', 'Service indisponible pour le moment. Reessayez dans un instant.');
        } finally {
            setLoading(false);
        }
    };

    const quick = quickByRole[role];

    return (
        <>
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        right: '18px',
                        bottom: '82px',
                        width: 'min(380px, calc(100vw - 22px))',
                        height: '520px',
                        zIndex: 1250,
                        borderRadius: '16px',
                        background: '#ffffff',
                        border: '1px solid rgba(16, 92, 56, 0.18)',
                        boxShadow: '0 18px 40px rgba(16, 92, 56, 0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            padding: '12px 14px',
                            background: 'linear-gradient(135deg, #105c38 0%, #1ab273 100%)',
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <Bot size={18} />
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>AgroBot</div>
                                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Assistant AgroStock Benin</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            style={{ background: 'transparent', border: 'none', color: '#fff' }}
                            aria-label="Fermer AgroBot"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #e6eee9', background: '#f5faf7' }}>
                        <div className="d-flex flex-wrap gap-2">
                            {quick.map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => sendMessage(q)}
                                    style={{
                                        border: '1px solid #cde8dc',
                                        background: '#fff',
                                        borderRadius: '999px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        color: '#105c38',
                                        padding: '4px 10px',
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: '12px', background: '#f9fcfa' }}>
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: '10px',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '84%',
                                        padding: '10px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.87rem',
                                        lineHeight: 1.5,
                                        background: m.from === 'user' ? '#105c38' : '#ffffff',
                                        color: m.from === 'user' ? '#fff' : '#123625',
                                        border: m.from === 'user' ? 'none' : '1px solid #e0ece5',
                                    }}
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ fontSize: '0.78rem', color: '#49785f' }}>AgroBot ecrit...</div>
                        )}
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendMessage();
                        }}
                        style={{ borderTop: '1px solid #e6eee9', padding: '10px', background: '#fff' }}
                    >
                        <div className="d-flex gap-2">
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Ecrivez votre question..."
                                className="form-control"
                                style={{ fontSize: '0.9rem' }}
                            />
                            <button
                                type="submit"
                                disabled={loading || !text.trim()}
                                className="btn"
                                style={{ background: '#1ab273', color: '#fff', minWidth: '44px' }}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <p style={{ margin: '8px 0 0', fontSize: '0.68rem', color: '#6a8678' }}>
                            AgroBot ne partage pas les contacts vendeurs et ne traite pas les paiements.
                        </p>
                    </form>
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Ouvrir AgroBot"
                title="AgroBot"
                style={{
                    position: 'fixed',
                    right: '18px',
                    bottom: '18px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    border: 'none',
                    zIndex: 1240,
                    background: 'linear-gradient(135deg, #1ab273 0%, #105c38 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 12px 25px rgba(16, 92, 56, 0.35)',
                }}
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>
        </>
    );
};

export default AgroBotWidget;