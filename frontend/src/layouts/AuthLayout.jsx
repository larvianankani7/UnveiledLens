import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ScanSearch } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-accent-burnt selection:text-white relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent-dark/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-burnt/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <ScanSearch className="h-8 w-8 text-accent-amber" />
            <span className="font-bold text-2xl tracking-tight text-white">
              UnveiledLens
            </span>
          </Link>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="glass-panel py-8 px-4 sm:px-10 rounded-xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
