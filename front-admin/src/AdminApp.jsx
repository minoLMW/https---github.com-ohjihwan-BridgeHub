import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberManage from './pages/admin/MemberManage';
import ReportManage from './pages/admin/ReportManage';
import Statistics from './pages/admin/Statistics';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

const theme = createTheme();

// 인증 보호 컴포넌트
const ProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  
  if (!adminToken || !adminUser) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(adminUser);
    if (user.role !== 'ADMIN') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AdminApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/dashboard" element={<AdminDashboard />} />
                    <Route path="/members" element={<MemberManage />} />
                    <Route path="/reports" element={<ReportManage />} />
                    <Route path="/statistics" element={<Statistics />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default AdminApp;
