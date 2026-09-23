import React, { useState, useEffect } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { Modal } from '../common/Modal';
import { 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Send,
  Building2,
  Zap
} from 'lucide-react';
import { DEPARTMENT_DIRECTORY, getDepartmentForCategory } from '../../data/departmentMapping';

const PRESET_OFFICERS = Object.values(DEPARTMENT_DIRECTORY).map(d => d.officer);

export const TicketActionModal = ({ ticket, isOpen, onClose }) => {
  const { updateGrievanceStatus } = useGrievance();

  const [newStatus, setNewStatus] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [officerNote, setOfficerNote] = useState('');
  const [actorName, setActorName] = useState('Grievance Officer');

  useEffect(() => {
    if (ticket) {
      setNewStatus(ticket.status);
      setAssignedOfficer(ticket.assignedTo || '');
      setOfficerNote('');
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateGrievanceStatus(ticket.id, {
      newStatus,
      assignedOfficer,
      officerNote,
      actorName
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Ticket #${ticket.id}`}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit}>
        {/* Ticket Summary Banner */}
        <div style={{ 
          background: 'var(--surface-input)', 
          padding: '1.25rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1.5rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building2 size={13} style={{ color: 'var(--primary-500)' }} />
              {ticket.department || getDepartmentForCategory(ticket.category).department}
            </span>
            <span className={`urgency-${ticket.urgency.toLowerCase()}`} style={{ fontSize: '0.8rem', fontWeight: 800 }}>
              {ticket.urgency} Urgency ({ticket.slaHours}h SLA)
            </span>
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            {ticket.title}
          </h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {ticket.description}
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span><strong>Complainant:</strong> {ticket.submittedBy}</span>
            <span><strong>Location:</strong> {ticket.location}</span>
            <span style={{ color: 'var(--color-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Zap size={11} /> <strong>Auto-Assigned Officer:</strong> {ticket.assignedTo}
            </span>
          </div>
        </div>

        {/* Status Transition Control */}
        <div className="form-group">
          <label className="form-label" htmlFor="ticket-status-select">
            <span>Transition Workflow Status <span style={{ color: 'var(--color-rose)' }}>*</span></span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Updates complainant progress tracker</span>
          </label>
          <select
            id="ticket-status-select"
            className="form-control"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="Submitted">Submitted (Queued for evaluation)</option>
            <option value="Under Review">Under Review (Committee screening)</option>
            <option value="In Progress">In Progress (Active investigation)</option>
            <option value="Resolved">Resolved (Completed & closed)</option>
            <option value="Rejected">Rejected (Ineligible / Duplicate)</option>
          </select>
        </div>

        {/* Assigned Officer Selection */}
        <div className="form-group">
          <label className="form-label">
            <span>Assign Responsible Officer / Cell</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Designated authority</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Type officer name or select preset below..."
            value={assignedOfficer}
            onChange={(e) => setAssignedOfficer(e.target.value)}
          />
          <div className="officer-select-grid">
            {PRESET_OFFICERS.map((off) => (
              <button
                key={off}
                type="button"
                className={`officer-chip ${assignedOfficer === off ? 'selected' : ''}`}
                onClick={() => setAssignedOfficer(off)}
              >
                {off}
              </button>
            ))}
          </div>
        </div>

        {/* Action / Official Resolution Note */}
        <div className="form-group">
          <label className="form-label" htmlFor="officer-action-note">
            <span>Official Action Remark / Resolution Notice</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Appears on the public tracking timeline</span>
          </label>
          <textarea
            id="officer-action-note"
            rows={3}
            className="form-control"
            placeholder="e.g. Work order issued to vendor; repair completion expected by tomorrow morning."
            value={officerNote}
            onChange={(e) => setOfficerNote(e.target.value)}
          />
        </div>

        {/* Officer Signature */}
        <div className="form-group">
          <label className="form-label" htmlFor="action-actor-name">
            Recording Officer Name
          </label>
          <input
            id="action-actor-name"
            type="text"
            className="form-control"
            value={actorName}
            onChange={(e) => setActorName(e.target.value)}
          />
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            id="save-ticket-action-btn"
            type="submit" 
            className="btn btn-primary"
          >
            <ShieldCheck size={16} />
            <span>Apply Action & Notify</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
