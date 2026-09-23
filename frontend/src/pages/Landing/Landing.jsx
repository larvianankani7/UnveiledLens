import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShieldAlert,
  ArrowRight,
  Database,
  Lock,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col relative overflow-hidden page-enter">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center z-10">
        
        {/* Intelligence System Signal Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] mb-8">
          <span className="status-pip status-pip-cyan status-pulse" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-gray-400">
            SEARCH-POWERED EXPOSURE INTELLIGENCE
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="block text-white">Discover Beyond</span>
          <span className="w-fit mx-auto block text-gradient-animated">The Known.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-gray-400 mx-auto mb-10 leading-relaxed font-normal">
          UnveiledLens identifies publicly discoverable exposure signals through search-engine intelligence. 
          Discover what the public web has already revealed about your external surface without invasive scanning.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/register"
            className="btn-primary w-full sm:w-auto text-sm px-8 py-3.5 tracking-wider uppercase font-semibold"
          >
            Start Discovery
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="btn-secondary w-full sm:w-auto text-sm px-7 py-3.5"
          >
            Access Intelligence Console
          </Link>
        </div>

        {/* Architecture Telemetry Highlights */}
        <div className="mt-16 pt-10 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan font-bold mb-1">
              SURFACE VISIBILITY
            </div>
            <div className="text-sm font-medium text-white mb-1">
              Non-Invasive OSINT
            </div>
            <div className="text-xs text-gray-500">
              Passively gathers publicly indexed resources without intrusive target scanning.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan font-bold mb-1">
              PRIVACY SAFEGUARDS
            </div>
            <div className="text-sm font-medium text-white mb-1">
              Automated Redaction
            </div>
            <div className="text-xs text-gray-500">
              Cryptographically masks credentials, tokens, and sensitive strings before persistence.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan font-bold mb-1">
              ACCESS BOUNDARY
            </div>
            <div className="text-sm font-medium text-white mb-1">
              Strict Verification
            </div>
            <div className="text-xs text-gray-500">
              Only verified domain owners unlock actionable telemetry and security overviews.
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 border-y border-[var(--border-primary)] bg-[var(--bg-secondary)]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent-cyan font-bold block mb-2">
              INTELLIGENCE PIPELINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">
              How UnveiledLens Operates
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Transforms publicly discoverable exposure signals into actionable security intelligence through four precise phases.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="glass-panel card-interactive p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center mb-4 text-accent-cyan">
                  <Search className="h-5 w-5" />
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                  PHASE 01
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Public Index Discovery
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Leverages search-engine intelligence to identify exposed API endpoints, open directories, and storage buckets.
                </p>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="glass-panel card-interactive p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center mb-4 text-accent-cyan">
                  <Cpu className="h-5 w-5" />
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                  PHASE 02
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Safe Surface Validation
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Conducts non-destructive HTTP validation to confirm resource accessibility without probing credentials.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-panel card-interactive p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center mb-4 text-accent-cyan">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                  PHASE 03
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Evidence Redaction
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Automatically sanitizes and masks sensitive identifiers, keys, and credentials before any report generation.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="glass-panel card-interactive p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center mb-4 text-accent-cyan">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
                  PHASE 04
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Risk Interpretation
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Synthesizes privacy-conscious risk overviews, potential attack chain signals, and targeted remediation steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Verified Ownership Boundary */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent-cyan font-bold block mb-2">
              BOUNDARY CONTROL
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-4">
              Verified Security Boundary
            </h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              UnveiledLens enforces an inviolable perimeter: deep intelligence findings and discovery summaries are locked until domain ownership is mathematically verified.
            </p>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
                <span className="status-pip status-pip-emerald" />
                <span className="text-gray-300">Email-to-Domain institutional binding</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
                <span className="status-pip status-pip-emerald" />
                <span className="text-gray-300">DNS TXT challenge fallback validation</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-subtle)]">
                <span className="status-pip status-pip-emerald" />
                <span className="text-gray-300">Strict separation of User Overview and Admin Console</span>
              </div>
            </div>
          </div>

          {/* Technical Terminal Mockup */}
          <div className="glass-panel card-glow rounded-xl p-6 border border-glass-border">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-primary)]">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-accent-cyan" />
                <span className="font-mono text-xs text-gray-300 tracking-wider uppercase">
                  TELEMETRY CONSOLE
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent-cyan/60" />
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-gray-500 pb-1 border-b border-glass-border">
                <span>TARGET ENTITY</span>
                <span>STATUS</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center text-white">
                  <Database className="h-3.5 w-3.5 mr-2 text-gray-500" />
                  targetdomain.com
                </span>
                <span className="badge-technical badge-cyan">
                  VERIFIED
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span className="flex items-center">
                  <Layers className="h-3.5 w-3.5 mr-2 text-gray-600" />
                  api.targetdomain.com
                </span>
                <span className="badge-technical">
                  INDEXED
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span className="flex items-center">
                  <Lock className="h-3.5 w-3.5 mr-2 text-gray-600" />
                  storage.targetdomain.com
                </span>
                <span className="badge-technical text-emerald-400 border-emerald-500/30">
                  REDACTED
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
