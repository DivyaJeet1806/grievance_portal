import React, { useState, useEffect } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, URGENCY_LEVELS } from '../../data/initialGrievances';
import confetti from 'canvas-confetti';
import { 
  Send, 
  UploadCloud, 
  Copy, 
  Check, 
  ArrowRight, 
  FileCheck, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { getDepartmentForCategory, detectDepartmentFromText } from '../../data/departmentMapping';

export const LodgeForm = () => {
  const { addGrievance, setTrackedTicketId, setActiveTab } = useGrievance();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    urgency: 'Medium',
    location: '',
    description: '',
    name: user ? user.name : '',
    email: user ? user.email : '',
    attachment: null
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email
      }));
    }
  }, [user]);

  const [submitting, setSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);
  const [copied, setCopied] = useState(false);

  const assignedDeptInfo = getDepartmentForCategory(formData.category);
  const detectedDept = detectDepartmentFromText(formData.title + ' ' + formData.description);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in the required fields (Title and Description).");
      return;
    }

    if (!formData.name.trim()) {
      alert("Please provide your Name or Roll Number.");
      return;
    }

    setSubmitting(true);

    try {
      const created = await addGrievance({
        ...formData,
        isAnonymous: false
      });
      setSubmitting(false);
      setSuccessTicket(created);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Ignore in environments where canvas is not supported
      }

      // Reset form
      setFormData({
        title: '',
        category: CATEGORIES[0],
        urgency: 'Medium',
        location: '',
        description: '',
        name: user ? user.name : '',
        email: user ? user.email : '',
        attachment: null
      });
    } catch (err) {
      setSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (successTicket) {
      navigator.clipboard.writeText(successTicket.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="lodge-container">
      {/* Centered Main Lodge Grievance Form */}
      <div className="glass-panel form-card">
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Lodge a Formal Grievance</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.35rem' }}>
            Fill in the details below. Your submission will receive a tamper-proof ticket ID and an assigned SLA redressal window.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Complainant Identity Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="complainant-name">
                Full Name / Roll No. <span style={{ color: 'var(--color-rose)' }}>*</span>
              </label>
              <input
                id="complainant-name"
                type="text"
                required
                placeholder="e.g. Aryan Mehra (EC-402)"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="complainant-email">
                Contact Email <span style={{ color: 'var(--color-rose)' }}>*</span>
              </label>
              <input
                id="complainant-email"
                type="email"
                required
                placeholder="e.g. aryan@institute.edu"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="grievance-title">
              <span>Grievance Summary / Title <span style={{ color: 'var(--color-rose)' }}>*</span></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Brief & specific</span>
            </label>
            <input
              id="grievance-title"
              type="text"
              required
              placeholder="e.g. Broken bench and faulty projector in Room 405"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Category & Location Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="grievance-category">
                Department / Category <span style={{ color: 'var(--color-rose)' }}>*</span>
              </label>
              <select
                id="grievance-category"
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="grievance-location">
                Exact Location / Campus Wing
              </label>
              <input
                id="grievance-location"
                type="text"
                placeholder="e.g. Block C, 2nd Floor, Room 214"
                className="form-control"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          {/* Keyword-based Auto-Detection Suggestion */}
          {detectedDept && detectedDept.category !== formData.category && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.65rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 0.85rem',
              marginBottom: '1rem',
              fontSize: '0.8rem'
            }}>
              <span style={{ color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} />
                <span>Detected <strong>"{detectedDept.matchedKeyword}"</strong> in description. Match: <strong>{detectedDept.category}</strong></span>
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.65rem', fontSize: '0.74rem' }}
                onClick={() => setFormData({ ...formData, category: detectedDept.category })}
              >
                Auto-Select
              </button>
            </div>
          )}


          {/* Urgency Level selection */}
          <div className="form-group">
            <label className="form-label">
              <span>Urgency & Resolution Target SLA <span style={{ color: 'var(--color-rose)' }}>*</span></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sets escalation timeline</span>
            </label>
            <div className="urgency-grid">
              {URGENCY_LEVELS.map((lvl) => (
                <div
                  key={lvl.value}
                  className={`urgency-option ${formData.urgency === lvl.value ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, urgency: lvl.value })}
                >
                  <div className="urgency-radio-indicator" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{lvl.value}</span>
                      <span className="sla-badge normal" style={{ fontSize: '0.7rem' }}>
                        <Clock size={11} /> {lvl.sla}h SLA
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {lvl.label.split('(')[1]?.replace(')', '')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="grievance-desc">
              <span>Detailed Explanation <span style={{ color: 'var(--color-rose)' }}>*</span></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min. 20 characters</span>
            </label>
            <textarea
              id="grievance-desc"
              required
              rows={4}
              placeholder="Provide complete facts, dates, affected parties, and previous steps taken..."
              className="form-control"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Attachment Box */}
          <div className="form-group">
            <label className="form-label">Supporting Evidence / Photos</label>
            <div 
              className="file-upload-box"
              onClick={() => {
                const sampleFiles = ['lab_photo_evidence.jpg', 'receipt_screenshot.pdf', 'corridor_hazard.png'];
                const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
                setFormData({ ...formData, attachment: picked });
              }}
            >
              {formData.attachment ? (
                <div className="file-preview-pill">
                  <FileCheck size={16} />
                  <span>Attached: {formData.attachment}</span>
                  <span 
                    style={{ marginLeft: '0.5rem', cursor: 'pointer', opacity: 0.8 }} 
                    onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, attachment: null }); }}
                  >
                    &times;
                  </span>
                </div>
              ) : (
                <div className="file-upload-content">
                  <UploadCloud size={28} style={{ color: 'var(--primary-500)' }} />
                  <div><strong>Click to attach file or image</strong> (Simulated)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG, PDF up to 10MB</div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            id="submit-grievance-btn"
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.9rem' }}
            disabled={submitting}
          >
            {submitting ? (
              <span>Registering Ticket...</span>
            ) : (
              <>
                <Send size={18} />
                <span>Submit Grievance</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Modal upon submission */}
      {successTicket && (
        <Modal 
          isOpen={true} 
          onClose={() => setSuccessTicket(null)} 
          title="Grievance Registered Successfully!"
          maxWidth="560px"
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'var(--color-emerald-bg)', 
              color: 'var(--color-emerald)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <Check size={36} />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Your complaint has been logged into the registry and routed to the corresponding department.
            </p>

            <div style={{ 
              background: 'var(--surface-input)', 
              padding: '1.25rem', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Your Tracking Ticket ID
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-500)', fontFamily: 'var(--font-mono)' }}>
                  {successTicket.id}
                </div>
              </div>
              <button 
                id="copy-ticket-id-btn"
                className="btn btn-secondary btn-sm" 
                onClick={handleCopyTicket}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setSuccessTicket(null)}
              >
                Lodge Another
              </button>
              <button 
                id="track-this-ticket-btn"
                className="btn btn-primary"
                onClick={() => {
                  const id = successTicket.id;
                  setSuccessTicket(null);
                  setTrackedTicketId(id);
                  setActiveTab('track');
                }}
              >
                <span>Track Status Live</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
