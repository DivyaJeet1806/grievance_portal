import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievance } from '../../context/GrievanceContext';
import {
  KeyRound,
  AlertCircle,
  UserCheck,
  ShieldCheck,
  Sparkles,
  LogIn
} from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast, setActiveRole } = useGrievance();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (e) => {
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

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
    setLoading(true);
    try {
      const loggedUser = await login(demoEmail, demoPassword);
      showToast(`Signed in as ${loggedUser.name}!`, 'success');
      setActiveRole(loggedUser.role === 'admin' ? 'admin' : 'complainant');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem 1.5rem', background: 'radial-gradient(ellipse at 50% 10%, rgba(99,102,241,0.15) 0%, rgba(15,23,42,0.95) 75%)' }}>

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem', maxWidth: '480px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          IMSEC <span style={{ background: 'linear-gradient(135deg, #00bfff 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grievance Portal</span>
        </h1>
      </div>

      {/* Centered Auth Card */}
      <div className="glass-panel" style={{
        maxWidth: '460px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-float)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Card Header */}
        <div style={{
          padding: '1.15rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-400)'
          }}>
            <LogIn size={16} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Sign In to Portal</h2>
          </div>
        </div>

        <div style={{ padding: '2rem 1.75rem' }}>
          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              background: 'var(--color-rose-bg)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              color: 'var(--color-rose)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="page-email">Institutional Email</label>
              <input
                id="page-email"
                type="email"
                required
                autoFocus
                className="form-control"
                placeholder=""
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

          {/* Demo Accounts Quick Fill */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={13} style={{ color: 'var(--color-amber)' }} /> Instant Demo Logins
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  padding: '0.65rem 0.85rem',
                  textAlign: 'left'
                }}
                onClick={() => handleQuickLogin('student@campus.edu', 'student123')}
                disabled={loading}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <UserCheck size={15} style={{ color: 'var(--color-blue)' }} />
                  <strong>Student:</strong> Rahul Sharma
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>student@campus.edu</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  padding: '0.65rem 0.85rem',
                  textAlign: 'left'
                }}
                onClick={() => handleQuickLogin('admin@campus.edu', 'admin123')}
                disabled={loading}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={15} style={{ color: '#a855f7' }} />
                  <strong>Admin:</strong> Dr. Anita Rao
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>admin@campus.edu</span>
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Institutional Portal • Encrypted JWT Authentication
          </p>
        </div>
      </div>
    </div>
  );
};
