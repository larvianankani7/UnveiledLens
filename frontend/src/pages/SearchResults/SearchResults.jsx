import React, { useEffect, useState } from 'react';
import {
  Search,
  ShieldCheck,
  Database,
  FileText,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  Radar
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const [isScanning, setIsScanning] = useState(false);
  const [scanStageIndex, setScanStageIndex] = useState(0);
  const [userDomain, setUserDomain] = useState('...');
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

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
        const response = await fetch(
          `${API_BASE_URL}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 401) {
          sessionStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setUserDomain(data.domain || 'Verified domain');
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };

    fetchProfile();
  }, []);

  // Multi-phase visual scan progress
  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        setScanStageIndex((prev) => (prev < SCAN_STAGES.length - 1 ? prev + 1 : prev));
      }, 950);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleSearch = async (event) => {
    event.preventDefault();
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

      const response = await fetch(
        `${API_BASE_URL}/api/discovery/scan`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

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
      console.error('Discovery scan failed', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to complete the security scan.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handlePdfDownload = async () => {
    if (!report?.domain) return;
    setError(null);
    setIsPdfLoading(true);

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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
          // Not JSON
        }
        throw new Error(message);
      }

      const blob = await response.blob();

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });

    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = 'unveiledlens-user-report.pdf';

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    } catch (err) {
      setError(err.message || 'Unable to generate PDF report.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const getExposureLabel = () => {
    if (!report) return 'Awaiting scan';
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
    if (!report) {
      return 'Run a discovery scan to receive a privacy-conscious overview of your domain.';
    }
    switch (report.exposureLevel) {
      case 'NO_SIGNIFICANT_SIGNALS':
        return 'The current discovery checks did not identify significant public exposure signals for your domain.';
      case 'LIMITED':
        return 'A small number of technical exposure signals were identified across public web intelligence.';
      case 'MODERATE':
        return 'Several technical exposure signals were identified that may deserve further internal review.';
      case 'ELEVATED':
        return 'Multiple technical exposure signals were identified requiring security attention and remediation.';
      default:
        return 'The scan identified information that may deserve further security review.';
    }
  };

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-10 py-8 lg:py-10 max-w-6xl mx-auto w-full page-enter">
      
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="status-pip status-pip-cyan" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500">
              SECURITY TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Security Exposure Overview
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl">
            A privacy-conscious summary of publicly discoverable technical signals associated with your verified domain.
          </p>
        </div>

        <Link
          to="/settings"
          className="btn-secondary self-start sm:self-auto text-xs px-4 py-2 gap-2"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Account Settings</span>
        </Link>
      </div>

      {/* Verified Domain Card */}
      <div className="glass-panel rounded-xl p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
            VERIFIED DOMAIN SCOPE
          </span>
          <div className="flex items-center gap-2.5">
            <span className="status-pip status-pip-emerald" />
            <span className="text-base sm:text-lg text-white font-mono font-medium">
              {userDomain}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex h-10 w-10 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] items-center justify-center text-accent-cyan">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      {/* Scan Trigger Panel */}
      <div className="glass-panel card-glow rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-base font-semibold text-white">
              Execute Passive Surface Check
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl leading-relaxed">
              UnveiledLens searches indexed intelligence resources and validates reachable technical surfaces without exposing raw sensitive strings.
            </p>
          </div>

          <button
            onClick={handleSearch}
            disabled={isScanning || userDomain === '...'}
            className="btn-primary self-start md:self-auto text-xs uppercase tracking-wider font-semibold px-6 py-3 shrink-0 gap-2"
          >
            {isScanning ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Analyzing Domain...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Run Security Check</span>
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

      {/* Sophisticated Scanning Animation State */}
      {isScanning && (
        <div className="glass-panel rounded-2xl border border-[var(--border-primary)] p-10 mb-8 text-center relative overflow-hidden">
          {/* Subtle radar circle */}
          <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-accent-cyan/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-accent-cyan/30 animate-pulse" />
            <div className="h-14 w-14 rounded-full bg-[var(--bg-surface-soft)] border border-accent-cyan/50 flex items-center justify-center text-accent-cyan shadow-[0_0_20px_rgba(18,168,174,0.2)]">
              <Radar className="h-7 w-7 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] mb-3">
            <span className="status-pip status-pip-cyan status-pulse" />
            <span className="font-mono text-xs text-accent-cyan tracking-widest uppercase">
              {SCAN_STAGES[scanStageIndex]}
            </span>
          </div>

          <h2 className="text-lg font-medium text-white mb-2">
            Investigating External Surface
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto font-mono">
            Evaluating search indices and public boundary configurations...
          </p>
        </div>
      )}

      {/* Report Section */}
      {report && !isScanning && (
        <div className="space-y-6">
          {/* Main Status Hero Card */}
          <div className="glass-panel card-glow rounded-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500 mb-2">
                    EXPOSURE STATUS
                  </div>
                  <div className="flex items-center gap-3">
                    {report.exposureLevel === 'NO_SIGNIFICANT_SIGNALS' ? (
                      <CheckCircle className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <Activity className="h-6 w-6 text-accent-cyan" />
                    )}
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {getExposureLabel()}
                    </h2>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mt-3 max-w-2xl leading-relaxed">
                    {getExposureDescription()}
                  </p>

                  <div className="mt-6">
                    <button
                      onClick={handlePdfDownload}
                      disabled={isPdfLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-glass-border bg-[var(--bg-surface-soft)] text-gray-300 hover:text-white hover:border-accent-cyan/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="h-4 w-4 text-accent-cyan" />
                      <span className="text-xs font-mono uppercase tracking-wider">{isPdfLoading ? 'Generating PDF...' : 'Export PDF'}</span>
                    </button>
                  </div>
                </div>

                <div className="lg:text-right border-t lg:border-t-0 pt-4 lg:pt-0 border-[var(--border-subtle)]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
                    POTENTIAL SIGNALS
                  </span>
                  <span className="text-4xl sm:text-5xl font-mono font-bold text-white block mt-1 number-entrance">
                    {report.summary?.potentialSignals ?? 0}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 block mt-1">
                    INDEXED SIGNALS IDENTIFIED
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] px-6 sm:px-8 py-3 bg-[var(--bg-surface-soft)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <span className="text-gray-500">LAST EVALUATION</span>
              <span className="text-gray-400">
                {report.scannedAt ? new Date(report.scannedAt).toLocaleString() : 'Unavailable'}
              </span>
            </div>
          </div>

          {/* 4 Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryMetricCard
              icon={Search}
              label="Public Discoveries"
              value={report.summary?.publiclyDiscovered ?? 0}
              description="Indexed resources reviewed"
              staggerClass="stagger-1"
            />
            <SummaryMetricCard
              icon={FileText}
              label="API Signals"
              value={report.summary?.apiSignals ?? 0}
              description="Technical endpoints exposed"
              staggerClass="stagger-2"
            />
            <SummaryMetricCard
              icon={Database}
              label="Storage Signals"
              value={report.summary?.storageSignals ?? 0}
              description="Cloud storage references"
              staggerClass="stagger-3"
            />
            <SummaryMetricCard
              icon={Info}
              label="Config Signals"
              value={report.summary?.configurationSignals ?? 0}
              description="Configuration exposures"
              staggerClass="stagger-4"
            />
          </div>

          {/* Privacy Note */}
          <div className="glass-panel rounded-xl p-5 border border-glass-border">
            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center shrink-0 text-accent-cyan">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-white">
                  Privacy-Conscious Intelligence Reporting
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Your exposure overview intentionally masks raw URLs, specific tokens, and internal keys. 
                  This aggregate report identifies exposure posture without publicizing actionable attack targets.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2.5 px-2 text-xs text-gray-500 font-mono">
            <Info className="h-3.5 w-3.5 text-gray-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Scan output is an external risk assessment based on indexed public data. It does not constitute an internal vulnerability audit.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!report && !isScanning && !error && (
        <div className="glass-panel rounded-xl p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center mb-4 text-accent-cyan">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-white">
            Security Intelligence Ready
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Execute a security check to inspect publicly discoverable technical signals for {userDomain}.
          </p>
        </div>
      )}

    </div>
  );
}

function SummaryMetricCard({
  icon: Icon,
  label,
  value,
  description,
  staggerClass
}) {
  return (
    <div className={`glass-panel card-interactive rounded-xl p-5 ${staggerClass}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="h-8 w-8 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center text-gray-400">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-2xl font-mono font-bold text-white number-entrance">
          {value}
        </span>
      </div>
      <p className="text-xs font-semibold text-white">
        {label}
      </p>
      <p className="text-[11px] text-gray-500 mt-0.5">
        {description}
      </p>
    </div>
  );
}
