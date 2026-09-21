import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  ShieldCheck,
  KeyRound,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080';

export default function AdminVerify() {

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [adminId, setAdminId] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const verifyAuthorization = async (
    event
  ) => {

    event.preventDefault();

    setError('');
    setLoading(true);

    try {

      const response =
          await fetch(
              `${API_BASE_URL}/api/admin-access/verify-id`,
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                      'application/json'
                },
                body: JSON.stringify({
                  email:
                      email.trim().toLowerCase(),
                  adminId:
                      adminId.trim()
                })
              }
          );

      const data =
          await response
              .json()
              .catch(() => null);

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

  const verifyOtp = async (
    event
  ) => {

    event.preventDefault();

    if (otp.length !== 6) {

      setError(
          'Enter the 6-digit verification code.'
      );

      return;
    }

    setError('');
    setLoading(true);

    try {

      const response =
          await fetch(
              `${API_BASE_URL}/api/admin-access/verify-otp`,
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                      'application/json'
                },
                body: JSON.stringify({
                  email:
                      email.trim().toLowerCase(),
                  otp
                })
              }
          );

      const data =
          await response
              .json()
              .catch(() => null);

      if (!response.ok) {

        throw new Error(
            data?.message ||
            data?.error ||
            'Invalid or expired OTP.'
        );
      }

      sessionStorage.setItem(
          'token',
          data.token
      );

      sessionStorage.setItem(
          'role',
          'ROLE_ADMIN'
      );

      localStorage.removeItem(
          'token'
      );

      localStorage.removeItem(
          'role'
      );

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
      <div className="text-center py-8">

        <CheckCircle2
          className="h-16 w-16 text-accent-amber mx-auto mb-4"
        />

        <h2 className="text-2xl font-bold text-white">
          Admin Authentication Successful
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          Opening admin panel...
        </p>

      </div>
    );
  }

  return (
    <div>

      <div className="text-center mb-6">

        <ShieldCheck
          className="h-12 w-12 text-accent-amber mx-auto mb-3"
        />

        <h2 className="text-2xl font-bold text-white">
          Admin Authentication
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          {step === 1
              ? 'Enter your Admin Authorization ID.'
              : 'Enter the verification code sent to your email.'}
        </p>

      </div>

      {step === 1 ? (

        <form
          onSubmit={verifyAuthorization}
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
                value={email}
                onChange={(event) =>
                    setEmail(event.target.value)
                }
                className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent-amber"
                placeholder="admin@yourdomain.com"
              />

            </div>

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-300 mb-1">
              Admin Authorization ID
            </label>

            <div className="relative">

              <KeyRound
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
              />

              <input
                type="text"
                required
                value={adminId}
                onChange={(event) =>
                    setAdminId(event.target.value)
                }
                className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent-amber"
                placeholder="Enter your authorization ID"
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
                ? 'Verifying...'
                : 'Verify Authorization'}

          </button>

        </form>

      ) : (

        <form
          onSubmit={verifyOtp}
          className="space-y-6"
        >

          <div className="text-center">

            <Mail
              className="h-10 w-10 text-accent-amber mx-auto mb-3"
            />

            <p className="text-sm text-gray-400">
              A verification code was sent to
            </p>

            <p className="text-sm text-white mt-1">
              {email}
            </p>

          </div>

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

        </form>
      )}

      <div className="mt-6 text-center">

        <Link
          to="/login"
          className="text-sm text-accent-amber hover:text-accent-burnt"
        >
          Back to Login
        </Link>

      </div>

    </div>
  );
}