import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const updated = await updateProfile({ name, email });
      updateUser(updated);
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="profile-page" id="profile-page">
      <div className="profile-card">
        <div className="profile-card__avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h1 className="profile-card__name">{user?.name}</h1>
        <p className="profile-card__role">
          {user?.role === 'admin' ? '🛡️ Admin / Organizer' : '👤 Member'}
        </p>
        <p className="profile-card__joined">
          Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
        </p>
      </div>

      <div className="profile-form-container">
        <h2 className="profile-form__title">Edit Profile</h2>

        {message && <div className="profile-form__success">{message}</div>}
        {error && <div className="profile-form__error">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form__field">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="profile-form__field">
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn--primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
