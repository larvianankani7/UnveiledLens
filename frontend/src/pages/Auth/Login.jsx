import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft, KeyRound } from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier: identifier.trim().toLowerCase(),
            password
          })
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          'Invalid email or password.'
        );
      }

      if (data?.requiresOtp) {
        setStep(2);
      } else if (data?.token) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('role', 'ROLE_USER');
        navigate('/search');
      }

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to login.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier: identifier.trim().toLowerCase(),
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
      sessionStorage.setItem('role', 'ROLE_USER');
      navigate('/search');
      
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

  return (
    <div className="relative page-enter">
      <Link 
        to="/" 
        className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-500 hover:text-white transition-colors mb-6 group"
        title="Back to Home"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        <span>Return to Platform Home</span>
      </Link>

      <div className="text-center mb-6">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent-amber block mb-1">
          AUTHENTICATION GATEWAY
        </span>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {step === 1 ? 'Sign in to UnveiledLens' : 'Two-Factor Challenge'}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          {step === 1
            ? 'Access external security exposure intelligence.'
            : `Enter the 6-digit verification code sent to ${identifier}`}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-technical w-full pl-9 pr-3 py-2.5 text-xs font-mono"
                placeholder="analyst@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-technical w-full pl-9 pr-3 py-2.5 text-xs font-mono"
                placeholder="••••••••••••"
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
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-5 text-center">
          <div className="h-10 w-10 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center mx-auto text-accent-amber">
            <KeyRound className="h-5 w-5" />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
              One-Time Passcode
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
              'Confirm Passcode'
            )}
          </button>
        </form>
      )}

      <div className="mt-8 pt-5 border-t border-[var(--border-subtle)] text-center space-y-2.5 text-xs font-mono">
        <p className="text-gray-400">
          Need an account?{' '}
          <Link to="/register" className="text-accent-amber hover:underline font-medium">
            Register Domain Scope
          </Link>
        </p>

        <p className="text-gray-500">
          Admin access?{' '}
          <Link to="/admin-verify" className="text-gray-400 hover:text-accent-amber">
            Enter Admin Portal
          </Link>
          <span className="mx-1.5 text-gray-700">•</span>
          <Link to="/admin-request" className="text-gray-400 hover:text-accent-amber">
            Request Access
          </Link>
        </p>
      </div>
    </div>
  );
}
