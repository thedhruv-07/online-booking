import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { Layout } from '../components/layout';

// Auth pages
import { Login, Signup, VerifyEmail, ForgotPassword, ResetPassword } from '../pages/auth';

// Dashboard pages
import { Dashboard, MyBookings, BookingDetails, PaymentsPage, ProfilePage, SettingsPage } from '../pages/dashboard';

// Booking pages
import CreateBooking from '../pages/booking/CreateBooking';
import { BookingLayout } from '../components/booking';

// Admin pages
import { AdminDashboard, Users, Bookings, Payments } from '../pages/admin';

// Components
import ProtectedRoute from './ProtectedRoute';

/**
 * Main application routes configuration
 */
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root — redirect to dashboard if logged in, else login */}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />

      {/* Auth Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
        <Route path="payments" element={<PaymentsPage />} />
      </Route>

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfilePage />} />
      </Route>

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SettingsPage />} />
      </Route>

      {/* Booking Routes */}
      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <BookingLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="create" replace />} />
        <Route path="create" element={<CreateBooking />} />
      </Route>


      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="payments" element={<Payments />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
