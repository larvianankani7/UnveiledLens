import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Globe,
  CheckCircle2,
  Phone,
  Loader2
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function Register() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
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

  const handleRoleChange = (admin) => {
    setIsAdmin(admin);
    setError('');
    setOtp('');
    setStep(1);
    setIsDnsFallback(false);
  };

  const handleInitialSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const endpoint = isAdmin
        ? '/api/auth/register/admin'
        : '/api/auth/register/user';

      const payload = isAdmin
        ? {
            phone: formData.phone.trim(),
            password: formData.password,
            domain: formData.domain.trim()
          }
        : {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            domain: formData.domain.trim()
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          'Unable to start registration.'
        );
      }

      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start registration.'
      );
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
      const identifier = isAdmin
        ? formData.phone.trim()
        : formData.email.trim().toLowerCase();

      const response = await fetch(
        `${API_BASE_URL}/api/auth/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier,
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

      setStep(3);

      setTimeout(() => {
        navigate('/login');
      }, 1200);
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

  const renderStep1 = () => (
    <form onSubmit={handleInitialSubmit} className="space-y-6">

      <div className="flex justify-center space-x-4 mb-6 border-b border-glass-border pb-4">

        <button
          type="button"
          onClick={() => handleRoleChange(false)}
          className={`text-sm font-medium transition-all ${
            !isAdmin
              ? 'text-accent-amber drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          User
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange(true)}
          className={`text-sm font-medium transition-all ${
            isAdmin
              ? 'text-accent-amber drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Admin
        </button>

      </div>

      {!isAdmin ? (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Company Email
          </label>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-accent-amber transition-colors" />
            </div>

            <input
              type="email"
              required
              value={formData.email}
              onChange={(event) =>
                updateField('email', event.target.value)
              }
              className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm transition-all shadow-inner"
              placeholder="security@example.com"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Mobile Phone Number
          </label>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-500 group-focus-within:text-accent-amber transition-colors" />
            </div>

            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(event) =>
                updateField('phone', event.target.value)
              }
              className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm transition-all shadow-inner"
              placeholder="+91 9876543210"
            />
          </div>

          <p className="mt-1 text-xs text-gray-500">
            A verification code will be sent by SMS.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Target Domain
        </label>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-500 group-focus-within:text-accent-amber transition-colors" />
          </div>

          <input
            type="text"
            required
            value={formData.domain}
            onChange={(event) =>
              updateField('domain', event.target.value)
            }
            className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm transition-all shadow-inner"
            placeholder="example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-accent-amber transition-colors" />
          </div>

          <input
            type="password"
            required
            value={formData.password}
            onChange={(event) =>
              updateField('password', event.target.value)
            }
            className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm transition-all shadow-inner"
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
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-burnt hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors glow-amber"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Sending verification code...' : 'Continue'}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleVerify} className="space-y-6 text-center">

      <div className="mb-4">

        {isAdmin ? (
          <Phone className="h-12 w-12 text-accent-amber mx-auto mb-4 drop-shadow-[0_0_12px_rgba(217,119,6,0.6)]" />
        ) : (
          <Mail className="h-12 w-12 text-accent-amber mx-auto mb-4 drop-shadow-[0_0_12px_rgba(217,119,6,0.6)]" />
        )}

        <h3 className="text-lg font-medium text-white">
          {isAdmin ? 'Verify your phone' : 'Verify your email'}
        </h3>

        <p className="text-sm text-gray-400 mt-2">
          A one-time verification code was sent to{' '}
          {isAdmin ? formData.phone : formData.email}.
        </p>
      </div>

      {!isAdmin && isDnsFallback ? (
        <div className="space-y-4 text-left bg-charcoal-lighter p-4 rounded-md border border-glass-border shadow-inner">

          <p className="text-sm text-gray-300">
            DNS verification is not connected to this OTP endpoint yet.
            Please use Email OTP for the current registration flow.
          </p>

          <button
            type="button"
            onClick={() => setIsDnsFallback(false)}
            className="w-full text-sm text-gray-400 hover:text-white transition-colors"
          >
            Back to Email OTP
          </button>

        </div>
      ) : (
        <>
          <div>
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
              className="block w-full text-center tracking-[0.5em] text-2xl bg-charcoal-lighter border border-glass-border rounded-md py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber transition-all shadow-inner"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-burnt hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors glow-amber"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {!isAdmin && (
            <button
              type="button"
              onClick={() => setIsDnsFallback(true)}
              className="text-sm text-gray-400 hover:text-white mt-4 transition-colors"
            >
              OTP not working? Use DNS verification
            </button>
          )}
        </>
      )}
    </form>
  );

  const renderStep3 = () => (
    <div className="text-center py-8">

      <CheckCircle2 className="h-16 w-16 text-accent-amber mx-auto mb-4 drop-shadow-[0_0_15px_rgba(217,119,6,0.8)]" />

      <h3 className="text-xl font-bold text-white">
        Verification Complete
      </h3>

      <p className="text-sm text-gray-400 mt-2">
        Redirecting to login...
      </p>

    </div>
  );

  return (
    <div>

      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Create an Account
      </h2>

      <div className="transition-all duration-300">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {step === 1 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}

            <Link
              to="/login"
              className="font-medium text-accent-amber hover:text-accent-burnt transition-colors drop-shadow-[0_0_4px_rgba(217,119,6,0.4)]"
            >
              Sign In
            </Link>
          </p>
        </div>
      )}

    </div>
  );
}

