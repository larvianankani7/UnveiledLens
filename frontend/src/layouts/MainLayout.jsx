import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ScanSearch, Settings, LogOut } from 'lucide-react';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Real auth check using sessionStorage or localStorage
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Auth guards
    if (!token && (location.pathname.startsWith('/search') || location.pathname.startsWith('/settings'))) {
      navigate('/login');
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-gray-200">
      <header className="border-b border-glass-border bg-[#080808]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={isAuthenticated ? "/search" : "/"} className="flex items-center space-x-2 group">
            <ScanSearch className="h-6 w-6 text-accent-amber group-hover:text-accent-burnt transition-colors group-hover:drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]" />
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-gray-200 transition-colors">
              UnveiledLens
            </span>
          </Link>
          
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/settings" 
                  className="p-2 text-gray-400 hover:text-accent-amber transition-colors rounded-full hover:bg-glass-light focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  title="Settings"
                >
                  <Settings className="h-5 w-5 drop-shadow-md" />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-accent-burnt transition-colors rounded-full hover:bg-glass-light focus:outline-none focus:ring-2 focus:ring-accent-burnt"
                  title="Log out"
                >
                  <LogOut className="h-5 w-5 drop-shadow-md" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2 hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]">
                  Sign in
                </Link>
                <Link to="/register" className="text-sm font-medium bg-accent-burnt hover:bg-accent-dark text-white px-4 py-2 rounded-md transition-all glow-amber hover:scale-105 active:scale-95">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>
      
      <footer className="border-t border-glass-border py-8 text-center text-sm text-gray-500 bg-[#050505]/50 relative z-10">
        <p>Ac {new Date().getFullYear()} UnveiledLens. All rights reserved.</p>
      </footer>
    </div>
  );
}
