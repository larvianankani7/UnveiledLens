import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

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
    <div className="relative">
      <Link 
        to="/" 
        className="absolute -top-12 left-0 p-2 text-gray-400 hover:text-white transition-colors"
        title="Back to Home"
        aria-label="Back to Home"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Welcome Back
      </h2>

      {step === 1 && (
        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          <div>

            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>

            <div className="relative">

              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
              />

              <input
                type="email"
                required
                value={identifier}
                onChange={(event) =>
                  setIdentifier(event.target.value)
                }
                className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm"
                placeholder="you@domain.com"
              />

            </div>

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>

            <div className="relative">

              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
              />

              <input
                type="password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm"
                placeholder="••••••••"
              />

            </div>

          </div>

          {error && (
            <div className="rounded-md border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-md text-sm font-medium text-white bg-accent-burnt hover:bg-accent-dark disabled:opacity-60 transition-colors glow-amber"
          >

            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {loading
              ? 'Signing in...'
              : 'Sign In'}

          </button>

        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={handleVerifyOtp}
          className="space-y-6 text-center"
        >
          <Mail className="h-12 w-12 text-accent-amber mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Verify your login</h3>
          <p className="text-sm text-gray-400 mt-2">
            A verification code was sent to {identifier}
          </p>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            className="block w-full text-center tracking-[0.5em] text-2xl bg-charcoal-lighter border border-glass-border rounded-md py-3 text-white focus:outline-none focus:ring-1 focus:ring-accent-amber"
            placeholder="000000"
            maxLength={6}
          />

          {error && (
            <div className="rounded-md border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-md text-sm font-medium text-white bg-accent-burnt hover:bg-accent-dark disabled:opacity-60 transition-colors glow-amber"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center space-y-3">

        <p className="text-sm text-gray-400">

          Don't have an account?{' '}

          <Link
            to="/register"
            className="font-medium text-accent-amber hover:text-accent-burnt"
          >
            Register as User
          </Link>

        </p>

        <p className="text-sm text-gray-400">

          Need admin access?{' '}

          <Link
            to="/admin-request"
            className="font-medium text-accent-amber hover:text-accent-burnt"
          >
            Request Admin Access
          </Link>

        </p>

        <p className="text-sm text-gray-400">

          Already authorized?{' '}

          <Link
            to="/admin-verify"
            className="font-medium text-accent-amber hover:text-accent-burnt"
          >
            Admin Authentication
          </Link>

        </p>

      </div>

    </div>
  );
}
