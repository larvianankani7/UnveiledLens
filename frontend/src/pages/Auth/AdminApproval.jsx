import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function AdminApproval() {
  const { token } = useParams();

  const [status, setStatus] = useState('LOADING');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {

    const loadStatus = async () => {

      try {

        const response = await fetch(
          `${API_BASE_URL}/api/admin-access/approval/${token}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
            data?.error ||
            'Unable to load request.'
          );
        }

        setStatus(data.status);

      } catch (error) {

        setStatus('ERROR');

        setMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load request.'
        );
      }
    };

    loadStatus();

  }, [token]);

  const processDecision = async (decision) => {

    setLoading(true);
    setMessage('');

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/admin-access/approval/${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            decision
          })
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          'Unable to process request.'
        );
      }

      setStatus(
        decision === 'APPROVE'
          ? 'APPROVED'
          : 'REJECTED'
      );

      setMessage(
        decision === 'APPROVE'
          ? 'The request has been approved. The requester will receive their Admin Authorization ID by email.'
          : 'The request has been rejected.'
      );

    } catch (error) {

      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to process request.'
      );

    } finally {

      setLoading(false);
    }
  };

  const pending =
    status === 'PENDING';

  return (
    <div className="text-center">

      <ShieldCheck
        className="h-14 w-14 text-accent-amber mx-auto mb-4"
      />

      <h2 className="text-2xl font-bold text-white">
        Admin Access Review
      </h2>

      {status === 'LOADING' && (
        <div className="mt-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent-amber" />
        </div>
      )}

      {pending && (
        <div className="mt-6 space-y-4">

          <p className="text-sm text-gray-400">
            A user has requested administrative access.
          </p>

          <div className="flex gap-3">

            <button
              disabled={loading}
              onClick={() =>
                processDecision('APPROVE')
              }
              className="flex-1 flex justify-center items-center gap-2 rounded-md bg-accent-burnt py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </button>

            <button
              disabled={loading}
              onClick={() =>
                processDecision('REJECT')
              }
              className="flex-1 flex justify-center items-center gap-2 rounded-md border border-red-900/60 bg-red-950/30 py-2 text-sm font-medium text-red-300 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>

          </div>

        </div>
      )}

      {status === 'APPROVED' && (
        <p className="mt-6 text-sm text-green-300">
          {message}
        </p>
      )}

      {status === 'REJECTED' && (
        <p className="mt-6 text-sm text-red-300">
          {message}
        </p>
      )}

      {status === 'EXPIRED' && (
        <p className="mt-6 text-sm text-yellow-300">
          This approval request has expired.
        </p>
      )}

      {status === 'ERROR' && (
        <p className="mt-6 text-sm text-red-300">
          {message}
        </p>
      )}

    </div>
  );
}