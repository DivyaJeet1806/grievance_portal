import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GrievanceProvider, useGrievance } from './context/GrievanceContext';
import { Navbar } from './components/common/Navbar';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/common/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { LodgeForm } from './components/complainant/LodgeForm';
import { TrackTicket } from './components/complainant/TrackTicket';
import { MyGrievances } from './components/complainant/MyGrievances';
import { Analytics } from './components/admin/Analytics';
import { TriageTable } from './components/admin/TriageTable';
import { OfficerDashboard } from './components/admin/OfficerDashboard';
import { ResolutionDesk } from './components/common/ResolutionDesk';
import { ResolvedProblems } from './components/common/ResolvedProblems';
import './css/complainant.css';
import './css/admin.css';
import { ShieldAlert, ShieldCheck, Award } from 'lucide-react';

const MainLayout = () => {
  const { activeRole, setActiveRole, activeTab, setActiveTab } = useGrievance();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      const targetRole = user.role === 'admin' ? 'admin' : 'complainant';
      if (activeRole !== targetRole) {
        setActiveRole(targetRole);
      }
      if (targetRole === 'admin' && (activeTab === 'lodge' || activeTab === 'track' || activeTab === 'my-tickets')) {
        setActiveTab('overview');
      } else if (targetRole === 'complainant' && (activeTab === 'overview' || activeTab === 'triage' || activeTab === 'department')) {
        setActiveTab('lodge');
      }
    }
  }, [user, activeRole, setActiveRole, activeTab, setActiveTab]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="app-container" style={{ flex: 1, paddingTop: '1.75rem' }}>
        {/* COMPLAINANT VIEWS */}
        {activeRole === 'complainant' && (
          <>
            {activeTab === 'lodge' && <LodgeForm />}
            {activeTab === 'track' && <TrackTicket />}
            {activeTab === 'my-tickets' && <MyGrievances />}
            {activeTab === 'resolved' && <ResolvedProblems />}
            {activeTab === 'resolution' && <ResolutionDesk />}
          </>
        )}

        {/* ADMIN / OFFICER VIEWS */}
        {activeRole === 'admin' && (
          <>
            {activeTab === 'overview' && <Analytics />}
            {activeTab === 'triage' && <TriageTable />}
            {activeTab === 'department' && <OfficerDashboard />}
            {activeTab === 'resolved' && <ResolvedProblems />}
            {activeTab === 'resolution' && <ResolutionDesk />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border-subtle)', 
        background: 'var(--surface-card)', 
        padding: '2.5rem 1.5rem',
        marginTop: '3rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              <ShieldAlert size={18} style={{ color: 'var(--primary-500)' }} />
              GrievanceHub Redressal System
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Institutional Internal Quality Assurance Cell (IQAC) & Grievance Redressal Committee Compliant.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} style={{ color: 'var(--color-emerald)' }} /> ISO 9001:2015 Redressal Protocol
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Award size={14} style={{ color: 'var(--color-amber)' }} /> SLA Timelines Guaranteed
            </span>
          </div>
        </div>
      </footer>

      {/* Persistent Toast feedback banner */}
      <Toast />

      {/* JWT Authentication Modal (available as secondary popup) */}
      <AuthModal />
    </div>
  );
};

const AppContent = () => {
  const { currentView, loading, isAuthenticated } = useAuth();

  // Show spinner while JWT is being verified on mount
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '1rem'
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '50%', 
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--primary-500)',
          animation: 'spin 0.75s linear infinite'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verifying session…</p>
      </div>
    );
  }

  // HARD AUTH GUARD — only a verified, authenticated user reaches the portal
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toast />
      </>
    );
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AuthProvider>
      <GrievanceProvider>
        <AppContent />
      </GrievanceProvider>
    </AuthProvider>
  );
}
