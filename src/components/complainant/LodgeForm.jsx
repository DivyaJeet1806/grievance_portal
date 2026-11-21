import React, { useState, useEffect, useRef } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/initialGrievances';
import confetti from 'canvas-confetti';
import { 
  Send, 
  UploadCloud, 
  Copy, 
  Check, 
  ArrowRight, 
  FileCheck, 
  Camera, 
  Trash2, 
  Maximize2, 
  FileText
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { ImageLightboxModal } from '../common/ImageLightboxModal';

// Helper to scale/compress large device photos to ensure fast upload & smooth rendering
const processUploadedImage = (dataUrl, maxWidth = 1600, maxHeight = 1600, quality = 0.85) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width <= maxWidth && height <= maxHeight) {
        resolve(dataUrl);
        return;
      }

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

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
    attachment: null,
    attachmentUrl: null
  });

  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [attachmentMeta, setAttachmentMeta] = useState(null); // { size, type }
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const mobileCameraRef = useRef(null);

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

  const handleFileSelected = async (file) => {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("File exceeds maximum allowed size (20MB). Please choose a smaller photo or document.");
      return;
    }

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const isImg = file.type.startsWith('image/');

    const reader = new FileReader();
    reader.onload = async (e) => {
      let finalDataUrl = e.target.result;
      if (isImg) {
        try {
          finalDataUrl = await processUploadedImage(finalDataUrl);
        } catch (err) {
          console.warn("Could not downscale image, using raw data URL", err);
        }
      }

      setFormData(prev => ({
        ...prev,
        attachment: file.name,
        attachmentUrl: finalDataUrl
      }));
      setAttachmentPreview(isImg ? finalDataUrl : null);
      setAttachmentMeta({
        name: file.name,
        size: sizeStr,
        isImage: isImg
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoCaptured = ({ dataUrl, fileName }) => {
    setFormData(prev => ({
      ...prev,
      attachment: fileName,
      attachmentUrl: dataUrl
    }));
    setAttachmentPreview(dataUrl);
    setAttachmentMeta({
      name: fileName,
      size: 'Camera Capture',
      isImage: true
    });
  };

  const handleRemoveAttachment = (e) => {
    if (e) e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      attachment: null,
      attachmentUrl: null
    }));
    setAttachmentPreview(null);
    setAttachmentMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mobileCameraRef.current) mobileCameraRef.current.value = '';
  };

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
      } catch {
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
        attachment: null,
        attachmentUrl: null
      });
      setAttachmentPreview(null);
      setAttachmentMeta(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
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
      {/* Main Lodge Grievance Form */}
      <div className="glass-panel form-card">
        {/* Form Title & Context Header */}
        <div style={{
          marginBottom: '1.75rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Lodge Grievance
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Complainant Identity Details */}
          <div className="form-grid-2col">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="complainant-name">
                Full Name / Roll No. <span style={{ color: 'var(--color-rose)' }}>*</span>
              </label>
              <input
                id="complainant-name"
                type="text"
                required
                placeholder="e.g. Rahul Sharma (CS-2023-45)"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="complainant-email">
                Email <span style={{ color: 'var(--color-rose)' }}>*</span>
              </label>
              <input
                id="complainant-email"
                type="email"
                required
                placeholder="e.g. student@campus.edu"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="grievance-title">
              <span>Summary <span style={{ color: 'var(--color-rose)' }}>*</span></span>
              
            </label>
            <input
              id="grievance-title"
              type="text"
              required
              placeholder="e.g. Non-functional air conditioning and electrical trip in Lab 204"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Category & Location Grid */}
          <div className="form-grid-2col">
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
                Exact Location 
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


          {/* Detailed Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="grievance-desc">
              <span>Detailed Explanation <span style={{ color: 'var(--color-rose)' }}>*</span></span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {formData.description.length} chars (min. 20)
              </span>
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

          {/* Attachment Box with Device Upload & Live Camera Options */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>
                <span>Photo Evidence / Attachment</span>
              </label>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Optional • JPG, PNG, PDF up to 20MB</span>
            </div>

            {/* Hidden native inputs */}
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelected(f);
              }}
            />
            <input 
              ref={mobileCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelected(f);
              }}
            />

            {/* When Attachment is Present */}
            {formData.attachment ? (
              <div 
                style={{
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: 0 }}>
                  {attachmentPreview ? (
                    <div 
                      style={{
                        position: 'relative',
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                      onClick={() => setIsLightboxOpen(true)}
                      title="Click to view full photo"
                    >
                      <img 
                        src={attachmentPreview} 
                        alt="Evidence Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                      >
                        <Maximize2 size={16} color="#ffffff" />
                      </div>
                    </div>
                  ) : (
                    <div 
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <FileText size={24} />
                    </div>
                  )}

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <FileCheck size={15} style={{ color: 'var(--color-emerald)' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                        {formData.attachment}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{attachmentMeta?.size || 'Attached'}</span>
                      {attachmentPreview && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#38bdf8', fontWeight: 600 }}>Photo Evidence</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons on attached file */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {attachmentPreview && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsLightboxOpen(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}
                      title="Enlarge photo"
                    >
                      <Maximize2 size={13} />
                      <span>Inspect</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsCameraOpen(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    title="Retake photo using camera"
                  >
                    <Camera size={13} />
                    <span>Retake</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    title="Pick a different file from device"
                  >
                    <UploadCloud size={13} />
                    <span>Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.4rem 0.65rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                    title="Remove attachment"
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              /* When No Attachment is Present: Dual Action Box with Drag & Drop */
              <div 
                className="file-upload-box"
                style={{
                  border: isDragging ? '2px dashed var(--primary-500)' : '1px dashed var(--border-strong)',
                  background: isDragging ? 'rgba(56, 189, 248, 0.08)' : 'var(--surface-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.4rem 1.25rem',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelected(file);
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '460px' }}>
                    {/* Device Upload Button */}
                    <button
                      type="button"
                      id="upload-from-device-btn"
                      className="btn btn-secondary"
                      style={{
                        flex: '1 1 200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.55rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '0.86rem'
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud size={18} style={{ color: 'var(--primary-500)' }} />
                      <span>Upload from Device</span>
                    </button>

                    {/* Camera Capture Button */}
                    <button
                      type="button"
                      id="capture-from-camera-btn"
                      className="btn btn-secondary"
                      style={{
                        flex: '1 1 200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.55rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(56, 189, 248, 0.1)',
                        borderColor: 'rgba(56, 189, 248, 0.35)',
                        color: '#38bdf8',
                        fontWeight: 700,
                        fontSize: '0.86rem'
                      }}
                      onClick={() => setIsCameraOpen(true)}
                    >
                      <Camera size={18} />
                      <span>Take Photo with Camera</span>
                    </button>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Drag & drop evidence photo here, or snap a direct picture with your webcam / phone camera
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            id="submit-grievance-btn"
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
            disabled={submitting}
          >
            {submitting ? (
              <span>Registering Ticket...</span>
            ) : (
              <>
                <Send size={16} />
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

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />

      {/* High-Resolution Full-Screen Image Lightbox */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageUrl={formData.attachmentUrl}
        fileName={formData.attachment}
        title="Evidence Preview"
      />
    </div>
  );
};
