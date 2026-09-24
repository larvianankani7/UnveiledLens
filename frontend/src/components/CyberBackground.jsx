import React, { useRef, useEffect } from 'react';

/**
 * Global UnveiledLens Background Layer
 * 
 * Implements:
 * - Animated visual referenced from Pinterest (https://pin.it/5i5Vhj7kT)
 * - Covers full viewport behind entire website (fixed inset-0, z-0, pointer-events-none)
 * - Infinite seamless loop with no visible restart/jump
 * - Approximately 5% blur (blur(5px))
 * - Approximately 85% opacity (opacity: 0.85)
 * - Foreground UI content remains 100% crisp and readable
 */
export default function CyberBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
    }
  }, []);

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div
      className="cyber-bg-container fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Reference Background Video (85% opacity, ~5% blur, seamless loop) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onEnded={handleEnded}
        className="w-full h-full object-cover absolute inset-0 pointer-events-none select-none"
        style={{
          opacity: 0.85,
          filter: 'blur(5px)',
          transform: 'scale(1.03)', // slightly scale to hide edge artifacts from blur
          willChange: 'transform, opacity'
        }}
      >
        <source src="/videos/cyber-bg.mp4" type="video/mp4" />
        <source src="https://v1.pinimg.com/videos/iht/720p/17/d1/59/17d1590f71039c57e267318238a33cd9.mp4" type="video/mp4" />
      </video>

      {/* Atmospheric Contrast Overlay ensuring foreground UI readability */}
      <div className="cyber-video-overlay absolute inset-0 pointer-events-none" />

      {/* Deep atmospheric radial glow */}
      <div className="cyber-radial-glow absolute inset-0 pointer-events-none" />

      {/* Perimeter Vignette */}
      <div className="cyber-vignette absolute inset-0 pointer-events-none" />
    </div>
  );
}
