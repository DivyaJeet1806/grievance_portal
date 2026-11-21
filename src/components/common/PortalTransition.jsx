import React, { useState, useEffect, useRef } from 'react';
import '../../css/portal-transition.css';

export const PortalTransition = ({ onComplete }) => {
  const [statusText, setStatusText] = useState('Entering Portal...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  const timeout1Ref = useRef(null);
  const timeout2Ref = useRef(null);
  const timeout3Ref = useRef(null);

  const clearAllTimers = () => {
    if (timeout1Ref.current) clearTimeout(timeout1Ref.current);
    if (timeout2Ref.current) clearTimeout(timeout2Ref.current);
    if (timeout3Ref.current) clearTimeout(timeout3Ref.current);
  };

  const startLoading = () => {
    clearAllTimers();
    setIsFadingOut(false);
    setStatusText('Entering Portal...');

    // 1. Simulate initial loading duration (1800ms)
    timeout1Ref.current = setTimeout(() => {
      setStatusText('Redirecting...');

      // 2. Begin smooth fade-out (400ms)
      timeout2Ref.current = setTimeout(() => {
        setIsFadingOut(true);

        // 3. Complete navigation into portal after fade transition (500ms)
        timeout3Ref.current = setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 500);
      }, 400);
    }, 1800);
  };

  useEffect(() => {
    startLoading();
    return () => {
      clearAllTimers();
    };
  }, []);

  return (
    <div className="portal-transition-screen" role="status" aria-live="polite">
      {/* MAIN CENTERED CONTAINER */}
      <main
        id="loading-container"
        className={`portal-transition-content ${isFadingOut ? 'fade-out' : ''}`}
      >
        {/* 1. Sleek Vertical Sliding Bars Animation */}
        <div className="bar-container" aria-label="Loading animation">
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>

        {/* 2. Low-Contrast Soft Text */}
        <p id="status-text" className="status-text">
          {statusText}
        </p>
      </main>

    
    </div>
  );
};
