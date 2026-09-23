import React, { useState, useEffect } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { STAGES } from '../../data/initialGrievances';
import { 
  Search, 
  Clock, 
  MapPin, 
  User, 
  Paperclip, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Star, 
  Send,
  Building,
  Building2,
  ShieldCheck,
  Tag,
  ArrowRight,
  Zap
} from 'lucide-react';
import { getDepartmentForCategory } from '../../data/departmentMapping';

export const TrackTicket = () => {
  const { 
    grievances, 
    trackedTicketId, 
    setTrackedTicketId, 
    rateGrievance 
  } = useGrievance();

  const [searchInput, setSearchInput] = useState(trackedTicketId || '');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Rating state for resolved tickets
  const [ratingVal, setRatingVal] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Sync when trackedTicketId changes from another tab
  useEffect(() => {
    if (trackedTicketId) {
      setSearchInput(trackedTicketId);
      const found = grievances.find(g => g.id.toLowerCase() === trackedTicketId.trim().toLowerCase());
      setSelectedTicket(found || null);
    } else if (grievances.length > 0 && !selectedTicket) {
      // Default to first item for great initial impression
      setSelectedTicket(grievances[0]);
      setSearchInput(grievances[0].id);
    }
  }, [trackedTicketId, grievances]);

  const handleSearch = (e) => {
    e?.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    const found = grievances.find(g => g.id.toUpperCase() === query);
    setSelectedTicket(found || null);
    if (found) {
      setTrackedTicketId(found.id);
    }
  };

  const handleSelectRecent = (id) => {
    setSearchInput(id);
    const found = grievances.find(g => g.id === id);
    setSelectedTicket(found || null);
    setTrackedTicketId(id);
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    rateGrievance(selectedTicket.id, ratingVal, feedbackText);
    setSelectedTicket({
      ...selectedTicket,
      rating: ratingVal,
      feedback: feedbackText
    });
  };

  // Determine active step index for the visual progression bar
  const getStepStatus = (stageKey) => {
    if (!selectedTicket) return 'pending';
    const status = selectedTicket.status;

    const stageOrder = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
    const currentIdx = stageOrder.indexOf(status);
    const stepIdx = stageOrder.indexOf(stageKey);

    if (currentIdx === -1 && status === 'Rejected') {
      return stageKey === 'Submitted' ? 'completed' : 'pending';
    }

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Submitted': return 'badge-submitted';
      case 'Under Review': return 'badge-under-review';
      case 'In Progress': return 'badge-in-progress';
      case 'Resolved': return 'badge-resolved';
      case 'Rejected': return 'badge-rejected';
      default: return 'badge-submitted';
    }
  };

  return (
    <div>
      {/* Search Header Card */}
      <div className="glass-panel track-header-card">
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Track Your Grievance Status</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.35rem' }}>
          Enter your unique Ticket ID below to inspect real-time progress, committee notes, and SLA compliance.
        </p>

        <form onSubmit={handleSearch} className="track-search-box">
          <input
            id="ticket-search-input"
            type="text"
            className="form-control track-search-input"
            placeholder="e.g. GRV-2026-1082"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button id="search-ticket-btn" type="submit" className="btn btn-primary">
            <Search size={18} />
            <span>Search</span>
          </button>
        </form>

        {/* Quick Recent Chips for testing */}
        <div className="recent-searches">
          <span>Quick Select:</span>
          {grievances.slice(0, 4).map(g => (
            <button
              key={g.id}
              className="recent-chip"
              onClick={() => handleSelectRecent(g.id)}
            >
              {g.id} ({g.status})
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Details View */}
      {selectedTicket ? (
        <div className="ticket-detail-view">
          {/* Left Column: Progress & Timeline */}
          <div className="glass-panel ticket-info-card">
            {/* Visual Step Tracker */}
            <div className="step-tracker">
              {STAGES.map((s) => {
                const stepState = getStepStatus(s.key);
                return (
                  <div key={s.key} className={`step-node ${stepState}`}>
                    <div className="step-circle">
                      {stepState === 'completed' ? (
                        <CheckCircle size={18} style={{ color: 'var(--color-emerald)' }} />
                      ) : (
                        <span>{s.label.charAt(0)}</span>
                      )}
                    </div>
                    <span className="step-label">{s.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <span className="ticket-mono" style={{ fontSize: '1.25rem' }}>{selectedTicket.id}</span>
                  <span className={`badge ${getStatusBadgeClass(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                  <span className={`urgency-${selectedTicket.urgency.toLowerCase()}`} style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    • {selectedTicket.urgency} Urgency
                  </span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{selectedTicket.title}</h3>
              </div>
            </div>

            {/* Grievance Narrative */}
            <div className="ticket-description-box">
              <strong style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Complainant's Stated Issue:
              </strong>
              {selectedTicket.description}
            </div>

            {/* Official Resolution Remarks if available */}
            {selectedTicket.resolutionNotes && (
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.08)', 
                border: '1px solid rgba(16, 185, 129, 0.3)', 
                padding: '1.25rem', 
                borderRadius: 'var(--radius-md)',
                marginTop: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-emerald)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <ShieldCheck size={18} />
                  Official Redressal Resolution Notice
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {selectedTicket.resolutionNotes}
                </p>
              </div>
            )}

            {/* Interactive Timeline History */}
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: 'var(--primary-500)' }} />
                Live Redressal Audit Trail & Activity Log
              </h4>

              <div className="timeline-container">
                {selectedTicket.timeline.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`timeline-item ${idx === selectedTicket.timeline.length - 1 ? 'active' : 'completed'}`}
                  >
                    <div className="timeline-marker">
                      {idx + 1}
                    </div>
                    <div className="timeline-card">
                      <div className="timeline-header">
                        <span className="timeline-title">{item.stage}</span>
                        <span className="timeline-meta">
                          {new Date(item.timestamp).toLocaleString(undefined, { 
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          })}
                        </span>
                      </div>
                      <p className="timeline-msg">{item.message}</p>
                      {item.actor && (
                        <div className="timeline-actor">
                          Actioned by: <strong>{item.actor}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback / Rating Box (If Resolved) */}
            {selectedTicket.status === 'Resolved' && (
              <div className="feedback-section">
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '0.5rem' }}>
                  Complainant Satisfaction Feedback
                </h4>
                {selectedTicket.rating ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={18} 
                            fill={star <= selectedTicket.rating ? '#facc15' : 'none'} 
                            color={star <= selectedTicket.rating ? '#facc15' : 'var(--text-muted)'} 
                          />
                        ))}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>({selectedTicket.rating} / 5 Stars)</span>
                    </div>
                    {selectedTicket.feedback && (
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        "{selectedTicket.feedback}"
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleRatingSubmit}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                      How satisfied are you with the timeliness and resolution of this grievance?
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`star-btn ${star <= ratingVal ? 'active' : ''}`}
                            onClick={() => setRatingVal(star)}
                          >
                            <Star 
                              size={22} 
                              fill={star <= ratingVal ? '#facc15' : 'none'} 
                            />
                          </button>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {ratingVal === 5 ? 'Excellent' : ratingVal === 4 ? 'Good' : ratingVal === 3 ? 'Average' : 'Needs Improvement'}
                      </span>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Optional remarks on the redressal process..."
                        className="form-control"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">
                      <Send size={14} />
                      <span>Submit Satisfaction Rating</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Assigned Officer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={16} style={{ color: 'var(--primary-500)' }} />
                Case Metadata
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="meta-field">
                  <label>Department Category</label>
                  <span>{selectedTicket.category}</span>
                </div>

                <div className="meta-field">
                  <label>Assigned Department</label>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building2 size={14} style={{ color: 'var(--primary-500)' }} />
                    {selectedTicket.department || getDepartmentForCategory(selectedTicket.category).department}
                  </span>
                </div>

                <div className="meta-field">
                  <label>Campus Location</label>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} style={{ color: 'var(--primary-500)' }} />
                    {selectedTicket.location}
                  </span>
                </div>

                <div className="meta-field">
                  <label>Assigned Redressal Officer</label>
                  <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>{selectedTicket.assignedTo}</span>
                </div>

                <div className="meta-field">
                  <label>Dispatch Routing</label>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--color-emerald)', fontWeight: 700 }}>
                    <Zap size={12} /> Automated Department Assignment
                  </span>
                </div>

                <div className="meta-field">
                  <label>Lodged By</label>
                  <span>{selectedTicket.submittedBy}</span>
                </div>

                <div className="meta-field">
                  <label>Lodged Date</label>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} />
                    {new Date(selectedTicket.createdAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>

                {selectedTicket.attachment && (
                  <div className="meta-field">
                    <label>Attached Document / Evidence</label>
                    <span className="file-preview-pill" style={{ display: 'inline-flex', marginTop: '0.25rem' }}>
                      <Paperclip size={13} />
                      {selectedTicket.attachment}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Rapid Escalation Info */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-rose)', fontWeight: 700, marginBottom: '0.35rem' }}>
                <AlertCircle size={16} />
                Need Urgent Escalation?
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                If this grievance has breached the SLA or involves physical safety, contact the Proctorial Cell directly at <strong>ext: 2049</strong> or email <strong>proctor@campus.edu</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Not Found State */
        <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-rose)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>No Grievance Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0.5rem auto 1.5rem auto', fontSize: '0.92rem' }}>
            We could not locate any ticket with ID <strong style={{ color: 'var(--primary-500)' }}>"{searchInput}"</strong>. Check the ticket code format (e.g. GRV-2026-1082) or choose from the demo tickets above.
          </p>
        </div>
      )}
    </div>
  );
};
