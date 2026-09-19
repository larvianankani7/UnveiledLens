import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone } from 'lucide-react';

export default function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login -> redirect to search results
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('role', isAdmin ? 'ROLE_ADMIN' : 'ROLE_USER');
    navigate('/search');
  };

  return (
    <div>
      <div className="flex justify-center space-x-4 mb-6 border-b border-glass-border pb-4">
        <button
          onClick={() => setIsAdmin(false)}
          className={`text-sm font-medium transition-colors ${!isAdmin ? 'text-accent-amber' : 'text-gray-400 hover:text-white'}`}
        >
          User Login
        </button>
        <button
          onClick={() => setIsAdmin(true)}
          className={`text-sm font-medium transition-colors ${isAdmin ? 'text-accent-amber' : 'text-gray-400 hover:text-white'}`}
        >
          Admin Login
        </button>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {isAdmin ? 'Admin Portal' : 'Welcome Back'}
      </h2>
      
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {isAdmin ? 'Phone Number' : 'Email Address'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isAdmin ? (
                <Phone className="h-5 w-5 text-gray-500" />
              ) : (
                <Mail className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <input
              type={isAdmin ? "tel" : "email"}
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm"
              placeholder={isAdmin ? "+1 (555) 000-0000" : "you@example.com"}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-burnt hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-charcoal focus:ring-accent-amber transition-colors glow-amber"
        >
          Sign In
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to={isAdmin ? "/register-admin" : "/register"} className="font-medium text-accent-amber hover:text-accent-burnt transition-colors">
            Register as {isAdmin ? 'Admin' : 'User'}
          </Link>
        </p>
      </div>
    </div>
  );
}
