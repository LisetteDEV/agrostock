import React from 'react';
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
import Accueil from './pages/public/Accueil';
import APropos from './pages/public/APropos';
import Catalogue from './pages/public/Catalogue';
import FicheProduit from './pages/public/FicheProduit';
import Transformateurs from './pages/public/Transformateurs';
import ProfilTransformateur from './pages/public/ProfilTransformateur';
import Blog from './pages/public/Blog';
import Contact from './pages/public/Contact';
import ArticleSingle from './pages/public/ArticleSingle';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/admin/AdminLogin';
import DashboardAcheteur from './pages/acheteur/Dashboard';
import Panier from './pages/acheteur/Panier';
import Checkout from './pages/acheteur/Checkout';
import MesCommandes from './pages/acheteur/Commandes';
import ProfilAcheteur from './pages/acheteur/Profil';
import Favoris from './pages/acheteur/Favoris';
import HistoriqueAvis from './pages/acheteur/Avis';
import DashboardTransformateur from './pages/transformateur/Dashboard';
import MesProduits from './pages/transformateur/MesProduits';
import GestionCommandes from './pages/transformateur/GestionCommandes';
import Statistiques from './pages/transformateur/Statistiques';
import ProfilEntreprise from './pages/transformateur/ProfilEntreprise';
import ParametresTransformateur from './pages/transformateur/Parametres';
import TransformateurLayout from './components/layout/TransformateurLayout';
import AcheteurLayout from './components/layout/AcheteurLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUtilisateurs from './pages/admin/Utilisateurs';
import AdminTransformateurs from './pages/admin/Transformateurs';
import AdminProduits from './pages/admin/Produits';
import AdminCommandes from './pages/admin/Commandes';
import AdminTransactions from './pages/admin/Transactions';
import AdminAvis from './pages/admin/Avis';
import AdminBlog from './pages/admin/Blog';
import AdminParametres from './pages/admin/Parametres';
import AdminMessagesContact from './pages/admin/MessagesContact';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div key={location.pathname}>
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

const App = () => {
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



