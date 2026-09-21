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
Info
} from 'lucide-react';

const API_BASE_URL =
import.meta.env.VITE_API_BASE_URL ||
'http://localhost:8080';

export default function SearchResults() {

const [isScanning, setIsScanning] = useState(false);
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

    const response =
      await fetch(
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

      const data =
        await response.json();

      setUserDomain(
        data.domain || 'Verified domain'
      );
    }

  } catch (err) {

    console.error(
      'Failed to fetch profile',
      err
    );
  }
};

fetchProfile();


}, []);

const handleSearch = async (event) => {

event.preventDefault();

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

  const response =
    await fetch(
      `${API_BASE_URL}/api/discovery/scan`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  const data =
    await response
      .json()
      .catch(() => null);

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

  console.error(
    'Discovery scan failed',
    err
  );

  setError(
    err instanceof Error
      ? err.message
      : 'Unable to complete the security scan.'
  );

} finally {

  setIsScanning(false);
}


};

const getExposureLabel = () => {


if (!report) {
  return 'Awaiting scan';
}

switch (report.exposureLevel) {

  case 'NO_SIGNIFICANT_SIGNALS':
    return 'No significant signals';

  case 'LIMITED':
    return 'Limited';

  case 'MODERATE':
    return 'Moderate';

  case 'ELEVATED':
    return 'Elevated';

  default:
    return 'Under review';
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
    return 'A small number of technical exposure signals were identified and may deserve review.';

  case 'MODERATE':
    return 'Several technical exposure signals were identified and may deserve further security review.';

  case 'ELEVATED':
    return 'Multiple technical exposure signals were identified and may require closer security review.';

  default:
    return 'The scan identified information that may deserve further security review.';
}


};

