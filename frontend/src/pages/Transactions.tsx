import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import type { Transaction, TransactionRequest, Category, CategoryType } from '../types';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '../utils/format';
import {
  PageShell,
  PageHeader,
  AlertBanner,
  BtnPrimary,
  BtnSecondary,
  Card,
  Modal,
  Label,
  FieldError,
  inputClass,
  selectClass,
  LoadingCenter,
} from '../components/ui/PageUI';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState<CategoryType | ''>('');

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionRequest>();

  const loadData = async () => {
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        api.get<Transaction[]>('/api/transactions'),
        api.get<Category[]>('/api/categories'),
      ]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
    } catch (err: any) {
      setError('Could not download transaction logs. Please reload.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
    setEditingTransaction(null);
    reset({
      amount: undefined,
      date: new Date().toISOString().split('T')[0],
      categoryName: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setValue('amount', tx.amount);
    setValue('date', tx.date); // Keep date read-only in edit form
    setValue('categoryName', tx.categoryName);
    setValue('description', tx.description || '');
    setIsModalOpen(true);
  };

  const onSubmit = async (data: TransactionRequest) => {
    try {
      if (editingTransaction) {
        // Update: Keep date unchanged
        const updatePayload = {
          ...data,
          date: editingTransaction.date, // Ensure same date is sent to API
        };
        const response = await api.put<Transaction>(`/api/transactions/${editingTransaction.id}`, updatePayload);
        setTransactions(transactions.map((t) => (t.id === editingTransaction.id ? response.data : t)));
        showNotification('Transaction updated successfully!');
      } else {
        // Create new
        const response = await api.post<Transaction>('/api/transactions', data);
        setTransactions([response.data, ...transactions]);
        showNotification('Transaction created successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Transaction submission failed.', false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this transaction?')) return;
    try {
      await api.delete(`/api/transactions/${id}`);
      setTransactions(transactions.filter((t) => t.id !== id));
      showNotification('Transaction removed successfully!');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Could not delete transaction.', false);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Date', 'Category', 'Type', 'Description', 'Amount'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.categoryName,
      t.categoryType,
      t.description || '',
      t.amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `syfe_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle sorting
  const handleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // 1. Filter, 2. Search, 3. Sort, 4. Paginate
  const filteredTransactions = transactions
    .filter((t) => {
      const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase()) || 
                          t.categoryName.toLowerCase().includes(search.toLowerCase());

      const matchStartDate = startDate ? new Date(t.date) >= new Date(startDate) : true;
      const matchEndDate = endDate ? new Date(t.date) <= new Date(endDate) : true;

      const matchCat = selectedCategory ? t.categoryName === selectedCategory : true;
      const matchType = selectedType ? t.categoryType === selectedType : true;

      return matchSearch && matchStartDate && matchEndDate && matchCat && matchType;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Pagination bounds
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <PageShell>
      <PageHeader
        title="Transactions"
        action={
          <>
            <BtnSecondary onClick={exportToCSV} disabled={filteredTransactions.length === 0} className="gap-2">
              <Download size={16} /> CSV Export
            </BtnSecondary>
            <BtnPrimary onClick={handleOpenCreateModal} className="gap-2">
              <Plus size={16} /> Add Transaction
            </BtnPrimary>
          </>
        }
      />
      {error && <AlertBanner type="error">{error}</AlertBanner>}
      {success && <AlertBanner type="success">{success}</AlertBanner>}
      <Card className="p-5 space-y-4">
        {/* Search & Basic filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search descriptions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className={`${inputClass()} pl-9`}
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value as CategoryType | ''); setCurrentPage(1); }}
              className={selectClass()}
            >
              <option value="">All Flow Types</option>
              <option value="INCOME">Income (+)</option>
              <option value="EXPENSE">Expense (-)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className={selectClass()}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className={`${inputClass()} px-2.5 py-2 text-xs`}
            />
            <span className="text-slate-500 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className={`${inputClass()} px-2.5 py-2 text-xs`}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {loading ? (
          <LoadingCenter />
        ) : paginatedTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-600 text-slate-500 text-xs font-semibold bg-slate-50/40 dark:bg-slate-900/10">
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1.5">
                      Date
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => handleSort('amount')}>
                    <div className="flex items-center gap-1.5">
                      Amount
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 text-slate-700 dark:text-slate-300">
                    <td className="py-3.5 px-6 font-medium text-xs text-slate-400 dark:text-slate-500">{tx.date}</td>
                    <td className="py-3.5 px-6">
                      <span className={tx.categoryType === 'INCOME' ? 'badge-income' : 'badge-expense'}>
                        {tx.categoryName}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 truncate max-w-[200px] font-semibold">{tx.description || '—'}</td>
                    <td className={`py-3.5 px-6 font-extrabold ${
                      tx.categoryType === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {tx.categoryType === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <AlertCircle size={40} className="text-slate-300 dark:text-slate-800 mb-2" />
            <span className="text-sm font-semibold">No transactions found matching filters</span>
            <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">Try clearing or tweaking search terms</span>
          </div>
        )}

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="h-14 border-t border-slate-100 dark:border-slate-600 px-6 flex items-center justify-between text-xs text-slate-400 font-semibold bg-slate-50/10 dark:bg-slate-900/5">
            <span>
              Page {currentPage} of {totalPages} ({filteredTransactions.length} items)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 text-slate-500"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 text-slate-500"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}
        footer={
          <>
            <BtnSecondary type="button" onClick={() => setIsModalOpen(false)}>Cancel</BtnSecondary>
            <BtnPrimary type="submit" form="tx-form">
              {editingTransaction ? 'Save Changes' : 'Create Transaction'}
            </BtnPrimary>
          </>
        }
      >
            <form id="tx-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Amount */}
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

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                  Transaction Date
                </label>
                <input
                  type="date"
                  disabled={!!editingTransaction} // Locked during edit per requirement
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400 focus:outline-none"
                  {...register('date', {
                    required: 'Date is required',
                    validate: (val) =>
                      new Date(val) <= new Date() || 'Date cannot be in the future',
                  })}
                />
                {editingTransaction && (
                  <span className="text-xs text-teal-600 font-semibold">
                    Date cannot be changed once created.
                  </span>
                )}
                {errors.date && (
                  <span className="text-xs text-rose-500 font-semibold">{errors.date.message}</span>
                )}
              </div>

              {/* Category */}
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
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
                {errors.categoryName && (
                  <span className="text-xs text-rose-500 font-semibold">
                    {errors.categoryName.message}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                  Description
                </label>
                <textarea
                  placeholder="Dinner, groceries, salary deposit..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  {...register('description')}
                />
              </div>

            </form>
      </Modal>
    </PageShell>
  );
};
