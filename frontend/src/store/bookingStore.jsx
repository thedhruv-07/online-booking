/**
 * Booking Store - Manages multi-step booking form state
 * Persists draft bookings to localStorage
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { bookingService } from '../services/booking.service';
import { BOOKING_STEPS } from '../utils/constants';
import { showNotification } from '../utils/helpers';

// Initial state
const initialState = {
  currentStep: 0,
  steps: BOOKING_STEPS,
  bookingData: {
    service: null,
    location: null,
    product: null,
    files: [],
    factory: null,
    contact: null,
    aql: null,
    overview: null,
    payment: null,
  },
  bookings: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 1
  },
  isSubmitting: false,
  isLoading: false,
  error: null,

  savedDraftId: null,
  isValidating: false,
};

// Action types
const BOOKING_ACTIONS = {
  SET_STEP: 'SET_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  UPDATE_DATA: 'UPDATE_DATA',
  SET_FILES: 'SET_FILES',
  REMOVE_FILE: 'REMOVE_FILE',
  SET_SUBMITTING: 'SET_SUBMITTING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOAD_DRAFT: 'LOAD_DRAFT',
  SAVE_DRAFT: 'SAVE_DRAFT',
  CLEAR_BOOKING: 'CLEAR_BOOKING',
  SET_VALIDATING: 'SET_VALIDATING',
  SET_OVERVIEW: 'SET_OVERVIEW',
  SET_PAYMENT: 'SET_PAYMENT',
  SET_BOOKINGS: 'SET_BOOKINGS',
  SET_LOADING: 'SET_LOADING',
};


// Reducer
function bookingReducer(state, action) {
  switch (action.type) {
    case BOOKING_ACTIONS.SET_STEP:
      return { ...state, currentStep: action.payload };

    case BOOKING_ACTIONS.NEXT_STEP:
      const nextStep = Math.min(state.currentStep + 1, state.steps.length - 1);
      return { ...state, currentStep: nextStep };

    case BOOKING_ACTIONS.PREV_STEP:
      const prevStep = Math.max(state.currentStep - 1, 0);
      return { ...state, currentStep: prevStep };

    case BOOKING_ACTIONS.UPDATE_DATA:
      return {
        ...state,
        bookingData: {
          ...state.bookingData,
          [action.payload.step]: action.payload.data,
        },
      };

    case BOOKING_ACTIONS.SET_FILES:
      return {
        ...state,
        bookingData: {
          ...state.bookingData,
          files: Array.isArray(action.payload) 
            ? action.payload.filter(f => f && typeof f === 'object')
            : [],
        },
      };

    case BOOKING_ACTIONS.REMOVE_FILE: {
      const updatedFiles = state.bookingData.files.filter(
        (file) => file.id !== action.payload
      );
      return {
        ...state,
        bookingData: {
          ...state.bookingData,
          files: updatedFiles,
        },
      };
    }

    case BOOKING_ACTIONS.SET_SUBMITTING:
      return { ...state, isSubmitting: action.payload };

    case BOOKING_ACTIONS.SET_VALIDATING:
      return { ...state, isValidating: action.payload };

    case BOOKING_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case BOOKING_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case BOOKING_ACTIONS.LOAD_DRAFT:
      return {
        ...state,
        bookingData: { ...state.bookingData, ...action.payload.bookingData },
        currentStep: action.payload.currentStep || state.currentStep,
        savedDraftId: action.payload.id,
      };

    case BOOKING_ACTIONS.SAVE_DRAFT:
      return { ...state, savedDraftId: action.payload };

    case BOOKING_ACTIONS.CLEAR_BOOKING:
      return { ...initialState, steps: state.steps };

    case BOOKING_ACTIONS.SET_OVERVIEW:
      return {
        ...state,
        bookingData: {
          ...state.bookingData,
          overview: action.payload,
        },
      };

    case BOOKING_ACTIONS.SET_PAYMENT:
      return {
        ...state,
        bookingData: {
          ...state.bookingData,
          payment: action.payload,
        },
      };

    case BOOKING_ACTIONS.SET_BOOKINGS:
      return { 
        ...state, 
        bookings: action.payload.data || [], 
        pagination: action.payload.pagination || state.pagination,
        isLoading: false 
      };

    case BOOKING_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}


// Context
const BookingContext = createContext(null);

/**
 * Booking Provider Component
 */
