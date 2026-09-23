import React, { useRef, useEffect } from 'react';

/**
 * Global Cybersecurity Live Background
 * 
 * Features:
 * - Specific Pinterest Video Background
 * - Dark cyan / Peacock green theme overlay
 * - No extra competing animations
 */
export default function CyberBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      // Stretch the video's duration/speed to approximately 115% of its original timing
      videoRef.current.playbackRate = 0.87;
    }
  }, []);

  return (
    <div
      className="cyber-bg-container fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Global Background Video (90% opacity, 10% blur, non-blocking) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.9,
          filter: 'blur(10px)',
          transform: 'scale(1.05)' // slightly scale to hide edge artifacts from blur
        }}
      >
        <source src="https://v1.pinimg.com/videos/mc/720p/8d/7e/5a/8d7e5af3824b88970fd4d05e26fc5b4f.mp4" type="video/mp4" />
      </video>

      {/* Brand Color Treatment Overlay (Dark cyan / Peacock green) */}
      <div className="cyber-color-treatment absolute inset-0 pointer-events-none" />

      {/* Contrast Overlay ensuring readability across dark and light modes */}
      <div className="cyber-video-overlay absolute inset-0" />

      {/* Deep atmospheric radial gradient */}
      <div className="cyber-radial-glow absolute inset-0" />

      {/* Perimeter Vignette */}
      <div className="cyber-vignette absolute inset-0" />
    </div>
  );
}
