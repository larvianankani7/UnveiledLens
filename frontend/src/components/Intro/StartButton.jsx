import React from 'react';

/**
 * Dedicated START button component.
 * 
 * Visual style:
 * - Dark peacock-green theme (#06483F, #083F45, #021a16)
 * - Black base/background
 * - Crisp white text
 * - Continuous infinite shifting animated gradient
 * - Elegant, premium appearance with subtle glow
 * - Appears smoothly at 9.5 seconds
 */
export default function StartButton({ show, onClick }) {
  return (
    <div
      className={`transition-all duration-700 ease-out transform ${
        show
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-95 translate-y-3 pointer-events-none'
      }`}
      aria-hidden={!show}
    >
      <button
        type="button"
        onClick={onClick}
        className="btn-intro-start group cursor-pointer"
        tabIndex={show ? 0 : -1}
      >
        <span className="relative z-10 flex items-center gap-2">
          <span>START</span>
          <svg
            className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1 opacity-80 group-hover:opacity-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </button>
    </div>
  );
}
