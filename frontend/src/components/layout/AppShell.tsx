import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ArticleDetailModal } from '../common/ArticleDetailModal';
import { LoginModal } from '../common/LoginModal';
import { useModals } from '../../context/ModalContext';
import { alertsApi } from '../../services/api/alertsApi';

export const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [alertCount, setAlertCount] = useState(0);

  const {
    selectedArticle,
    closeArticleModal,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
  } = useModals();

  const refreshAlertCount = useCallback(async () => {
    try {
      const unread = await alertsApi.getAlerts(true);
      setAlertCount(unread.length);
    } catch {
      // keep current count on error
    }
  }, []);

  // Initialize theme & auth status
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const token = localStorage.getItem('scm_token');
    const user = localStorage.getItem('scm_user');
    if (token && user) {
      setIsLoggedIn(true);
      setUsername(user);
    }

    refreshAlertCount();
  }, [darkMode, refreshAlertCount]);


  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('scm_token');
    localStorage.removeItem('scm_user');
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex transition-colors duration-200 antialiased selection:bg-sky-500 selection:text-white">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        alertCount={alertCount}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Topbar */}
        <Topbar
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onOpenLoginModal={openLoginModal}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          username={username}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          alertCount={alertCount}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ refreshAlertCount }} />
        </main>
      </div>

      {/* Shared Modals */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={closeArticleModal}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSuccess={(user) => {
          setIsLoggedIn(true);
          setUsername(user);
          closeLoginModal();
        }}
      />
    </div>
  );
};
