import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8080';

function AdminDashboard() {

    const navigate = useNavigate();

    const [domain, setDomain] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [adminTheme, setAdminTheme] = useState(() => {
        return localStorage.getItem('unveiledlens-theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.dataset.theme = adminTheme;
    }, [adminTheme]);

    const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('token');

    const role =
        sessionStorage.getItem('role') ||
        localStorage.getItem('role');

    useEffect(() => {
        if (!token || role !== 'ROLE_ADMIN') {
            navigate('/admin-verify', { replace: true });
        }
    }, [navigate, token, role]);

    if (!token || role !== 'ROLE_ADMIN') {
        return null;
    }

    const handleScan = async (event) => {

        event.preventDefault();

        const targetDomain =
            domain
                .trim()
                .replace(/^https?:\/\//i, '')
                .replace(/\/+$/, '');

        if (!targetDomain) {

            setError(
                'Enter a domain to scan.'
            );

            return;
        }

        setError('');
        setReport(null);
        setLoading(true);

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/discovery/scan`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            domain: targetDomain
                        })
                    }
                );

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                clearAuth();

                navigate(
                    '/admin-verify'
                );

                return;
            }

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    'Unable to scan the target domain.'
                );
            }

            setReport(data);

        } catch (scanError) {

            setError(
                scanError.message ||
                'Something went wrong while scanning.'
            );

        } finally {

            setLoading(false);
        }
    };

    const handlePdfDownload = async () => {

        if (!report?.domain) {
            return;
        }

        setError('');
        setPdfLoading(true);

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/discovery/report/pdf`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            domain: report.domain
                        })
                    }
                );

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                clearAuth();

                navigate(
                    '/admin-verify'
                );

                return;
            }

            if (!response.ok) {

                let message =
                    'Unable to generate PDF report.';

                try {

                    const data =
                        await response.json();

                    message =
                        data.message ||
                        message;

                } catch {
                    // Response was not JSON.
                }

                throw new Error(message);
            }

            const blob =
                await response.blob();

            const url =
                window.URL.createObjectURL(blob);

            const anchor =
                document.createElement('a');

            anchor.href = url;

            anchor.download =
                `unveiledlens-${report.domain}-report.pdf`;

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            window.URL.revokeObjectURL(url);

        } catch (pdfError) {

            setError(
                pdfError.message ||
                'Unable to generate PDF report.'
            );

        } finally {

            setPdfLoading(false);
        }
    };

    const clearAuth = () => {

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');

        localStorage.removeItem('token');
        localStorage.removeItem('role');
    };

    const handleLogout = () => {

        clearAuth();

        navigate(
            '/',
            {
                replace: true
            }
        );
    };

    const summary =
        report?.summary || {};

    const findings =
        report?.findings || [];

    return (
        <div className="admin-dashboard relative z-10 page-enter">

            <header className="admin-dashboard-header">

                <div>

                    <div className="admin-brand">
                        UNVEILEDLENS
                    </div>

                    <h1>
                        Security Intelligence
                    </h1>

                    <p>
                        Discover publicly exposed resources
                        across any target domain.
                    </p>

                </div>

                <div className="admin-header-actions">

                    <span className="admin-role-badge">
                        ADMIN
                    </span>

                    <button
                        type="button"
                        onClick={() => {
                            const newTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
                            document.documentElement.dataset.theme = newTheme;
                            localStorage.setItem('unveiledlens-theme', newTheme);
                            setAdminTheme(newTheme);
                        }}
                        className="admin-theme-button p-2 text-gray-400 hover:text-accent-cyan transition-colors rounded-md border border-transparent hover:border-glass-border hover:bg-glass-light flex items-center justify-center"
                        title="Toggle theme"
                    >
                        {adminTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </button>

                    <button
                        type="button"
                        className="admin-logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            <main className="admin-dashboard-content">

                <section className="admin-scan-panel">

                    <div className="admin-section-heading">

                        <span className="admin-section-label">
                            TARGET SCAN
                        </span>

                        <h2>
                            Scan a domain
                        </h2>

                        <p>
                            Enter any public domain to begin
                            an external exposure discovery scan.
                        </p>

                    </div>


                    <form
                        className="admin-domain-form"
                        onSubmit={handleScan}
                    >

                        <div className="admin-domain-input-wrapper">

                            <span className="admin-input-prefix">
                                https://
                            </span>

                            <input
                                type="text"
                                value={domain}
                                onChange={(event) =>
                                    setDomain(
                                        event.target.value
                                    )
                                }
                                placeholder="example.com"
                                autoComplete="off"
                                spellCheck="false"
                                disabled={loading}
                            />

                        </div>


                        <button
                            type="submit"
                            className="admin-scan-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="admin-scan-spinner" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    Scan Domain
                                    <span>→</span>
                                </>
                            )}

                        </button>

                    </form>


                    {error && (

                        <div className="admin-error">

                            {error}

                        </div>

                    )}

                </section>


                {report && (

                    <section className="admin-results">

                        <div className="admin-report-header">

                            <div>

                                <span className="admin-section-label">
                                    SECURITY REPORT
                                </span>

                                <h2>
                                    {report.domain}
                                </h2>

                                <p>
                                    Scanned{' '}
                                    {formatDate(
                                        report.scannedAt
                                    )}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-pdf-button"
                                onClick={handlePdfDownload}
                                disabled={pdfLoading}
                            >

                                {pdfLoading
                                    ? 'Generating PDF...'
                                    : 'Export PDF'}

                            </button>

                        </div>


                        <div className="admin-summary-grid">

                            <SummaryCard
                                label="Total Findings"
                                value={
                                    summary.totalFindings ?? 0
                                }
                            />

                            <SummaryCard
                                label="High Severity"
                                value={
                                    summary.highSeverity ?? 0
                                }
                                severity="high"
                            />

                            <SummaryCard
                                label="Medium Severity"
                                value={
                                    summary.mediumSeverity ?? 0
                                }
                                severity="medium"
                            />

                            <SummaryCard
                                label="Low Severity"
                                value={
                                    summary.lowSeverity ?? 0
                                }
                                severity="low"
                            />

                            <SummaryCard
                                label="API Surfaces"
                                value={
                                    summary.apiSurfaces ?? 0
                                }
                            />

                        </div>


                        <div className="admin-category-grid">

                            <CategoryCard
                                label="GraphQL"
                                value={
                                    summary.graphqlSurfaces ?? 0
                                }
                            />

                            <CategoryCard
                                label="Cloud Storage"
                                value={
                                    summary.cloudStorageReferences ?? 0
                                }
                            />

                            <CategoryCard
                                label="Configuration"
                                value={
                                    summary.configurationSignals ?? 0
                                }
                            />

                        </div>


                        <div className="admin-findings-section">

                            <div className="admin-findings-heading">

                                <div>

                                    <span className="admin-section-label">
                                        DISCOVERED EXPOSURES
                                    </span>

                                    <h2>
                                        Findings
                                    </h2>

                                </div>

                                <span className="admin-finding-count">
                                    {findings.length} result
                                    {findings.length === 1
                                        ? ''
                                        : 's'}
                                </span>

                            </div>


                            {findings.length === 0 ? (

                                <div className="admin-empty-state">

                                    <div className="admin-empty-icon">
                                        ✓
                                    </div>

                                    <h3>
                                        No relevant findings
                                    </h3>

                                    <p>
                                        The current discovery checks
                                        did not identify relevant
                                        exposure signals.
                                    </p>

                                </div>

                            ) : (

                                <div className="admin-findings-list">

                                    {findings.map(
                                        (
                                            finding,
                                            index
                                        ) => (

                                            <FindingCard
                                                key={
                                                    `${finding.url || 'finding'}-${index}`
                                                }
                                                finding={
                                                    finding
                                                }
                                            />

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </section>

                )}

            </main>

        </div>
    );
}


function SummaryCard({
    label,
    value,
    severity
}) {

    return (
        <div
            className={
                `admin-summary-card ${
                    severity
                        ? `severity-${severity}`
                        : ''
                }`
            }
        >

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


function CategoryCard({
    label,
    value
}) {

    return (
        <div className="admin-category-card">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


function FindingCard({
    finding
}) {

    const severity =
        String(
            finding.severity || 'LOW'
        ).toLowerCase();

    return (
        <article
            className={
                `admin-finding-card severity-border-${severity}`
            }
        >

            <div className="admin-finding-top">

                <div className="admin-finding-title">

                    <span className="admin-category">
                        {finding.category ||
                            'GENERAL_EXPOSURE'}
                    </span>

                    <div className="finding-redacted-url">

                        <span>
                            {finding.url ||
                                'Redacted resource'}
                        </span>

                        <span className="url-redaction" />

                    </div>

                </div>


                <div className="admin-finding-badges">

                    <span
                        className={
                            `admin-severity severity-${severity}`
                        }
                    >
                        {finding.severity || 'LOW'}
                    </span>

                    <span
                        className={
                            finding.reachable
                                ? 'admin-reachable'
                                : 'admin-unconfirmed'
                        }
                    >
                        {finding.reachable
                            ? 'REACHABLE'
                            : 'NOT CONFIRMED'}
                    </span>

                </div>

            </div>


            <div className="admin-finding-meta">

                <span>
                    Status:
                    <strong>
                        {finding.status ?? '—'}
                    </strong>
                </span>

                <span>
                    Content:
                    <strong>
                        {finding.contentType || '—'}
                    </strong>
                </span>

                <span>
                    Target owned:
                    <strong>
                        {finding.targetOwned
                            ? 'YES'
                            : 'NO'}
                    </strong>
                </span>

                <span>
                    Redirected:
                    <strong>
                        {finding.redirected
                            ? 'YES'
                            : 'NO'}
                    </strong>
                </span>

                <span>
                    Authentication:
                    <strong>
                        {finding.authRequired
                            ? 'REQUIRED'
                            : 'NOT CONFIRMED'}
                    </strong>
                </span>

            </div>


            {finding.riskLevel && (

                <div className="admin-finding-risk">

                    <span>
                        RISK LEVEL
                    </span>

                    <strong>
                        {finding.riskLevel}
                    </strong>

                </div>

            )}


            {finding.corsWildcard && (

                <div className="admin-unconfirmed">

                    WILDCARD CORS DETECTED

                </div>

            )}


            {finding.reason && (

                <div className="admin-finding-reason">

                    <span>
                        ANALYSIS
                    </span>

                    <p>
                        {finding.reason}
                    </p>

                </div>

            )}


            {finding.evidence?.length > 0 && (

                <div className="admin-evidence">

                    <span>
                        EVIDENCE
                    </span>

                    <ul>

                        {finding.evidence.map(
                            (
                                item,
                                index
                            ) => (

                                <li key={index}>
                                    {item}
                                </li>

                            )
                        )}

                    </ul>

                </div>

            )}


            {finding.attackChainSignals?.length > 0 && (

                <div className="admin-evidence">

                    <span>
                        POTENTIAL ATTACK CHAINS
                    </span>

                    <ul>

                        {finding.attackChainSignals.map(
                            (
                                item,
                                index
                            ) => (

                                <li key={index}>
                                    {formatSignal(item)}
                                </li>

                            )
                        )}

                    </ul>

                </div>

            )}


            {finding.compliance?.length > 0 && (

                <div className="admin-evidence">

                    <span>
                        DPDP RELEVANCE
                    </span>

                    <ul>

                        {finding.compliance.map(
                            (
                                item,
                                index
                            ) => (

                                <li key={index}>
                                    {item}
                                </li>

                            )
                        )}

                    </ul>

                </div>

            )}


            {finding.remediation && (

                <div className="admin-finding-reason">

                    <span>
                        RECOMMENDED REMEDIATION
                    </span>

                    <p>
                        {finding.remediation}
                    </p>

                </div>

            )}

        </article>
    );
}


function formatSignal(
    value
) {

    return String(value)
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );
}


function formatDate(
    value
) {

    if (!value) {
        return 'unknown date';
    }

    try {

        return new Date(value)
            .toLocaleString();

    } catch {

        return value;
    }
}


export default AdminDashboard;