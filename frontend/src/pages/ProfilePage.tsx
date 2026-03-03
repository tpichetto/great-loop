import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import './ProfilePage.css';

export function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      await authAPI.updateProfile({ name });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // In a real implementation, we'd update the auth context with the new user data
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setIsEditing(false);
    setMessage(null);
  };

  if (isLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-section">
            <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>

            <div className="profile-info">
              {isEditing ? (
                <input
                  type="text"
                  className="edit-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                />
              ) : (
                <h2 className="profile-name">{user?.name}</h2>
              )}
              <p className="profile-email">{user?.email}</p>
              <div className="profile-badges">
                <span className={`badge role-badge ${user?.role}`}>{user?.role}</span>
              </div>
            </div>
          </div>

          {message && <div className={`message ${message.type}`}>{message.text}</div>}

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="btn btn-secondary" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-details">
          <h3 className="details-title">Account Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Member since</span>
              <span className="detail-value">
                {new Date(user?.createdAt || '').toLocaleDateString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Account ID</span>
              <span className="detail-value">{user?.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Role</span>
              <span className="detail-value">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
