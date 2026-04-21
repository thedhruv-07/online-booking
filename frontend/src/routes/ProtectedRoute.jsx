import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';

/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 * Supports role-based access control
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access control (if roles specified)
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    // User doesn't have required role, redirect to dashboard or unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
