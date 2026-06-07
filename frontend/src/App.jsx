import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

import { Landing } from './pages/Landing';
import { Upload } from './pages/Upload';
import { AttributeSelection } from './pages/AttributeSelection';
import { Dashboard } from './pages/Dashboard';
import { MitigationLab } from './pages/MitigationLab';
import { ComplianceReport } from './pages/ComplianceReport';
import { AuditHistory } from './pages/AuditHistory';
import { Heatmap } from './pages/Heatmap';
import { Methodology } from './pages/Methodology';
import { Settings } from './pages/Settings';

import { onAuthStateChanged } from './services/authService';
import useAuthStore from './store/useAuthStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  const { setUser, clearUser, isLoading, isAuthenticated, theme } = useAuthStore();

  useEffect(() => {
    // Apply theme on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        clearUser();
      }
    });

    return () => unsubscribe();
  }, [setUser, clearUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page is standalone, redirect if already logged in */}
        <Route index element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
            <Route path="wizard" element={<Navigate to="/upload" replace />} />
            <Route path="methodology" element={<Methodology />} />
            
            <Route element={<AppShell children={<Outlet />} />}>
                <Route path="upload" element={<Upload />} />
                <Route path="attribute-selection" element={<AttributeSelection />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="heatmap" element={<Heatmap />} />
                <Route path="mitigation" element={<MitigationLab />} />
                <Route path="report" element={<ComplianceReport />} />
                <Route path="history" element={<AuditHistory />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
