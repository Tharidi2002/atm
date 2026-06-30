import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, AlertTriangle, MapPin, Clock, Eye, 
  Search, Filter, Calendar, X, Check, Smartphone,
  Building, Home, Activity, Bell, RefreshCw  // 🔥 RefreshCw එක add කරන්න
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

export default function ArmedAlerts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Role-based redirect
  useEffect(() => {
    if (!user || (user?.role !== 'BRANCH_ADMIN' && user?.role !== 'BANK_USER' && user?.role !== 'SUPER_ADMIN')) {
      navigate('/dashboard');
      return;
    }
    loadArmedAlerts();
  }, [user, navigate]);

  const loadArmedAlerts = async () => {
    try {
      setLoading(true);
      let allAlerts = [];
      
      if (user?.role === 'SUPER_ADMIN') {
        allAlerts = await api.getAlerts();
      } else if (user?.role === 'BRANCH_ADMIN' || user?.role === 'BANK_USER') {
        allAlerts = await api.getAlertsByBranch(user?.branchId);
      }
      
      // 🔥 Filter only ARMED alerts - case insensitive
      const armedAlerts = allAlerts.filter(alert => {
        if (!alert.alertType) return false;
        const upper = alert.alertType.toUpperCase();
        return upper.includes('ARMED') || upper.includes('ARM');
      });
      
      console.log('[ARMED] Total alerts:', allAlerts.length);
      console.log('[ARMED] ARMED alerts found:', armedAlerts.length);
      
      setAlerts(armedAlerts);
      setFilteredAlerts(armedAlerts);
    } catch (error) {
      console.error('Error loading ARMED alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter function
  useEffect(() => {
    let filtered = alerts;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.atmMachine?.atmCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.atmMachine?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.alertType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter(alert => 
        new Date(alert.receivedAt).toDateString() === filterDate
      );
    }
    
    setFilteredAlerts(filtered);
  }, [searchTerm, statusFilter, dateFilter, alerts]);

  const viewDetails = (alert) => {
    setSelectedAlert(alert);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': 'bg-red-500/20 text-red-400 border border-red-500/30',
      'ACKNOWLEDGED': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'RESOLVED': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.PENDING}`}>
        {status}
      </span>
    );
  };

  const getMessagePreview = (text) => {
    if (!text) return 'No message';
    if (text.length > 50) return text.substring(0, 50) + '...';
    return text;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setDateFilter('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar onRefresh={loadArmedAlerts} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-slate-400">Loading ARMED alerts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar onRefresh={loadArmedAlerts} />
      
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                <Shield className="w-7 h-7 text-red-500" />
              </div>
              ARMED Alerts
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {filteredAlerts.length} alerts found • {alerts.filter(a => a.status === 'PENDING').length} pending
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
            <button
              onClick={loadArmedAlerts}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total ARMED</p>
            <p className="text-2xl font-bold text-white mt-1">{alerts.length}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{alerts.filter(a => a.status === 'PENDING').length}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{alerts.filter(a => a.status === 'RESOLVED').length}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Today</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {alerts.filter(a => new Date(a.receivedAt).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ATM, Location, Message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors text-sm"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 transition-colors text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 transition-colors text-sm"
              />
              
              {(searchTerm || statusFilter !== 'ALL' || dateFilter) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-lg text-red-400 transition-colors text-sm"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No ARMED alerts found</p>
              <p className="text-slate-500 text-sm mt-1">
                {alerts.length > 0 ? 'Try changing your filters' : 'No ARMED alerts in the system yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">ATM</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Message</th>
                    <th className="py-4 px-6">Time</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6">{getStatusBadge(alert.status)}</td>
                      <td className="py-4 px-6 font-mono font-bold text-white text-sm">
                        {alert.atmMachine?.atmCode || 'UNKNOWN'}
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{alert.atmMachine?.location || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 max-w-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="text-sm text-slate-300 truncate">
                            {getMessagePreview(alert.alertType)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          {new Date(alert.receivedAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => viewDetails(alert)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors text-xs mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {showModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">ARMED Alert Details</h2>
                  <p className="text-xs text-slate-400">ID: #{selectedAlert.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Alert Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500">ATM Code</p>
                    <p className="text-white font-mono font-bold">{selectedAlert.atmMachine?.atmCode || 'UNKNOWN'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Status</p>
                    {getStatusBadge(selectedAlert.status)}
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-500">Location</p>
                    <p className="text-slate-300">{selectedAlert.atmMachine?.location || 'Unknown'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-500">Full Message</p>
                    <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 mt-1">
                      <p className="text-white font-mono text-sm break-words">
                        {selectedAlert.rawMessage || selectedAlert.alertType || 'No message'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Received</p>
                    <p className="text-slate-300 text-sm">{new Date(selectedAlert.receivedAt).toLocaleString()}</p>
                  </div>
                  {selectedAlert.resolvedAt && (
                    <div>
                      <p className="text-[10px] text-slate-500">Resolved</p>
                      <p className="text-emerald-400 text-sm">{new Date(selectedAlert.resolvedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}