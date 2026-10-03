import React from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  FileText,
  Search,
  Layers,
  BarChart3,
  ListFilter,
  KeyRound,
  LogOut,
  Building2,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

// Clean user display name & initial
const getCleanName = (fullName) => {
  if (!fullName) return 'User';
  // Strip trailing notes in parentheses, e.g. "Dr. Anita Rao (Dean of Student Welfare)" -> "Dr. Anita Rao"
  return fullName.split('(')[0].trim();
};

const getAvatarInitial = (fullName) => {
  const clean = getCleanName(fullName);
  // If name starts with titles like Dr., Prof., Er., Mr., Mrs., Ms., use the initial of actual name (e.g. "A" for Dr. Anita)
  const withoutTitle = clean.replace(/^(Dr\.|Prof\.|Er\.|Mr\.|Mrs\.|Ms\.|Dr|Prof|Er|Mr|Mrs|Ms)\s+/i, '');
  return (withoutTitle.charAt(0) || clean.charAt(0) || 'U').toUpperCase();
};

export const Navbar = () => {
  const {
    activeRole,
    setActiveRole,
    activeTab,
    setActiveTab,
    apiConnected
  } = useGrievance();

  const {
    user,
    isAuthenticated,
    logout,
    setCurrentView
  } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={() => setActiveTab(activeRole === 'complainant' ? 'lodge' : 'overview')}>
          <div className="brand-icon-wrapper" style={{ background: '#ffffff', padding: '3px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
            <img
              src="/imsec-logo.png"
              alt="IMSEC Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div className="brand-title">IMSEC</div>
            <div className="brand-subtitle">GrievancePortal</div>
          </div>
        </div>

        {/* Navigation Tabs based on Role */}
        <nav className="nav-center">
          {activeRole === 'complainant' ? (
            <>
              <button
                id="nav-tab-lodge"
                className={`nav-tab-btn ${activeTab === 'lodge' ? 'active' : ''}`}
                onClick={() => setActiveTab('lodge')}
              >
                <FileText size={16} />
                <span>Grievance Form</span>
              </button>
              <button
                id="nav-tab-track"
                className={`nav-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => setActiveTab('track')}
              >
                <Search size={16} />
                <span>Track Status</span>
              </button>
              <button
                id="nav-tab-my"
                className={`nav-tab-btn ${activeTab === 'my-tickets' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-tickets')}
              >
                <Layers size={16} />
                <span>Active Grievances</span>
              </button>
              <button
                id="nav-tab-resolved"
                className={`nav-tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                <FileCheck size={16} />
                <span>Solved Problems</span>
              </button>
              <button
                id="nav-tab-confirm-resolution"
                className={`nav-tab-btn ${activeTab === 'resolution' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolution')}
              >
                <CheckCircle2 size={16} />
                <span>Confirm Resolution</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="nav-tab-overview"
                className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <BarChart3 size={16} />
                <span>Analysis</span>
              </button>
              <button
                id="nav-tab-triage"
                className={`nav-tab-btn ${activeTab === 'triage' ? 'active' : ''}`}
                onClick={() => setActiveTab('triage')}
              >
                <ListFilter size={16} />
                <span>Queue</span>
              </button>
              <button
                id="nav-tab-department"
                className={`nav-tab-btn ${activeTab === 'department' ? 'active' : ''}`}
                onClick={() => setActiveTab('department')}
              >
                <Building2 size={16} />
                <span>Department</span>
              </button>
              <button
                id="nav-tab-resolved-admin"
                className={`nav-tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                <FileCheck size={16} />
                <span>Solved Problems</span>
              </button>
            </>
          )}
        </nav>

        {/* Right side: Role Switcher, Auth User & Theme */}
        <div className="nav-actions">


          {/* User Auth Pill or Sign In Button */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.75rem 0.25rem 0.4rem'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.74rem',
                  fontWeight: 800
                }}>
                  {getAvatarInitial(user.name)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {getCleanName(user.name)}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: user.role === 'admin' ? '#a855f7' : 'var(--color-blue)', textTransform: 'uppercase', fontWeight: 700 }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                id="sign-out-btn"
                className="btn-icon"
                title="Sign Out"
                onClick={logout}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              id="sign-in-btn"
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
              onClick={() => setCurrentView('login')}
            >
              <KeyRound size={14} />
              <span>Sign In / Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
