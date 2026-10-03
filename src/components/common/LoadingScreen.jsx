import React, { useEffect, useState, useCallback, useRef } from 'react';
import '../../css/loader.css';

export const LoadingScreen = ({ 
  onComplete, 
  duration = 3200, 
  isLoading = false 
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const minTimeElapsed = useRef(false);
  const timerRef = useRef(null);

  // Trigger completion with silky fade out transition
  const handleFinish = useCallback(() => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 550);
  }, [isFadingOut, onComplete]);

  // Track initial animation sequence duration
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      minTimeElapsed.current = true;
      if (!isLoading) {
        handleFinish();
      }
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, isLoading, handleFinish]);

  // If external loading finishes after minimum animation duration, finish
  useEffect(() => {
    if (!isLoading && minTimeElapsed.current) {
      handleFinish();
    }
  }, [isLoading, handleFinish]);

  return (
    <div 
      className={`imsec-loader-overlay ${isFadingOut ? 'fade-out' : ''}`}
      role="status"
      aria-label="Loading IMSEC Grievance Portal"
    >
      {/* TOP NEON */}
      <div className="top-light" />

      {/* BOTTOM NEON */}
      <div className="bottom-light" />

      {/* MAIN LOADER */}
      <main className="loader" id="loaderStage">
        <div className="logo">
          <svg viewBox="0 0 900 250" preserveAspectRatio="xMidYMid meet">
            {/* Faint outline */}
            <text x="50%" y="65%" textAnchor="middle" className="ghost-text" id="ghostText">
              IMSEC
            </text>

            {/* Animated writing */}
            <text x="50%" y="65%" textAnchor="middle" className="draw-text" id="drawText">
              IMSEC
            </text>
          </svg>

          {/* Line below IMSEC */}
          <div className="line-container">
            <div className="ghost-line" />
            <div className="moving-line" id="movingLine" />
            <div className="moving-dot" id="movingDot" />
          </div>
        </div>

        {/* Portal Subtext */}
        <div className="portal" id="portalSubtext">
          GRIEVANCE PORTAL
        </div>
      </main>
    </div>
  );
};
