import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // Check for email change success
  const emailChanged = searchParams.get('email_changed') === '1';
  const newEmail = searchParams.get('new_email');
  const verificationFailed = searchParams.get('verification_failed') === '1';
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);
  
  // Set the new email if provided
  React.useEffect(() => {
    if (newEmail && !verificationFailed) {
      const decodedEmail = decodeURIComponent(newEmail);
      setEmail(decodedEmail);
      console.log('📧 Auto-filled email from URL:', decodedEmail);
    }
  }, [newEmail, verificationFailed]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting login with email:', email);
      const success = await login(email, password);
      
      if (success) {
        console.log('✅ Login successful, redirecting to admin dashboard');
        navigate('/admin');
      } else {
        console.log('❌ Login failed');
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100 mt-1">
              {emailChanged && !verificationFailed ? 'Your email has been verified and changed. Please log in with your new email and password.' : 'Login to manage your projects'}
            </p>
          </div>
          
          <div className="p-8">
            {emailChanged && !verificationFailed && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">Email Successfully Changed!</p>
                    <p className="text-green-700 dark:text-green-400 text-sm">
                      Your email verification was successful! Please log in with your new email address{newEmail ? `: ${decodeURIComponent(newEmail)}` : ''}. 
                      For security, you have been automatically signed out from all devices and browsers. Your password remains the same.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 ${
                      emailChanged && !verificationFailed ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {emailChanged && !verificationFailed && newEmail ? `✅ New email auto-filled after verification: ${decodeURIComponent(newEmail)}` : 'Demo: admin@example.com'}
                </p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Demo: admin123</p>
                {emailChanged && !verificationFailed && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    ✅ Your password remains the same as before the email verification
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;