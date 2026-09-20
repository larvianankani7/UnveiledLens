import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function AdminRequest() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
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
            email: email.trim().toLowerCase()
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
      <div className="text-center py-8">

        <CheckCircle2
          className="h-16 w-16 text-accent-amber mx-auto mb-4"
        />

        <h2 className="text-2xl font-bold text-white">
          Request Submitted
        </h2>

        <p className="text-sm text-gray-400 mt-3">
          Your request has been submitted.
          If approved, you will receive your
          Admin Authorization ID by email.
        </p>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-6 text-sm text-accent-amber hover:text-accent-burnt"
        >
          Back to Login
        </button>

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
          Request Admin Access
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          Admin access requires developer approval.
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
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
              className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm"
              placeholder="admin@example.com"
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
            ? 'Submitting...'
            : 'Request Admin Access'}

        </button>

      </form>

      <div className="mt-6 text-center">

        <p className="text-sm text-gray-400">

          Already have an Admin Authorization ID?{' '}

          <Link
            to="/admin-verify"
            className="text-accent-amber hover:text-accent-burnt"
          >
            Verify Access
          </Link>

        </p>

      </div>

    </div>
  );
}