import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavorisContext = createContext();

export const FavorisProvider = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user ? `favoris_${user.id}` : 'favoris_guest';

  const [favoris, setFavoris] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist whenever favoris list changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(favoris));
  }, [favoris, storageKey]);

  // Reload when user changes (login/logout)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setFavoris(saved ? JSON.parse(saved) : []);
    } catch { setFavoris([]); }
  }, [storageKey]);

  const isFavori = (produitId) => favoris.some(f => f.id === produitId);

  const toggleFavori = (produit) => {
    setFavoris(prev => {
      const exists = prev.some(f => f.id === produit.id);
      if (exists) {
        return prev.filter(f => f.id !== produit.id);
      } else {
        return [...prev, { 
          id: produit.id,
          nom: produit.nom,
          image_url: produit.image_url || null,
          prix_unitaire: produit.prix_unitaire,
          unite_mesure: produit.unite_mesure,
          entreprise: produit.entreprise,
          ajouteA: new Date().toISOString()
        }];
      }
    });
  };

  const clearFavoris = () => setFavoris([]);

  return (
    <FavorisContext.Provider value={{ favoris, isFavori, toggleFavori, clearFavoris }}>
      {children}
    </FavorisContext.Provider>
  );
};

export const useFavoris = () => useContext(FavorisContext);
