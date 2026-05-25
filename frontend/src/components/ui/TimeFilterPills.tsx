import React from 'react';

export type TimePeriod = 'today' | 'week' | 'month';

interface TimeFilterPillsProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
  variant?: 'light' | 'dark';
}

const labels: { key: TimePeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export const TimeFilterPills: React.FC<TimeFilterPillsProps> = ({
  value,
  onChange,
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  return (
    <div
      className={`inline-flex p-1 rounded-full ${
        isDark ? 'bg-white/10' : 'bg-slate-100'
      }`}
    >
      {labels.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
            value === key
              ? isDark
                ? 'bg-white/25 text-white shadow-sm'
                : 'bg-white text-slate-800 shadow-sm'
              : isDark
                ? 'text-white/70 hover:text-white'
                : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
