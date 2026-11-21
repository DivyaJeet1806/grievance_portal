import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievance } from '../../context/GrievanceContext';
import {
  AlertCircle,
  LogIn,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import loginBg from '../../assets/login-bg.jpg';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast, setActiveRole } = useGrievance();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      setActiveRole(loggedUser.role === 'admin' ? 'admin' : 'complainant');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="login-page-wrapper"
      style={{
        backgroundImage: `radial-gradient(circle at 85% 30%, rgba(6, 182, 212, 0.12) 0%, transparent 40%), linear-gradient(135deg, rgba(7, 9, 14, 0.92) 0%, rgba(7, 9, 14, 0.72) 45%, rgba(7, 9, 14, 0.35) 100%), url(${loginBg})`
      }}
    >
      <div className="login-card-container">
        <div className="login-glass-card">
          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                flexShrink: 0
              }}>
                <img src="/imsec-logo.png" alt="IMSEC" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  Sign In
                </h2>
                <div style={{ marginTop: '0.15rem' }}>
                  <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 500 }}>
                    IMSEC Grievance Portal
                  </span>
                </div>
              </div>
            </div>
          </div>

            {/* Error Message */}
            {errorMsg && (
              <div style={{
                background: 'var(--color-rose-bg)',
                border: '1px solid rgba(225, 29, 72, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 0.95rem',
                marginBottom: '1.25rem',
                color: 'var(--color-rose)',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="page-email" style={{ color: '#e2e8f0', fontWeight: 600 }}>
                  <span>Email</span>
                </label>
                <input
                  id="page-email"
                  type="email"
                  required
                  autoFocus
                  className="form-control login-input"
                  placeholder="name@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="page-password" style={{ color: '#e2e8f0', fontWeight: 600 }}>
                  <span>Password</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="page-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-control login-input"
                    placeholder="••••••••"
                    style={{ paddingRight: '2.5rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                id="page-auth-submit-btn"
                type="submit"
                className="btn btn-primary login-submit-btn"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
                disabled={loading}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>


            {/* Security Note */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginTop: '1.5rem',
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}>
              <Lock size={12} style={{ color: '#38bdf8' }} />
              <span>Encrypted Session</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
