import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';
import { Wallet, Mail, Lock, User as UserIcon, Phone, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

interface RegisterForm {
  username: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      username: '',
      password: '',
      fullName: '',
      phoneNumber: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await registerUser(data);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Registration failed. Please check your inputs.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[15%] left-[10%] w-96 h-96 bg-blue-400 rounded-full blur-[120px]" />
        <div className="absolute bottom-[15%] right-[10%] w-80 h-80 bg-teal-700 rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 finance-gradient-hero rounded-2xl text-white shadow-finance-lg mb-3">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create Account
          </h1>
        </div>

        <div className="finance-card p-8 shadow-finance-lg">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400 flex items-start gap-3 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 flex items-start gap-3 text-sm">
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon size={18} />
                </div>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                    errors.fullName
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-finance-border focus:border-teal-600'
                  }`}
                  {...register('fullName', { required: 'Full name is required' })}
                />
              </div>
              {errors.fullName && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.fullName.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="username"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                    errors.username
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-finance-border focus:border-teal-600'
                  }`}
                  {...register('username', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.username && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.username.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="1234567890"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                    errors.phoneNumber
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-finance-border focus:border-teal-600'
                  }`}
                  {...register('phoneNumber', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+() -]{7,20}$/,
                      message: 'Invalid phone number format',
                    },
                  })}
                />
              </div>
              {errors.phoneNumber && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.phoneNumber.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                    errors.password
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-finance-border focus:border-teal-600'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="btn-finance-primary w-full disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Register
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-teal-600 hover:underline font-semibold"
              >
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
