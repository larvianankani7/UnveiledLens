import React, { useEffect } from 'react';
import {
    Outlet,
    Link,
    useNavigate,
    useLocation
} from 'react-router-dom';

import {
    ScanSearch,
    Settings,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';

import { useTheme } from '../hooks/useTheme.js';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('token');

    const role =
        sessionStorage.getItem('role') ||
        localStorage.getItem('role');

    const isAuthenticated = !!token;

    useEffect(() => {
        if (!token) {
            if (
                location.pathname.startsWith('/search') ||
                location.pathname.startsWith('/settings')
            ) {
                navigate('/login');
            }
            return;
        }

        if (
            role === 'ROLE_ADMIN' &&
            (
                location.pathname === '/search' ||
                location.pathname === '/settings'
            )
        ) {
            navigate('/admin');
            return;
        }
    }, [location.pathname, navigate, token, role]);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');

        localStorage.removeItem('token');
        localStorage.removeItem('role');

        navigate('/login', {
            replace: true
        });
    };

    const homePath =
        !isAuthenticated
            ? '/'
            : role === 'ROLE_ADMIN'
                ? '/admin'
                : '/search';

    return (
        <div className="min-h-screen flex flex-col bg-transparent text-gray-200">
            {/* Header Navigation */}
            <header className="border-b border-glass-border bg-[var(--bg-primary)]/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    
                    {/* Brand */}
                    <Link
                        to={homePath}
                        className="flex items-center space-x-3 group focus:outline-none"
                    >
                        <div className="h-9 w-9 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center transition-transform group-hover:border-[var(--accent-cyan)]/40">
                            <ScanSearch className="h-5 w-5 text-accent-cyan transition-transform group-hover:scale-105" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-base tracking-wider uppercase text-white font-mono leading-tight">
                                UNVEILEDLENS
                            </span>
                            <span className="text-[9px] tracking-[0.22em] uppercase text-gray-500 font-mono">
                                DISCOVER BEYOND THE KNOWN.
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Actions */}
                    <nav className="flex items-center space-x-2 sm:space-x-3">
                        {/* Theme Toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-glass-light border border-transparent hover:border-glass-border focus:outline-none"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-4 w-4 text-accent-cyan" />
                            ) : (
                                <Moon className="h-4 w-4 text-gray-400" />
                            )}
                        </button>

                        {isAuthenticated ? (
                            <>
                                {/* User Badge */}
                                <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[var(--bg-surface-soft)] border border-[var(--border-primary)]">
                                    <span className="status-pip status-pip-cyan status-pulse" />
                                    <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-gray-300">
                                        USER
                                    </span>
                                </div>

                                {/* Settings */}
                                <Link
                                    to="/settings"
                                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-glass-light border border-transparent hover:border-glass-border focus:outline-none"
                                    title="Settings"
                                >
                                    <Settings className="h-4 w-4" />
                                </Link>

                                {/* Logout */}
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-glass-light border border-transparent hover:border-glass-border focus:outline-none"
                                    title="Log out"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="btn-ghost text-sm font-medium px-3.5 py-1.5"
                                >
                                    Sign in
                                </Link>

                                <Link
                                    to="/register"
                                    className="btn-primary text-xs tracking-wider uppercase font-semibold px-4 py-2"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative z-10 page-enter">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-glass-border py-8 text-center bg-[var(--bg-primary)]/70 backdrop-blur-sm relative z-10 text-xs text-gray-500">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                        <span className="status-pip status-pip-cyan" />
                        <span className="font-mono text-gray-400 tracking-wider uppercase text-[11px]">
                            UNVEILEDLENS
                        </span>
                        <span className="text-gray-600">—</span>
                        <span className="text-gray-500 font-mono text-[11px]">
                            EXTERNAL EXPOSURE INTELLIGENCE
                        </span>
                    </div>

                    <div className="flex items-center space-x-4 text-gray-500 font-mono text-[11px]">
                        <span>DISCOVER BEYOND THE KNOWN.</span>
                        <span className="text-gray-700">•</span>
                        <span>© {new Date().getFullYear()}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}