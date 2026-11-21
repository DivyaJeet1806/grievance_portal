import React from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Search,
  Layers,
  BarChart3,
  ListFilter,
  LogOut,
  Building2,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

// Clean user display name & initial
const getCleanName = (fullName) => {
  if (!fullName) return 'User';
  return fullName.split('(')[0].trim();
};

const getAvatarInitial = (fullName) => {
  const clean = getCleanName(fullName);
  const withoutTitle = clean.replace(/^(Dr\.|Prof\.|Er\.|Mr\.|Mrs\.|Ms\.|Dr|Prof|Er|Mr|Mrs|Ms)\s+/i, '');
  return (withoutTitle.charAt(0) || clean.charAt(0) || 'U').toUpperCase();
};

export const Navbar = () => {
  const {
    activeRole,
    activeTab,
    setActiveTab,
    grievances
  } = useGrievance();

  const {
    user,
    isAuthenticated,
    logout
  } = useAuth();

  const activeCount = grievances.filter(g => g.status !== 'Resolved' && g.status !== 'Rejected').length;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={() => setActiveTab(activeRole === 'complainant' ? 'lodge' : 'overview')}>
          <div className="brand-icon-wrapper">
            <img
              src="/imsec-logo.png"
              alt="IMSEC Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div className="brand-title">IMSEC</div>
            </div>
            <div className="brand-subtitle">Grievance Portal</div>
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
                <FileText size={15} />
                <span>Lodge Grievance</span>
              </button>
              <button
                id="nav-tab-track"
                className={`nav-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => setActiveTab('track')}
              >
                <Search size={15} />
                <span>Track Status</span>
              </button>
              <button
                id="nav-tab-my"
                className={`nav-tab-btn ${activeTab === 'my-tickets' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-tickets')}
              >
                <Layers size={15} />
                <span>Active Registry</span>
                {activeCount > 0 && (
                  <span style={{
                    fontSize: '0.68rem',
                    background: 'var(--surface-input)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700
                  }}>
                    {activeCount}
                  </span>
                )}
              </button>
              <button
                id="nav-tab-resolved"
                className={`nav-tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                <FileCheck size={15} />
                <span>Solved </span>
              </button>
              <button
                id="nav-tab-confirm-resolution"
                className={`nav-tab-btn ${activeTab === 'resolution' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolution')}
              >
                <CheckCircle2 size={15} />
                <span>Verify Resolution</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="nav-tab-overview"
                className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <BarChart3 size={15} />
                <span>Analytics</span>
              </button>
              <button
                id="nav-tab-triage"
                className={`nav-tab-btn ${activeTab === 'triage' ? 'active' : ''}`}
                onClick={() => setActiveTab('triage')}
              >
                <ListFilter size={15} />
                <span>Queue</span>
              </button>
              <button
                id="nav-tab-department"
                className={`nav-tab-btn ${activeTab === 'department' ? 'active' : ''}`}
                onClick={() => setActiveTab('department')}
              >
                <Building2 size={15} />
                <span>Officer Desk</span>
              </button>
              <button
                id="nav-tab-resolved-admin"
                className={`nav-tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                <FileCheck size={15} />
                <span>Solved Archive</span>
              </button>
            </>
          )}
        </nav>

        {/* Right side: Role Switcher, Auth User & Theme */}
        <div className="nav-actions">
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.75rem'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-xs)',
                  background: user.role === 'admin' 
                    ? '#d97706'
                    : (user.role === 'teacher' ? '#059669' : '#2563eb'),
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  {getAvatarInitial(user.name)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {getCleanName(user.name)}
                  </span>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    color: user.role === 'admin' ? '#f59e0b' : (user.role === 'teacher' ? 'var(--color-emerald)' : 'var(--color-blue)'), 
                    textTransform: 'uppercase', 
                    fontWeight: 700,
                    letterSpacing: '0.04em'
                  }}>
                    {user.role === 'teacher' ? 'Faculty' : user.role}
                  </span>
                </div>
              </div>

              <button
                id="sign-out-btn"
                className="btn btn-secondary btn-sm"
                title="Sign Out"
                onClick={logout}
                style={{ padding: '0.45rem 0.65rem' }}
              >
                <LogOut size={14} />
                <span style={{ fontSize: '0.76rem' }}>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
