import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, Image as ImageIcon } from 'lucide-react';

export const ImageLightboxModal = ({ isOpen, onClose, imageUrl, title = 'Attached Photo Evidence', fileName = 'evidence.jpg', ticketId }) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || `grievance_${ticketId || 'photo'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(5, 8, 15, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={onClose}
    >
      {/* Lightbox Top Header Toolbar */}
      <div 
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          color: '#f8fafc'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ImageIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              {title} {ticketId && <span style={{ color: '#38bdf8', fontSize: '0.82rem' }}>#{ticketId}</span>}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              {fileName}
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
            title="Zoom In"
            style={{ padding: '0.4rem 0.65rem', background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#f8fafc' }}
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
            title="Zoom Out"
            style={{ padding: '0.4rem 0.65rem', background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#f8fafc' }}
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleDownload}
            title="Download Full Image"
            style={{ padding: '0.4rem 0.65rem', background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#f8fafc' }}
          >
            <Download size={15} />
            <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>Download</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginLeft: '0.5rem'
            }}
            title="Close viewer (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        style={{
          maxWidth: '1000px',
          maxHeight: 'calc(100vh - 140px)',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          borderRadius: '16px',
          background: 'rgba(10, 15, 26, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={title || "Grievance Photo Evidence"}
          style={{
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 180px)',
            objectFit: 'contain',
            borderRadius: '8px',
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.15s ease',
            cursor: zoomLevel > 1 ? 'grab' : 'zoom-in'
          }}
          onClick={() => setZoomLevel(prev => prev === 1 ? 1.5 : 1)}
        />
      </div>
    </div>
  );
};
