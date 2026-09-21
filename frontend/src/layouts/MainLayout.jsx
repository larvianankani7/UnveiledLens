import React, {
    useEffect,
    useState
} from 'react';

import {
    Outlet,
    Link,
    useNavigate,
    useLocation
} from 'react-router-dom';

import {
    ScanSearch,
    Settings,
    LogOut
} from 'lucide-react';

export default function MainLayout() {

    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] =
        useState(false);

    const [role, setRole] =
        useState(null);

    useEffect(() => {

        const savedTheme =
            localStorage.getItem(
                'unveiledlens-theme'
            ) || 'dark';

        document.documentElement.dataset.theme =
            savedTheme;

    }, []);

    useEffect(() => {

        const token =
            sessionStorage.getItem('token') ||
            localStorage.getItem('token');

        const savedRole =
            sessionStorage.getItem('role') ||
            localStorage.getItem('role');

        setIsAuthenticated(!!token);
        setRole(savedRole);

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
            savedRole === 'ROLE_ADMIN' &&
            (
                location.pathname === '/search' ||
                location.pathname === '/settings'
            )
        ) {
            navigate('/admin');
            return;
        }

    }, [
        location.pathname,
        navigate
    ]);

    const handleLogout = () => {

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');

        localStorage.removeItem('token');
        localStorage.removeItem('role');

        setIsAuthenticated(false);
        setRole(null);

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

            <header className="border-b border-glass-border bg-[#080808]/80 backdrop-blur-md sticky top-0 z-50">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    <Link
                        to={homePath}
                        className="flex items-center space-x-2 group"
                    >

                        <ScanSearch className="h-6 w-6 text-accent-amber group-hover:text-accent-burnt transition-colors" />

                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-gray-200 transition-colors">
                            UnveiledLens
                        </span>

                    </Link>

                    <nav className="flex items-center space-x-4">

                        {isAuthenticated ? (

                            <>

                                <Link
                                    to="/settings"
                                    className="p-2 text-gray-400 hover:text-accent-amber transition-colors rounded-full hover:bg-glass-light"
                                    title="Settings"
                                >
                                    <Settings className="h-5 w-5" />
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-accent-burnt transition-colors rounded-full hover:bg-glass-light"
                                    title="Log out"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>

                            </>

                        ) : (

                            <>

                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2"
                                >
                                    Sign in
                                </Link>

                                <Link
                                    to="/register"
                                    className="text-sm font-medium bg-accent-burnt hover:bg-accent-dark text-white px-4 py-2 rounded-md transition-all glow-amber"
                                >
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

                <p>
                    © {new Date().getFullYear()} UnveiledLens. All rights reserved.
                </p>

                <p className="text-xs mt-1 text-gray-600">
                    Discover Beyond the Known.
                </p>

            </footer>

        </div>
    );
}