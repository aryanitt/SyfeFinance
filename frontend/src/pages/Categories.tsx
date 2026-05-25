import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import type { Category, CategoryType } from '../types';
import {
  Plus,
  Trash2,
  Lock,
  Tag,
  AlertCircle,
  Check,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string; type: CategoryType }>();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get<Category[]>('/api/categories');
      setCategories(response.data);
    } catch (err: any) {
      setError('Could not fetch categories. Let\'s try reloading.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const showNotification = (msg: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    }
  };

  const onSubmit = async (data: { name: string; type: CategoryType }) => {
    setError(null);
    try {
      const response = await api.post<Category>('/api/categories', data);
      setCategories([...categories, response.data]);
      showNotification(`Custom category '${data.name}' added successfully!`);
      reset();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Could not save category.', false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete category '${name}'?`)) return;
    try {
      await api.delete(`/api/categories/${name}`);
      setCategories(categories.filter((c) => c.name !== name));
      showNotification(`Category '${name}' deleted successfully.`);
    } catch (err: any) {
      showNotification(err.response?.data?.message || `Failed to delete '${name}'.`, false);
    }
  };

  // Group categories by type
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Categories
        </h1>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 flex items-start gap-3 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 flex items-start gap-3 text-sm">
          <Check size={18} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Box */}
        <div className="glass-card p-6 h-fit space-y-4">
          <h2 className="card-title flex items-center gap-2">
            <Tag size={18} className="text-teal-600" />
            Add Custom Category
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Subscriptions, Travel"
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                  errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                }`}
                {...register('name', { required: 'Category name is required' })}
              />
              {errors.name && (
                <span className="text-xs text-rose-500 font-semibold">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Category Type
              </label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-700 dark:text-slate-300"
                {...register('type', { required: 'Please select a type' })}
              >
                <option value="EXPENSE">Expense (-)</option>
                <option value="INCOME">Income (+)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-600/15 transition-all"
            >
              <Plus size={16} className="mr-2" />
              Add Category
            </button>
          </form>
        </div>

        {/* Categories List Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income Column */}
          <div className="glass-card p-6 flex flex-col">
            <h3 className="text-md font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-600 pb-2">
              <TrendingUp size={18} />
              Income Categories
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-teal-200 dark:border-teal-900 border-t-teal-600 dark:border-t-teal-400 rounded-full animate-spin" />
              </div>
            ) : incomeCategories.length > 0 ? (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[450px] pr-2">
                {incomeCategories.map((c) => (
                  <div
                    key={c.id || c.name}
                    className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-xl flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                        {c.isCustom ? 'Custom Category' : 'System Default'}
                      </span>
                    </div>

                    {!c.isCustom ? (
                      <span className="p-1.5 rounded-lg text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-950 cursor-not-allowed">
                        <Lock size={14} />
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(c.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-400 text-center py-10">No income categories loaded.</span>
            )}
          </div>

          {/* Expense Column */}
          <div className="glass-card p-6 flex flex-col">
            <h3 className="text-md font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-600 pb-2">
              <TrendingDown size={18} />
              Expense Categories
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-teal-200 dark:border-teal-900 border-t-teal-600 dark:border-t-teal-400 rounded-full animate-spin" />
              </div>
            ) : expenseCategories.length > 0 ? (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[450px] pr-2">
                {expenseCategories.map((c) => (
                  <div
                    key={c.id || c.name}
                    className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-xl flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                        {c.isCustom ? 'Custom Category' : 'System Default'}
                      </span>
                    </div>

                    {!c.isCustom ? (
                      <span className="p-1.5 rounded-lg text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-950 cursor-not-allowed">
                        <Lock size={14} />
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(c.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-400 text-center py-10">No expense categories loaded.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
