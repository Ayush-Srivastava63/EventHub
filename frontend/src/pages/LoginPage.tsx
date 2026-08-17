import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/auth';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      login(result.token, result.user);
      navigate(result.user.role === 'admin' ? '/admin' : '/events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Welcome Back</h1>
        <p className="auth-card__subtitle">Sign in to your account</p>

        {error && <div className="auth-card__error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-card__form">
          <div className="auth-card__field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-card__field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
