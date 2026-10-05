import { useState, useRef, useEffect, useCallback } from 'react';
export function useIntroTiming({ onComplete } = {}) {
  const videoRef = useRef(null);
  const [showStart, setShowStart] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const showStartRef = useRef(false);
  const frozenRef = useRef(false);
  const evaluateTime = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const current = video.currentTime;
    if (current >= 9.5 && !showStartRef.current) {
      showStartRef.current = true;
      setShowStart(true);
    }
    if ((current >= 10.0 || video.ended) && !frozenRef.current) {
      frozenRef.current = true;
      video.pause();
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
  const handleStart = useCallback(() => {
    if (isExiting || isDismissed) return;
    setIsExiting(true);
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