import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-main, #0f172a)',
          color: 'var(--text-primary, #f8fafc)'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '2.5rem',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '16px'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              An unexpected render error occurred in this view.
              {this.state.error?.message && (
                <code style={{
                  display: 'block',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  marginTop: '0.5rem',
                  fontSize: '0.78rem',
                  color: '#fca5a5'
                }}>
                  {this.state.error.message}
                </code>
              )}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReload}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
              >
                <RefreshCw size={15} /> Reload Page
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={this.handleReset}
                style={{ padding: '0.65rem 1.25rem' }}
              >
                Clear Cache & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
