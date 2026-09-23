import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievance } from '../../context/GrievanceContext';
import { Modal } from './Modal';
import { 
  Lock, 
  AlertCircle, 
  KeyRound
} from 'lucide-react';

export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    login
  } = useAuth();

  const { showToast, setActiveRole } = useGrievance();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      showToast(`Signed in as ${loggedUser.name}!`, 'success');
      if (loggedUser.role === 'admin') {
        setActiveRole('admin');
      } else {
        setActiveRole('complainant');
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      title="Sign In to GrievanceHub"
      maxWidth="460px"
    >
      <div>
        {/* Error notice if any */}
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

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Institutional Email</label>
            <input
              id="auth-email"
              type="email"
              required
              className="form-control"
              placeholder="e.g. student@campus.edu or admin@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            id="auth-submit-btn"
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
      </div>
    </Modal>
  );
};
