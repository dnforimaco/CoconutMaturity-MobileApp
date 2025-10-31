import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Simulate API call - replace with actual authentication logic
      const userData = {
        id: 1,
        email: email,
        name: email.split('@')[0],
        loginTime: new Date().toISOString(),
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const guestLogin = async () => {
    try {
      const guestUser = {
        id: 'guest',
        email: 'guest@example.com',
        name: 'Guest User',
        isGuest: true,
        loginTime: new Date().toISOString(),
      };

      await AsyncStorage.setItem('user', JSON.stringify(guestUser));
      setUser(guestUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Guest login error:', error);
      return { success: false, error: 'Guest login failed' };
    }
  };

  const createAccount = async (email, password, name) => {
    try {
      // Check if user already exists
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      const userExists = users.find(u => u.email === email);
      if (userExists) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email: email,
        password: password, // In a real app, this would be hashed
        name: name,
        createdAt: new Date().toISOString(),
        isGuest: false,
      };

      // Save to users array
      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));

      // Auto-login after account creation
      const userData = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        loginTime: new Date().toISOString(),
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Create account error:', error);
      return { success: false, error: 'Account creation failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      // Check if user exists
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      const userExists = users.find(u => u.email === email);
      if (!userExists) {
        return { success: false, error: 'No account found with this email address' };
      }

      // Generate a reset token (in a real app, this would be more secure)
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Store reset token (in a real app, this would be stored securely on the server)
      const resetData = {
        email: email,
        token: resetToken,
        expiry: resetExpiry.toISOString(),
        used: false,
      };

      await AsyncStorage.setItem(`reset_${email}`, JSON.stringify(resetData));

      // In a real app, you would send an email here
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return {
        success: true,
        message: 'Password reset instructions have been sent to your email'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: 'Failed to process password reset request' };
    }
  };

  const resetPassword = async (email, token, newPassword) => {
    try {
      // Get reset data
      const resetDataStr = await AsyncStorage.getItem(`reset_${email}`);
      if (!resetDataStr) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      const resetData = JSON.parse(resetDataStr);

      // Check if token is valid and not expired
      if (resetData.token !== token || resetData.used) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      if (new Date() > new Date(resetData.expiry)) {
        return { success: false, error: 'Reset token has expired' };
      }

      // Get users and update password
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      const userIndex = users.findIndex(u => u.email === email);
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      // Update user password
      users[userIndex].password = newPassword;
      await AsyncStorage.setItem('users', JSON.stringify(users));

      // Mark token as used
      resetData.used = true;
      await AsyncStorage.setItem(`reset_${email}`, JSON.stringify(resetData));

      return { success: true, message: 'Password has been successfully reset' };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    guestLogin,
    createAccount,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
