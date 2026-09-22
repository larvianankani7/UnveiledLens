import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  KeyRound,
  Loader2,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function AdminVerify() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [adminId, setAdminId] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const verifyAuthorization = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin-access/verify-id`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            adminId: adminId.trim()
          })
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          'Invalid or expired Admin Authorization ID.'
        );
      }

      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to verify authorization.'
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin-access/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp
          })
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          'Invalid or expired OTP.'
        );
      }

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', 'ROLE_ADMIN');
      localStorage.removeItem('token');
      localStorage.removeItem('role');

      setStep(3);
      setTimeout(() => {
        navigate('/admin');
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid or expired OTP.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="text-center py-6 page-enter">
        <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white font-mono">
          Admin Authorization Validated
        </h2>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          Connecting to Admin Dashboard...
        </p>
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
          ADMIN PORTAL
        </span>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {step === 1 ? 'Admin Authorization' : 'OTP Verification'}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          {step === 1
            ? 'Enter your verified email and approved Admin Authorization ID.'
            : `Enter the 6-digit verification code dispatched to ${email}`}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={verifyAuthorization} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
              Email
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

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
              Admin Authorization ID
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="input-technical w-full pl-9 pr-3 py-2.5 text-xs font-mono"
                placeholder="AUTH-XXXX-XXXX"
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
                <span>Verifying Authorization...</span>
              </span>
            ) : (
              'Verify Admin Auth'
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400 font-mono">
              Missing an authorization ID?{' '}
              <Link to="/admin-request" className="text-accent-amber hover:underline font-medium">
                Request Admin Auth
              </Link>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-5 text-center">
          <div className="h-10 w-10 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center mx-auto text-accent-amber">
            <KeyRound className="h-5 w-5" />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
              One-Time Passcode (OTP)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-technical w-full text-center tracking-[0.5em] text-xl py-2.5 font-mono"
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3.5 py-2.5 text-xs text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xs uppercase tracking-wider font-semibold py-2.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Verifying Code...</span>
              </span>
            ) : (
              'Verify OTP'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setError('');
            }}
            className="btn-ghost text-xs text-gray-500 hover:text-gray-300 font-mono block mx-auto"
          >
            Re-enter Admin Authorization ID
          </button>
        </form>
      )}

      <div className="mt-8 pt-5 border-t border-[var(--border-subtle)] text-center text-xs font-mono space-y-2">
        <p className="text-gray-400">
          Need to request authorization?{' '}
          <Link to="/admin-request" className="text-accent-amber hover:underline font-medium">
            Request Admin Access
          </Link>
        </p>
        <p>
          <Link to="/login" className="text-gray-500 hover:text-gray-300">
            Return to User Login
          </Link>
        </p>
      </div>
    </div>
  );
}