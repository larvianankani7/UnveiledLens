import React from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, User, Shield, Bell, ChevronLeft } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/search" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-accent-amber transition-colors drop-shadow-sm">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Search
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4 flex items-center">
          <SettingsIcon className="h-8 w-8 mr-3 text-accent-burnt drop-shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
          Settings
        </h1>
      </div>

      <div className="space-y-6">
        <div className="glass-panel rounded-xl p-6 transition-all hover:border-glass-border/80 hover:shadow-lg">
          <div className="flex items-center mb-4 border-b border-glass-border pb-4">
            <User className="h-6 w-6 text-accent-amber mr-3" />
            <h2 className="text-xl font-semibold text-white">Account Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email / Phone</label>
              <input type="text" disabled value="Authenticated User" className="block w-full bg-[#050505] border border-glass-border rounded-md py-2 px-3 text-gray-300 cursor-not-allowed shadow-inner" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-burnt/20 text-accent-amber border border-accent-burnt/30 shadow-sm">
                {localStorage.getItem('role') === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 transition-all hover:border-glass-border/80 hover:shadow-lg">
          <div className="flex items-center mb-4 border-b border-glass-border pb-4">
            <Shield className="h-6 w-6 text-accent-amber mr-3" />
            <h2 className="text-xl font-semibold text-white">Security & API</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">API Access Token</label>
              <div className="flex space-x-2">
                <input type="password" disabled value="************************" className="block w-full bg-[#050505] border border-glass-border rounded-md py-2 px-3 text-gray-300 cursor-not-allowed shadow-inner" />
                <button className="px-4 py-2 border border-glass-border rounded-md text-sm font-medium text-gray-300 hover:text-white hover:border-accent-amber transition-colors hover:shadow-[0_0_8px_rgba(217,119,6,0.3)]">
                  Reveal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
