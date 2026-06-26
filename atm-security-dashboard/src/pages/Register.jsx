import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock, AlertCircle, Building } from 'lucide-react';
import { api } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'BANK_USER',
    bankId: '',
    branchId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Banks load කරන්න (role එක BANK_ADMIN හෝ BRANCH_ADMIN නම්)
  useEffect(() => {
    if (formData.role === 'BANK_ADMIN' || formData.role === 'BRANCH_ADMIN' || formData.role === 'BANK_USER') {
      loadBanks();
    } else {
      setBanks([]);
      setBranches([]);
      setFormData(prev => ({ ...prev, bankId: '', branchId: '' }));
    }
  }, [formData.role]);

  // Branches load කරන්න (bankId එකක් selected නම්)
  useEffect(() => {
    if (formData.bankId && (formData.role === 'BRANCH_ADMIN' || formData.role === 'BANK_USER')) {
      loadBranches(formData.bankId);
    } else {
      setBranches([]);
      if (formData.role !== 'BANK_ADMIN') {
        setFormData(prev => ({ ...prev, branchId: '' }));
      }
    }
  }, [formData.bankId, formData.role]);

  const loadBanks = async () => {
    try {
      setLoadingBanks(true);
      const data = await api.getBanks();
      // Active banks විතරයි පෙන්වන්න
      setBanks(data.filter(b => b.status === 'ACTIVE'));
    } catch (error) {
      console.error('Error loading banks:', error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const loadBranches = async (bankId) => {
    try {
      const data = await api.getBranchesByBank(bankId);
      setBranches(data.filter(b => b.status === 'ACTIVE'));
    } catch (error) {
      console.error('Error loading branches:', error);
      setBranches([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        bankId: formData.bankId ? parseInt(formData.bankId) : null,
        branchId: formData.branchId ? parseInt(formData.branchId) : null,
      };
      
      await api.register(submitData);
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Role එක අනුව bank/branch fields පෙන්වන්නද කියලා check කරන්න
  const showBankField = ['BANK_ADMIN', 'BRANCH_ADMIN', 'BANK_USER'].includes(formData.role);
  const showBranchField = ['BRANCH_ADMIN', 'BANK_USER'].includes(formData.role);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="bg-red-500/10 p-3 rounded-2xl inline-block border border-red-500/20">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mt-3">Create Account</h1>
          <p className="text-slate-400 text-sm">Register as a new user</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4 text-emerald-400 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-10 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Username *</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-10 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-10 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-10 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                required
                minLength="6"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="BANK_USER">Bank User</option>
              <option value="BRANCH_ADMIN">Branch Admin</option>
              <option value="BANK_ADMIN">Bank Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {/* Bank Selection - BANK_ADMIN, BRANCH_ADMIN, BANK_USER ට පෙන්වන්න */}
          {showBankField && (
            <div>
              <label className="text-sm text-slate-400 block mb-1">
                {formData.role === 'BANK_ADMIN' ? 'Select Bank *' : 'Select Bank *'}
              </label>
              <div className="relative">
                <Building className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={formData.bankId}
                  onChange={(e) => setFormData({ ...formData, bankId: e.target.value, branchId: '' })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-10 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                  required={formData.role !== 'SUPER_ADMIN'}
                >
                  <option value="">Select a bank</option>
                  {loadingBanks ? (
                    <option disabled>Loading banks...</option>
                  ) : (
                    banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bankName} ({bank.bankCode})
                      </option>
                    ))
                  )}
                </select>
              </div>
              {banks.length === 0 && !loadingBanks && (
                <p className="text-xs text-amber-400 mt-1">
                  ⚠️ No banks available. Please contact Super Admin.
                </p>
              )}
            </div>
          )}

          {/* Branch Selection - BRANCH_ADMIN, BANK_USER ට පෙන්වන්න */}
          {showBranchField && formData.bankId && (
            <div>
              <label className="text-sm text-slate-400 block mb-1">Select Branch *</label>
              <div className="relative">
                <Building className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-10 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                  required={formData.role !== 'SUPER_ADMIN' && formData.role !== 'BANK_ADMIN'}
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName} ({branch.branchCode})
                    </option>
                  ))}
                </select>
              </div>
              {branches.length === 0 && formData.bankId && (
                <p className="text-xs text-amber-400 mt-1">
                  ⚠️ No branches available for this bank.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-4">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}