import React from 'react';
import { Routes, Route } from 'react-router-dom';

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
    return (
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

        </Routes>
    );
}

export default App;