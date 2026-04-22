/**
 * Auth Store - Manages authentication state
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { showNotification } from '../utils/helpers';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  VERIFY_EMAIL_START: 'VERIFY_EMAIL_START',
  VERIFY_EMAIL_SUCCESS: 'VERIFY_EMAIL_SUCCESS',
  VERIFY_EMAIL_FAILURE: 'VERIFY_EMAIL_FAILURE',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  FORGOT_PASSWORD_START: 'FORGOT_PASSWORD_START',
  FORGOT_PASSWORD_SUCCESS: 'FORGOT_PASSWORD_SUCCESS',
  FORGOT_PASSWORD_FAILURE: 'FORGOT_PASSWORD_FAILURE',
  RESET_PASSWORD_START: 'RESET_PASSWORD_START',
  RESET_PASSWORD_SUCCESS: 'RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_FAILURE: 'RESET_PASSWORD_FAILURE',
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.VERIFY_EMAIL_START:
    case AUTH_ACTIONS.FORGOT_PASSWORD_START:
    case AUTH_ACTIONS.RESET_PASSWORD_START:
      return { ...state, loading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
    case AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.VERIFY_EMAIL_FAILURE:
    case AUTH_ACTIONS.FORGOT_PASSWORD_FAILURE:
    case AUTH_ACTIONS.RESET_PASSWORD_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.FORGOT_PASSWORD_SUCCESS:
    case AUTH_ACTIONS.RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, loading: false };

    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };

    default:
      return state;
  }
}

// Context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return;
    }

    try {
      const user = await authService.getProfile();
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user },
      });
    } catch (error) {
      localStorage.removeItem('token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  /**
   * LOGIN (FIXED)
   */
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authService.login(email, password);

      console.log("LOGIN RESPONSE:", response);

      const user = response.user || response.data?.user;
      const token = response.token || response.data?.token;

      if (!token) {
        throw new Error("Token not received from server");
      }

      localStorage.setItem('token', token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user },
      });

      showNotification('Login successful!', 'success');

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * SIGNUP (FIXED)
   */
  const signup = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await authService.signup(userData);

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user: response.user || null },
      });

      showNotification('Account created! Please check your email to verify.', 'success');

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Verify email
   */
  const verifyEmail = async (token) => {
    dispatch({ type: AUTH_ACTIONS.VERIFY_EMAIL_START });

    try {
      await authService.verifyEmail(token);

      dispatch({
        type: AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS,
        payload: {},
      });

      showNotification('Email verified successfully!', 'success');

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.VERIFY_EMAIL_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Request password reset
   */
  const forgotPassword = async (email) => {
    dispatch({ type: AUTH_ACTIONS.FORGOT_PASSWORD_START });

    try {
      const response = await authService.requestPasswordReset(email);

      dispatch({
        type: AUTH_ACTIONS.FORGOT_PASSWORD_SUCCESS,
        payload: response,
      });

      showNotification('Password reset link sent to your email!', 'success');

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.FORGOT_PASSWORD_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (token, password) => {
    dispatch({ type: AUTH_ACTIONS.RESET_PASSWORD_START });

    try {
      const response = await authService.resetPassword(token, password);

      dispatch({
        type: AUTH_ACTIONS.RESET_PASSWORD_SUCCESS,
        payload: response,
      });

      showNotification('Password reset successfully! You can now login.', 'success');

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.RESET_PASSWORD_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Resend verification email
   */
  const resendVerification = async (email) => {
    try {
      await authService.resendVerification(email);
      showNotification('Verification email resent! Please check your inbox.', 'success');
      return { success: true };
    } catch (error) {
      showNotification(error.message, 'error');
      return { success: false, error: error.message };
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      showNotification('Logged out successfully', 'info');
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const updateUser = (updates) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: updates,
    });
  };

  const value = {
    ...state,
    login,
    signup,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;