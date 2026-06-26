import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, Building, MapPin, Phone, Mail, 
  X, Check, AlertCircle, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export default function Banks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [formData, setFormData] = useState({
    bankCode: '',
    bankName: '',
    address: '',
    contactNumber: '',
    email: '',
    status: 'ACTIVE'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Super Admin නෙවෙයි නම් redirect කරන්න
  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const data = await api.getBanks();
      setBanks(data);
    } catch (error) {
      console.error('Error loading banks:', error);
      setError('Failed to load banks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingBank) {
        await api.updateBank(editingBank.id, formData);
        setSuccess('Bank updated successfully!');
      } else {
        await api.createBank(formData);
        setSuccess('Bank created successfully!');
      }
      setShowModal(false);
      resetForm();
      loadBanks();
    } catch (error) {
      setError(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bank?')) return;
    
    try {
      await api.deleteBank(id);
      setSuccess('Bank deleted successfully!');
      loadBanks();
    } catch (error) {
      setError('Failed to delete bank');
    }
  };

  const handleEdit = (bank) => {
    setEditingBank(bank);
    setFormData({
      bankCode: bank.bankCode,
      bankName: bank.bankName,
      address: bank.address || '',
      contactNumber: bank.contactNumber || '',
      email: bank.email || '',
      status: bank.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBank(null);
    setFormData({
      bankCode: '',
      bankName: '',
      address: '',
      contactNumber: '',
      email: '',
      status: 'ACTIVE'
    });
  };

  if (user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar onRefresh={loadBanks} />
      
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building className="w-8 h-8 text-red-500" />
              Bank Management
            </h1>
            <p className="text-sm text-slate-400">Manage all banks in the system</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Bank
          </button>
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

        {/* Banks Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading banks...</div>
          ) : banks.length === 0 ? (
            <div className="p-12 text-center">
              <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No banks registered yet</p>
              <button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="mt-3 text-red-400 hover:text-red-300 transition-colors"
              >
                Add your first bank →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-4 px-6">Code</th>
                    <th className="py-4 px-6">Bank Name</th>
                    <th className="py-4 px-6">Address</th>
                    <th className="py-4 px-6">Contact</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {banks.map((bank) => (
                    <tr key={bank.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {bank.bankCode}
                      </td>
                      <td className="py-4 px-6 text-white">
                        {bank.bankName}
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{bank.address || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-sm">
                        <div className="space-y-0.5">
                          {bank.contactNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span>{bank.contactNumber}</span>
                            </div>
                          )}
                          {bank.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span className="truncate max-w-[120px]">{bank.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          bank.status === 'ACTIVE' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {bank.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(bank)}
                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                            title="Edit Bank"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bank.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                            title="Delete Bank"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {editingBank ? 'Edit Bank' : 'Add New Bank'}
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
                <label className="text-sm text-slate-400 block mb-1">Bank Code *</label>
                <input
                  type="text"
                  value={formData.bankCode}
                  onChange={(e) => setFormData({ ...formData, bankCode: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                  required
                  disabled={editingBank}
                  placeholder="e.g., B001"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">Bank Name *</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                  required
                  placeholder="e.g., Sample Bank"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g., Colombo 03"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">Contact Number</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g., 011-2223333"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g., info@samplebank.com"
                />
              </div>

              {editingBank && (
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
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
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                >
                  {editingBank ? 'Update Bank' : 'Create Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}