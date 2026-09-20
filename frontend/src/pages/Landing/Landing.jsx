import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldAlert, ShieldCheck, ArrowRight, Database, Lock } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col relative overflow-hidden">
      {/* Background glow for hero */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-dark/20 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
          <span className="block text-white mb-2 watery-hover cursor-default">Discover Beyond</span>
          <span className="block text-gradient-animated pb-2">The Known.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-400 mx-auto mb-10">
          UnveiledLens identifies publicly discoverable exposure signals through search-engine intelligence. 
          Discover what the public web has already revealed about your external surface.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register" className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-burnt hover:bg-accent-dark transition-colors glow-amber">
            Start Discovery
            <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
          </Link>
          <Link to="/login" className="inline-flex justify-center items-center px-8 py-3 border border-glass-border text-base font-medium rounded-md text-gray-300 bg-glass-light hover:bg-glass-border transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      {/* Explanation Section */}
      <section className="py-24 bg-charcoal-light/50 relative border-y border-glass-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Turns publicly discoverable exposure signals into actionable security findings without invasive scanning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-panel p-6 rounded-xl relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-burnt/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <Search className="h-10 w-10 text-accent-amber mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">1. Public Search</h3>
              <p className="text-sm text-gray-400">Leverages search-engine intelligence to discover exposed API endpoints and storage resources.</p>
            </div>
            
            <div className="glass-panel p-6 rounded-xl relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-burnt/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <ShieldCheck className="h-10 w-10 text-accent-amber mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">2. Safe Validation</h3>
              <p className="text-sm text-gray-400">Performs non-destructive validation to safely determine accessibility without authentication.</p>
            </div>

            <div className="glass-panel p-6 rounded-xl relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-burnt/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <Lock className="h-10 w-10 text-accent-amber mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">3. Redaction</h3>
              <p className="text-sm text-gray-400">Automatically redacts sensitive evidence like tokens and passwords before storage.</p>
            </div>

            <div className="glass-panel p-6 rounded-xl relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-burnt/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <ShieldAlert className="h-10 w-10 text-accent-amber mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">4. Interpretation</h3>
              <p className="text-sm text-gray-400">Provides privacy-conscious security findings and AI-driven remediation advice.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Detail */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Verified Ownership</h2>
            <p className="text-gray-400 mb-6 text-lg">
              UnveiledLens operates strictly within a verified security boundary. Active scanning and validation are only performed after domain ownership is proven.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-5 w-5 rounded-full bg-accent-burnt/20 flex items-center justify-center border border-accent-burnt/50">
                    <div className="h-2 w-2 rounded-full bg-accent-amber"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-300">Email-to-Domain consistency checks</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-5 w-5 rounded-full bg-accent-burnt/20 flex items-center justify-center border border-accent-burnt/50">
                    <div className="h-2 w-2 rounded-full bg-accent-amber"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-300">DNS TXT record verification fallback</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-5 w-5 rounded-full bg-accent-burnt/20 flex items-center justify-center border border-accent-burnt/50">
                    <div className="h-2 w-2 rounded-full bg-accent-amber"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-300">Isolated Admin verification flows</p>
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-accent-dark/20 blur-[80px] rounded-full"></div>
            <div className="glass-panel rounded-xl p-8 border border-glass-border relative z-10">
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between items-center text-gray-400 border-b border-glass-border pb-2">
                  <span>Domain</span>
                  <span>Status</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="flex items-center"><Database className="h-4 w-4 mr-2 text-gray-500" /> yourdomain.com</span>
                  <span className="text-accent-amber bg-accent-burnt/10 px-2 py-1 rounded text-xs">VERIFIED</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="flex items-center"><Database className="h-4 w-4 mr-2 text-gray-500" /> api.yourdomain.com</span>
                  <span className="text-gray-400 bg-gray-800 px-2 py-1 rounded text-xs">PENDING TXT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
