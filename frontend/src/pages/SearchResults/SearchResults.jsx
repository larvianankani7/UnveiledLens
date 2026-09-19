import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, Database, FileText, Download, ChevronRight } from 'lucide-react';

export default function SearchResults() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="flex-1 bg-charcoal p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Discovery & Validation</h1>
            <p className="text-gray-400 text-sm mt-1">
              Active verification context: <span className="text-white font-mono bg-charcoal-lighter px-2 py-1 rounded ml-1 border border-glass-border">example.com</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white bg-charcoal-lighter border border-glass-border px-4 py-2 rounded-md transition-colors">
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-panel rounded-xl transition-all hover:border-glass-border/80 hover:shadow-lg p-2 flex items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter domain or subdomain to discover exposures..."
              className="w-full bg-transparent border-none text-white pl-10 pr-4 py-3 focus:outline-none focus:ring-0 placeholder-gray-500"
            />
          </div>
          <div className="flex-shrink-0 px-2 flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Filter className="h-5 w-5" />
            </button>
            <button
              onClick={handleSearch}
              disabled={isScanning}
              className="bg-accent-burnt hover:bg-accent-dark text-white px-6 py-2 rounded-lg font-medium transition-colors glow-amber disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isScanning ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Discovering...</span>
                </>
              ) : (
                <span>Scan</span>
              )}
            </button>
          </div>
        </div>

        {/* Scan Status / Shell Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          
          {/* Main Results Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-xl transition-all hover:border-glass-border/80 hover:shadow-lg overflow-hidden border border-glass-border">
              <div className="px-6 py-4 border-b border-glass-border bg-charcoal-lighter/50 flex justify-between items-center">
                <h3 className="font-semibold text-white">Discovered Assets</h3>
                <span className="text-xs font-mono text-gray-400">Waiting for discovery...</span>
              </div>
              
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-charcoal-lighter flex items-center justify-center mb-4 border border-glass-border">
                  <Search className="h-8 w-8 text-gray-500" />
                </div>
                <h4 className="text-lg font-medium text-white mb-2">No active scan results</h4>
                <p className="text-gray-400 max-w-sm text-sm">
                  Enter a verified domain above to begin the discovery process using search-engine intelligence.
                </p>
              </div>

              {/* Placeholder for future findings shell */}
              {/* <div className="divide-y divide-glass-border">
                <div className="p-4 hover:bg-charcoal-lighter/50 transition-colors cursor-pointer flex items-start space-x-4">
                  ...
                </div>
              </div> */}
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
                  <span className="text-sm font-mono text-gray-400">0</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-charcoal-lighter rounded-lg border border-glass-border">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">API Endpoints</p>
                      <p className="text-xs text-gray-500">Swagger, GraphQL, REST</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-gray-400">0</span>
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
                Once resources are discovered, the Ollama analyst will provide privacy-conscious security findings and remediation advice here.
              </p>
              <button disabled className="text-xs font-medium text-accent-amber opacity-50 flex items-center space-x-1 cursor-not-allowed">
                <span>View latest analysis</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
