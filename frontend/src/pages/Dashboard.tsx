import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Transaction, MonthlyReport, SavingsGoal, Category, TransactionRequest } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  AlertCircle,
  Wallet,
  Lightbulb,
  Target,
  ArrowUp,
  Info,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { formatCurrency, chartTooltipFormatter } from '../utils/format';
import { TimeFilterPills, type TimePeriod } from '../components/ui/TimeFilterPills';
import {
  filterTransactionsByPeriod,
  computeTotals,
  buildExpensePieData,
} from '../utils/dashboard';
import {
  Modal,
  Label,
  FieldError,
  inputClass,
  selectClass,
  BtnPrimary,
  BtnSecondary,
  AlertBanner,
} from '../components/ui/PageUI';

const COLORS = ['#0d9488', '#16a34a', '#ea580c', '#6366f1', '#dc2626', '#0891b2', '#ca8a04'];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [categories, setCategories] = useState<Category[]>([]);
  const [quickAddType, setQuickAddType] = useState<'INCOME' | 'EXPENSE' | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionRequest>({
    defaultValues: {
      amount: undefined,
      date: new Date().toISOString().split('T')[0],
      categoryName: '',
      description: '',
    }
  });

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const [reportRes, txRes, goalsRes, categoriesRes] = await Promise.all([
        api.get<MonthlyReport>(`/api/reports/monthly/${year}/${month}`),
        api.get<Transaction[]>('/api/transactions'),
        api.get<SavingsGoal[]>('/api/goals'),
        api.get<Category[]>('/api/categories'),
      ]);

      setReport(reportRes.data);
      setAllTransactions(Array.isArray(txRes.data) ? txRes.data : []);
      setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (err: unknown) {
      setError('Failed to fetch dashboard intelligence. Let\'s try reloading.');
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, []);

  const filteredCategoriesForForm = useMemo(() => {
    if (!quickAddType) return [];
    return categories.filter((c) => c.type === quickAddType);
  }, [categories, quickAddType]);

  const onQuickAddSubmit = async (data: TransactionRequest) => {
    setFormError(null);
    setFormSuccess(null);
    try {
      // Parse amount as number to match BigDecimal expectation in backend
      const payload = {
        ...data,
        amount: Number(data.amount),
      };

      await api.post<Transaction>('/api/transactions', payload);
      setFormSuccess(`Successfully logged new ${quickAddType === 'INCOME' ? 'income' : 'expense'}!`);
      
      // Instantly reload dashboard data without full page spinner
      await fetchDashboardData(false);

      // Close the modal after a short delay so they see the success banner
      setTimeout(() => {
        setQuickAddType(null);
        setFormSuccess(null);
        reset({
          amount: undefined,
          date: new Date().toISOString().split('T')[0],
          categoryName: '',
          description: '',
        });
      }, 1000);
    } catch (err: any) {
      console.error('Quick Add Transaction Error Details:', err);
      const serverMessage = err.response?.data?.message || err.response?.data?.error || err.response?.data;
      const errorMsg = serverMessage || err.message || 'Transaction submission failed. Please try again.';
      setFormError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
  };

  const filteredTx = useMemo(
    () => filterTransactionsByPeriod(allTransactions, period),
    [allTransactions, period]
  );

  const totals = useMemo(() => computeTotals(filteredTx), [filteredTx]);
  const netFlow = totals.income - totals.expenses;
  const pieData = useMemo(
    () => buildExpensePieData(allTransactions, report, period),
    [allTransactions, report, period]
  );
  const totalExpenses = pieData.reduce((s, d) => s + d.value, 0);
  const recentTransactions = allTransactions.slice(0, 3);
  const pinnedGoals = goals.slice(0, 3);
  const sidebarGoals = goals.slice(0, 2);

  const periodLabel = period === 'today' ? 'TODAY' : period === 'week' ? 'WEEK' : 'MONTH';
  const expensePercent =
    totals.income + totals.expenses > 0
      ? Math.round((totals.expenses / (totals.income + totals.expenses)) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-finance-blue animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="alert-error">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Unified 2-Column Responsive Layout to completely eliminate gaps */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* Left Column (spans 2) — Houses financial summary, actions, recent transactions */}
        <div className="xl:col-span-2 space-y-5">
          {/* 1. Financial Overview — dark hero */}
          <div className="finance-gradient-hero rounded-2xl p-6 text-white shadow-finance-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-48 h-32 opacity-10 pointer-events-none">
              <div className="w-full h-full rounded-tl-3xl bg-white/30" />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-teal-100" />
                  <span className="text-xs font-bold tracking-widest text-white/90">
                    FINANCIAL OVERVIEW
                  </span>
                </div>
                <TimeFilterPills value={period} onChange={setPeriod} variant="dark" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <div className="finance-glass-inner p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-semibold tracking-wide text-teal-50 uppercase">
                      Total Income
                    </span>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <TrendingUp size={16} className="text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">+ {formatCurrency(totals.income)}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300">
                      {periodLabel}
                    </span>
                  </div>
                  <p className="text-xs text-teal-100/90 mt-2">
                    All tracked earnings for this period.
                  </p>
                </div>

                <div className="finance-glass-inner p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-semibold tracking-wide text-teal-50 uppercase">
                      Expenses
                    </span>
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                      <TrendingDown size={16} className="text-rose-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">- {formatCurrency(totals.expenses)}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/25 text-orange-300">
                      {periodLabel}
                    </span>
                  </div>
                  <p className="text-xs text-teal-100/90 mt-2">
                    Net: {formatCurrency(netFlow)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Financial Overview Actions card */}
          <div className="finance-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="card-title">Financial Overview</h2>
              <TimeFilterPills value={period} onChange={setPeriod} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="total-flow-card">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Total Flow</p>
                <p
                  className={`text-4xl font-extrabold tracking-tight ${
                    netFlow >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatCurrency(netFlow)}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddType('EXPENSE');
                    setFormError(null);
                    setFormSuccess(null);
                    reset({
                      amount: undefined,
                      date: new Date().toISOString().split('T')[0],
                      categoryName: '',
                      description: '',
                    });
                  }}
                  className="action-button-expense group"
                >
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-rose-500 shadow-sm">
                    <Plus size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">Add Expense</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Record a new expense entry</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddType('INCOME');
                    setFormError(null);
                    setFormSuccess(null);
                    reset({
                      amount: undefined,
                      date: new Date().toISOString().split('T')[0],
                      categoryName: '',
                      description: '',
                    });
                  }}
                  className="action-button-income group"
                >
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-600 shadow-sm">
                    <ArrowUp size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">Add Income</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Record salary or earnings</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Summary pills */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="summary-pill">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Income</span>
                </div>
                <p className="card-title">{formatCurrency(totals.income)}</p>
                <p className="text-xs font-semibold text-emerald-600">100%</p>
              </div>
              <div className="summary-pill">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Expenses</span>
                </div>
                <p className="card-title">{formatCurrency(totals.expenses)}</p>
                <p className="text-xs font-semibold text-rose-500">{expensePercent}%</p>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="insights-card">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={18} className="text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Quick Insights</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">Net Income</p>
                  <p className={`font-bold ${netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(netFlow)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">Income / Expense Ratio</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {totals.income}:{totals.expenses}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">Avg Daily Income</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {formatCurrency(
                      period === 'today'
                        ? totals.income
                        : period === 'week'
                          ? totals.income / 7
                          : totals.income / Math.max(new Date().getDate(), 1)
                    )}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/50 text-teal-900 dark:text-teal-300 text-xs">
                {netFlow >= 0
                  ? 'Great! Your income covers your expenses for this period.'
                  : 'Tip: Review expenses in Reports to improve your savings this period.'}
              </div>
            </div>
          </div>

          {/* 3. Pinned Goals (Full Width of Left Column) */}
          <div className="finance-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Pinned Goals</h2>
              <Link
                to="/goals"
                className="text-xs font-semibold text-teal-600 hover:underline flex items-center"
              >
                View All <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {pinnedGoals.length > 0 ? (
                pinnedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-xl border border-finance-border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{goal.goalName}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span>{goal.progressPercentage}% complete</span>
                      <span>{formatCurrency(goal.remainingAmount)} left</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-6">No active savings goals</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="finance-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Expense Distribution</h2>
              <Link to="/reports" className="text-xs font-semibold text-teal-600 hover:underline">
                View All
              </Link>
            </div>
            <TimeFilterPills value={period} onChange={setPeriod} />
            <div className="flex-1 min-h-[220px] flex items-center justify-center mt-4">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={chartTooltipFormatter} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-40 h-40 rounded-full border-[14px] border-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-slate-600 font-medium">TOTAL</p>
                    <p className="text-xl font-bold text-slate-800">{formatCurrency(0)}</p>
                  </div>
                </div>
              )}
            </div>
            {pieData.length > 0 && (
              <div className="text-center -mt-2">
                <p className="text-xs text-slate-600 font-medium">TOTAL</p>
                <p className="card-title">{formatCurrency(totalExpenses)}</p>
              </div>
            )}
          </div>

          <div className="finance-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Savings Goals</h2>
              <Link to="/goals">
                <Info size={16} className="text-slate-600 hover:text-teal-600" />
              </Link>
            </div>

            <div className="flex-1 space-y-3">
              {sidebarGoals.length > 0 ? (
                sidebarGoals.map((goal) => {
                  const daysLeft = Math.ceil(
                    (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const status =
                    daysLeft <= 7 ? 'UPCOMING' : daysLeft <= 30 ? 'IN PROGRESS' : 'ON TRACK';
                  const statusColor =
                    daysLeft <= 7
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';

                  return (
                    <div
                      key={goal.id}
                      className="p-4 rounded-xl border border-finance-border dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 hover:border-teal-600 dark:hover:border-teal-900/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/25 flex items-center justify-center shrink-0">
                          <Target size={18} className="text-orange-500 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{goal.goalName}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Target {goal.targetDate}
                            {daysLeft > 0 ? ` • ${daysLeft} days left` : ''}
                          </p>
                          <p className="card-title mt-1">
                            {formatCurrency(goal.targetAmount)}
                          </p>
                          <span
                            className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${statusColor}`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                      {goal.progressPercentage > 0 && (
                        <div className="mt-3 p-3 rounded-lg bg-teal-50/50 dark:bg-teal-950/10 border border-teal-100 dark:border-teal-900/30">
                          <p className="text-[10px] font-bold text-teal-800 dark:text-teal-400 tracking-wide">
                            SYFE INSIGHT
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {goal.progressPercentage}% complete —{' '}
                            {formatCurrency(goal.remainingAmount)} left to reach your goal.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-600 text-sm">
                  No savings goals yet
                </div>
              )}
            </div>

            <Link
              to="/goals"
              className="mt-4 w-full py-3 text-center text-xs font-bold text-slate-600 border border-dashed border-finance-border rounded-xl hover:border-teal-600 hover:text-teal-600 transition-colors"
            >
              + MANAGE SAVINGS GOALS
            </Link>
          </div>

          {/* Recent Transactions Card (Moved to bottom of right column) */}
          <div className="finance-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Recent Transactions</h2>
              <Link
                to="/transactions"
                className="text-xs font-semibold text-teal-600 hover:underline flex items-center"
              >
                View All <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            {recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent hover:border-finance-border dark:hover:border-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.categoryType === 'INCOME'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}
                      >
                        {tx.categoryType === 'INCOME' ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {tx.categoryName}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{tx.date}</p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold shrink-0 ml-2 ${
                        tx.categoryType === 'INCOME'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {tx.categoryType === 'INCOME' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center pb-2">
        Welcome back, {user?.fullName} · SyfeFinance
      </p>

      <Modal
        open={quickAddType !== null}
        onClose={() => setQuickAddType(null)}
        title={quickAddType === 'INCOME' ? 'Quick Add Income' : 'Quick Add Expense'}
        footer={
          <>
            <BtnSecondary type="button" onClick={() => setQuickAddType(null)}>
              Cancel
            </BtnSecondary>
            <BtnPrimary type="submit" form="quick-add-form">
              {quickAddType === 'INCOME' ? 'Add Income' : 'Add Expense'}
            </BtnPrimary>
          </>
        }
      >
        <form id="quick-add-form" onSubmit={handleSubmit(onQuickAddSubmit)} className="space-y-4 text-left">
          {formSuccess && <AlertBanner type="success">{formSuccess}</AlertBanner>}
          {formError && <AlertBanner type="error">{formError}</AlertBanner>}

          <div className="space-y-1.5">
            <Label>Amount (₹)</Label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className={inputClass(!!errors.amount)}
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be positive' },
              })}
            />
            <FieldError message={errors.amount?.message} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
              Transaction Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
              {...register('date', {
                required: 'Date is required',
                validate: (val) =>
                  new Date(val) <= new Date() || 'Date cannot be in the future',
              })}
            />
            <FieldError message={errors.date?.message} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
              Category
            </label>
            <select
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                errors.categoryName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              {...register('categoryName', { required: 'Please select a category' })}
            >
              <option value="">Select Category...</option>
              {filteredCategoriesForForm.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.categoryName?.message} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
              Description
            </label>
            <textarea
              placeholder={quickAddType === 'INCOME' ? 'Salary, bonus, dividend...' : 'Dinner, groceries, transport...'}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              {...register('description')}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
