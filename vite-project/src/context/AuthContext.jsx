import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data } = await api.get('/me');
      setUser(data.data);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/register', userData);

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Fetch user details
      await checkUserLoggedIn();
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
      return false;
    }
  };

  const login = async (userData) => {
    try {
      const { data } = await api.post('/login', userData);

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Fetch user details
      await checkUserLoggedIn();
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.get('/logout');
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error(error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/forgotpassword', { email });
      toast.success('Email sent! Check your inbox.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send email');
      return false;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await api.put(`/resetpassword/${token}`, { password });
      toast.success('Password reset successful! Please login.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
