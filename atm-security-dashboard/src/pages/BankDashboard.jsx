import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, MapPin, Smartphone, Activity, Eye, 
  X, CheckCircle, AlertCircle, XCircle,
  LayoutDashboard, Server, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/Navbar';

export default function BankDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bank, setBank] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showAtmModal, setShowAtmModal] = useState(false);
  const [selectedAtm, setSelectedAtm] = useState(null);
  const [stats, setStats] = useState({
    totalBranches: 0,
    activeBranches: 0,
    totalATMs: 0,
    activeATMs: 0,
    maintenanceATMs: 0
  });

  // 🔥 Bank Admin නෙවෙයි නම් redirect කරන්න
  useEffect(() => {
    if (user?.role !== 'BANK_ADMIN') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const bankId = localStorage.getItem('selectedBankId') || user?.bankId;

  useEffect(() => {
    if (!bankId) {
      navigate('/bank-select');
      return;
    }
    loadData();
  }, [bankId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const bankData = await api.getBankById(bankId);
      setBank(bankData);
      
      const branchesData = await api.getBranchesByBank(bankId);
      
      let totalATMs = 0;
      let activeATMs = 0;
      let maintenanceATMs = 0;
      
      const branchesWithAtms = await Promise.all(
        branchesData.map(async (branch) => {
          const atms = await api.getAtmsByBranch(branch.id);
          totalATMs += atms.length;
          activeATMs += atms.filter(a => a.status === 'ACTIVE').length;
          maintenanceATMs += atms.filter(a => a.status === 'MAINTENANCE').length;
          return { ...branch, atms };
        })
      );
      
      setBranches(branchesWithAtms);
      
      setStats({
        totalBranches: branchesData.length,
        activeBranches: branchesData.filter(b => b.status === 'ACTIVE').length,
        totalATMs,
        activeATMs,
        maintenanceATMs
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewBranchDetails = (branch) => {
    setSelectedBranch(branch);
    setShowBranchModal(true);
  };

  const viewAtmDetails = (atm) => {
    setSelectedAtm(atm);
    setShowAtmModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'ACTIVE': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      'INACTIVE': 'bg-red-500/20 text-red-400 border border-red-500/30',
      'MAINTENANCE': 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    };
    const icons = {
      'ACTIVE': <CheckCircle className="w-3 h-3" />,
      'INACTIVE': <XCircle className="w-3 h-3" />,
      'MAINTENANCE': <AlertCircle className="w-3 h-3" />
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || styles.ACTIVE}`}>
        {icons[status] || icons.ACTIVE}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar onRefresh={loadData} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-slate-400">Loading bank data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar onRefresh={loadData} />
      
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Bank Header */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                <Building className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{bank?.bankName}</h1>
                <p className="text-sm text-slate-400">{bank?.bankCode} • {bank?.address || 'No address'}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/branches')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <LayoutDashboard className="w-4 h-4" /> Manage Branches
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Branches</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalBranches}</p>
            <p className="text-xs text-emerald-400 mt-0.5">{stats.activeBranches} active</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total ATMs</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalATMs}</p>
            <p className="text-xs text-emerald-400 mt-0.5">{stats.activeATMs} active</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Active ATMs</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.activeATMs}</p>
            <p className="text-xs text-slate-400 mt-0.5">Online & running</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Maintenance</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stats.maintenanceATMs}</p>
            <p className="text-xs text-slate-400 mt-0.5">Under maintenance</p>
          </div>
        </div>

        {/* Branches List with ATMs */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              Branches & ATMs
            </h2>
            <span className="text-xs text-slate-400">{branches.length} branches</span>
          </div>

          {branches.length === 0 ? (
            <div className="p-12 text-center">
              <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No branches found</p>
              <button
                onClick={() => navigate('/branches')}
                className="mt-3 text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                Add your first branch →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {branches.map((branch) => (
                <div key={branch.id} className="p-4 hover:bg-slate-900/40 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-white font-semibold">{branch.branchName}</h3>
                        {getStatusBadge(branch.status)}
                      </div>
                      <p className="text-sm text-slate-400">{branch.branchCode}</p>
                      {branch.address && (
                        <p className="text-xs text-slate-500 mt-0.5">{branch.address}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          {branch.atms?.length || 0} ATMs
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {branch.atms?.filter(a => a.status === 'ACTIVE').length || 0} active
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => viewBranchDetails(branch)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                      <button
                        onClick={() => {
                          localStorage.setItem('selectedBranchId', branch.id);
                          navigate('/atms');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors text-xs"
                      >
                        <Server className="w-3.5 h-3.5" /> Manage ATMs
                      </button>
                    </div>
                  </div>

                  {/* ATM Summary */}
                  {branch.atms && branch.atms.length > 0 && (
                    <div className="mt-3 ml-4 pl-4 border-l-2 border-slate-700 space-y-1.5">
                      <p className="text-xs text-slate-500 font-mono">ATMs:</p>
                      {branch.atms.slice(0, 3).map((atm) => (
                        <div key={atm.id} className="flex items-center gap-3 text-xs flex-wrap">
                          <span className="font-mono text-white">{atm.atmCode}</span>
                          <span className="text-slate-400">{atm.location}</span>
                          {getStatusBadge(atm.status)}
                          <button
                            onClick={() => viewAtmDetails(atm)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {branch.atms.length > 3 && (
                        <p className="text-xs text-slate-500">
                          + {branch.atms.length - 3} more ATMs
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Branch Details Modal */}
      {showBranchModal && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-400" />
                Branch Details
              </h2>
              <button
                onClick={() => setShowBranchModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Branch Code</p>
                  <p className="text-white font-mono">{selectedBranch.branchCode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  {getStatusBadge(selectedBranch.status)}
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Branch Name</p>
                  <p className="text-white font-semibold">{selectedBranch.branchName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Address</p>
                  <p className="text-slate-300">{selectedBranch.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Contact</p>
                  <p className="text-slate-300">{selectedBranch.contactNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-slate-300">{selectedBranch.email || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  ATMs ({selectedBranch.atms?.length || 0})
                </h3>
                {selectedBranch.atms && selectedBranch.atms.length > 0 ? (
                  <div className="space-y-2">
                    {selectedBranch.atms.map((atm) => (
                      <div key={atm.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <p className="text-white font-mono text-sm">{atm.atmCode}</p>
                          <p className="text-xs text-slate-400">{atm.location}</p>
                          <p className="text-xs text-slate-500">SIM: {atm.simNumber}</p>
                        </div>
                        {getStatusBadge(atm.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No ATMs in this branch</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATM Details Modal */}
      {showAtmModal && selectedAtm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-emerald-400" />
                ATM Details
              </h2>
              <button
                onClick={() => setShowAtmModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">ATM Code</p>
                  <p className="text-white font-mono text-lg">{selectedAtm.atmCode}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="text-slate-300">{selectedAtm.location}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">SIM Number</p>
                  <p className="text-white font-mono">{selectedAtm.simNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  {getStatusBadge(selectedAtm.status)}
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Bank</p>
                  <p className="text-slate-300">{bank?.bankName}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800">
                  <p className="text-xs text-slate-400">Created</p>
                  <p className="text-slate-300 text-sm">{new Date(selectedAtm.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}