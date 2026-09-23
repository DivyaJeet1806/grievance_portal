import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievance } from '../../context/GrievanceContext';
import { 
  Lock, 
  KeyRound, 
  AlertCircle 
} from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast, setActiveRole } = useGrievance();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      setActiveRole(loggedUser.role === 'admin' ? 'admin' : 'complainant');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 1.5rem' }}>

      {/* Centered Login Card */}
      <div className="glass-panel" style={{ 
        maxWidth: '440px', 
        margin: '0 auto', 
        width: '100%', 
        overflow: 'hidden',
        boxShadow: 'var(--shadow-float)'
      }}>
        <div style={{ padding: '2.75rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-500)'
            }}>
              <Lock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Sign In to Portal</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Institutional Grievance Redressal System</p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{ 
              background: 'var(--color-rose-bg)', 
              border: '1px solid rgba(244, 63, 94, 0.3)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.75rem 1rem', 
              marginBottom: '1.25rem',
              color: 'var(--color-rose)',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="page-email">Institutional Email</label>
              <input
                id="page-email"
                type="email"
                required
                autoFocus
                className="form-control"
                placeholder="e.g. user@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="page-password">Password</label>
              <input
                id="page-password"
                type="password"
                required
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              id="page-auth-submit-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem' }}
              disabled={loading}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Institutional footer notice */}
          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Authorized campus access only.
          </p>
        </div>
      </div>
    </div>
  );
};
