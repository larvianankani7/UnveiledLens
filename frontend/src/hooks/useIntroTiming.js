import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage the timing and lifecycle of the UnveiledLens intro video.
 *
 * Sequence:
 * 0.0s → 9.5s: Video plays normally.
 * 9.5s: START button appears.
 * 9.5s → 10.0s: Video continues playing.
 * 10.0s: Video pauses/freezes on final frame indefinitely.
 * START clicked: Triggers smooth fade transition and reveals website.
 */
export function useIntroTiming({ onComplete } = {}) {
  const videoRef = useRef(null);
  const [showStart, setShowStart] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const showStartRef = useRef(false);
  const frozenRef = useRef(false);

  // Time-checking function supporting high-frequency animation frames
  const evaluateTime = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;

    // At 9.5 seconds: Reveal START button
    if (current >= 9.5 && !showStartRef.current) {
      showStartRef.current = true;
      setShowStart(true);
    }

    // At 10.0 seconds: Freeze on final frame
    if ((current >= 10.0 || video.ended) && !frozenRef.current) {
      frozenRef.current = true;
      video.pause();
      
      // Preserve final frame
      if (video.duration && current > video.duration - 0.05) {
        try {
          video.currentTime = Math.max(0, video.duration - 0.01);
        } catch {}
      }
      
      setIsFrozen(true);
      if (!showStartRef.current) {
        showStartRef.current = true;
        setShowStart(true);
      }
    }
  }, []);

  useEffect(() => {
    let animFrameId = null;

    const loop = () => {
      evaluateTime();
      if (!frozenRef.current) {
        animFrameId = requestAnimationFrame(loop);
      }
    };

    animFrameId = requestAnimationFrame(loop);

    return () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, [evaluateTime]);

  // Handle START button click
  const handleStart = useCallback(() => {
    if (isExiting || isDismissed) return;
    setIsExiting(true);

    // Subtle 600ms fade transition into the existing website
    setTimeout(() => {
      setIsDismissed(true);
      if (onComplete) {
        onComplete();
      }
    }, 600);
  }, [isExiting, isDismissed, onComplete]);

  return {
    videoRef,
    showStart,
    isFrozen,
    isExiting,
    isDismissed,
    evaluateTime,
    handleStart,
  };
}
