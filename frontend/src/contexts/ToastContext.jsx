import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { ToastContainer } from '../components/Toast';

// Create toast context
const ToastContext = createContext();

// Actions
const ADD_TOAST = 'ADD_TOAST';
const REMOVE_TOAST = 'REMOVE_TOAST';

// Initial state
const initialState = {
  toasts: []
};

// Reducer
const toastReducer = (state, action) => {
  switch (action.type) {
    case ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, action.payload]
      };
    case REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
    default:
      return state;
  }
};

// Provider component
export const ToastProvider = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  // Generate a unique ID for each toast
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Add toast
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = generateUniqueId();
    
    dispatch({
      type: ADD_TOAST,
      payload: {
        id,
        message,
        type,
        duration
      }
    });

    return id;
  }, []);

  // Remove toast
  const removeToast = useCallback((id) => {
    dispatch({
      type: REMOVE_TOAST,
      payload: id
    });
  }, []);

  // Shorthand methods
  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    warning: (message, duration) => addToast(message, 'warning', duration)
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={state.toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}; 