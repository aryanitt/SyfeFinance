import type { Transaction, MonthlyReport } from '../types';
import type { TimePeriod } from '../components/ui/TimeFilterPills';

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: TimePeriod
): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const monthPrefix = `${year}-${month}`;
  const today = now.toISOString().split('T')[0];

  return transactions.filter((tx) => {
    if (period === 'today') return tx.date === today;
    if (period === 'month') return tx.date.startsWith(monthPrefix);
    const txDate = new Date(tx.date + 'T00:00:00');
    const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });
}

export function computeTotals(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, tx) => {
      if (tx.categoryType === 'INCOME') {
        acc.income += tx.amount;
        if (/dividend|interest|passive|rental/i.test(tx.categoryName)) {
          acc.passiveIncome += tx.amount;
        } else {
          acc.activeIncome += tx.amount;
        }
      } else {
        acc.expenses += tx.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0, activeIncome: 0, passiveIncome: 0 }
  );
}

export function buildExpensePieData(
  transactions: Transaction[],
  report: MonthlyReport | null,
  period: TimePeriod
) {
  if (period === 'month' && report?.expenseByCategory?.length) {
    return report.expenseByCategory.map((c) => ({
      name: c.categoryName,
      value: c.totalAmount,
    }));
  }

  const map = new Map<string, number>();
  filterTransactionsByPeriod(transactions, period)
    .filter((t) => t.categoryType === 'EXPENSE')
    .forEach((t) => {
      map.set(t.categoryName, (map.get(t.categoryName) || 0) + t.amount);
    });

  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}
