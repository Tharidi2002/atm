import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import StatsCards from '../components/StatsCards';
import AlertTable from '../components/AlertTable';
import NotificationToast from '../components/NotificationToast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [newAlert, setNewAlert] = useState(null);
  const tableContainerRef = useRef(null);
  const previousAlertIds = useRef(new Set());

  // 🔥 Role-based redirect
  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      navigate('/banks');
      return;
    }
    
    if (user?.role === 'BANK_ADMIN') {
      navigate('/bank-dashboard');
      return;
    }
    
    // Branch Admin and Bank User stay on dashboard
  }, [user, navigate]);

  const loadAlerts = async () => {
    try {
      let data = [];
      
      if (user?.role === 'SUPER_ADMIN') {
        data = await api.getAlerts();
      } else if (user?.role === 'BRANCH_ADMIN' || user?.role === 'BANK_USER') {
        data = await api.getAlertsByBranch(user?.branchId);
      } else if (user?.role === 'BANK_ADMIN') {
        data = [];
      }
      
      const currentIds = new Set(data.map(a => a.id));
      const newAlerts = data.filter(a => !previousAlertIds.current.has(a.id));
      
      if (newAlerts.length > 0 && previousAlertIds.current.size > 0) {
        setNewAlert(newAlerts[0]);
      }
      
      previousAlertIds.current = currentIds;
      setAlerts(data);
      
      const pending = data.filter(a => a.status === 'PENDING').length;
      const resolved = data.filter(a => a.status === 'RESOLVED').length;
      setStats({ total: data.length, pending, resolved });
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'BANK_ADMIN') {
      loadAlerts();
      const interval = setInterval(loadAlerts, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Super Admin and Bank Admin redirect කරනවා
  if (user?.role === 'SUPER_ADMIN' || user?.role === 'BANK_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar onRefresh={loadAlerts} />
      
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <StatsCards stats={stats} />
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-400">
            Showing <span className="text-white font-bold">{alerts.length}</span> alerts
            {stats.pending > 0 && (
              <span className="ml-2 text-red-400">
                • <span className="font-bold">{stats.pending}</span> pending
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 font-mono">Auto-refresh every 5s</div>
        </div>

        <AlertTable alerts={alerts} loading={loading} tableContainerRef={tableContainerRef} />
      </main>

      {newAlert && <NotificationToast alert={newAlert} onClose={() => setNewAlert(null)} />}
    </div>
  );
}