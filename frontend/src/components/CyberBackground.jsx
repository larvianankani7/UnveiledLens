import React, { useRef, useEffect } from 'react';
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
          transform: 'scale(1.03)',
          willChange: 'transform, opacity'
        }}
      >
        <source src="/videos/cyber-bg.mp4" type="video/mp4" />
        <source src="https://v1.pinimg.com/videos/iht/720p/17/d1/59/17d1590f71039c57e267318238a33cd9.mp4" type="video/mp4" />
      </video>
      <div className="cyber-video-overlay absolute inset-0 pointer-events-none" />
      <div className="cyber-radial-glow absolute inset-0 pointer-events-none" />
      <div className="cyber-vignette absolute inset-0 pointer-events-none" />
    </div>
  );
}