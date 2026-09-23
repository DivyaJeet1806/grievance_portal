import React, { useState } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { CATEGORIES } from '../../data/initialGrievances';
import { TicketActionModal } from './TicketActionModal';
import { 
  Search, 
  Filter, 
  Edit3, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  SlidersHorizontal,
  Zap
} from 'lucide-react';
import { getDepartmentForCategory } from '../../data/departmentMapping';

export const TriageTable = () => {
  const { grievances, setActiveTab } = useGrievance();

  const [search, setSearch] = useState('');
  // Default to ACTIVE so resolved problems are removed from the main triage page
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState('department'); // default to department sorting
  const [sortAsc, setSortAsc] = useState(true);

  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;

  const filteredTickets = grievances.filter((item) => {
    // Status
    if (statusFilter === 'ACTIVE') {
      if (item.status === 'Resolved' || item.status === 'Rejected') return false;
    } else if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }

    // Category
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    // Urgency
    if (urgencyFilter !== 'ALL' && item.urgency !== urgencyFilter) return false;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchComplainant = item.submittedBy.toLowerCase().includes(q);
      const matchLocation = item.location.toLowerCase().includes(q);
      const matchDept = (item.department || getDepartmentForCategory(item.category).department || '').toLowerCase().includes(q);
      return matchId || matchTitle || matchComplainant || matchLocation || matchDept;
    }

    return true;
  });

  // Apply sorting
  filteredTickets.sort((a, b) => {
    if (sortField === 'department') {
      const deptA = (a.department || getDepartmentForCategory(a.category).department || '').toLowerCase();
      const deptB = (b.department || getDepartmentForCategory(b.category).department || '').toLowerCase();
      return sortAsc ? deptA.localeCompare(deptB) : deptB.localeCompare(deptA);
    }
    if (sortField === 'date') {
      return sortAsc
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

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

  const handleOpenAction = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Resolved Archive Notice Banner */}
      {resolvedCount > 0 && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            <span><strong>{resolvedCount} resolved grievance{resolvedCount !== 1 ? 's' : ''}</strong> moved to the Resolved Problems Archive and removed from active triage queue.</span>
          </div>
          <button
            id="triage-view-resolved-btn"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('resolved')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}
          >
            <span>Open Resolved Problems List →</span>
          </button>
        </div>
      )}

      {/* Triage Search & Filters Header */}
      <div className="glass-panel triage-toolbar">
        <div className="triage-search">
          <Search size={16} className="search-icon-inside" />
          <input
            id="triage-search-input"
            type="text"
            className="form-control"
            placeholder="Search active tickets by ID, Title, Person, Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="triage-filters">
          {/* Status Filter */}
          <select
            id="filter-status-select"
            className="select-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ACTIVE">Active Triage Queue (Default)</option>
            <option value="ALL">All Statuses (Including Resolved)</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            id="filter-category-select"
            className="select-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Urgency Filter */}
          <select
            id="filter-urgency-select"
            className="select-control"
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
          >
            <option value="ALL">All Urgencies</option>
            <option value="Low">Low Urgency</option>
            <option value="Medium">Medium Urgency</option>
            <option value="High">High Urgency</option>
            <option value="Critical">Critical Urgency</option>
          </select>
        </div>
      </div>

      {/* Grievance Datatable */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Summary & Location</th>
              <th 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('department')}
                title="Click to sort according to Department"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Department</span>
                  <span style={{ color: sortField === 'department' ? 'var(--primary-500)' : 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {sortField === 'department' ? (sortAsc ? '▲ A-Z' : '▼ Z-A') : '⇅'}
                  </span>
                </div>
              </th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Assigned Officer</th>
              <th>Lodged</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <span className="ticket-mono">{ticket.id}</span>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {ticket.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={11} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.location}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {ticket.department || getDepartmentForCategory(ticket.category).department}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{ticket.category}</span>
                  </td>
                  <td>
                    <span className={`urgency-${ticket.urgency.toLowerCase()}`} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {ticket.urgency === 'Critical' && <span className="pulse-dot"></span>}
                      {ticket.urgency}
                    </span>
                  </td>
                  <td>
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-blue)', fontWeight: 600, display: 'block' }}>
                      {ticket.assignedTo}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                      <Zap size={10} /> Auto-Assigned
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      id={`action-btn-${ticket.id}`}
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenAction(ticket)}
                    >
                      <Edit3 size={13} />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No grievances found matching the current search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      <TicketActionModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
