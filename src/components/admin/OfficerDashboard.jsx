import React, { useState, useRef, useEffect } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENT_DIRECTORY, getDepartmentForCategory } from '../../data/departmentMapping';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  User,
  FileText,
  Send,
  ChevronDown,
  ChevronUp,
  Zap,
  BadgeCheck,
  XCircle,
  MessageSquare,
  Calendar,
  Hash,
  ArrowRight,
  Filter,
  Inbox,
  Check,
  Search
} from 'lucide-react';

// Department selector so officer can pick which dept they represent
const DEPARTMENTS = Object.entries(DEPARTMENT_DIRECTORY).map(([category, info]) => ({
  category,
  department: info.department,
  officer: info.officer,
  email: info.email,
  scope: info.scope
}));

const statusColors = {
  Submitted: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#f59e0b' },
  'Under Review': { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', text: '#3b82f6' },
  'In Progress': { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.35)', text: '#8b5cf6' },
  Resolved: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#10b981' },
  Rejected: { bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.35)', text: '#f43f5e' }
};

const urgencyColors = {
  Low: '#10b981',
  Medium: '#3b82f6',
  High: '#f59e0b',
  Critical: '#f43f5e'
};

const ConfirmResolutionPanel = ({ ticket, onClose, initialActionType = 'Resolved' }) => {
  const { updateGrievanceStatus, showToast } = useGrievance();
  const { user } = useAuth();
  const [actionType, setActionType] = useState(initialActionType);
  const [resolutionNote, setResolutionNote] = useState(
    initialActionType === 'In Progress'
      ? 'Investigation and active repair work initiated by department officer.'
      : ''
  );
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!resolutionNote.trim()) {
      showToast('Please provide a resolution note before confirming.', 'error');
      return;
    }
    setSubmitting(true);
    await updateGrievanceStatus(ticket.id, {
      newStatus: actionType,
      assignedOfficer: ticket.assignedTo,
      officerNote: resolutionNote.trim(),
      actorName: user?.name || 'Department Officer'
    });
    showToast(
      actionType === 'Resolved'
        ? `Ticket #${ticket.id} confirmed as Resolved!`
        : `Ticket #${ticket.id} marked as ${actionType}.`,
      'success'
    );
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="officer-resolution-panel">
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Action Type
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['In Progress', 'Resolved', 'Rejected'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setActionType(s)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${actionType === s ? statusColors[s]?.border : 'var(--border-subtle)'}`,
                background: actionType === s ? statusColors[s]?.bg : 'transparent',
                color: actionType === s ? statusColors[s]?.text : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Resolution Note <span style={{ color: 'var(--color-rose)' }}>*</span>
        </label>
        <textarea
          rows={3}
          className="form-control"
          placeholder={actionType === 'Resolved'
            ? 'e.g. Issue investigated. Repair completed on 22-Sep. Verified by student rep.'
            : actionType === 'Rejected'
            ? 'e.g. Duplicate submission. See ticket GRV-2026-XXXX.'
            : 'e.g. Work order raised. Vendor visit scheduled for tomorrow.'}
          value={resolutionNote}
          onChange={e => setResolutionNote(e.target.value)}
          style={{ resize: 'vertical', minHeight: '80px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={submitting}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleConfirm}
          disabled={submitting || !resolutionNote.trim()}
          style={{
            background: actionType === 'Resolved'
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : actionType === 'Rejected'
              ? 'linear-gradient(135deg, #f43f5e, #dc2626)'
              : 'var(--primary-gradient)'
          }}
        >
          {submitting ? (
            <span>Confirming...</span>
          ) : (
            <>
              {actionType === 'Resolved' ? <BadgeCheck size={15} /> : <Send size={15} />}
              <span>Confirm {actionType}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const GrievanceCard = ({ ticket }) => {
  const [expanded, setExpanded] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const [panelActionType, setPanelActionType] = useState('Resolved');
  const sc = statusColors[ticket.status] || statusColors['Submitted'];
  const isResolved = ticket.status === 'Resolved' || ticket.status === 'Rejected';

  return (
    <div className="officer-ticket-card" style={{ borderLeft: `3px solid ${urgencyColors[ticket.urgency] || '#6366f1'}` }}>
      {/* Card Header */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Hash size={11} />{ticket.id}
            </span>
            <span style={{
              fontSize: '0.74rem', fontWeight: 700, padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)', background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text
            }}>
              {ticket.status}
            </span>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: urgencyColors[ticket.urgency], display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              {ticket.urgency === 'Critical' && <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />}
              {ticket.urgency}
            </span>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
            {ticket.title}
          </h3>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <User size={12} /> {ticket.submittedBy}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={12} /> {ticket.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} /> {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {!isResolved && ticket.status !== 'In Progress' && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={e => {
                e.stopPropagation();
                setPanelActionType('In Progress');
                setShowResolution(true);
                setExpanded(true);
              }}
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.65rem',
                color: '#8b5cf6',
                borderColor: 'rgba(139,92,246,0.35)',
                background: 'rgba(139,92,246,0.08)'
              }}
              title="Start Work (In Progress)"
            >
              <Clock size={13} />
              <span>In Progress</span>
            </button>
          )}

          {!isResolved && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={e => {
                e.stopPropagation();
                setPanelActionType('Resolved');
                setShowResolution(true);
                setExpanded(true);
              }}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              title="Mark Solved"
            >
              <CheckCircle2 size={13} />
              <span>Mark Solved</span>
            </button>
          )}

          {isResolved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: ticket.status === 'Resolved' ? '#10b981' : '#f43f5e', fontWeight: 700 }}>
              {ticket.status === 'Resolved' ? <BadgeCheck size={15} /> : <XCircle size={15} />}
              {ticket.status}
            </span>
          )}
          <button
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
          >
            {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          {/* Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FileText size={12} /> Problem Description
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--surface-input)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', margin: 0 }}>
              {ticket.description}
            </p>
          </div>

          {/* Timeline */}
          {ticket.timeline && ticket.timeline.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={12} /> Activity Timeline
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {ticket.timeline.map((event, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === ticket.timeline.length - 1 ? 'var(--primary-500)' : 'var(--border-subtle)', marginTop: '0.35rem', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{event.stage}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{event.message}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                        {new Date(event.timestamp).toLocaleString('en-IN')} {event.actor ? '— ' + event.actor : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Note if resolved */}
          {ticket.resolutionNotes && (
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <MessageSquare size={14} style={{ color: '#10b981', marginTop: '0.1rem', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#10b981', marginBottom: '0.2rem' }}>Resolution Note</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ticket.resolutionNotes}</div>
              </div>
            </div>
          )}

          {/* Inline Resolution Panel */}
          {showResolution && !isResolved && (
            <ConfirmResolutionPanel ticket={ticket} initialActionType={panelActionType} onClose={() => setShowResolution(false)} />
          )}
        </div>
      )}
    </div>
  );
};

export const OfficerDashboard = () => {
  const { grievances } = useGrievance();
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  // Default to ACTIVE so resolved problems are removed from active department queue
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter grievances belonging to selected department
  const deptGrievances = grievances.filter(g => {
    const deptInfo = getDepartmentForCategory(g.category);
    const assignedDept = g.department || deptInfo.department;
    return assignedDept === selectedDept.department;
  });

  const filteredGrievances = statusFilter === 'ACTIVE'
    ? deptGrievances.filter(g => g.status !== 'Resolved' && g.status !== 'Rejected')
    : statusFilter === 'ALL'
    ? deptGrievances
    : deptGrievances.filter(g => g.status === statusFilter);

  const total = deptGrievances.length;
  const pending = deptGrievances.filter(g => g.status === 'Submitted').length;
  const inProgress = deptGrievances.filter(g => g.status === 'In Progress').length;
  const resolved = deptGrievances.filter(g => g.status === 'Resolved').length;
  const critical = deptGrievances.filter(g => g.urgency === 'Critical' && g.status !== 'Resolved').length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>Department Officer Portal</h1>
          </div>
        </div>
      </div>

      {/* Department Selector as Dropdown List */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: isDropdownOpen ? 100 : 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <label
            htmlFor="officer-department-select"
            style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Building2 size={13} /> Select Your Department
          </label>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {DEPARTMENTS.length} divisions available
          </span>
        </div>

        {/* Dropdown Container */}
        <div ref={dropdownRef} className="officer-dept-dropdown-wrapper" style={{ position: 'relative', zIndex: isDropdownOpen ? 100 : 1 }}>
          {/* Synchronized accessible select element */}
          <select
            id="officer-department-select"
            value={selectedDept.category}
            onChange={(e) => {
              const match = DEPARTMENTS.find(d => d.category === e.target.value);
              if (match) {
                setSelectedDept(match);
                setStatusFilter('ALL');
              }
            }}
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0,0,0,0)',
              border: 0,
              pointerEvents: 'none'
            }}
            aria-hidden="true"
            tabIndex={-1}
          >
            {DEPARTMENTS.map(d => (
              <option key={d.category} value={d.category}>
                {d.department} ({d.officer.split('(')[0].trim()})
              </option>
            ))}
          </select>

          {/* Custom Dropdown Trigger Button */}
          <button
            id="officer-department-dropdown-btn"
            type="button"
            className={`officer-dept-dropdown-trigger ${isDropdownOpen ? 'open' : ''}`}
            onClick={() => setIsDropdownOpen(prev => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.2))',
                border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Building2 size={18} style={{ color: 'var(--primary-500)' }} />
              </div>
              <div style={{ minWidth: 0, textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedDept.department}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>{selectedDept.officer.split('(')[0].trim()}</span>
                  <span>•</span>
                  <span>{deptGrievances.length} assigned grievance{deptGrievances.length === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
              <span style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontWeight: 600
              }}>
                Change Division
              </span>
              <ChevronDown
                size={18}
                style={{
                  color: 'var(--text-muted)',
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </div>
          </button>

          {/* Dropdown Menu List */}
          {isDropdownOpen && (
            <div className="officer-dept-dropdown-menu" role="listbox">
              {/* Search Bar inside dropdown */}
              <div style={{ padding: '0.3rem 0.35rem 0.6rem 0.35rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.35rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Search division or officer name..."
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                      background: 'var(--surface-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Department Items */}
              {DEPARTMENTS.filter(d => 
                d.department.toLowerCase().includes(deptSearch.toLowerCase()) ||
                d.officer.toLowerCase().includes(deptSearch.toLowerCase())
              ).map(dept => {
                const isSelected = selectedDept.category === dept.category;
                const count = grievances.filter(g => {
                  const deptInfo = getDepartmentForCategory(g.category);
                  const assignedDept = g.department || deptInfo.department;
                  return assignedDept === dept.department;
                }).length;

                return (
                  <button
                    key={dept.category}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`officer-dept-dropdown-item ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedDept(dept);
                      setStatusFilter('ALL');
                      setIsDropdownOpen(false);
                      setDeptSearch('');
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Building2 size={15} style={{ color: isSelected ? 'var(--primary-500)' : 'var(--text-muted)' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontWeight: isSelected ? 700 : 600,
                          fontSize: '0.88rem',
                          color: isSelected ? '#fff' : 'var(--text-primary)',
                          lineHeight: 1.25
                        }}>
                          {dept.department}
                        </div>
                        <div style={{
                          fontSize: '0.74rem',
                          color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                          marginTop: '0.15rem'
                        }}>
                          {dept.officer.split('(')[0].trim()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        background: count > 0 ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                        color: count > 0 ? 'var(--primary-500)' : 'var(--text-muted)',
                        fontWeight: 600
                      }}>
                        {count} {count === 1 ? 'ticket' : 'tickets'}
                      </span>
                      {isSelected && (
                        <Check size={16} style={{ color: '#10b981' }} />
                      )}
                    </div>
                  </button>
                );
              })}

              {DEPARTMENTS.filter(d => 
                d.department.toLowerCase().includes(deptSearch.toLowerCase()) ||
                d.officer.toLowerCase().includes(deptSearch.toLowerCase())
              ).length === 0 && (
                <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No department matching "{deptSearch}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Dept Info Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.06))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={16} style={{ color: 'var(--primary-500)' }} />
              {selectedDept.department}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>{selectedDept.officer}</span>
              {' · '}
              <span>{selectedDept.email}</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Scope: {selectedDept.scope}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {critical > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', fontSize: '0.78rem', fontWeight: 700 }}>
                <AlertTriangle size={12} /> {critical} Critical
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: 'var(--primary-500)', fontSize: '0.78rem', fontWeight: 700 }}>
              <Zap size={12} /> {total} Total Assigned
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Pending', value: pending, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={18} color="#f59e0b" /> },
          { label: 'In Progress', value: inProgress, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <ArrowRight size={18} color="#8b5cf6" /> },
          { label: 'Resolved', value: resolved, color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle2 size={18} color="#10b981" /> },
          { label: 'Total Assigned', value: total, color: 'var(--primary-500)', bg: 'rgba(99,102,241,0.1)', icon: <Inbox size={18} style={{ color: 'var(--primary-500)' }} /> },
        ].map(m => (
          <div key={m.label} className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {m.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.15rem' }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>View:</span>
        <button
          type="button"
          onClick={() => setStatusFilter('ACTIVE')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${statusFilter === 'ACTIVE' ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
            background: statusFilter === 'ACTIVE' ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: statusFilter === 'ACTIVE' ? 'var(--primary-500)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
        >
          Active Work Queue ({pending + inProgress})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('Resolved')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${statusFilter === 'Resolved' ? '#10b981' : 'var(--border-subtle)'}`,
            background: statusFilter === 'Resolved' ? 'rgba(16,185,129,0.15)' : 'transparent',
            color: statusFilter === 'Resolved' ? '#10b981' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
        >
          ✓ Resolved Archive ({resolved})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${statusFilter === 'ALL' ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
            background: statusFilter === 'ALL' ? 'var(--surface-input)' : 'transparent',
            color: statusFilter === 'ALL' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.78rem',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
        >
          All Statuses ({total})
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {filteredGrievances.length} ticket{filteredGrievances.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grievance Cards */}
      {filteredGrievances.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <BadgeCheck size={44} style={{ color: 'var(--color-emerald)', margin: '0 auto 1rem', display: 'block' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            {statusFilter === 'Resolved' ? 'No Resolved Tickets Yet' : statusFilter === 'ALL' ? 'No Tickets Assigned' : `No "${statusFilter}" Tickets`}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
            {statusFilter === 'ALL'
              ? `No grievances are currently routed to ${selectedDept.department}.`
              : `No tickets with status "${statusFilter}" in this department.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredGrievances.map(ticket => (
            <GrievanceCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};
