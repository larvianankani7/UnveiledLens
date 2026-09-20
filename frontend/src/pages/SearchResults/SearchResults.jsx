import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, Database, FileText, Download, ChevronRight, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function SearchResults() {
  const [isScanning, setIsScanning] = useState(false);
  const [userDomain, setUserDomain] = useState('...');
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
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
          setUserDomain(data.domain);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsScanning(true);
    setError(null);
    setReport(null);

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/discovery/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) {
        throw new Error('Scan failed. Please try again.');
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'MEDIUM': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <div className="flex-1 bg-charcoal p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Discovery & Validation</h1>
            <p className="text-gray-400 text-sm mt-1">
              Active verification context: <span className="text-white font-mono bg-charcoal-lighter px-2 py-1 rounded ml-1 border border-glass-border">{userDomain}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white bg-charcoal-lighter border border-glass-border px-4 py-2 rounded-md transition-colors" disabled={!report}>
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Scan Bar */}
        <div className="glass-panel rounded-xl transition-all hover:border-glass-border/80 hover:shadow-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-charcoal-lighter border border-glass-border flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-accent-amber" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Target Domain</p>
              <p className="text-gray-400 text-xs font-mono">{userDomain}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSearch}
              disabled={isScanning || userDomain === '...'}
              className="bg-accent-burnt hover:bg-accent-dark text-white px-6 py-2 rounded-lg font-medium transition-colors glow-amber disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isScanning ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Scanning...</span>
                </>
              ) : (
                <span>Start Discovery Scan</span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Scan Status / Shell Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          
          {/* Main Results Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-xl transition-all hover:border-glass-border/80 hover:shadow-lg overflow-hidden border border-glass-border">
              <div className="px-6 py-4 border-b border-glass-border bg-charcoal-lighter/50 flex justify-between items-center">
                <h3 className="font-semibold text-white flex items-center space-x-2">
                  <span>Discovered Assets</span>
                  {report && (
                    <span className="bg-charcoal-light text-xs px-2 py-0.5 rounded-full border border-glass-border">{report.summary.totalFindings}</span>
                  )}
                </h3>
                <span className="text-xs font-mono text-gray-400">
                  {isScanning ? "Scanning in progress..." : (report ? `Completed ${report.scannedAt}` : "Waiting for discovery...")}
                </span>
              </div>
              
              {!report && !isScanning && (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-charcoal-lighter flex items-center justify-center mb-4 border border-glass-border">
                    <Search className="h-8 w-8 text-gray-500" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">No active scan results</h4>
                  <p className="text-gray-400 max-w-sm text-sm">
                    Click the scan button above to begin the discovery process using search-engine intelligence.
                  </p>
                </div>
              )}

              {isScanning && (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-charcoal-lighter flex items-center justify-center mb-4 border border-glass-border">
                    <div className="h-8 w-8 border-4 border-accent-burnt/30 border-t-accent-burnt rounded-full animate-spin"></div>
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2 animate-pulse">Running Discovery Pipeline...</h4>
                  <p className="text-gray-400 max-w-sm text-sm">
                    Querying search engines, classifying assets, and performing safe validation checks.
                  </p>
                </div>
              )}

              {report && report.findings && report.findings.length > 0 && (
                <div className="divide-y divide-glass-border">
                  {report.findings.map((finding, idx) => (
                    <div key={idx} className="p-4 hover:bg-charcoal-lighter/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 overflow-hidden pr-4">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityColor(finding.severity)}`}>
                              {finding.severity}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">{finding.category}</span>
                            {finding.reachable ? (
                              <span className="flex items-center text-[10px] text-emerald-400"><CheckCircle className="h-3 w-3 mr-1" />Reach</span>
                            ) : (
                              <span className="flex items-center text-[10px] text-gray-500"><Info className="h-3 w-3 mr-1" />Unreach</span>
                            )}
                          </div>
                          <a href={finding.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-accent-amber truncate block mt-2">
                            {finding.url}
                          </a>
                          <p className="text-xs text-gray-400 mt-1">{finding.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {report && report.findings && report.findings.length === 0 && (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-charcoal-lighter flex items-center justify-center mb-4 border border-glass-border">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">No exposures found</h4>
                  <p className="text-gray-400 max-w-sm text-sm">
                    The discovery pipeline did not identify any publicly indexed exposures.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-panel rounded-xl transition-all hover:border-glass-border/80 hover:shadow-lg p-6 border border-glass-border">
              <h3 className="font-semibold text-white mb-4">Discovery Context</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-charcoal-lighter rounded-lg border border-glass-border">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Storage Resources</p>
                      <p className="text-xs text-gray-500">Buckets, blobs, shares</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-gray-400">{report ? report.summary.cloudStorageReferences : 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-charcoal-lighter rounded-lg border border-glass-border">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">API Endpoints</p>
                      <p className="text-xs text-gray-500">Swagger, GraphQL, REST</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-gray-400">{report ? report.summary.apiSurfaces : 0}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-xl transition-all hover:border-glass-border/80 hover:shadow-lg p-6 border border-glass-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-burnt/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>
              <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-accent-amber" />
                <span>AI Interpretation</span>
              </h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                The Ollama analyst interpreted the findings and provided privacy-conscious security reasoning alongside each discovered asset.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
