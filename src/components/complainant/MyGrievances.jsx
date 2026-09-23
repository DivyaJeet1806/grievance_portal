import React, { useState } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  PlusCircle, 
  Filter, 
  Inbox, 
  Clock,
  Building2
} from 'lucide-react';
import { getDepartmentForCategory } from '../../data/departmentMapping';

export const MyGrievances = () => {
  const { grievances, setTrackedTicketId, setActiveTab } = useGrievance();

  // Default to active so resolved problems are removed from the main active page
  const [activeFilter, setActiveFilter] = useState('active'); // active (default), all, critical
  const [searchQuery, setSearchQuery] = useState('');

  const activeTickets = grievances.filter(g => g.status !== 'Resolved' && g.status !== 'Rejected');
  const resolvedTickets = grievances.filter(g => g.status === 'Resolved');
  const criticalTickets = grievances.filter(g => g.urgency === 'Critical' && g.status !== 'Resolved');

  const filterTickets = () => {
    return grievances.filter(item => {
      // Status filter
      if (activeFilter === 'active') {
        // Remove resolved from main page
        if (item.status === 'Resolved' || item.status === 'Rejected') return false;
      } else if (activeFilter === 'critical') {
        if (item.urgency !== 'Critical' || item.status === 'Resolved') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        return matchTitle || matchId || matchCat;
      }

      return true;
    });
  };

  const filtered = filterTickets();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted': return <span className="badge badge-submitted">Submitted</span>;
      case 'Under Review': return <span className="badge badge-under-review">Under Review</span>;
      case 'In Progress': return <span className="badge badge-in-progress">In Progress</span>;
      case 'Resolved': return <span className="badge badge-resolved">Resolved</span>;
      case 'Rejected': return <span className="badge badge-rejected">Rejected</span>;
      default: return <span className="badge badge-submitted">{status}</span>;
    }
  };

  return (
    <div>
      {/* Top action bar */}
      <div className="tickets-filter-bar">
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Active Grievance Registry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Showing {filtered.length} active in-flight complaints awaiting resolution
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            id="view-resolved-archive-btn"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('resolved')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#10b981' }}
          >
            <span>✓ Resolved Archive ({resolvedTickets.length})</span>
            <ArrowRight size={13} />
          </button>
          <button 
            id="quick-lodge-btn"
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('lodge')}
          >
            <PlusCircle size={16} />
            <span>Lodge New Grievance</span>
          </button>
        </div>
      </div>

      {/* Resolved Archive Notice Banner */}
      {resolvedTickets.length > 0 && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            <span><strong>{resolvedTickets.length} problem{resolvedTickets.length !== 1 ? 's have' : ' has'} been resolved</strong> and automatically archived into the Resolved Problems list.</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('resolved')}
            style={{
              background: 'none',
              border: 'none',
              color: '#10b981',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span>Open Resolved Problems List</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="filter-pills">
          <button 
            className={`filter-pill ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Active In-Flight ({activeTickets.length})
          </button>
          <button 
            className={`filter-pill ${activeFilter === 'critical' ? 'active' : ''}`}
            onClick={() => setActiveFilter('critical')}
          >
            Critical Urgency ({criticalTickets.length})
          </button>
          <button 
            className="filter-pill"
            onClick={() => setActiveTab('resolved')}
            style={{ color: '#10b981' }}
          >
            ✓ Resolved Archive ({resolvedTickets.length})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="filter-search-input"
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.25rem', paddingBottom: '0.55rem', paddingTop: '0.55rem', fontSize: '0.86rem' }}
            placeholder="Search keywords, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grievance Cards Grid */}
      {filtered.length > 0 ? (
        <div className="tickets-grid">
          {filtered.map((item) => (
            <div 
              key={item.id} 
              className="glass-panel ticket-card"
              onClick={() => {
                setTrackedTicketId(item.id);
                setActiveTab('track');
              }}
            >
              <div>
                <div className="ticket-card-header">
                  <span className="ticket-mono">{item.id}</span>
                  {getStatusBadge(item.status)}
                </div>

                <h3 className="ticket-card-title">{item.title}</h3>
                <p className="ticket-card-snippet">{item.description}</p>
              </div>

              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building2 size={12} style={{ color: 'var(--primary-500)' }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.department || getDepartmentForCategory(item.category).department}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-blue)', fontSize: '0.75rem' }}>
                    <span>👤 {item.assignedTo}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={12} style={{ color: 'var(--primary-500)' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.location}</span>
                  </div>
                </div>

                <div className="ticket-card-footer">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} />
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-500)', fontWeight: 700 }}>
                    Track Case <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Inbox size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No grievances match your filter</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Try adjusting your search criteria or resetting filters.
          </p>
        </div>
      )}
    </div>
  );
};
