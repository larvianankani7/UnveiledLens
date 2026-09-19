import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Globe, CheckCircle2, Phone } from 'lucide-react';

export default function Register() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    domain: ''
  });
  const [otp, setOtp] = useState('');
  const [isDnsFallback, setIsDnsFallback] = useState(false);
  const navigate = useNavigate();

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setStep(3);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const renderStep1 = () => (
    <form onSubmit={handleInitialSubmit} className="space-y-6">
      <div className="flex justify-center space-x-4 mb-6 border-b border-glass-border pb-4">
        <button
          type="button"
          onClick={() => { setIsAdmin(false); setFormData({...formData, phone: ''}); }}
          className={`text-sm font-medium transition-all ${!isAdmin ? 'text-accent-amber drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]' : 'text-gray-400 hover:text-white'}`}
        >
          User
        </button>
        <button
          type="button"
          onClick={() => { setIsAdmin(true); setFormData({...formData, email: ''}); }}
          className={`text-sm font-medium transition-all ${isAdmin ? 'text-accent-amber drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]' : 'text-gray-400 hover:text-white'}`}
        >
          Admin
        </button>
      </div>

      {!isAdmin ? (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Company Email</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-accent-amber transition-colors" />
            </div>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm transition-all shadow-inner"
              placeholder="security@example.com"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Mobile Phone Number</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-500 group-focus-within:text-accent-amber transition-colors" />
            </div>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm transition-all shadow-inner"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Requires SMS verification.</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Target Domain</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-500 group-focus-within:text-accent-amber transition-colors" />
          </div>
          <input
            type="text"
            required
            value={formData.domain}
            onChange={(e) => setFormData({...formData, domain: e.target.value})}
            className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm transition-all shadow-inner"
            placeholder="example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-accent-amber transition-colors" />
          </div>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="block w-full pl-10 bg-charcoal-lighter border border-glass-border rounded-md py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber sm:text-sm transition-all shadow-inner"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-burnt hover:bg-accent-dark transition-colors glow-amber"
      >
        Continue
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleVerify} className="space-y-6 text-center">
      <div className="mb-4">
        {isAdmin ? (
          <Phone className="h-12 w-12 text-accent-amber mx-auto mb-4 drop-shadow-[0_0_12px_rgba(217,119,6,0.6)]" />
        ) : (
          <Mail className="h-12 w-12 text-accent-amber mx-auto mb-4 drop-shadow-[0_0_12px_rgba(217,119,6,0.6)]" />
        )}
        <h3 className="text-lg font-medium text-white">
          {isAdmin ? 'Verify your phone' : 'Verify your email'}
        </h3>
        <p className="text-sm text-gray-400 mt-2">
          We've sent a one-time passcode to {isAdmin ? formData.phone : formData.email}.
        </p>
      </div>

      {!isAdmin && isDnsFallback ? (
        <div className="space-y-4 text-left bg-charcoal-lighter p-4 rounded-md border border-glass-border shadow-inner">
          <p className="text-sm text-gray-300">Add the following TXT record to your DNS configuration for <strong className="text-white">{formData.domain}</strong>:</p>
          <div className="bg-charcoal p-3 rounded text-sm font-mono text-accent-amber break-all border border-glass-border">
            unveiledlens-verify=8f7d9a2b3c4e
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-burnt hover:bg-accent-dark transition-colors glow-amber mt-4"
          >
            Verify DNS Record
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsDnsFallback(false)}
              className="text-sm text-gray-400 hover:text-white mt-2 transition-colors"
            >
              Back to Email OTP
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="block w-full text-center tracking-[0.5em] text-2xl bg-charcoal-lighter border border-glass-border rounded-md py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-amber focus:border-accent-amber transition-all shadow-inner"
              placeholder="000000"
              maxLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-burnt hover:bg-accent-dark transition-colors glow-amber"
          >
            Verify OTP
          </button>
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setIsDnsFallback(true)}
              className="text-sm text-gray-400 hover:text-white mt-4 transition-colors"
            >
              OTP not working? Use DNS verification
            </button>
          )}
        </>
      )}
    </form>
  );

  const renderStep3 = () => (
    <div className="text-center py-8">
      <CheckCircle2 className="h-16 w-16 text-accent-amber mx-auto mb-4 drop-shadow-[0_0_15px_rgba(217,119,6,0.8)]" />
      <h3 className="text-xl font-bold text-white">Verification Complete</h3>
      <p className="text-sm text-gray-400 mt-2">Redirecting to login...</p>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Create an Account
      </h2>
      
      <div className="transition-all duration-300">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {step === 1 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent-amber hover:text-accent-burnt transition-colors drop-shadow-[0_0_4px_rgba(217,119,6,0.4)]">
              Sign In
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
