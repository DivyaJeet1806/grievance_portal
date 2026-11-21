import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, Upload, SwitchCamera } from 'lucide-react';

export const CameraCaptureModal = ({ isOpen, onClose, onPhotoCaptured }) => {
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // Default to back camera for photographing issues
  const [cameraError, setCameraError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef(null);
  const fileInputFallbackRef = useRef(null);

  // Stop camera stream tracks helper
  const stopStream = useCallback((currentStream) => {
    const s = currentStream || stream;
    if (s) {
      s.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
    }
  }, [stream]);

  // Check available camera devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setHasMultipleCameras(videoDevices.length > 1);
        })
        .catch(() => {});
    }
  }, []);

  // Start live camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCapturedPhoto(null);
    stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported by your current browser.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Direct camera stream error:', err);
      // If environment camera failed, try user (front) camera as fallback
      if (facingMode === 'environment') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play().catch(() => {});
          }
          return;
        } catch (e) {
          // fall through to error message
        }
      }

      let errorMsg = 'Could not access device camera. Please check camera permissions in your browser.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission was denied. Please allow camera access in browser settings or use the file picker.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No active camera was detected on this device.';
      }
      setCameraError(errorMsg);
    }
  }, [facingMode, stopStream]);

  // Start camera on modal open
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setCapturedPhoto(null);
      setCameraError(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Flip camera between front/back
  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture snapshot from video stream
  const handleShutter = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');

      // Mirror if user-facing camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedPhoto(dataUrl);
      stopStream();
    } catch (err) {
      console.error('Failed to capture photo:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Confirm photo selection
  const handleConfirmPhoto = () => {
    if (!capturedPhoto) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `camera_photo_${timestamp}.jpg`;
    onPhotoCaptured({ dataUrl: capturedPhoto, fileName });
    onClose();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Handle fallback native camera file picker
  const handleFallbackFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target.result;
      onPhotoCaptured({
        dataUrl,
        fileName: file.name || `camera_photo_${Date.now()}.jpg`
      });
      onClose();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'var(--surface-modal, #0f172a)',
          borderRadius: '20px',
          border: '1px solid var(--border-strong, rgba(255, 255, 255, 0.12))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.1rem 1.4rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Camera size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                {capturedPhoto ? 'Review Captured Photo' : 'Capture Photo Evidence'}
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0 }}>
                {capturedPhoto ? 'Ensure the problem area is clear and focused' : 'Position issue in frame and press shutter'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div
          style={{
            position: 'relative',
            background: '#030712',
            minHeight: '340px',
            maxHeight: '65vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Live Video Feed */}
          {!capturedPhoto && !cameraError && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '65vh',
                  objectFit: 'contain',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                }}
              />

              {/* Viewfinder Frame Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: '24px',
                  border: '2px dashed rgba(56, 189, 248, 0.4)',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Center Crosshair */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid rgba(56, 189, 248, 0.7)',
                    borderRadius: '50%',
                    position: 'relative',
                    opacity: 0.75
                  }}
                >
                  <div style={{ position: 'absolute', top: '50%', left: '-8px', right: '-8px', height: '1px', background: 'rgba(56,189,248,0.6)' }} />
                  <div style={{ position: 'absolute', left: '50%', top: '-8px', bottom: '-8px', width: '1px', background: 'rgba(56,189,248,0.6)' }} />
                </div>
              </div>

              {/* Camera Flip Switch Button (Top Right of viewfinder) */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#f8fafc',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}
                  title="Switch Camera (Front/Back)"
                >
                  <SwitchCamera size={18} />
                </button>
              )}
            </>
          )}

          {/* Captured Frozen Photo Preview */}
          {capturedPhoto && (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
              <img
                src={capturedPhoto}
                alt="Captured Snapshot"
                style={{
                  maxWidth: '100%',
                  maxHeight: '62vh',
                  objectFit: 'contain',
                  borderRadius: '12px'
                }}
              />
            </div>
          )}

          {/* Camera Error Fallback UI */}
          {cameraError && (
            <div
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                maxWidth: '440px'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertCircle size={30} />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Camera Not Accessible
              </div>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                {cameraError}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={startCamera}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f8fafc' }}
                >
                  <RefreshCw size={14} />
                  <span>Retry Access</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => fileInputFallbackRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Upload size={14} />
                  <span>Pick from Device</span>
                </button>
              </div>
              <input
                ref={fileInputFallbackRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFallbackFileSelect}
              />
            </div>
          )}
        </div>

        {/* Footer Controls Toolbar */}
        <div
          style={{
            padding: '1.1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: capturedPhoto ? 'space-between' : 'center',
            gap: '1rem'
          }}
        >
          {!capturedPhoto && !cameraError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Shutter Button */}
              <button
                type="button"
                onClick={handleShutter}
                disabled={isCapturing}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '4px solid #ffffff',
                  background: 'radial-gradient(circle, #38bdf8 0%, #0284c7 100%)',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.6), inset 0 0 8px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.1s ease',
                  transform: isCapturing ? 'scale(0.92)' : 'scale(1)'
                }}
                title="Take Photo"
              >
                <Camera size={26} color="#ffffff" />
              </button>
            </div>
          )}

          {capturedPhoto && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRetake}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.1rem', color: '#f8fafc' }}
              >
                <RefreshCw size={15} />
                <span>Retake</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmPhoto}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.25rem',
                  background: 'var(--color-emerald, #10b981)',
                  borderColor: 'var(--color-emerald, #10b981)'
                }}
              >
                <Check size={16} />
                <span>Use This Photo</span>
              </button>
            </>
          )}

          {cameraError && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ color: '#94a3b8' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
