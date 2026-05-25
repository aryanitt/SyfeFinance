import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import type { SavingsGoal, SavingsGoalRequest } from '../types';
import { formatCurrency } from '../utils/format';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  Check,
  X,
  Target
} from 'lucide-react';

export const SavingsGoals: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SavingsGoalRequest>();

  const loadGoals = async () => {
    setLoading(true);
    try {
      const response = await api.get<SavingsGoal[]>('/api/goals');
      setGoals(response.data);
    } catch (err: any) {
      setError('Could not fetch savings goals. Let\'s try reloading.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
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

  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    reset({
      goalName: '',
      targetAmount: undefined,
      targetDate: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setValue('goalName', goal.goalName);
    setValue('targetAmount', goal.targetAmount);
    setValue('targetDate', goal.targetDate);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: SavingsGoalRequest) => {
    try {
      if (editingGoal) {
        // Edit Goal
        const response = await api.put<SavingsGoal>(`/api/goals/${editingGoal.id}`, data);
        setGoals(goals.map((g) => (g.id === editingGoal.id ? response.data : g)));
        showNotification('Savings Goal updated successfully!');
      } else {
        // Create Goal
        const response = await api.post<SavingsGoal>('/api/goals', data);
        setGoals([...goals, response.data]);
        showNotification('Savings Goal defined successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Goal submission failed.', false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this savings goal?')) return;
    try {
      await api.delete(`/api/goals/${id}`);
      setGoals(goals.filter((g) => g.id !== id));
      showNotification('Savings Goal deleted.');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Could not delete goal.', false);
    }
  };

  // Helper: tomorrow's date string (for calendar min validation)
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">
            Savings Goals
          </h1>
        </div>
        <div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-600/20 hover:shadow-teal-600/25 transition-all"
          >
            <Plus size={16} className="mr-2" />
            Define Goal
          </button>
        </div>
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

      {/* Goals Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-teal-200 dark:border-teal-900 border-t-teal-600 dark:border-t-teal-400 rounded-full animate-spin" />
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const isCompleted = goal.progressPercentage >= 100;
            const progressPct = Math.min(goal.progressPercentage, 100);
            return (
              <div
                key={goal.id}
                className="glass-card p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-200"
              >
                <div>
                  {/* Title & Actions */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
                        {goal.goalName}
                      </h3>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400'
                      }`}>
                        {isCompleted ? 'Goal Achieved!' : 'Active Savings'}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEditModal(goal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Math Breakdown */}
                  <div className="mt-5 space-y-3.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">Net Progress</span>
                      <span className="font-bold text-slate-800 dark:text-white">
                        {formatCurrency(goal.currentProgress)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">Target Goal</span>
                      <span className="font-bold text-slate-800 dark:text-white">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Linear Progress Bar */}
                  <div className="mt-5 space-y-1.5">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-teal-600 dark:bg-teal-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-500 font-semibold">
                      <span>{goal.progressPercentage}% completed</span>
                      <span>{formatCurrency(goal.remainingAmount)} remaining</span>
                    </div>
                  </div>
                </div>

                {/* Date constraints info */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-600/60 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-500">Started</span>
                      <span className="text-slate-600 dark:text-slate-300">{goal.startDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target size={14} />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-500">Deadline</span>
                      <span className="text-slate-600 dark:text-slate-300">{goal.targetDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center py-20 text-center text-slate-400">
          <Target size={48} className="text-slate-300 dark:text-slate-800 mb-3" />
          <span className="text-base font-bold text-slate-800 dark:text-white">No active savings goals found</span>
          <span className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-sm">
            Create an active savings goal to dynamically aggregate cash balance starting from your definition date!
          </span>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Create Goal
          </button>
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
              <h3 className="font-bold text-slate-800 dark:text-white">
                {editingGoal ? 'Edit Savings Goal' : 'Define Savings Goal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Goal Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                  Goal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. New car savings, Emergency fund"
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                    errors.goalName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                  {...register('goalName', { required: 'Goal name is required' })}
                />
                {errors.goalName && (
                  <span className="text-xs text-rose-500 font-semibold">{errors.goalName.message}</span>
                )}
              </div>

              {/* Target Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                  Target Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                    errors.targetAmount ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                  {...register('targetAmount', {
                    required: 'Target amount is required',
                    min: { value: 0.01, message: 'Target amount must be positive' },
                  })}
                />
                {errors.targetAmount && (
                  <span className="text-xs text-rose-500 font-semibold">
                    {errors.targetAmount.message}
                  </span>
                )}
              </div>

              {/* Target Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                  Target Date (Deadline)
                </label>
                <input
                  type="date"
                  min={getTomorrowString()} // Enforces date in the future per requirement
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                    errors.targetDate ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                  {...register('targetDate', { required: 'Target date is required' })}
                />
                {errors.targetDate && (
                  <span className="text-xs text-rose-500 font-semibold">{errors.targetDate.message}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-600/15 transition-all"
                >
                  {editingGoal ? 'Save Changes' : 'Define Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
