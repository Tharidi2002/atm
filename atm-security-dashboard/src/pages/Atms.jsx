import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, MapPin, Smartphone, 
  X, Check, AlertCircle, Eye, RefreshCw,
  Activity, Server, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

export default function Atms() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [atms, setAtms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAtm, setEditingAtm] = useState(null);
  const [selectedAtm, setSelectedAtm] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [formData, setFormData] = useState({
    atmCode: '',
    location: '',
    simNumber: '',
    status: 'ACTIVE'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Branch Admin නෙවෙයි නම් redirect කරන්න
  useEffect(() => {
    if (user?.role !== 'BRANCH_ADMIN' && user?.role !== 'BANK_USER') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const branchId = user?.branchId;

  useEffect(() => {
    if (!branchId) {
      setError('No branch assigned to this user');
      setLoading(false);
      return;
    }
    loadAtms();
  }, [branchId]);

  const loadAtms = async () => {
    try {
      setLoading(true);
      const data = await api.getAtmsByBranch(branchId);
      setAtms(data);
    } catch (error) {
      setError('Failed to load ATMs');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async (atmId) => {
    try {
      // Get alerts for this ATM
      const allAlerts = await api.getAlerts();
      const atmAlerts = allAlerts.filter(a => a.atmId === atmId);
      setAlerts(atmAlerts);
      setShowAlertModal(true);
    } catch (error) {
      setError('Failed to load alerts');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const atmData = { 
        ...formData, 
        branchId: parseInt(branchId),
        bankId: user?.bankId,
        createdBy: user?.userId
      };
      
      if (editingAtm) {
        await api.updateAtm(editingAtm.id, atmData);
        setSuccess('ATM updated successfully!');
      } else {
        await api.createAtm(atmData);
        setSuccess('ATM created successfully!');
      }
      setShowModal(false);
      resetForm();
      loadAtms();
    } catch (error) {
      setError(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ATM?')) return;
    
    try {
      await api.deleteAtm(id);
      setSuccess('ATM deleted successfully!');
      loadAtms();
    } catch (error) {
      setError('Failed to delete ATM');
    }
  };

  const handleEdit = (atm) => {
    setEditingAtm(atm);
    setFormData({
      atmCode: atm.atmCode,
      location: atm.location,
      simNumber: atm.simNumber,
      status: atm.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAtm(null);
    setFormData({
      atmCode: '',
      location: '',
      simNumber: '',
      status: 'ACTIVE'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'ACTIVE': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      'INACTIVE': 'bg-red-500/20 text-red-400 border border-red-500/30',
      'MAINTENANCE': 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.ACTIVE}`}>
        {status}
      </span>
    );
  };

  // View Only mode for BANK_USER
  const isViewOnly = user?.role === 'BANK_USER';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar onRefresh={loadAtms} />
      
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Server className="w-8 h-8 text-emerald-400" />
              ATM Machines
            </h1>
            <p className="text-sm text-slate-400">
              {isViewOnly ? 'View ATMs in your branch' : 'Manage ATMs in your branch'}
            </p>
          </div>
          {!isViewOnly && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add ATM
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 text-emerald-400">
            <Check className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* ATMs Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading ATMs...</div>
          ) : atms.length === 0 ? (
            <div className="p-12 text-center">
              <Server className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No ATMs registered in this branch</p>
              {!isViewOnly && (
                <button
                  onClick={() => { resetForm(); setShowModal(true); }}
                  className="mt-3 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Add your first ATM →
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-4 px-6">Code</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">SIM Number</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Alerts</th>
                    {!isViewOnly && (
                      <th className="py-4 px-6 text-center">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {atms.map((atm) => (
                    <tr key={atm.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {atm.atmCode}
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span>{atm.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-300 text-sm">
                        <div className="flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                          {atm.simNumber}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(atm.status)}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => loadAlerts(atm.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-amber-400 transition-colors text-xs"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          View Alerts
                        </button>
                      </td>
                      {!isViewOnly && (
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(atm)}
                              className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                              title="Edit ATM"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(atm.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                              title="Delete ATM"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && !isViewOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {editingAtm ? 'Edit ATM' : 'Add New ATM'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">ATM Code *</label>
                <input
                  type="text"
                  value={formData.atmCode}
                  onChange={(e) => setFormData({ ...formData, atmCode: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                  disabled={editingAtm}
                  placeholder="e.g., ATM001"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                  placeholder="e.g., Colombo 03 - Main Street"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">SIM Number *</label>
                <input
                  type="text"
                  value={formData.simNumber}
                  onChange={(e) => setFormData({ ...formData, simNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                  placeholder="e.g., 0771234567"
                />
              </div>

              {editingAtm && (
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors"
                >
                  {editingAtm ? 'Update ATM' : 'Create ATM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alerts Modal */}
      {showAlertModal && selectedAtm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                Alerts for {selectedAtm.atmCode}
              </h2>
              <button
                onClick={() => setShowAlertModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No alerts for this ATM</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-slate-300">{alert.alertType}</p>
                          {alert.zoneNumbers && alert.zoneNumbers !== '00' && (
                            <p className="text-xs text-amber-400 mt-1">
                              Zones: {alert.zoneNumbers}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={alert.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(alert.receivedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}