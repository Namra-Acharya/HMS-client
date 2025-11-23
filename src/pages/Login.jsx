import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import useHMSStore from '../store/hmsStore';

function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(true);
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const { setIsAuthenticated, setNotification } = useHMSStore();

  useEffect(() => {
    checkIfPasswordSet();
  }, []);

  const checkIfPasswordSet = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth/check-password` : '/api/auth/check-password';
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error('Server response not OK:', response.status);
        setIsSetup(true);
        setCheckingPassword(false);
        return;
      }

      const data = await response.json();
      setIsSetup(!data.passwordSet);
    } catch (error) {
      console.error('Error checking password:', error);
      setIsSetup(true);
    } finally {
      setCheckingPassword(false);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (setupPassword.length < 4) {
      setError('Password must be at least 4 characters');
      setLoading(false);
      return;
    }

    if (setupPassword !== setupConfirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth/initialize-password` : '/api/auth/initialize-password';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: setupPassword })
      });

      if (!response.ok) {
        setError(`Server error: ${response.status}`);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setNotification({ type: 'success', message: 'Password setup successful' });
        setIsSetup(false);
        setSetupPassword('');
        setSetupConfirm('');
      } else {
        setError(data.error || 'Failed to setup password');
      }
    } catch (error) {
      setError('Failed to setup password. Please try again: ' + error.message);
      console.error('Setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth/verify-password` : '/api/auth/verify-password';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        setError(`Server error: ${response.status}`);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setNotification({ type: 'success', message: 'Login successful' });
      } else {
        setError(data.error || 'Invalid password');
        setPassword('');
      }
    } catch (error) {
      setError('Failed to verify password. Please try again: ' + error.message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-3 sm:mb-4">
            <span className="text-2xl sm:text-3xl">🏥</span>
          </div>
          <p className="text-white text-base sm:text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="flex justify-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl">🏥</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">HIMS</h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium">Hospital Information Management System</p>
          </div>

          {/* Setup Form */}
          {isSetup ? (
            <form onSubmit={handleSetupSubmit} className="space-y-3 sm:space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xs sm:text-sm text-blue-800 font-medium">Initial Setup</p>
                <p className="text-xs text-blue-600">Please set a password for the first time</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 flex items-start gap-2 sm:gap-3">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="relative">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Set Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
                  <input
                    type="password"
                    value={setupPassword}
                    onChange={(e) => {
                      setSetupPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Minimum 4 characters"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors font-medium text-gray-900 placeholder-gray-500 text-sm"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
                  <input
                    type="password"
                    value={setupConfirm}
                    onChange={(e) => {
                      setSetupConfirm(e.target.value);
                      setError('');
                    }}
                    placeholder="Re-enter password"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors font-medium text-gray-900 placeholder-gray-500 text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !setupPassword || !setupConfirm}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-2 sm:py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 text-sm sm:text-base"
              >
                {loading ? 'Setting up...' : 'Setup Password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 flex items-start gap-2 sm:gap-3">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="relative">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Enter Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter access password"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors font-medium text-gray-900 placeholder-gray-500 text-sm"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-2 sm:py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 text-sm sm:text-base"
              >
                {loading ? 'Verifying...' : 'Access Hospital System'}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6 text-center">
            <p className="text-xs text-gray-500">
              Nexus Group Hospital Information Management System
            </p>
            <p className="text-xs text-gray-400 mt-1">Secure Access Required</p>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-4 sm:mt-6 text-white text-xs sm:text-sm">
          <p>For access issues, contact the administrator</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