export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Initial data loading
  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchBookings();
    }
    loadDraft();
  }, []);

  // Save draft to localStorage on data change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasData(state.bookingData)) {
        saveDraftToStorage(state.bookingData, state.currentStep);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [state.bookingData, state.currentStep]);


  const hasData = (data) => {
    return Object.values(data).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (value && typeof value === 'object') return Object.keys(value).length > 0;
      return value !== null && value !== undefined;
    });
  };

  const saveDraftToStorage = (bookingData, currentStep) => {
    try {
      const draft = {
        bookingData,
        currentStep,
        timestamp: Date.now(),
      };
      localStorage.setItem('bookingDraft', JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  /**
   * Load saved draft from localStorage
   */
  const loadDraft = () => {
    try {
      const saved = localStorage.getItem('bookingDraft');
      if (saved) {
        const { bookingData, currentStep } = JSON.parse(saved);
        dispatch({
          type: BOOKING_ACTIONS.LOAD_DRAFT,
          payload: { bookingData, currentStep, id: 'local' },
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return false;
  };

  /**
   * Clear saved draft
   */
  const clearDraft = () => {
    localStorage.removeItem('bookingDraft');
    dispatch({ type: BOOKING_ACTIONS.CLEAR_BOOKING });
  };

  /**
   * Go to specific step
   */
  const goToStep = (stepIndex) => {
    dispatch({ type: BOOKING_ACTIONS.SET_STEP, payload: stepIndex });
  };

  /**
   * Go to next step
   */
  const nextStep = () => {
    dispatch({ type: BOOKING_ACTIONS.NEXT_STEP });
  };

  /**
   * Go to previous step
   */
  const prevStep = () => {
    dispatch({ type: BOOKING_ACTIONS.PREV_STEP });
  };

  /**
   * Update booking data for a step
   */
  const updateStepData = (step, data) => {
    dispatch({
      type: BOOKING_ACTIONS.UPDATE_DATA,
      payload: { step, data },
    });
  };

  /**
   * Set uploaded files
   */
  const setFiles = (files) => {
    dispatch({ type: BOOKING_ACTIONS.SET_FILES, payload: files });
  };

  /**
   * Remove a file
   */
  const removeFile = (fileId) => {
    dispatch({ type: BOOKING_ACTIONS.REMOVE_FILE, payload: fileId });
  };

  /**
   * Set overview data
   */
  const setOverview = (data) => {
    dispatch({ type: BOOKING_ACTIONS.SET_OVERVIEW, payload: data });
  };

  /**
   * Set payment data
   */
  const setPayment = (data) => {
    dispatch({
      type: BOOKING_ACTIONS.SET_PAYMENT,
      payload: data,
    });
  };

  /**
   * Fetch all bookings
   */
  const fetchBookings = async (filters = {}) => {
    dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await bookingService.getBookings(filters);
      dispatch({ type: BOOKING_ACTIONS.SET_BOOKINGS, payload: response });
    } catch (error) {
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: error.message });
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: false });
    }
  };

  /**
   * Submit booking
   */

  const submitBooking = async (overrides = {}) => {
    dispatch({ type: BOOKING_ACTIONS.SET_SUBMITTING, payload: true });
    dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });

    try {
      const mergedData = {
        ...state.bookingData,
        ...overrides,
      };

      // Validate all steps before submitting
      for (const step of state.steps) {
        // Skip validation for overview and payment as they are final stages
        if (['overview', 'payment'].includes(step.route)) continue;

        let stepData;
        if (step.route === 'upload') {
          stepData = mergedData.files && mergedData.files.length > 0;
        } else {
          stepData = mergedData[step.route];
        }

        if (!stepData) {
          throw new Error(`Please complete the ${step.name} step`);
        }
      }

      // Clean and validate files data before submission
      let sanitizedFiles = [];
      if (Array.isArray(mergedData.files)) {
        sanitizedFiles = mergedData.files
          .filter(f => f && typeof f === 'object') // Ensure we only have objects
          .map(({ file, ...rest }) => ({
            id: rest.id || `file_${Date.now()}`,
            name: rest.name || 'document',
            url: rest.url || '',
            size: Number(rest.size) || 0,
            type: rest.type || 'application/octet-stream'
          }));
      }

      const sanitizedBookingData = {
        ...mergedData,
        files: sanitizedFiles
      };

      const response = await bookingService.createBooking({
        ...sanitizedBookingData,
        savedDraftId: state.savedDraftId,
      });

      // Clear draft after successful submission
      localStorage.removeItem('bookingDraft');

      showNotification('Booking created successfully!', 'success');

      // Extract the actual booking object from the { success: true, data: booking } response
      const createdBooking = response.data || response;

      return { success: true, booking: createdBooking };
    } catch (error) {
      dispatch({
        type: BOOKING_ACTIONS.SET_ERROR,
        payload: error.message,
      });
      showNotification(error.message, 'error');
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: BOOKING_ACTIONS.SET_SUBMITTING, payload: false });
    }
  };

  const deleteBooking = async (bookingId) => {
    dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
    try {
      await bookingService.deleteBooking(bookingId);
      showNotification('Booking deleted successfully!', 'success');
      // Refresh the list
      await fetchBookings();
      return { success: true };
    } catch (error) {
      showNotification(error.message || 'Failed to delete booking', 'error');
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const value = {
    ...state,
    goToStep,
    nextStep,
    prevStep,
    updateStepData,
    setFiles,
    removeFile,
    setOverview,
    setPayment,
    submitBooking,
    fetchBookings,
    deleteBooking,
    loadDraft,
    clearDraft,
  };


  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

/**
 * Custom hook to use booking store
 */
export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

export default BookingContext;
