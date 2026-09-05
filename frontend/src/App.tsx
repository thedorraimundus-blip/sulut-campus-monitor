import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WebSocketProvider } from './context/WebSocketContext';
import { ModalProvider } from './context/ModalContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { BeritaPage } from './pages/BeritaPage';
import { UniversitiesPage } from './pages/UniversitiesPage';
import { UniversityDetailPage } from './pages/UniversityDetailPage';
import { SourcesPage } from './pages/SourcesPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIPage } from './pages/AIPage';
import { ModelsPage } from './pages/ModelsPage';
import { DatasetPage } from './pages/DatasetPage';
import { AlertsPage } from './pages/AlertsPage';
import { LogsPage } from './pages/LogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <ModalProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/berita" element={<BeritaPage />} />
              <Route path="/news" element={<Navigate to="/berita" replace />} />
              <Route path="/universities" element={<UniversitiesPage />} />
              <Route path="/universities/:id" element={<UniversityDetailPage />} />
              <Route path="/sources" element={<SourcesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/ai" element={<AIPage />} />
              <Route path="/ai/models" element={<ModelsPage />} />
              <Route path="/models" element={<Navigate to="/ai/models" replace />} />
              <Route path="/ai/dataset" element={<DatasetPage />} />
              <Route path="/dataset" element={<Navigate to="/ai/dataset" replace />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ModalProvider>
      </WebSocketProvider>
    </BrowserRouter>
  );
};

export default App;
