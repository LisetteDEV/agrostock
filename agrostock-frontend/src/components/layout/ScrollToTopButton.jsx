import React, { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 260);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Retour en haut"
            title="Retour en haut"
            className="scroll-top-square"
            style={{
                position: 'fixed',
                left: '18px',
                bottom: '18px',
                width: '50px',
                height: '50px',
                border: 'none',
                borderRadius: '10px',
                zIndex: 1100,
                background: 'linear-gradient(135deg, #1ab273 0%, #105c38 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 22px rgba(16, 92, 56, 0.35)',
                cursor: 'pointer',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                pointerEvents: visible ? 'auto' : 'none',
                transition: 'opacity 0.22s ease, transform 0.22s ease, filter 0.22s ease',
            }}
        >
            <ChevronUp size={22} strokeWidth={2.5} />
        </button>
    );
};

export default ScrollToTopButton;
