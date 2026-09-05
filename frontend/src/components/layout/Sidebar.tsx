import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  Newspaper,
  GraduationCap,
  Globe,
  BarChart3,
  BrainCircuit,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Cpu,
  Database
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  alertCount?: number;
}

interface NavGroup {
  group: string;
  items: {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  alertCount = 4
}) => {
  const location = useLocation();

  const navGroups: NavGroup[] = [
    {
      group: 'OVERVIEW',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/monitoring', label: 'Live Monitor', icon: Radio },
      ]
    },
    {
      group: 'MONITORING',
      items: [
        { path: '/berita', label: 'Berita Kampus', icon: Newspaper },
        { path: '/universities', label: 'Perguruan Tinggi', icon: GraduationCap },
        { path: '/sources', label: 'Sumber Media', icon: Globe },
      ]
    },
    {
      group: 'INTELLIGENCE & AI',
      items: [
        { path: '/analytics', label: 'Analitik & Tren', icon: BarChart3 },
        { path: '/ai', label: 'AI Intelligence', icon: BrainCircuit },
        { path: '/ai/models', label: 'Model AI', icon: Cpu },
        {
          path: '/alerts',
          label: 'Alerts & Krisis',
          icon: Bell,
          badge: alertCount,
          badgeColor: 'bg-rose-500 text-white'
        },
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { path: '/logs', label: 'System Logs', icon: FileText },
        { path: '/settings', label: 'Pengaturan', icon: Settings },
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0c121e] border-r border-slate-200 dark:border-slate-800/80 transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shrink-0 shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                SULUT CAMPUS
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold tracking-widest uppercase">
                MONITOR
              </span>
            </div>
          )}
        </NavLink>

        {/* Mobile close or Desktop collapse toggle */}
        {mobileOpen ? (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {(!collapsed || mobileOpen) && (
              <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/' || location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  } ${collapsed && !mobileOpen ? 'justify-center' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  {(!collapsed || mobileOpen) && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {(!collapsed || mobileOpen) && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-sky-700' : item.badgeColor || 'bg-sky-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Engine Status Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 shrink-0">
        {(!collapsed || mobileOpen) ? (
          <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  Local AI Engine
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                100% Offline • Sastrawi & NB
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Local AI Engine: Online">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
