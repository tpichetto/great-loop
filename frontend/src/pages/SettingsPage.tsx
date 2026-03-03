import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import './SettingsPage.css';

export function SettingsPage() {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setIsChangingPassword(true);

    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to change password',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2 className="section-title">Account Security</h2>
          <div className="section-card">
            <h3 className="card-title">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="password-form">
              {message && <div className={`message ${message.type}`}>{message.text}</div>}

              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isChangingPassword}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isChangingPassword}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isChangingPassword}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Notifications</h2>
          <div className="section-card">
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Email Notifications</h3>
                <p className="setting-description">
                  Receive email updates about your account activity
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Push Notifications</h3>
                <p className="setting-description">Receive browser push notifications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleNotificationChange('push')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Danger Zone</h2>
          <div className="section-card danger">
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Log Out</h3>
                <p className="setting-description">Sign out of your account on this device</p>
              </div>
              <button className="btn btn-danger" onClick={logout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
