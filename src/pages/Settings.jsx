import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import useHMSStore from '../store/hmsStore';

function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { setNotification } = useHMSStore();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setNotification({ type: 'success', message: 'Password changed successfully' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setError('Failed to change password. Please try again.');
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Password Management Card */}
      <div className="card max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Lock size={24} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-600">Update your system access password</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
            <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password */}
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter current password"
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* New Password */}
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter new password (minimum 4 characters)"
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              placeholder="Re-enter new password"
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This password is required to access the Hospital Management System. Keep it safe and secure.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
              }}
              className="btn-secondary"
              disabled={loading}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="btn-primary"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Additional Info */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Security Reminder</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Password must be at least 4 characters</li>
          <li>✓ Users will need to enter this password each time they open the system</li>
          <li>✓ Only admins can change the password</li>
          <li>✓ Keep your password secure and do not share it</li>
        </ul>
      </div>
    </div>
  );
}

export default Settings;
