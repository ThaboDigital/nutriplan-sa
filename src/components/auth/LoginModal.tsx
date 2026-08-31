import React, { useState } from 'react';
import { authService, AuthUser } from '../../services/authService';
import { X, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
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
        </form>
      </div>
    </div>
  );
};