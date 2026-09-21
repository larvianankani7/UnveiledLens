import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8080';

function AdminDashboard() {

    const navigate = useNavigate();

    const [domain, setDomain] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('token');

    const handleScan = async (event) => {

        event.preventDefault();

        const targetDomain =
            domain.trim()
                .replace(/^https?:\/\//i, '')
                .replace(/\/+$/, '');

        if (!targetDomain) {
            setError('Enter a domain to scan.');
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

            if (response.status === 401 ||
                response.status === 403) {

                sessionStorage.removeItem('token');
                localStorage.removeItem('token');
                sessionStorage.removeItem('role');
                localStorage.removeItem('role');

                navigate('/admin-verify');

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

    const handleLogout = () => {

        sessionStorage.removeItem('token');
        localStorage.removeItem('token');

        sessionStorage.removeItem('role');
        localStorage.removeItem('role');

        navigate('/');
    };

    const summary =
        report?.summary || {};

    const findings =
        report?.findings || [];

    return (
        <div className="admin-dashboard">

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
                                    setDomain(event.target.value)
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

                    {loading && (
                        <div className="admin-scan-status">

                            <div className="admin-pulse" />

                            <div>
                                <strong>
                                    Scanning {domain.trim()}
                                </strong>

                                <span>
                                    Discovering indexed assets
                                    and validating exposure signals...
                                </span>
                            </div>

                        </div>
                    )}

                </section>


                {report && !loading && (

                    <section className="admin-report">

                        <div className="admin-report-header">

                            <div>

                                <span className="admin-section-label">
                                    SECURITY REPORT
                                </span>

                                <h2>
                                    {report.domain}
                                </h2>

                            </div>

                            <div className="admin-scan-time">

                                Scanned
                                <br />

                                <strong>
                                    {report.scannedAt
                                        ? new Date(
                                            report.scannedAt
                                        ).toLocaleString()
                                        : '—'}
                                </strong>

                            </div>

                        </div>


                        <div className="admin-summary-grid">

                            <SummaryCard
                                label="Discovered"
                                value={
                                    summary.totalDiscovered ?? 0
                                }
                            />

                            <SummaryCard
                                label="Relevant Assets"
                                value={
                                    summary.relevantAssets ?? 0
                                }
                            />

                            <SummaryCard
                                label="Findings"
                                value={
                                    summary.totalFindings ?? 0
                                }
                            />

                            <SummaryCard
                                label="Reachable"
                                value={
                                    summary.reachableFindings ?? 0
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
                                        (finding, index) => (
                                            <FindingCard
                                                key={`${finding.url || 'finding'}-${index}`}
                                                finding={finding}
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
            className={`admin-summary-card ${
                severity
                    ? `severity-${severity}`
                    : ''
            }`}
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
            className={`admin-finding-card severity-border-${severity}`}
        >

            <div className="admin-finding-top">

                <div className="admin-finding-title">

                    <span className="admin-category">
                        {finding.category ||
                            'GENERAL_EXPOSURE'}
                    </span>

                    <div className="finding-redacted-url">
                        <span>
                            {finding.url || 'Redacted resource'}
                        </span>

                        <span className="url-redaction" />
                    </div>

                </div>


                <div className="admin-finding-badges">

                    <span
                        className={`admin-severity severity-${severity}`}
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

            </div>


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
                            (item, index) => (
                                <li key={index}>
                                    {item}
                                </li>
                            )
                        )}

                    </ul>

                </div>

            )}

        </article>
    );
}


export default AdminDashboard;