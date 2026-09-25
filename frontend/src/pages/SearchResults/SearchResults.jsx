import React, { useEffect, useState } from 'react';
import {
  Search,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Radar
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const SCAN_STAGES = [
  'VERIFYING DOMAIN IDENTITY',
  'DISCOVERING PUBLIC SIGNALS',
  'ANALYZING TECHNICAL SURFACES',
  'VALIDATING EXPOSURE BOUNDARY',
  'GENERATING INTELLIGENCE OVERVIEW'
];

export default function SearchResults() {
  const [userDomain, setUserDomain] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStageIndex, setScanStageIndex] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // Fetch the authenticated user's verified domain from backend profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('token');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          sessionStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setUserDomain(data.domain || '');
        } else {
          setError('Unable to retrieve verified account domain.');
        }
      } catch (err) {
        console.error('Failed to load user profile', err);
        setError('Network error while connecting to server.');
      }
    };

    fetchProfile();
  }, []);

  // Multi-phase visual scan progress stages
  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        setScanStageIndex((prev) => (prev < SCAN_STAGES.length - 1 ? prev + 1 : prev));
      }, 950);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // Execute authenticated domain discovery scan
  const handleScan = async (event) => {
    if (event) event.preventDefault();
    setScanStageIndex(0);
    setIsScanning(true);
    setError(null);

    try {
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('token');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/discovery/scan`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          'Unable to complete the security scan.'
        );
      }

      setReport(data);
    } catch (err) {
      console.error('Security scan failed', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to complete the security scan.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Download authenticated user PDF report
  const handlePdfDownload = async () => {
    if (!report) return;
    setError(null);
    setIsPdfLoading(true);

    try {
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('token');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/discovery/report/pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        let message = 'Unable to generate PDF report.';
        try {
          const data = await response.json();
          message = data.message || data.error || message;
        } catch {
          // Response is not JSON
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'unveiledlens-user-report.pdf';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate PDF report.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const getExposureLabel = () => {
    if (!report) return 'Awaiting Scan';
    switch (report.exposureLevel) {
      case 'NO_SIGNIFICANT_SIGNALS':
        return 'No Significant Signals';
      case 'LIMITED':
        return 'Limited Exposure';
      case 'MODERATE':
        return 'Moderate Exposure';
      case 'ELEVATED':
        return 'Elevated Exposure';
      default:
        return 'Under Review';
    }
  };

  const getExposureDescription = () => {
    if (!report) return '';
    if (report.overview) return report.overview;

    switch (report.exposureLevel) {
      case 'NO_SIGNIFICANT_SIGNALS':
        return 'No significant public exposure signals were identified by the current discovery checks.';
      case 'LIMITED':
        return 'A small number of technical exposure signals were identified across public web intelligence.';
      case 'MODERATE':
        return 'Several technical exposure signals were identified that may deserve further internal review.';
      case 'ELEVATED':
        return 'Multiple technical exposure signals were identified requiring security attention and remediation.';
      default:
        return 'The scan identified technical resources that may deserve further security review.';
    }
  };

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-4xl mx-auto w-full page-enter">
      
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="status-pip status-pip-cyan" />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500">
            SECURITY INTELLIGENCE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Security Exposure Overview
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl">
          A privacy-conscious overview of publicly discoverable technical signals associated with your verified domain.
        </p>
      </div>

      {/* Main Action Panel: Verified Domain & Scan Button */}
      <div className="glass-panel card-glow rounded-xl p-6 sm:p-7 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
              VERIFIED DOMAIN SCOPE
            </span>
            <div className="flex items-center gap-2.5">
              <span className="status-pip status-pip-emerald" />
              <span className="text-base sm:text-lg text-white font-mono font-medium">
                {userDomain || 'Loading domain...'}
              </span>
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning || !userDomain}
            className="btn-primary self-start sm:self-auto text-xs uppercase tracking-wider font-semibold px-6 py-3 shrink-0 gap-2"
          >
            {isScanning ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>{report ? 'Run Scan Again' : 'Run Scan'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-red-900/60 bg-red-950/30 px-5 py-4 mb-8 flex items-start gap-3 text-red-300">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Scan unavailable</p>
            <p className="text-xs text-red-400/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Scanning State */}
      {isScanning && (
        <div className="glass-panel rounded-xl border border-[var(--border-primary)] p-10 mb-8 text-center relative overflow-hidden">
          <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-accent-cyan/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-accent-cyan/30 animate-pulse" />
            <div className="h-12 w-12 rounded-full bg-[var(--bg-surface-soft)] border border-accent-cyan/50 flex items-center justify-center text-accent-cyan shadow-[0_0_20px_rgba(18,168,174,0.2)]">
              <Radar className="h-6 w-6 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] mb-3">
            <span className="status-pip status-pip-cyan status-pulse" />
            <span className="font-mono text-xs text-accent-cyan tracking-widest uppercase">
              {SCAN_STAGES[scanStageIndex]}
            </span>
          </div>

          <h2 className="text-base font-medium text-white mb-1">
            Analyzing External Exposure
          </h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto font-mono">
            Evaluating indexed signals for {userDomain}...
          </p>
        </div>
      )}

      {/* After Scan: Concise Vague Report */}
      {report && !isScanning && (
        <div className="glass-panel rounded-xl p-6 sm:p-8 space-y-6">
          {/* Status & Overview */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500 mb-2">
              EXPOSURE STATUS
            </div>
            <div className="flex items-center gap-3">
              {report.exposureLevel === 'NO_SIGNIFICANT_SIGNALS' ? (
                <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0" />
              ) : (
                <Activity className="h-6 w-6 text-accent-cyan shrink-0" />
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {getExposureLabel()}
              </h2>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-3 leading-relaxed max-w-2xl">
              {getExposureDescription()}
            </p>
          </div>

          {/* Small Number of Aggregate Signals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">
                Potential Signals
              </span>
              <span className="text-xl font-mono font-semibold text-white mt-0.5 block">
                {report.summary?.potentialSignals ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">
                Public Discoveries
              </span>
              <span className="text-xl font-mono font-semibold text-white mt-0.5 block">
                {report.summary?.publiclyDiscovered ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">
                API Surfaces
              </span>
              <span className="text-xl font-mono font-semibold text-white mt-0.5 block">
                {report.summary?.apiSignals ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">
                Storage References
              </span>
              <span className="text-xl font-mono font-semibold text-white mt-0.5 block">
                {report.summary?.storageSignals ?? 0}
              </span>
            </div>
          </div>

          {/* Export PDF Button & Evaluation Timestamp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
              <span>EVALUATED:</span>
              <span className="text-gray-400">
                {report.scannedAt ? new Date(report.scannedAt).toLocaleString() : 'Recent'}
              </span>
            </div>

            <button
              onClick={handlePdfDownload}
              disabled={isPdfLoading}
              className="btn-secondary text-xs uppercase tracking-wider font-mono font-medium px-4 py-2.5 gap-2 shrink-0 self-start sm:self-auto"
            >
              <FileText className="h-4 w-4 text-accent-cyan" />
              <span>{isPdfLoading ? 'Generating PDF...' : 'Export PDF'}</span>
            </button>
          </div>

          {/* Safe Privacy Disclaimer */}
          <p className="text-[11px] font-mono text-gray-500 leading-relaxed pt-2 border-t border-[var(--border-subtle)]">
            Privacy note: Raw URLs, search results, and specific technical evidence are intentionally omitted to provide a safe, aggregate exposure overview.
          </p>
        </div>
      )}

    </div>
  );
}
