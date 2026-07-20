import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.responsive.css';
import { AuthProvider } from './context/AuthContext';
import { PanierProvider } from './context/PanierContext';
import { FavorisProvider } from './context/FavorisContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTopButton from './components/layout/ScrollToTopButton';
import AgroBotWidget from './components/layout/AgroBotWidget';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TransformateurLayout from './components/layout/TransformateurLayout';
import AcheteurLayout from './components/layout/AcheteurLayout';
import AdminLayout from './components/layout/AdminLayout';

// Code Splitting - Lazy Loading Pages
const Accueil = lazy(() => import('./pages/public/Accueil'));
const APropos = lazy(() => import('./pages/public/APropos'));
const Catalogue = lazy(() => import('./pages/public/Catalogue'));
const FicheProduit = lazy(() => import('./pages/public/FicheProduit'));
const Transformateurs = lazy(() => import('./pages/public/Transformateurs'));
const ProfilTransformateur = lazy(() => import('./pages/public/ProfilTransformateur'));
const Blog = lazy(() => import('./pages/public/Blog'));
const Contact = lazy(() => import('./pages/public/Contact'));
const ArticleSingle = lazy(() => import('./pages/public/ArticleSingle'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const DashboardAcheteur = lazy(() => import('./pages/acheteur/Dashboard'));
const Panier = lazy(() => import('./pages/acheteur/Panier'));
const Checkout = lazy(() => import('./pages/acheteur/Checkout'));
const MesCommandes = lazy(() => import('./pages/acheteur/Commandes'));
const ProfilAcheteur = lazy(() => import('./pages/acheteur/Profil'));
const Favoris = lazy(() => import('./pages/acheteur/Favoris'));
const HistoriqueAvis = lazy(() => import('./pages/acheteur/Avis'));
const DashboardTransformateur = lazy(() => import('./pages/transformateur/Dashboard'));
const MesProduits = lazy(() => import('./pages/transformateur/MesProduits'));
const GestionCommandes = lazy(() => import('./pages/transformateur/GestionCommandes'));
const Statistiques = lazy(() => import('./pages/transformateur/Statistiques'));
const ProfilEntreprise = lazy(() => import('./pages/transformateur/ProfilEntreprise'));
const ParametresTransformateur = lazy(() => import('./pages/transformateur/Parametres'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUtilisateurs = lazy(() => import('./pages/admin/Utilisateurs'));
const AdminTransformateurs = lazy(() => import('./pages/admin/Transformateurs'));
const AdminProduits = lazy(() => import('./pages/admin/Produits'));
const AdminCommandes = lazy(() => import('./pages/admin/Commandes'));
const AdminTransactions = lazy(() => import('./pages/admin/Transactions'));
const AdminAvis = lazy(() => import('./pages/admin/Avis'));
const AdminBlog = lazy(() => import('./pages/admin/Blog'));
const AdminParametres = lazy(() => import('./pages/admin/Parametres'));
const AdminMessagesContact = lazy(() => import('./pages/admin/MessagesContact'));

const PageLoader = () => (
  <div style={{
    position: 'fixed', inset: 0,
    background: '#050e08',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 9999
  }}>
    <div style={{
      width: 48, height: 48,
      border: '3px solid rgba(74,222,128,0.15)',
      borderTop: '3px solid #4ade80',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
        <Route path="/" element={<Accueil />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/produit/:id" element={<FicheProduit />} />
        <Route path="/transformateurs" element={<Transformateurs />} />
        <Route path="/transformateur/:id" element={<ProfilTransformateur />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<ArticleSingle />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/panier" element={<Panier />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['acheteur']} redirectPath="/login">
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* Routes protégées Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectPath="/admin/login">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="utilisateurs" element={<AdminUtilisateurs />} />
          <Route path="transformateurs" element={<AdminTransformateurs />} />
          <Route path="produits" element={<AdminProduits />} />
          <Route path="commandes" element={<AdminCommandes />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="avis" element={<AdminAvis />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="parametres" element={<AdminParametres />} />
          <Route path="messages-contact" element={<AdminMessagesContact />} />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={['acheteur']} redirectPath="/">
              <AcheteurLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard-acheteur" element={<DashboardAcheteur />} />
          <Route path="mes-commandes" element={<MesCommandes />} />
          <Route path="profil" element={<ProfilAcheteur />} />
          <Route path="favoris" element={<Favoris />} />
          <Route path="historique-avis" element={<HistoriqueAvis />} />
        </Route>

        {/* Routes protégées Transformateur */}
        <Route
          path="/dashboard-transformateur"
          element={
            <ProtectedRoute allowedRoles={['transformateur']} redirectPath="/">
              <TransformateurLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardTransformateur />} />
          <Route path="produits" element={<MesProduits />} />
          <Route path="commandes" element={<GestionCommandes />} />
          <Route path="stats" element={<Statistiques />} />
          <Route path="profil" element={<ProfilEntreprise />} />
          <Route path="parametres" element={<ParametresTransformateur />} />
        </Route>

        <Route path="*" element={<Accueil />} />
      </Routes>
      </Suspense>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();

  // Liste des chemins où on ne veut pas de Header/Footer publics
  const isDashboard =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/dashboard-transformateur') ||
    location.pathname.startsWith('/dashboard-acheteur') ||
    location.pathname.startsWith('/mes-commandes') ||
    location.pathname.startsWith('/profil') ||
    location.pathname.startsWith('/favoris') ||
    location.pathname.startsWith('/historique-avis') ||
    location.pathname.startsWith('/admin-portal');

  const showAgroBot = !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/admin-portal');

  return (
    <>
      {!isDashboard && <Navbar />}
      <AnimatedRoutes />
      {showAgroBot && <AgroBotWidget />}
      {!isDashboard && <ScrollToTopButton />}
      {!isDashboard && <Footer />}
    </>
  );
};

import { API_URL } from './services/config';

const App = () => {
  React.useEffect(() => {
    // Ping immédiat au chargement de l'application pour réveiller Render le plus tôt possible
    fetch(`${API_URL}/ping`).catch(() => {});
    
    // Ping toutes les 8 minutes pour empêcher le backend Render de s'endormir (limite de Render: 15 min)
    const interval = setInterval(() => {
      fetch(`${API_URL}/ping`).catch(() => {});
    }, 8 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <FavorisProvider>
        <PanierProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </PanierProvider>
      </FavorisProvider>
    </AuthProvider>
  );
};

const container = document.getElementById('app');
if (!container) {
  console.error("Élément #app introuvable dans index.html !");
} else {
  createRoot(container).render(<App />);
}



