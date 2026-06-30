import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BankDashboard from './pages/BankDashboard';
import Banks from './pages/Banks';
import BankSelect from './pages/BankSelect';
import Branches from './pages/Branches';
import Atms from './pages/Atms';
import ArmedAlerts from './pages/ArmedAlerts';  // 🔥 New
import './index.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-900" />;
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/bank-dashboard" element={<PrivateRoute><BankDashboard /></PrivateRoute>} />
      <Route path="/banks" element={<PrivateRoute><Banks /></PrivateRoute>} />
      <Route path="/bank-select" element={<PrivateRoute><BankSelect /></PrivateRoute>} />
      <Route path="/branches" element={<PrivateRoute><Branches /></PrivateRoute>} />
      <Route path="/atms" element={<PrivateRoute><Atms /></PrivateRoute>} />
      <Route path="/armed-alerts" element={<PrivateRoute><ArmedAlerts /></PrivateRoute>} />  // 🔥 New
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;