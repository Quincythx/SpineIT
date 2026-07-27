import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
  }, [initialMode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        await login({ username, password });
      } else {
        await register({ username, email, password });
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let detail = 'Authentication failed. Please check credentials.';
      
      if (err.response?.data?.detail) {
        detail = err.response.data.detail;
      } else if (err.response?.data) {
        // Handle DRF validation errors (may be an object with field names)
        const data = err.response.data;
        if (typeof data === 'string') {
          detail = data;
        } else {
          // Collect all error messages from all fields
          const messages: string[] = [];
          Object.entries(data).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              messages.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              messages.push(errors);
            }
          });
          detail = messages.length > 0 ? messages.join('; ') : 'Authentication failed. Please check credentials.';
        }
      } else if (err.message && !err.response) {
        detail = 'Network error. Please check your connection and try again.';
      }
      
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] border border-[#EAE0D0] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header Tabs */}
        <div className="flex border-b border-[#EAE0D0] bg-[#F5EFE6]">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors ${
              mode === 'login'
                ? 'bg-[#FDFBF7] text-[#1C1917] border-b-2 border-[#854D0E]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <LogIn className="w-4 h-4 text-[#854D0E]" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors ${
              mode === 'register'
                ? 'bg-[#FDFBF7] text-[#1C1917] border-b-2 border-[#854D0E]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#854D0E]" />
            <span>Create Account</span>
          </button>

          <button
            onClick={onClose}
            className="p-4 text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div className="text-center mb-4">
            <h3 className="font-serif-editorial text-2xl font-bold text-[#1C1917]">
              {mode === 'login' ? 'Welcome Back' : 'Join SpineIT'}
            </h3>
            <p className="text-xs text-[#78716C] mt-1">
              {mode === 'login'
                ? 'Enter your credentials to access your literary collection.'
                : 'Create your account to start writing and saving reviews.'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-[#991B1B]/10 border border-[#991B1B]/30 rounded-xl text-xs text-[#991B1B] font-medium">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. quincy_dev"
              required
              className="w-full px-4 py-2.5 bg-[#F5EFE6] border border-[#EAE0D0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#854D0E]/30"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 bg-[#F5EFE6] border border-[#EAE0D0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#854D0E]/30"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 bg-[#F5EFE6] border border-[#EAE0D0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#854D0E]/30"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-[#854D0E] hover:bg-[#B45309] text-[#FDFBF7] text-sm font-semibold shadow-md disabled:opacity-50 transition-all mt-4"
          >
            {isSubmitting
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

      </div>
    </div>
  );
};
