import React, { useState, useEffect } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENT_DIRECTORY, getDepartmentForCategory } from '../../data/departmentMapping';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  User,
  Building2,
  FileText,
  Star,
  RotateCcw,
  CheckCircle,
  ShieldCheck,
  Zap,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Send,
  XCircle,
  Hash,
  Paperclip
} from 'lucide-react';

const DEPARTMENTS_LIST = Object.entries(DEPARTMENT_DIRECTORY).map(([cat, info]) => ({
  category: cat,
  department: info.department,
  officer: info.officer
}));

export const ResolutionDesk = () => {
  const { grievances, confirmGrievanceResolution, trackedTicketId, setTrackedTicketId } = useGrievance();
  const { user } = useAuth();

  // Role perspective: 'department' or 'complainant'
  const [perspective, setPerspective] = useState(user?.role === 'admin' ? 'department' : 'complainant');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Ticket
  const [selectedTicketId, setSelectedTicketId] = useState('');

  // Department Confirmation Form State
  const [deptNote, setDeptNote] = useState('');
  const [deptStatus, setDeptStatus] = useState('Resolved');
  const [deptOfficerName, setDeptOfficerName] = useState('');

  // Complainant Confirmation Form State
  const [complainantSatisfaction, setComplainantSatisfaction] = useState('satisfied'); // 'satisfied' or 'unsatisfied'
  const [complainantRating, setComplainantRating] = useState(5);
  const [complainantFeedback, setComplainantFeedback] = useState('');
  const [complainantName, setComplainantName] = useState('');

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync perspective when auth changes
  useEffect(() => {
    if (user?.role === 'admin') {
      setPerspective('department');
      setDeptOfficerName(user.name);
    } else if (user) {
      setComplainantName(user.name);
    }
  }, [user]);

  // Set initial selected ticket
  useEffect(() => {
    if (trackedTicketId) {
      const match = grievances.find(g => g.id.toUpperCase() === trackedTicketId.toUpperCase());
      if (match) {
        setSelectedTicketId(match.id);
        return;
      }
    }
    if (grievances.length > 0 && !selectedTicketId) {
      setSelectedTicketId(grievances[0].id);
    }
  }, [grievances, trackedTicketId, selectedTicketId]);

  // Find currently selected ticket object
  const selectedTicket = grievances.find(g => g.id === selectedTicketId) || grievances[0] || null;

  // Filtered grievances list
  const filteredList = grievances.filter(g => {
    if (deptFilter !== 'ALL') {
      const dept = g.department || getDepartmentForCategory(g.category).department;
      if (dept !== deptFilter) return false;
    }

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'DualConfirmed') {
        if (!g.departmentConfirmed || !g.complainantConfirmed) return false;
      } else if (statusFilter === 'PendingConfirmation') {
        if (g.status === 'Resolved' && g.departmentConfirmed && g.complainantConfirmed) return false;
      } else if (g.status !== statusFilter) {
        return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = g.id.toLowerCase().includes(q);
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchSubmitter = g.submittedBy.toLowerCase().includes(q);
      const matchLocation = g.location.toLowerCase().includes(q);
      return matchId || matchTitle || matchSubmitter || matchLocation;
    }

    return true;
  });

  // Handle Department Confirmation Submit
  const handleDepartmentConfirm = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setIsSubmitting(true);

    const officer = deptOfficerName.trim() || user?.name || selectedTicket.assignedTo || 'Department Officer';

    await confirmGrievanceResolution(selectedTicket.id, {
      confirmedByRole: 'department',
      confirmedByName: officer,
      status: deptStatus,
      notes: deptNote.trim() || `Department confirmed problem resolved: ${selectedTicket.title}`
    });

    setDeptNote('');
    setIsSubmitting(false);
  };

  // Handle Complainant Confirmation Submit
  const handleComplainantConfirm = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setIsSubmitting(true);

    const name = complainantName.trim() || user?.name || selectedTicket.submittedBy || 'Complainant';

    if (complainantSatisfaction === 'satisfied') {
      await confirmGrievanceResolution(selectedTicket.id, {
        confirmedByRole: 'complainant',
        confirmedByName: name,
        status: 'Resolved',
        rating: complainantRating,
        feedback: complainantFeedback.trim() || 'Verified by complainant. Issue solved satisfactorily.',
        notes: complainantFeedback.trim() || 'Verified by complainant. Issue solved satisfactorily.'
      });
    } else {
      await confirmGrievanceResolution(selectedTicket.id, {
        confirmedByRole: 'complainant',
        confirmedByName: name,
        status: 'Reopened',
        notes: complainantFeedback.trim() || 'Complainant reported problem is NOT solved yet.',
        feedback: complainantFeedback.trim()
      });
    }

    setComplainantFeedback('');
    setIsSubmitting(false);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Title & Perspective Switcher */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.15 }}>
                  Problem Resolution & Verification Desk
                </h1>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Joint confirmation portal — designated departments and complainants verify that campus grievances are resolved on ground.
                </p>
              </div>
            </div>
          </div>

          {/* Perspective Toggle (Department vs Complainant) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--surface-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '0.3rem'
          }}>
            <button
              id="switch-perspective-dept"
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: perspective === 'department' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                color: perspective === 'department' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: perspective === 'department' ? '0 2px 8px rgba(99,102,241,0.35)' : 'none'
              }}
              onClick={() => setPerspective('department')}
            >
              <Building2 size={15} />
              <span>Department Desk</span>
            </button>
            <button
              id="switch-perspective-person"
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: perspective === 'complainant' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                color: perspective === 'complainant' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: perspective === 'complainant' ? '0 2px 8px rgba(16,185,129,0.35)' : 'none'
              }}
              onClick={() => setPerspective('complainant')}
            >
              <User size={15} />
              <span>Complainant / Citizen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Left = Problem Selector, Right = Problem Inspector & Confirmation Desk */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT COLUMN: Problem Browser & Search */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={16} style={{ color: 'var(--primary-500)' }} />
              Select Grievance ({filteredList.length})
            </h3>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="resolution-search-input"
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.2rem', fontSize: '0.82rem', paddingBottom: '0.5rem', paddingTop: '0.5rem' }}
                placeholder="Search ticket, title, person..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <div style={{ marginBottom: '0.5rem' }}>
              <select
                id="resolution-dept-select"
                className="select-control"
                style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {DEPARTMENTS_LIST.map(d => (
                  <option key={d.category} value={d.department}>{d.department}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                id="resolution-status-select"
                className="select-control"
                style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PendingConfirmation">Pending Confirmation</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="DualConfirmed">Dual-Confirmed & Verified</option>
              </select>
            </div>
          </div>

          {/* Ticket List Scrollbox */}
          <div style={{ maxHeight: '620px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: '0.2rem' }}>
            {filteredList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No grievances match this search or filter.
              </div>
            ) : (
              filteredList.map(item => {
                const isSelected = selectedTicket?.id === item.id;
                const isDual = item.departmentConfirmed && item.complainantConfirmed;
                const isDeptDone = item.departmentConfirmed || item.status === 'Resolved';
                const isComplainantDone = item.complainantConfirmed;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedTicketId(item.id);
                      setTrackedTicketId(item.id);
                    }}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--surface-input)',
                      border: isSelected ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary-500)' }}>
                        {item.id}
                      </span>
                      <span className={`badge ${item.status === 'Resolved' ? 'badge-resolved' : item.status === 'In Progress' ? 'badge-in-progress' : 'badge-submitted'}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                        {item.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '0.35rem' }}>
                      {item.title}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                        {item.department || getDepartmentForCategory(item.category).department}
                      </span>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {isDeptDone && <span title="Department Confirmed" style={{ color: '#10b981', fontSize: '0.72rem' }}>🏢✓</span>}
                        {isComplainantDone && <span title="Complainant Verified" style={{ color: '#3b82f6', fontSize: '0.72rem' }}>👤✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Full Problem Inspector & Dual Confirmation Desk */}
        {selectedTicket ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* PROBLEM INSPECTOR CARD ("Can See Problem") */}
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
              {/* Header: Ticket ID, Urgency, SLA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span className="ticket-mono" style={{ fontSize: '1.15rem' }}>{selectedTicket.id}</span>
                  <span className={`badge ${selectedTicket.status === 'Resolved' ? 'badge-resolved' : selectedTicket.status === 'In Progress' ? 'badge-in-progress' : 'badge-submitted'}`}>
                    {selectedTicket.status}
                  </span>
                  <span className={`urgency-${selectedTicket.urgency.toLowerCase()}`} style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    {selectedTicket.urgency === 'Critical' && <span className="pulse-dot"></span>}
                    {selectedTicket.urgency} Urgency ({selectedTicket.slaHours}h SLA)
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} />
                  Lodged: {new Date(selectedTicket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Problem Title */}
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                {selectedTicket.title}
              </h2>

              {/* Department Routing Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.06))',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1.15rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={15} style={{ color: 'var(--primary-500)' }} />
                    Assigned Department: {selectedTicket.department || getDepartmentForCategory(selectedTicket.category).department}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Officer in Charge: <strong style={{ color: 'var(--color-blue)' }}>{selectedTicket.assignedTo}</strong>
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-emerald)', fontWeight: 700 }}>
                  <Zap size={12} /> Auto-Routed
                </div>
              </div>

              {/* Problem Description Narrative */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={13} /> Complete Problem Statement
                </label>
                <div style={{
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  fontSize: '0.92rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6
                }}>
                  {selectedTicket.description}
                </div>
              </div>

              {/* Metadata Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.85rem',
                background: 'var(--surface-input)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1.15rem',
                marginBottom: '1.25rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Complainant Name</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedTicket.submittedBy}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Campus Location</span>
                  <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={12} style={{ color: 'var(--primary-500)' }} />
                    {selectedTicket.location}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Category</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedTicket.category}</strong>
                </div>
                {selectedTicket.attachment && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Evidence / Attachment</span>
                    <span className="file-preview-pill" style={{ display: 'inline-flex', marginTop: '0.2rem' }}>
                      <Paperclip size={12} />
                      {selectedTicket.attachment}
                    </span>
                  </div>
                )}
              </div>

              {/* Activity Timeline Preview */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={13} /> Action & Inspection Audit Trail
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {selectedTicket.timeline && selectedTicket.timeline.map((t, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      fontSize: '0.78rem',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '2px solid var(--primary-500)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{t.stage}</strong>
                          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                            {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>{t.message}</div>
                        {t.actor && <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.1rem' }}>By: {t.actor}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CONFIRMATION INTERACTIVE ACTION PANELS */}
            {perspective === 'department' ? (
              /* DEPARTMENT CONFIRMATION FORM */
              <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', borderTop: '3px solid #6366f1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Building2 size={18} style={{ color: 'var(--primary-500)' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                    Department Authority Sign-Off Desk
                  </h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Inspect the physical problem above. Record the action taken and confirm resolution to notify the complainant.
                </p>

                <form onSubmit={handleDepartmentConfirm}>
                  {/* Status Selection */}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">
                      <span>Redressal Outcome / Status <span style={{ color: 'var(--color-rose)' }}>*</span></span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Confirm Solved (Resolved)', val: 'Resolved', color: '#10b981' },
                        { label: 'In Progress (Active Work Order)', val: 'In Progress', color: '#8b5cf6' },
                        { label: 'Under Review (Screening)', val: 'Under Review', color: '#3b82f6' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setDeptStatus(opt.val)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-full)',
                            border: `1px solid ${deptStatus === opt.val ? opt.color : 'var(--border-subtle)'}`,
                            background: deptStatus === opt.val ? 'rgba(99,102,241,0.15)' : 'transparent',
                            color: deptStatus === opt.val ? opt.color : 'var(--text-secondary)',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Officer Action Remark */}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" htmlFor="dept-action-notes">
                      <span>Official Action Taken & Resolution Summary <span style={{ color: 'var(--color-rose)' }}>*</span></span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Visible to student & grievance committee</span>
                    </label>
                    <textarea
                      id="dept-action-notes"
                      rows={3}
                      className="form-control"
                      placeholder="e.g. Electrician visited Site Room 302; faulty drain pan sealed and tested. All equipment safe."
                      value={deptNote}
                      onChange={e => setDeptNote(e.target.value)}
                      required
                    />
                  </div>

                  {/* Officer Name Stamp */}
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" htmlFor="dept-officer-name">
                      Recording Officer Name
                    </label>
                    <input
                      id="dept-officer-name"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Er. Vikram Mehta"
                      value={deptOfficerName}
                      onChange={e => setDeptOfficerName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      id="dept-confirm-submit-btn"
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '0.9rem', padding: '0.65rem 1.4rem' }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{isSubmitting ? 'Confirming...' : 'Confirm Problem Solved (Department Sign-off)'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* COMPLAINANT / CITIZEN CONFIRMATION FORM */
              <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', borderTop: '3px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <User size={18} style={{ color: '#10b981' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                    Complainant Verification & Sign-Off Desk
                  </h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  As the person who lodged this problem, please confirm if the department has resolved it on ground to your satisfaction.
                </p>

                <form onSubmit={handleComplainantConfirm}>
                  {/* Satisfaction Choice */}
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">
                      <span>Has your problem been solved? <span style={{ color: 'var(--color-rose)' }}>*</span></span>
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setComplainantSatisfaction('satisfied')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem 1.25rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${complainantSatisfaction === 'satisfied' ? '#10b981' : 'var(--border-subtle)'}`,
                          background: complainantSatisfaction === 'satisfied' ? 'rgba(16,185,129,0.12)' : 'var(--surface-input)',
                          color: complainantSatisfaction === 'satisfied' ? '#10b981' : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Yes, Problem is Solved!</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setComplainantSatisfaction('unsatisfied')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem 1.25rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${complainantSatisfaction === 'unsatisfied' ? '#f43f5e' : 'var(--border-subtle)'}`,
                          background: complainantSatisfaction === 'unsatisfied' ? 'rgba(244,63,94,0.12)' : 'var(--surface-input)',
                          color: complainantSatisfaction === 'unsatisfied' ? '#f43f5e' : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer'
                        }}
                      >
                        <XCircle size={16} />
                        <span>No, Still Facing Issue (Reopen)</span>
                      </button>
                    </div>
                  </div>

                  {/* Rating Stars (if satisfied) */}
                  {complainantSatisfaction === 'satisfied' && (
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label">
                        <span>Rate Redressal Timeliness & Quality</span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setComplainantRating(star)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                          >
                            <Star
                              size={24}
                              fill={star <= complainantRating ? '#facc15' : 'none'}
                              color={star <= complainantRating ? '#facc15' : 'var(--text-muted)'}
                            />
                          </button>
                        ))}
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                          {complainantRating}/5 Stars
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Feedback or Reopen Reason */}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" htmlFor="complainant-remarks">
                      <span>
                        {complainantSatisfaction === 'satisfied'
                          ? 'Complainant Feedback / Remarks (Optional)'
                          : 'Why is the problem not solved? Describe the issue in detail *'}
                      </span>
                    </label>
                    <textarea
                      id="complainant-remarks"
                      rows={3}
                      className="form-control"
                      placeholder={
                        complainantSatisfaction === 'satisfied'
                          ? 'e.g. Fast response! The lab AC was repaired within 24 hours. Works great now.'
                          : 'e.g. The leak has started again after the technician left; desk 15 is still unusable.'
                      }
                      value={complainantFeedback}
                      onChange={e => setComplainantFeedback(e.target.value)}
                      required={complainantSatisfaction === 'unsatisfied'}
                    />
                  </div>

                  {/* Complainant Name */}
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" htmlFor="complainant-name-input">
                      Your Name / Roll Number
                    </label>
                    <input
                      id="complainant-name-input"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Sharma"
                      value={complainantName}
                      onChange={e => setComplainantName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      id="complainant-confirm-submit-btn"
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                      style={{
                        background: complainantSatisfaction === 'satisfied'
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #f43f5e, #dc2626)',
                        fontSize: '0.9rem',
                        padding: '0.65rem 1.4rem'
                      }}
                    >
                      {complainantSatisfaction === 'satisfied' ? <CheckCircle size={16} /> : <RotateCcw size={16} />}
                      <span>
                        {isSubmitting
                          ? 'Processing...'
                          : complainantSatisfaction === 'satisfied'
                            ? 'Confirm Problem Solved (Complainant Sign-off)'
                            : 'Reopen Grievance Ticket'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Grievance Selected</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Choose a grievance from the left list to view problem details and record resolution.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
