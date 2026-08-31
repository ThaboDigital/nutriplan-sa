import React, { useState, useEffect } from 'react';
import { authService, AuthUser } from '../../services/authService';
import { X, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode, isOpen]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { user, error } = await authService.signIn(email, password);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          onSuccess(user);
          onClose();
        }
      } else if (mode === 'register') {
        if (!name.trim()) {
          setErrorMsg('Please enter your name');
          setLoading(false);
          return;
        }
        const { user, error } = await authService.signUp(email, password, name);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          onSuccess(user);
          onClose();
        }
      } else if (mode === 'forgot') {
        const { success, error } = await authService.resetPassword(email);
        if (error) {
          setErrorMsg(error);
        } else if (success) {
          setSuccessMsg('Password reset instructions sent to your email.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) {
        setErrorMsg(error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize Google Sign In.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#E8EDE9]">
        {/* Header */}
        <div className="p-5 bg-[#17211B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="NutriPlan SA"
              className="w-8 h-8 rounded-xl object-cover border border-white/20"
            />
            <div>
              <h3 className="font-extrabold text-sm">
                {mode === 'login' && 'Sign in to NutriPlan SA'}
                {mode === 'register' && 'Create Your NutriPlan Account'}
                {mode === 'forgot' && 'Reset Password'}
              </h3>
              <p className="text-[10px] text-white/70">Sync your meal plans, water & pantry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E8EDE9] bg-[#FFFDF8]">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
              mode === 'login'
                ? 'border-[#3FAE68] text-[#17211B]'
                : 'border-transparent text-[#6B756C] hover:text-[#17211B]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
              mode === 'register'
                ? 'border-[#3FAE68] text-[#17211B]'
                : 'border-transparent text-[#6B756C] hover:text-[#17211B]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Social Sign-In with Google */}
          {mode !== 'forgot' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E8EDE9] bg-white hover:bg-[#F8F9FA] text-[#17211B] font-bold text-xs flex items-center justify-center gap-2.5 shadow-2xs transition active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center my-2">
                <div className="flex-1 border-t border-[#E8EDE9]"></div>
                <span className="px-3 text-[10px] uppercase font-bold text-[#6B756C]">or continue with email</span>
                <div className="flex-1 border-t border-[#E8EDE9]"></div>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-[#17211B] block mb-1">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EDE9] text-xs text-[#17211B] outline-none focus:border-[#3FAE68]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#17211B] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EDE9] text-xs text-[#17211B] outline-none focus:border-[#3FAE68]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#17211B]">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMsg(null); }}
                    className="text-[11px] font-semibold text-[#3FAE68] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EDE9] text-xs text-[#17211B] outline-none focus:border-[#3FAE68]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#3FAE68] text-white hover:bg-[#349859] disabled:opacity-50 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 mt-2"
          >
            <span>
              {loading
                ? 'Connecting to Supabase...'
                : mode === 'login'
                ? 'Sign In to Account'
                : mode === 'register'
                ? 'Create Cloud Account'
                : 'Send Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Modal Footer Attribution */}
          <div className="pt-3 border-t border-[#F0F2F0] text-center">
            <p className="text-[11px] text-[#6B756C]">
              NutriPlan SA • A Product of{' '}
              <a
                href="https://www.thabosystems.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2C854E] hover:text-[#3FAE68] font-bold hover:underline transition"
              >
                Thabo Systems
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};