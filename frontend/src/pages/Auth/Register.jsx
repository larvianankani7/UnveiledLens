import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Globe,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  KeyRound,
  Phone
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function Register() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    adminId: '',
    password: '',
    domain: ''
  });

  const [otp, setOtp] = useState('');
  const [isDnsFallback, setIsDnsFallback] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleInitialSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isAdmin) {
        const response = await fetch(
          `${API_BASE_URL}/api/admin-access/verify-id`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email.trim().toLowerCase(),
              adminId: formData.adminId.trim()
            })
          }
        );
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.message || data?.error || 'Unable to verify Admin ID.');
        }
        setStep(2);
      } else {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/register/user`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email.trim().toLowerCase(),
              password: formData.password,
              domain: formData.domain.trim()
            })
          }
        );
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.message || data?.error || 'Unable to start registration.');
        }
        setStep(2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isAdmin) {
        const response = await fetch(
          `${API_BASE_URL}/api/admin-access/verify-otp`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email.trim().toLowerCase(),
              otp
            })
          }
        );
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.message || data?.error || 'Invalid or expired OTP.');
        
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('role', 'ROLE_ADMIN');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        
        setStep(3);
        setTimeout(() => navigate('/admin'), 1200);
      } else {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/verify-otp`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: formData.email.trim().toLowerCase(),
              otp
            })
          }
        );
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.message || data?.error || 'Invalid or expired OTP.');
        
        setStep(3);
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP.');
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
        Create an Account
      </h2>

      <div className="flex justify-center space-x-6 mb-6 border-b border-glass-border pb-3">
        <button
          type="button"
          onClick={() => { setIsAdmin(false); setError(''); setStep(1); }}
          className={`text-sm font-medium transition-all pb-2 -mb-[13px] border-b-2 ${!isAdmin ? 'text-accent-amber border-accent-amber drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]' : 'text-gray-400 border-transparent hover:text-white'}`}
        >
          User Registration
        </button>
        <button
          type="button"
          onClick={() => { setIsAdmin(true); setError(''); setStep(1); }}
          className={`text-sm font-medium transition-all pb-2 -mb-[13px] border-b-2 ${isAdmin ? 'text-accent-amber border-accent-amber drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]' : 'text-gray-400 border-transparent hover:text-white'}`}
        >
          Admin Registration
        </button>
      </div>

      {step === 1 && (
        <form
          onSubmit={handleInitialSubmit}
          className="space-y-6"
        >

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Admin Authorization ID
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={formData.adminId}
                  onChange={(event) => updateField('adminId', event.target.value)}
                  className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber"
                  placeholder="AUTH-XXXX-XXXX"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Company Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber"
                placeholder="security@yourdomain.com"
              />
            </div>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Target Domain
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                required
                value={formData.domain}
                onChange={(event) => updateField('domain', event.target.value)}
                className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber"
                placeholder="yourdomain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(event) => updateField('password', event.target.value)}
                className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber"
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
              ? 'Sending verification code...'
              : 'Continue'}

          </button>

        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={handleVerify}
          className="space-y-6 text-center"
        >

          {!isDnsFallback ? (
            <>

              <Mail
                className="h-12 w-12 text-accent-amber mx-auto mb-4"
              />

              <h3 className="text-lg font-medium text-white">
                Verify your email
              </h3>

              <p className="text-sm text-gray-400 mt-2">
                A one-time verification code was sent to{' '}
                {formData.email}
              </p>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6)
                  )
                }
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

                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {loading
                  ? 'Verifying...'
                  : 'Verify OTP'}

              </button>

              <button
                type="button"
                onClick={() =>
                  setIsDnsFallback(true)
                }
                className="text-sm text-gray-400 hover:text-white"
              >
                OTP not working? Use DNS verification
              </button>

            </>
          ) : (

            <div className="space-y-4">

              <p className="text-sm text-gray-300">
                DNS verification fallback can remain
                connected to your existing DNS verification
                implementation.
              </p>

              <button
                type="button"
                onClick={() =>
                  setIsDnsFallback(false)
                }
                className="text-sm text-gray-400 hover:text-white"
              >
                Back to Email OTP
              </button>

            </div>
          )}

        </form>
      )}

      {step === 3 && (
        <div className="text-center py-8">

          <CheckCircle2
            className="h-16 w-16 text-accent-amber mx-auto mb-4"
          />

          <h3 className="text-xl font-bold text-white">
            Verification Complete
          </h3>

          <p className="text-sm text-gray-400 mt-2">
            Redirecting to login...
          </p>

        </div>
      )}

      {step === 1 && (
        <div className="mt-6 text-center space-y-3">

          <p className="text-sm text-gray-400">

            Already have an account?{' '}

            <Link
              to="/login"
              className="font-medium text-accent-amber hover:text-accent-burnt"
            >
              Sign In
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

        </div>
      )}

    </div>
  );
}
