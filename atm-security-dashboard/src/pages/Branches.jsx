import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, MapPin, Phone, Mail, 
  X, Check, AlertCircle, Building, ChevronLeft 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export default function Branches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [formData, setFormData] = useState({
    branchCode: '',
    branchName: '',
    address: '',
    contactNumber: '',
    email: '',
    status: 'ACTIVE'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 🔥 Bank Admin ගේ bankId එක localStorage එකෙන් ගන්න
  const bankId = localStorage.getItem('selectedBankId') || user?.bankId;

  useEffect(() => {
    if (user?.role !== 'BANK_ADMIN') {
      navigate('/dashboard');
      return;
    }

    if (!bankId) {
      navigate('/bank-select');
      return;
    }

    loadBranches();
    loadBankDetails();
  }, [user, bankId]);

  const loadBankDetails = async () => {
    try {
      const data = await api.getBankById(bankId);
      setSelectedBank(data);
    } catch (error) {
      console.error('Error loading bank:', error);
    }
  };

  const loadBranches = async () => {
    try {
      setLoading(true);
      // 🔥 තමන්ගේ bank එකේ branches විතරයි
      const data = await api.getBranchesByBank(bankId);
      setBranches(data);
    } catch (error) {
      setError('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // 🔥 නව branch එකක් create කරනකොත් bankId එක set කරන්න
      const branchData = { 
        ...formData, 
        bankId: parseInt(bankId),
        createdBy: user?.userId
      };
      
      if (editingBranch) {
        await api.updateBranch(editingBranch.id, branchData);
        setSuccess('Branch updated successfully!');
      } else {
        await api.createBranch(branchData);
        setSuccess('Branch created successfully!');
      }
      setShowModal(false);
      resetForm();
      loadBranches();
    } catch (error) {
      setError(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    
    try {
      await api.deleteBranch(id);
      setSuccess('Branch deleted successfully!');
      loadBranches();
    } catch (error) {
      setError('Failed to delete branch');
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      branchCode: branch.branchCode,
      branchName: branch.branchName,
      address: branch.address || '',
      contactNumber: branch.contactNumber || '',
      email: branch.email || '',
      status: branch.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBranch(null);
    setFormData({
      branchCode: '',
      branchName: '',
      address: '',
      contactNumber: '',
      email: '',
      status: 'ACTIVE'
    });
  };

  if (user?.role !== 'BANK_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar onRefresh={loadBranches} />
      
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => navigate('/bank-select')}
              className="text-sm text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Change Bank
            </button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building className="w-8 h-8 text-blue-500" />
              {selectedBank?.bankName || 'Branches'}
            </h1>
            <p className="text-sm text-slate-400">Manage branches for this bank</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Branch
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

        {/* Branches Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading branches...</div>
          ) : branches.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No branches registered for this bank</p>
              <button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="mt-3 text-blue-400 hover:text-blue-300 transition-colors"
              >
                Add your first branch →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-4 px-6">Code</th>
                    <th className="py-4 px-6">Branch Name</th>
                    <th className="py-4 px-6">Address</th>
                    <th className="py-4 px-6">Contact</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {branches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {branch.branchCode}
                      </td>
                      <td className="py-4 px-6 text-white">{branch.branchName}</td>
                      <td className="py-4 px-6 text-slate-300 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{branch.address || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-sm">
                        <div className="space-y-0.5">
                          {branch.contactNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span>{branch.contactNumber}</span>
                            </div>
                          )}
                          {branch.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span className="truncate max-w-[120px]">{branch.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          branch.status === 'ACTIVE' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {branch.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(branch)}
                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(branch.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
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
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
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
                <label className="text-sm text-slate-400 block mb-1">Branch Code *</label>
                <input
                  type="text"
                  value={formData.branchCode}
                  onChange={(e) => setFormData({ ...formData, branchCode: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                  disabled={editingBranch}
                  placeholder="e.g., BR001"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">Branch Name *</label>
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                  placeholder="e.g., Colombo Main Branch"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., Colombo 03"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">Contact Number</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., 011-2224444"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., branch@samplebank.com"
                />
              </div>

              {editingBranch && (
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  {editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}