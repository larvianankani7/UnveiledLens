import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import CyberBackground from './components/CyberBackground.jsx';
import IntroExperience from './components/Intro/IntroExperience.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

import Landing from './pages/Landing/Landing.jsx';

import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import AdminRequest from './pages/Auth/AdminRequest.jsx';
import AdminVerify from './pages/Auth/AdminVerify.jsx';
import AdminApproval from './pages/Auth/AdminApproval.jsx';

import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import SearchResults from './pages/SearchResults/SearchResults.jsx';
import Settings from './pages/Settings/Settings.jsx';

function App() {
    React.useEffect(() => {
        const savedTheme = localStorage.getItem('unveiledlens-theme') || 'dark';
        document.documentElement.dataset.theme = savedTheme;
    }, []);

    return (
        <div className="relative min-h-screen selection:bg-[#06483F] selection:text-white">
            <IntroExperience />
            <CyberBackground />
            <Routes>
                <Route element={<MainLayout />}>
                    <Route
                        path="/"
                        element={<Landing />}
                    />
                    <Route
                        path="/search"
                        element={<SearchResults />}
                    />
                    <Route
                        path="/settings"
                        element={<Settings />}
                    />
                </Route>

                <Route element={<AuthLayout />}>
                    <Route
                        path="/login"
                        element={<Login />}
                    />
                    <Route
                        path="/register"
                        element={<Register />}
                    />
                    <Route
                        path="/admin-request"
                        element={<AdminRequest />}
                    />
                    <Route
                        path="/admin-verify"
                        element={<AdminVerify />}
                    />
                    <Route
                        path="/admin-approval/:token"
                        element={<AdminApproval />}
                    />
                </Route>

                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />
                <Route
                    path="/adminDashboard"
                    element={<Navigate to="/admin" replace />}
                />
            </Routes>
        </div>
    );
}

export default App;