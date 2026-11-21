import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GrievanceProvider, useGrievance } from './context/GrievanceContext';
import { Navbar } from './components/common/Navbar';
import { Toast } from './components/common/Toast';
import { LoginPage } from './components/auth/LoginPage';
import { LoadingScreen } from './components/common/LoadingScreen';
import { PortalTransition } from './components/common/PortalTransition';
import { LodgeForm } from './components/complainant/LodgeForm';
import { TrackTicket } from './components/complainant/TrackTicket';
import { MyGrievances } from './components/complainant/MyGrievances';
import { Analytics } from './components/admin/Analytics';
import { TriageTable } from './components/admin/TriageTable';
import { OfficerDashboard } from './components/admin/OfficerDashboard';
import { ResolutionDesk } from './components/common/ResolutionDesk';
import { ResolvedProblems } from './components/common/ResolvedProblems';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import mainBg from './assets/main-bg.jpg';
import './css/complainant.css';
import './css/admin.css';

const MainLayout = () => {
  const { activeRole, setActiveRole, activeTab, setActiveTab } = useGrievance();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      const targetRole = user.role === 'admin' ? 'admin' : 'complainant';
      if (activeRole !== targetRole) {
        setActiveRole(targetRole);
      }
      if (targetRole === 'admin' && (activeTab === 'lodge' || activeTab === 'track' || activeTab === 'my-tickets' || activeTab === 'resolution')) {
        setActiveTab('overview');
      } else if (targetRole === 'complainant' && (activeTab === 'overview' || activeTab === 'triage' || activeTab === 'department')) {
        setActiveTab('lodge');
      }
    }
  }, [user, activeRole, setActiveRole, activeTab, setActiveTab]);

  return (
    <div 
      className="main-portal-wrapper" 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundImage: `linear-gradient(135deg, rgba(8, 12, 20, 0.72) 0%, rgba(8, 12, 20, 0.50) 45%, rgba(8, 12, 20, 0.20) 100%), url(${mainBg})`
      }}
    >
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
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border-subtle)', 
        background: 'var(--surface-card)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '2.5rem 1.5rem',
        marginTop: '3rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              <img src="/imsec-logo.png" alt="IMSEC" style={{ width: '24px', height: '24px', objectFit: 'contain', background: '#fff', borderRadius: '4px', padding: '1px' }} />
              IMSEC Grievance Portal
            </div>
          </div>
        </div>
      </footer>

      {/* Persistent Toast feedback banner */}
      <Toast />
    </div>
  );
};

const AppContent = () => {
  const { loading, isAuthenticated, isEnteringPortal, setIsEnteringPortal } = useAuth();
  const [showIntro, setShowIntro] = React.useState(true);

  // Display the full IMSEC Neon Loading Screen animation before opening the portal
  if (showIntro) {
    return (
      <LoadingScreen 
        isLoading={loading} 
        duration={2800} 
        onComplete={() => setShowIntro(false)} 
      />
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

  // POST-LOGIN TRANSITION — smooth entry after login page
  if (isEnteringPortal) {
    return (
      <PortalTransition 
        onComplete={() => setIsEnteringPortal(false)} 
      />
    );
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GrievanceProvider>
          <AppContent />
        </GrievanceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
