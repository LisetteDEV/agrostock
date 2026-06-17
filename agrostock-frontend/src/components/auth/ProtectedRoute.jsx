import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles, redirectPath = "/" }) => {
    const { user, token } = useAuth();

    // S'il n'y a pas de token ou d'utilisateur, rediriger vers l'accueil (ou le portail admin specifie)
    if (!token || !user) {
        return <Navigate to={redirectPath} replace />;
    }

    // S'il y a des roles restreints et que l'utilisateur n'a pas le bon role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Interdiction d'acces. Rediriger l'utilisateur vers son propre dashboard
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'acheteur') return <Navigate to="/dashboard-acheteur" replace />;
        if (user.role === 'transformateur') return <Navigate to="/dashboard-transformateur" replace />;
        return <Navigate to="/" replace />;
    }

    // Si tout est bon, afficher le composant demande
    return children;
};

export default ProtectedRoute;