return ( <div className="search-results-page flex-1 bg-charcoal px-5 py-8 lg:px-10 lg:py-10">


  <div className="max-w-6xl mx-auto">

    {/* Header */}

    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">

      <div>

        <div className="flex items-center gap-2 mb-3">

          <ShieldCheck
            className="h-5 w-5 text-accent-amber"
          />

          <span className="text-xs uppercase tracking-[0.22em] text-gray-500">
            UnveiledLens
          </span>

        </div>

        <h1 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight">
          Security Exposure Overview
        </h1>

        <p className="text-gray-400 text-sm mt-2 max-w-xl">
          A privacy-conscious summary of publicly discoverable
          technical signals associated with your verified domain.
        </p>

      </div>

      <button
        type="button"
        onClick={() => {
          window.location.href = '/settings';
        }}
        className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-glass-border bg-charcoal-lighter text-gray-300 hover:text-white hover:border-accent-burnt/40 transition-all"
      >
        <Settings className="h-4 w-4" />
        <span className="text-sm">Settings</span>
      </button>

    </div>

    {/* Domain */}

    <div className="glass-panel rounded-2xl border border-glass-border p-5 mb-6">

      <div className="flex items-center justify-between gap-4">

        <div>

          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            Verified domain
          </p>

          <p className="text-lg text-white font-mono break-all">
            {userDomain}
          </p>

        </div>

        <div className="hidden sm:flex h-11 w-11 rounded-xl bg-accent-burnt/10 border border-accent-burnt/20 items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-accent-amber" />
        </div>

      </div>

    </div>

    {/* Scan */}

    <div className="glass-panel rounded-2xl border border-glass-border p-6 mb-8">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        <div>

          <h2 className="text-lg font-medium text-white">
            Check public exposure
          </h2>

          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            UnveiledLens checks publicly indexed technical signals
            without exposing detailed discovery information here.
          </p>

        </div>

        <button
          onClick={handleSearch}
          disabled={
            isScanning ||
            userDomain === '...'
          }
          className="shrink-0 bg-accent-burnt hover:bg-accent-dark text-white px-6 py-3 rounded-xl font-medium transition-all glow-amber disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >

          {isScanning ? (
            <>
              <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Checking...</span>
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

    {/* Error */}

    {error && (

      <div className="rounded-xl border border-red-900/60 bg-red-950/30 px-5 py-4 mb-6 flex items-start gap-3">

        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />

        <div>

          <p className="text-sm font-medium text-red-300">
            Scan unavailable
          </p>

          <p className="text-sm text-red-400/80 mt-1">
            {error}
          </p>

        </div>

      </div>

    )}

    {/* Loading */}

    {isScanning && (

      <div className="glass-panel rounded-2xl border border-glass-border p-10 mb-8 text-center">

        <div className="mx-auto h-14 w-14 rounded-full bg-accent-burnt/10 border border-accent-burnt/20 flex items-center justify-center mb-5">

          <div className="h-7 w-7 border-4 border-accent-burnt/30 border-t-accent-burnt rounded-full animate-spin" />

        </div>

        <h2 className="text-xl font-medium text-white">
          Reviewing your domain
        </h2>

        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Discovery and validation checks are running.
          This may take a moment.
        </p>

      </div>

    )}

    {/* Report */}

    {report && !isScanning && (

      <div className="space-y-6">

        {/* Main status */}

        <div className="glass-panel rounded-2xl border border-glass-border overflow-hidden">

          <div className="p-7 lg:p-9">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">
                  Exposure overview
                </p>

                <div className="flex items-center gap-3">

                  {report.exposureLevel ===
                  'NO_SIGNIFICANT_SIGNALS' ? (

                    <CheckCircle className="h-7 w-7 text-emerald-400" />

                  ) : (

                    <Activity className="h-7 w-7 text-accent-amber" />

                  )}

                  <h2 className="text-3xl font-semibold text-white">
                    {getExposureLabel()}
                  </h2>

                </div>

                <p className="text-gray-400 text-sm mt-4 max-w-2xl leading-6">
                  {getExposureDescription()}
                </p>

              </div>

              <div className="lg:text-right">

                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Potential signals
                </p>

                <p className="text-5xl font-semibold text-white mt-1">
                  {report.summary?.potentialSignals ?? 0}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  identified by current checks
                </p>

              </div>

            </div>

          </div>

          <div className="border-t border-glass-border px-7 lg:px-9 py-4 bg-charcoal-lighter/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <span className="text-xs text-gray-500">
              Last checked
            </span>

            <span className="text-xs text-gray-400 font-mono">
              {report.scannedAt
                ? new Date(report.scannedAt).toLocaleString()
                : 'Unavailable'}
            </span>

          </div>

        </div>

        {/* Summary cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <SummaryCard
            icon={Search}
            label="Publicly discoverable"
            value={
              report.summary?.publiclyDiscovered ?? 0
            }
            description="Indexed resources reviewed"
          />

          <SummaryCard
            icon={FileText}
            label="API-related"
            value={
              report.summary?.apiSignals ?? 0
            }
            description="Technical API signals"
          />

          <SummaryCard
            icon={Database}
            label="Storage-related"
            value={
              report.summary?.storageSignals ?? 0
            }
            description="Storage signals"
          />

          <SummaryCard
            icon={Info}
            label="Configuration"
            value={
              report.summary?.configurationSignals ?? 0
            }
            description="Configuration signals"
          />

        </div>

        {/* Privacy note */}

        <div className="glass-panel rounded-2xl border border-glass-border p-6">

          <div className="flex items-start gap-4">

            <div className="h-10 w-10 rounded-xl bg-accent-burnt/10 border border-accent-burnt/20 flex items-center justify-center shrink-0">

              <ShieldCheck className="h-5 w-5 text-accent-amber" />

            </div>

            <div>

              <h3 className="text-sm font-medium text-white">
                Privacy-conscious reporting
              </h3>

              <p className="text-sm text-gray-400 mt-2 leading-6 max-w-3xl">
                Your overview intentionally does not display discovered
                URLs, search results, technical evidence, or other
                detailed security information. This page provides only
                an aggregate view of the current scan.
              </p>

            </div>

          </div>

        </div>

        {/* Disclaimer */}

        <div className="flex items-start gap-3 px-2 pb-4">

          <Info className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />

          <p className="text-xs text-gray-500 leading-5">
            A scan result is an indication based on the discovery
            checks performed by UnveiledLens. It does not guarantee
            that a domain has no security issues.
          </p>

        </div>

      </div>

    )}

    {/* Empty state */}

    {!report && !isScanning && !error && (

      <div className="glass-panel rounded-2xl border border-glass-border p-12 lg:p-16 text-center">

        <div className="mx-auto h-16 w-16 rounded-2xl bg-accent-burnt/10 border border-accent-burnt/20 flex items-center justify-center mb-5">

          <ShieldCheck className="h-8 w-8 text-accent-amber" />

        </div>

        <h2 className="text-xl font-medium text-white">
          Your exposure overview is ready
        </h2>

        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto leading-6">
          Run a security check to see a simple overview of the
          publicly discoverable technical signals associated
          with your verified domain.
        </p>

      </div>

    )}

  </div>

</div>


);
}

function SummaryCard({
icon: Icon,
label,
value,
description
}) {

return (


<div className="glass-panel rounded-2xl border border-glass-border p-5">

  <div className="flex items-center justify-between">

    <div className="h-10 w-10 rounded-xl bg-charcoal-lighter border border-glass-border flex items-center justify-center">

      <Icon className="h-5 w-5 text-gray-400" />

    </div>

    <span className="text-2xl font-semibold text-white">
      {value}
    </span>

  </div>

  <p className="text-sm font-medium text-white mt-4">
    {label}
  </p>

  <p className="text-xs text-gray-500 mt-1">
    {description}
  </p>

</div>


);
}
