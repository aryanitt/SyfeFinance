import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { MonthlyReport, YearlyReport } from '../types';
import { Calendar } from 'lucide-react';
import {
  PageShell,
  PageHeader,
  AlertBanner,
  Card,
  TabGroup,
  TabButton,
  LoadingCenter,
  selectClass,
} from '../components/ui/PageUI';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { formatCurrency, chartTooltipFormatter } from '../utils/format';

export const Reports: React.FC = () => {
  const [tab, setTab] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time selections
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Report States
  const [monthlyData, setMonthlyData] = useState<MonthlyReport | null>(null);
  const [yearlyData, setYearlyData] = useState<YearlyReport | null>(null);

  const fetchMonthlyReport = async (y: number, m: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<MonthlyReport>(`/api/reports/monthly/${y}/${m}`);
      setMonthlyData(response.data);
    } catch (err) {
      setError('Could not generate the monthly report.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyReport = async (y: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<YearlyReport>(`/api/reports/yearly/${y}`);
      setYearlyData(response.data);
    } catch (err) {
      setError('Could not generate the yearly report.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'monthly') {
      fetchMonthlyReport(year, month);
    } else {
      fetchYearlyReport(year);
    }
  }, [tab, month, year]);

  const COLORS = ['#0d9488', '#16a34a', '#ea580c', '#6366f1', '#dc2626', '#0891b2', '#ca8a04'];
  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Aggregated Yearly Area Chart Data
  const trendData = yearlyData?.monthlyBreakdown.map((m) => ({
    name: monthsList[m.month - 1].slice(0, 3),
    Income: m.totalIncome,
    Expenses: m.totalExpenses,
    Savings: m.netSavings
  })) || [];

  return (
    <PageShell>
      <PageHeader
        title="Financial Reports"
        action={
          <TabGroup>
            <TabButton active={tab === 'monthly'} onClick={() => setTab('monthly')}>
              Monthly Report
            </TabButton>
            <TabButton active={tab === 'yearly'} onClick={() => setTab('yearly')}>
              Yearly Report
            </TabButton>
          </TabGroup>
        }
      />

      {error && <AlertBanner type="error">{error}</AlertBanner>}

      <Card className="p-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
          <Calendar size={16} />
          <span>Select Reporting Period:</span>
        </div>

        <div className="flex items-center gap-3">
          {tab === 'monthly' && (
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className={`${selectClass()} !w-auto`}
            >
              {monthsList.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          )}

          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className={`${selectClass()} !w-auto`}
          >
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <LoadingCenter />
      ) : tab === 'monthly' ? (
        /* ==================== MONTHLY REPORT TAB ==================== */
        <div className="space-y-6">
          {/* Totals cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                Income Summary
              </span>
              <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {formatCurrency(monthlyData?.totalIncome || 0)}
              </h3>
            </div>
            <div className="glass-card p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                Expenses Summary
              </span>
              <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
                {formatCurrency(monthlyData?.totalExpenses || 0)}
              </h3>
            </div>
            <div className="glass-card p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                Net Monthly Savings
              </span>
              <h3 className={`text-3xl font-extrabold mt-2 ${
                (monthlyData?.netSavings || 0) >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600'
              }`}>
                {formatCurrency(monthlyData?.netSavings || 0)}
              </h3>
            </div>
          </div>

          {/* Monthly charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Expenses Breakdown */}
            <div className="glass-card p-6 flex flex-col">
              <h3 className="card-title mb-4">
                Expense Allocation
              </h3>
              <div className="flex-1 min-h-[300px] flex items-center justify-center">
                {monthlyData && monthlyData.expenseByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={monthlyData.expenseByCategory.map((c) => ({ name: c.categoryName, value: c.totalAmount }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {monthlyData.expenseByCategory.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={chartTooltipFormatter} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-sm text-slate-400">No expenses recorded for this month.</span>
                )}
              </div>
            </div>

            {/* Income Allocation */}
            <div className="glass-card p-6 flex flex-col">
              <h3 className="card-title mb-4">
                Income Allocation
              </h3>
              <div className="flex-1 min-h-[300px] flex items-center justify-center">
                {monthlyData && monthlyData.incomeByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={monthlyData.incomeByCategory.map((c) => ({ name: c.categoryName, value: c.totalAmount }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {monthlyData.incomeByCategory.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={chartTooltipFormatter} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-sm text-slate-400">No earnings recorded for this month.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== YEARLY REPORT TAB ==================== */
        <div className="space-y-6">
          {/* Totals cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Annual Income
              </span>
              <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {formatCurrency(yearlyData?.totalIncome || 0)}
              </h3>
            </div>
            <div className="glass-card p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Annual Expenses
              </span>
              <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
                {formatCurrency(yearlyData?.totalExpenses || 0)}
              </h3>
            </div>
            <div className="glass-card p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Net Annual Savings
              </span>
              <h3 className={`text-3xl font-extrabold mt-2 ${
                (yearlyData?.netSavings || 0) >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {formatCurrency(yearlyData?.netSavings || 0)}
              </h3>
            </div>
          </div>

          {/* Area Trend Graph */}
          <div className="glass-card p-6 flex flex-col">
            <h3 className="card-title mb-4">
              Annual Cash Flow Trends
            </h3>
            <div className="min-h-[350px]">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip formatter={chartTooltipFormatter} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};
