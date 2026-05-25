import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Target,
  PieChart,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Wallet,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'Reports', path: '/reports', icon: PieChart },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={onNavigate}
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600 dark:bg-teal-950/40 dark:text-teal-300'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={18} className="mr-3" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-5 bg-white dark:bg-slate-900 border-b border-finance-border dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 finance-gradient-hero rounded-lg text-white">
            <Wallet size={16} />
          </div>
          <span className="font-bold text-slate-800 dark:text-white">SyfeFinance</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-600"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-600"
            aria-label="Menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex pt-16">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-finance-border shadow-finance-lg h-full">
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <NavLinks onNavigate={() => setSidebarOpen(false)} />
            </nav>
            <div className="p-4 border-t border-finance-border space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-finance-border dark:border-slate-800 shadow-finance">
          <div className="h-16 flex items-center px-6 border-b border-finance-border dark:border-slate-800 gap-2.5">
            <div className="p-2 finance-gradient-hero rounded-xl text-white shadow-md">
              <Wallet size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">
              Syfe<span className="text-teal-600 dark:text-teal-400">Finance</span>
            </span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <NavLinks />
          </nav>

          <div className="p-4 border-t border-finance-border dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                    {user?.fullName}
                  </span>
                  <span className="text-xs text-slate-600 truncate">{user?.username}</span>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-950/20 text-sm font-medium transition-all"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 w-full pt-16 md:pt-0 overflow-y-auto">
          <div className="p-5 md:p-7 max-w-[1400px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};
