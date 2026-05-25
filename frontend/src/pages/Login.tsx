import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';
import { Wallet, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginForm {
  username: string;
  password: string;
}

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setLoading(true);
    try {
      await login(data);
      navigate('/');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="auth-blob-slate top-[15%] left-[10%]" />
        <div className="auth-blob-teal bottom-[15%] right-[10%]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 finance-gradient-hero rounded-2xl text-white shadow-finance-lg mb-3">
            <Wallet size={32} />
          </div>
          <h1 className="page-title text-center">Welcome Back</h1>
        </div>

        <div className="finance-card p-8 shadow-finance-lg">
          {error && (
            <div className="mb-6 alert-error">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="username" className="field-label normal-case tracking-normal text-sm">
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
                  className={`input-field pl-10 ${errors.username ? 'input-field-error' : ''}`}
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
              <label htmlFor="password" className="field-label normal-case tracking-normal text-sm">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input-field pl-10 ${errors.password ? 'input-field-error' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
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
              disabled={loading}
              className="btn-finance-primary w-full disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-teal-600 hover:underline font-semibold"
              >
                Create Account
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
