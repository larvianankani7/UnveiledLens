import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Mail,
  Globe
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function AdminApproval() {
  const { token } = useParams();

  const [status, setStatus] = useState('LOADING');
  const [requestDetails, setRequestDetails] = useState({ email: '', domain: '' });
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
        setRequestDetails({
          email: data.email || '',
          domain: data.domain || ''
        });
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
          ? `The request has been approved. The generated Admin ID has been securely dispatched to ${requestDetails.email || 'the requester'}.`
          : `The request has been rejected. Notification dispatched to ${requestDetails.email || 'the requester'}.`
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

  const pending = status === 'PENDING';

  return (
    <div className="text-center page-enter">
      <div className="h-12 w-12 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-3 text-accent-cyan">
        <ShieldCheck className="h-6 w-6" />
      </div>

      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent-cyan block mb-1">
        PRIVILEGE ESCALATION
      </span>

      <h2 className="text-xl font-bold text-white tracking-tight">
        Admin Access Decision
      </h2>

      {status === 'LOADING' && (
        <div className="mt-6 flex flex-col items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-accent-cyan mb-2" />
          <span className="text-xs font-mono text-gray-500">Retrieving authorization record...</span>
        </div>
      )}

      {pending && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-gray-400 font-mono leading-relaxed">
            An operator has formally requested administrative console access. Review the requested scope and submit an authorization decision.
          </p>

          {/* Request Details Card */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] text-left space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">REQUEST STATUS</span>
              <span className="badge-technical badge-cyan">PENDING</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="truncate">{requestDetails.email || '—'}</span>
            </div>

            {requestDetails.domain && (
              <div className="flex items-center gap-2 text-gray-300">
                <Globe className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="truncate">{requestDetails.domain}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              disabled={loading}
              onClick={() => processDecision('APPROVE')}
              className="btn-primary flex-1 text-xs py-2.5 gap-2 uppercase tracking-wider font-semibold"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Approve Access</span>
            </button>

            <button
              disabled={loading}
              onClick={() => processDecision('REJECT')}
              className="btn-secondary flex-1 text-xs py-2.5 gap-2 uppercase tracking-wider text-red-400 hover:text-red-300 border-red-900/40"
            >
              <XCircle className="h-4 w-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {status === 'APPROVED' && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 font-mono">
          <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
          {message}
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-xs text-red-300 font-mono">
          <XCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
          {message}
        </div>
      )}

      {status === 'EXPIRED' && (
        <div className="mt-6 p-4 rounded-xl -cyan-950/20 border -cyan-900/40 text-xs -cyan-300 font-mono flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent-cyan" />
          <span>This approval challenge has expired.</span>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-xs text-red-300 font-mono">
          {message}
        </div>
      )}
    </div>
  );
}
