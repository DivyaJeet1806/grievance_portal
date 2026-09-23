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
  Sun, 
  Moon, 
  RotateCcw,
  KeyRound,
  LogOut,
  Building2,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

export const Navbar = () => {
  const { 
    theme, 
    toggleTheme, 
    activeRole, 
    setActiveRole, 
    activeTab, 
    setActiveTab, 
    resetToDefault,
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
          <div className="brand-icon-wrapper">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="brand-title">GrievanceHub</div>
            <div className="brand-subtitle">Redressal Portal</div>
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
                <span>Lodge Grievance</span>
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
                <span>Executive Analytics</span>
              </button>
              <button 
                id="nav-tab-triage"
                className={`nav-tab-btn ${activeTab === 'triage' ? 'active' : ''}`}
                onClick={() => setActiveTab('triage')}
              >
                <ListFilter size={16} />
                <span>Triage Queue</span>
              </button>
              <button 
                id="nav-tab-department"
                className={`nav-tab-btn ${activeTab === 'department' ? 'active' : ''}`}
                onClick={() => setActiveTab('department')}
              >
                <Building2 size={16} />
                <span>Dept Portal</span>
              </button>
              <button 
                id="nav-tab-resolved-admin"
                className={`nav-tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                <FileCheck size={16} />
                <span>Solved Problems</span>
              </button>
              <button 
                id="nav-tab-resolution"
                className={`nav-tab-btn ${activeTab === 'resolution' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolution')}
              >
                <CheckCircle2 size={16} />
                <span>Resolution Desk</span>
              </button>
            </>
          )}
        </nav>

        {/* Right side: Role Switcher, Auth User & Theme */}
        <div className="nav-actions">
          {/* Node.js Backend Status Badge */}
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.74rem', 
              fontFamily: 'var(--font-mono)',
              padding: '0.3rem 0.65rem', 
              borderRadius: 'var(--radius-full)', 
              background: apiConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${apiConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              color: apiConnected ? 'var(--color-emerald)' : 'var(--color-amber)'
            }}
            title={apiConnected ? "Connected to Express/Node.js REST API (Port 5000)" : "Connecting to Node.js backend..."}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }}></span>
            <span>{apiConnected ? 'Node API' : 'Syncing'}</span>
          </div>

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
                  fontSize: '0.72rem', 
                  fontWeight: 800 
                }}>
                  {user.name.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: user.role === 'admin' ? '#a855f7' : 'var(--color-blue)', textTransform: 'uppercase', fontWeight: 700 }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button 
                id="sign-out-btn"
                className="btn-icon" 
                title="Sign Out (Clear JWT Session)"
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

          {/* Reset Demo Data Button */}
          <button 
            className="btn-icon" 
            title="Reset to Demo Grievances"
            onClick={() => {
              if (window.confirm("Reset all grievances back to demo initial state? (Requires Admin login)")) {
                resetToDefault();
              }
            }}
          >
            <RotateCcw size={17} />
          </button>

          {/* Theme Toggle */}
          <button 
            id="theme-toggle-btn"
            className="btn-icon" 
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
};
