import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

/* ── Layout ── */
export const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-6">{children}</div>
);

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {action && <div className="flex flex-wrap gap-2">{action}</div>}
  </div>
);

/* ── Alerts ── */
export const AlertBanner: React.FC<{
  type: 'error' | 'success';
  children: React.ReactNode;
}> = ({ type, children }) => (
  <div className={type === 'error' ? 'alert-error' : 'alert-success'}>
    {type === 'error' ? (
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
    ) : (
      <Check size={18} className="shrink-0 mt-0.5" />
    )}
    <span>{children}</span>
  </div>
);

/* ── Buttons ── */
export const BtnPrimary: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className = '', ...props }) => (
  <button type="button" className={`btn-finance-primary ${className}`} {...props}>
    {children}
  </button>
);

export const BtnSecondary: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className = '', ...props }) => (
  <button type="button" className={`btn-secondary ${className}`} {...props}>
    {children}
  </button>
);

/* ── Form fields (class names exported for react-hook-form inputs) ── */
export const inputClass = (hasError?: boolean) =>
  `input-field ${hasError ? 'input-field-error' : ''}`;

export const selectClass = (hasError?: boolean) =>
  `select-field ${hasError ? 'input-field-error' : ''}`;

export const Label: React.FC<{ children: React.ReactNode; htmlFor?: string }> = ({
  children,
  htmlFor,
}) => (
  <label htmlFor={htmlFor} className="field-label">
    {children}
  </label>
);

export const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <span className="field-error">{message}</span> : null;

/* ── Tabs ── */
export const TabGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="tab-group">{children}</div>
);

export const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} className={active ? 'tab-active' : 'tab-inactive'}>
    {children}
  </button>
);

/* ── Cards & stats ── */
export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`finance-card ${className}`}>{children}</div>
);

export const StatCard: React.FC<{
  label: string;
  value: string;
  valueClassName?: string;
}> = ({ label, value, valueClassName = 'stat-value' }) => (
  <Card className="p-6 flex flex-col justify-between">
    <span className="stat-label">{label}</span>
    <h3 className={`${valueClassName} mt-2`}>{value}</h3>
  </Card>
);

/* ── Loading ── */
export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`spinner ${className}`} />
);

export const LoadingCenter: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <LoadingSpinner />
    {label && <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>}
  </div>
);

/* ── Modal ── */
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

/* ── Table ── */
export const tableHeadClass = 'table-head';
export const tableRowClass = 'table-row';
