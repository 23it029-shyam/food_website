import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Configure Axios Defaults
axios.defaults.withCredentials = true;

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'STOP_LOADING':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set default authorization header if token exists
  if (state.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load user profile on app mount
  const checkSession = async () => {
    dispatch({ type: 'AUTH_START' });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'STOP_LOADING' });
        return;
      }
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.data, token }
        });
      } else {
        dispatch({ type: 'AUTH_FAIL', payload: 'Session invalid' });
      }
    } catch (error) {
      localStorage.removeItem('token');
      dispatch({ type: 'AUTH_FAIL', payload: error.response?.data?.message || 'Session expired' });
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Login handler
  const login = async (email, password, requiredRole) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/login', { email, password, requiredRole });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      toast.success(`Welcome back, ${user.name}!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      toast.error(message);
      throw new Error(message);
    }
  };

  // Register handler
  const register = async (name, email, password, phone, role) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/register', { name, email, password, phone, role });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      toast.success(`Registered successfully! Welcome, ${user.name}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      toast.error(message);
      throw new Error(message);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
    } catch (err) {
      console.warn('Backend logout call warning:', err);
    }
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Update profile states locally
  const updateUserProfile = (userData) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: userData });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUserProfile, reloadSession: checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
