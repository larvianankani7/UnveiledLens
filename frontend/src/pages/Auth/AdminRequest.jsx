import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function AdminRequest() {
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const targetEmail = email.trim().toLowerCase();
    const targetDomain = domain.trim();

    if (!targetEmail) {
      setError('Email address is required.');
      return;
    }

    if (!targetDomain) {
      setError('Target domain is required.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin-access/request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: targetEmail,
            domain: targetDomain
          })
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          'Unable to submit admin access request.'
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit admin access request.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6 page-enter">
        <div className="h-12 w-12 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-3 text-accent-amber">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] mb-3">
          <span className="status-pip status-pip-amber status-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-amber font-semibold">
            STATUS: PENDING
          </span>
        </div>

        <h2 className="text-lg font-bold text-white font-mono">
          Authorization Request Logged
        </h2>

        <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
          Your request to administer <span className="text-white font-mono">{domain}</span> has been submitted and is currently <strong className="text-accent-amber">PENDING</strong> authorization.
        </p>

        <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Upon manual authorization approval, your unique <strong className="text-gray-300">Admin Authorization ID</strong> will be securely transmitted to <span className="text-gray-300 font-mono">{email}</span>.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/admin-verify"
            className="btn-primary w-full text-xs uppercase tracking-wider font-semibold py-2.5"
          >
            Go to Admin Portal
          </Link>

          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setEmail('');
              setDomain('');
            }}
            className="btn-ghost text-xs text-gray-500 hover:text-gray-300 font-mono"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <Link 
        to="/login" 
        className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-500 hover:text-white transition-colors mb-6 group"
        title="Back to Login"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        <span>Return to Login</span>
      </Link>

      <div className="text-center mb-6">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent-amber block mb-1">
          ELEVATED PRIVILEGES
        </span>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Request Admin Access
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Administrative access requires formal authorization. Enter your institutional email and target domain.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Requester Email */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
            Institutional / Corporate Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-technical w-full pl-9 pr-3 py-2.5 text-xs font-mono"
              placeholder="admin@yourdomain.com"
            />
          </div>
        </div>

        {/* Target Domain Scope */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
            Target Domain Scope
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="input-technical w-full pl-9 pr-3 py-2.5 text-xs font-mono"
              placeholder="yourdomain.com"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3.5 py-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-xs uppercase tracking-wider font-semibold py-2.5 mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Transmitting Request...</span>
            </span>
          ) : (
            'Request Admin Access'
          )}
        </button>
      </form>

      <div className="mt-8 pt-5 border-t border-[var(--border-subtle)] text-center text-xs font-mono space-y-2">
        <p className="text-gray-400">
          Already possess an Admin ID?{' '}
          <Link to="/admin-verify" className="text-accent-amber hover:underline font-medium">
            Enter Admin Portal
          </Link>
        </p>
      </div>
    </div>
  );
}
