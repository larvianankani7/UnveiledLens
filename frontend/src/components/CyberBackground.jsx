import React from 'react';

/**
 * Global Cybersecurity Live Background
 * 
 * Features:
 * - Subtle technical coordinate grid
 * - Faint intelligence nodes with restrained amber signal pulses
 * - Slow-moving telemetry scan line
 * - Vignetted radial gradients preserving high contrast for typography
 * - Fully accessible with prefers-reduced-motion support
 */
export default function CyberBackground() {
  return (
    <div
      className="cyber-bg-container fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Global Background Video (75% opacity, 20px Gaussian blur, non-blocking) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.75,
          filter: 'blur(20px)',
          transform: 'scale(1.08)'
        }}
      >
        <source src="/videos/auth-bg.mp4" type="video/mp4" />
        <source src="https://v1.pinimg.com/videos/mc/720p/de/f0/66/def066b05de872b1b03d6d3502e9e5a5.mp4" type="video/mp4" />
      </video>

      {/* Contrast Overlay ensuring readability across dark and light modes */}
      <div className="cyber-video-overlay absolute inset-0" />

      {/* Deep atmospheric radial gradient */}
      <div className="cyber-radial-glow absolute inset-0" />

      {/* Technical Grid Pattern */}
      <svg
        className="cyber-grid absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="cyber-grid-pattern"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-glass-border opacity-40"
            />
            {/* Tiny intersection cross */}
            <circle
              cx="0"
              cy="0"
              r="1"
              fill="currentColor"
              className="text-gray-600 opacity-60"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyber-grid-pattern)" />
      </svg>

      {/* Intelligence Signal Nodes (Subtle ambient telemetry pulses) */}
      <div className="cyber-node cyber-node-1" />
      <div className="cyber-node cyber-node-2" />
      <div className="cyber-node cyber-node-3" />

      {/* Slow Technical Scan Line */}
      <div className="cyber-scanline" />

      {/* Perimeter Vignette */}
      <div className="cyber-vignette absolute inset-0" />
    </div>
  );
}
