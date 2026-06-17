import React, { createContext, useContext, useState, useEffect } from 'react';

const PanierContext = createContext();

export const usePanier = () => useContext(PanierContext);

const normalizePanierItem = (item) => {
    const modeAchat = item.mode_achat === 'gros' ? 'gros' : 'detail';
    const panierKey = item.panier_key || `${item.id}-${modeAchat}`;

    return {
        ...item,
        mode_achat: modeAchat,
        panier_key: panierKey,
    };
};

export const PanierProvider = ({ children }) => {
    const [panier, setPanier] = useState(() => {
        try {
            const saved = localStorage.getItem('agrostock_panier');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed.map(normalizePanierItem) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('agrostock_panier', JSON.stringify(panier));
    }, [panier]);

    const getPrixByMode = (produit) => {
        if (produit.mode_achat === 'gros') {
            return Number(produit.prix_gros ?? 0);
        }
        return Number(produit.prix_unitaire ?? 0);
    };

    const addToPanier = (produit, quantite = 1, modeAchat = 'detail') => {
        const normalizedMode = modeAchat === 'gros' ? 'gros' : 'detail';
        const panierKey = `${produit.id}-${normalizedMode}`;

        setPanier((prev) => {
            const index = prev.findIndex((item) => item.panier_key === panierKey);
            if (index > -1) {
                const updated = [...prev];
                updated[index].quantite += quantite;
                return updated;
            }

            return [
                ...prev,
                normalizePanierItem({
                    ...produit,
                    quantite,
                    mode_achat: normalizedMode,
                    panier_key: panierKey,
                }),
            ];
        });
    };

    const removeFromPanier = (panierKey) => {
        setPanier((prev) => prev.filter((item) => item.panier_key !== panierKey));
    };

    const updateQuantite = (panierKey, quantite) => {
        if (quantite <= 0) {
            removeFromPanier(panierKey);
            return;
        }
        setPanier((prev) => prev.map((item) => (item.panier_key === panierKey ? { ...item, quantite } : item)));
    };

    const clearPanier = () => setPanier([]);

    const totalPanier = panier.reduce((sum, item) => sum + getPrixByMode(item) * item.quantite, 0);
    const countPanier = panier.reduce((sum, item) => sum + item.quantite, 0);

    return (
        <PanierContext.Provider value={{ panier, addToPanier, removeFromPanier, updateQuantite, clearPanier, totalPanier, countPanier, getPrixByMode }}>
            {children}
        </PanierContext.Provider>
    );
};
