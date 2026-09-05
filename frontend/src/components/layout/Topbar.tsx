import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Radio,
  User,
  LogIn,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';

interface TopbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenLoginModal: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  username?: string;
  onOpenMobileMenu?: () => void;
  alertCount?: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenLoginModal,
  isLoggedIn,
  onLogout,
  username,
  onOpenMobileMenu,
  alertCount = 4
}) => {
  const { isConnected } = useWebSocket();
  const location = useLocation();

  // Determine breadcrumb / page title from path
  const getPageInfo = (path: string) => {
    if (path === '/' || path === '/dashboard') return { section: 'Overview', title: 'Dashboard Utama' };
    if (path.startsWith('/monitoring')) return { section: 'Overview', title: 'Live Monitor' };
    if (path.startsWith('/berita')) return { section: 'Monitoring', title: 'Katalog Berita' };
    if (path.startsWith('/universities')) return { section: 'Monitoring', title: 'Direktori Perguruan Tinggi' };
    if (path.startsWith('/sources')) return { section: 'Monitoring', title: 'Sumber Media' };
    if (path.startsWith('/analytics')) return { section: 'Intelligence', title: 'Analitik & Tren Media' };
    if (path.startsWith('/ai')) return { section: 'AI Engine', title: 'Local AI Intelligence' };
    if (path.startsWith('/alerts')) return { section: 'Intelligence', title: 'Alerts & Deteksi Krisis' };
    if (path.startsWith('/logs')) return { section: 'System', title: 'System Logs' };
    if (path.startsWith('/settings')) return { section: 'System', title: 'Pengaturan Sistem' };
    return { section: 'Halaman', title: 'Sistem Monitoring' };
  };

  const pageInfo = getPageInfo(location.pathname);

  return (
    <header className="h-16 bg-white/85 dark:bg-[#0c121e]/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="hidden sm:inline-block font-medium text-slate-600 dark:text-slate-300">
            {pageInfo.section}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:inline-block" />
          <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* System Online Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>

        {/* WebSocket Stream Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border ${
            isConnected
              ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/50 text-sky-700 dark:text-sky-300'
              : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
          }`}
          title={isConnected ? 'Live WebSockets Connected' : 'Simulated polling sync active'}
        >
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-sky-500 animate-pulse' : 'text-slate-400'}`} />
          <span>{isConnected ? 'Live Feed' : 'Local Mode'}</span>
        </div>

        {/* Quick Link to Alerts */}
        <Link
          to="/alerts"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifikasi & Alerts"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0c121e]" />
          )}
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? "Beralih ke Light Mode" : "Beralih ke Dark Mode"}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Admin Login / Profile */}
        {isLoggedIn ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-sky-500/30">
                {username ? username[0].toUpperCase() : 'A'}
              </div>
              <span className="hidden md:inline">{username || 'Admin'}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm shadow-sky-600/20 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Login Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
