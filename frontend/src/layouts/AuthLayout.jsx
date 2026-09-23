import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ScanSearch } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative z-10 page-enter">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link
          to="/"
          className="inline-flex items-center space-x-3 group focus:outline-none"
        >
          <div className="h-10 w-10 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center transition-all group-hover:border-[var(--accent-cyan)]/50 group-hover:shadow-[0_0_15px_rgba(18,168,174,0.15)]">
            <ScanSearch className="h-5 w-5 text-accent-cyan transition-transform group-hover:scale-105" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-mono font-bold text-lg tracking-wider uppercase text-white leading-tight">
              UNVEILEDLENS
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-mono">
              DISCOVER BEYOND THE KNOWN.
            </span>
          </div>
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="my-auto sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel card-glow py-8 px-5 sm:px-9 rounded-2xl relative">
          <Outlet />
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="text-center font-mono text-[11px] text-gray-600 mt-8 relative z-10">
        <span>© {new Date().getFullYear()} UNVEILEDLENS — EXTERNAL EXPOSURE INTELLIGENCE</span>
      </div>
    </div>
  );
}
