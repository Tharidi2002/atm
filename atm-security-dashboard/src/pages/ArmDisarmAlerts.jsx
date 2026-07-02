import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, AlertTriangle, MapPin, Clock, Eye, 
  Search, X, Check, RefreshCw,
  ChevronDown, ChevronUp, Power, PowerOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

export default function ArmDisarmAlerts() {
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
  const [expandedRows, setExpandedRows] = useState({});
  const [resolvingId, setResolvingId] = useState(null);

  // Role-based access
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user?.role === 'SUPER_ADMIN') {
      navigate('/banks');
      return;
    }
    
    if (user?.role === 'BANK_ADMIN') {
      navigate('/bank-dashboard');
      return;
    }
    
    if (user?.role !== 'BRANCH_ADMIN' && user?.role !== 'BANK_USER') {
      navigate('/dashboard');
      return;
    }
    
    loadArmDisarmAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const loadArmDisarmAlerts = async () => {
    try {
      setLoading(true);
      let allAlerts = [];
      
      if (user?.role === 'BRANCH_ADMIN' || user?.role === 'BANK_USER') {
        allAlerts = await api.getAlertsByBranch(user?.branchId);
      }
      
      // Filter only ARMED and DISARMED alerts (exclude Zone alerts)
      const armDisarmAlerts = allAlerts.filter(alert => {
        if (!alert.alertType) return false;
        const upper = alert.alertType.toUpperCase().trim();
        
        // Exact match for ARMED or DISARMED (not containing ZONE or ALARM)
        const isArmed = upper.includes('ARMED') && !upper.includes('ZONE') && !upper.includes('ALARM');
        const isDisarmed = (upper.includes('DISARMED') || upper.includes('DISARM')) && !upper.includes('ZONE') && !upper.includes('ALARM');
        
        return isArmed || isDisarmed;
      });
      
      setAlerts(armDisarmAlerts);
      setFilteredAlerts(armDisarmAlerts);
    } catch (error) {
      console.error('Error loading ARM/DISARM alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    if (resolvingId) return;
    if (!window.confirm('Are you sure you want to resolve this DISARMED alert?')) return;
    
    setResolvingId(alertId);
    try {
      await api.resolveAlert(alertId, user?.userId);
      loadArmDisarmAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    } finally {
      setResolvingId(null);
    }
  };

  // Filter effect
  useEffect(() => {
    let filtered = alerts;
    
    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.atmMachine?.atmCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.atmMachine?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.alertType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }
    
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

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isArmed = (alertType) => {
    if (!alertType) return false;
    const upper = alertType.toUpperCase();
    return upper.includes('ARMED') && !upper.includes('DISARMED');
  };

  const isDisarmed = (alertType) => {
    if (!alertType) return false;
    const upper = alertType.toUpperCase();
    return upper.includes('DISARMED') || (upper.includes('DISARM') && !upper.includes('ARMED'));
  };

  const getTypeIcon = (alertType) => {
    if (isArmed(alertType)) {
      return <Power className="w-3.5 h-3.5 text-green-400" />;
    } else if (isDisarmed(alertType)) {
      return <PowerOff className="w-3.5 h-3.5 text-red-400" />;
    }
    return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
  };

  const getTypeBadge = (alertType) => {
    if (isArmed(alertType)) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
          ARMED
        </span>
      );
    } else if (isDisarmed(alertType)) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
          DISARMED
        </span>
      );
    }
    return null;
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

  // Can resolve only DISARMED alerts
  const canResolve = (alert) => {
    return (user?.role === 'BANK_USER' || user?.role === 'BRANCH_ADMIN') && 
           alert.status === 'PENDING' &&
           isDisarmed(alert.alertType);
  };

  const showResolveColumn = user?.role === 'BANK_USER' || user?.role === 'BRANCH_ADMIN';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar onRefresh={loadArmDisarmAlerts} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-slate-400">Loading ARM/DISARM alerts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar onRefresh={loadArmDisarmAlerts} />
      
      <main className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <div className="bg-red-500/10 p-1.5 sm:p-2 rounded-xl border border-red-500/20">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-red-500" />
              </div>
              ARM / DISARM Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
              {filteredAlerts.length} alerts found • {alerts.filter(a => a.status === 'PENDING').length} pending
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] sm:text-xs text-slate-500 hidden xs:block">
              {new Date().toLocaleTimeString()}
            </span>
            <button
              onClick={loadArmDisarmAlerts}
              className="flex items-center gap-1 sm:gap-2 bg-slate-800 hover:bg-slate-700 px-2 sm:px-3 py-1.5 rounded-lg transition-colors text-[10px] sm:text-sm"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" /> 
              <span className="hidden xs:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">{alerts.length}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Pending</p>
            <p className="text-xl sm:text-2xl font-bold text-red-400 mt-0.5 sm:mt-1">
              {alerts.filter(a => a.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Resolved</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5 sm:mt-1">
              {alerts.filter(a => a.status === 'RESOLVED').length}
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Today</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-400 mt-0.5 sm:mt-1">
              {alerts.filter(a => new Date(a.receivedAt).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 text-white focus:outline-none focus:border-red-500 transition-colors text-xs sm:text-sm"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-white focus:outline-none focus:border-red-500 transition-colors text-xs sm:text-sm flex-1 sm:flex-none"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-white focus:outline-none focus:border-red-500 transition-colors text-xs sm:text-sm flex-1 sm:flex-none"
              />
              
              {(searchTerm || statusFilter !== 'ALL' || dateFilter) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-red-400 transition-colors text-xs sm:text-sm"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" /> 
                  <span className="hidden xs:inline">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Table/Cards */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm sm:text-base">No ARM/DISARM alerts found</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                No ARMED or DISARMED alerts in the system yet
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-mono">
                    <tr>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">ATM</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Message</th>
                      <th className="py-3 px-4">Time</th>
                      {showResolveColumn && (
                        <th className="py-3 px-4 text-center">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <StatusBadge status={alert.status} alertType={alert.alertType} />
                        </td>
                        <td className="py-3 px-4">{getTypeBadge(alert.alertType)}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                          {alert.atmMachine?.atmCode || 'UNKNOWN'}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span className="truncate max-w-[120px]">{alert.atmMachine?.location || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 max-w-xs">
                            {getTypeIcon(alert.alertType)}
                            <span className="text-sm text-slate-300 truncate">
                              {getMessagePreview(alert.alertType)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs font-mono whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            {new Date(alert.receivedAt).toLocaleString()}
                          </div>
                        </td>
                        {showResolveColumn && (
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => viewDetails(alert)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors text-xs"
                              >
                                <Eye className="w-3.5 h-3.5" /> Details
                              </button>
                              {canResolve(alert) && (
                                <button
                                  onClick={() => handleResolve(alert.id)}
                                  disabled={resolvingId === alert.id}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors text-xs disabled:opacity-50"
                                >
                                  {resolvingId === alert.id ? (
                                    '...'
                                  ) : (
                                    <>
                                      <Check className="w-3.5 h-3.5" /> Resolve
                                    </>
                                  )}
                                </button>
                              )}
                              {alert.status === 'RESOLVED' && (
                                <span className="text-xs text-slate-500">✓ Resolved</span>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-800">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 sm:p-4 hover:bg-slate-900/40 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={alert.status} alertType={alert.alertType} />
                        {getTypeBadge(alert.alertType)}
                        <span className="font-mono font-bold text-white text-xs sm:text-sm">
                          {alert.atmMachine?.atmCode || 'UNKNOWN'}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleRow(alert.id)}
                        className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        {expandedRows[alert.id] ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{alert.atmMachine?.location || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getTypeIcon(alert.alertType)}
                        <span className="text-xs text-slate-300 truncate flex-1">
                          {getMessagePreview(alert.alertType)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          {new Date(alert.receivedAt).toLocaleString()}
                        </div>
                        {canResolve(alert) && (
                          <button
                            onClick={() => handleResolve(alert.id)}
                            disabled={resolvingId === alert.id}
                            className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors text-xs disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" /> Resolve
                          </button>
                        )}
                      </div>
                    </div>

                    {expandedRows[alert.id] && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                        <div className="bg-slate-900 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 mb-1">Full Message</p>
                          <p className="text-xs text-white font-mono break-words">
                            {alert.rawMessage || alert.alertType || 'No message'}
                          </p>
                        </div>
                        <button
                          onClick={() => viewDetails(alert)}
                          className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Full Details
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {showModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl mx-2 sm:mx-0">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-red-500/10 p-1.5 sm:p-2 rounded-lg border border-red-500/20">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-white">
                    {isArmed(selectedAlert.alertType) ? 'ARMED' : 'DISARMED'} Alert Details
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-400">ID: #{selectedAlert.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4">
                <h3 className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">Alert Information</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <p className="text-[8px] sm:text-[10px] text-slate-500">Type</p>
                    {getTypeBadge(selectedAlert.alertType)}
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] text-slate-500">Status</p>
                    <StatusBadge status={selectedAlert.status} alertType={selectedAlert.alertType} />
                  </div>
                  <div className="col-span-2">
                    <p className="text-[8px] sm:text-[10px] text-slate-500">ATM Code</p>
                    <p className="text-white font-mono font-bold text-xs sm:text-sm">{selectedAlert.atmMachine?.atmCode || 'UNKNOWN'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[8px] sm:text-[10px] text-slate-500">Location</p>
                    <p className="text-slate-300 text-xs sm:text-sm">{selectedAlert.atmMachine?.location || 'Unknown'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[8px] sm:text-[10px] text-slate-500">Full Message</p>
                    <div className="bg-slate-900 rounded-lg p-2 sm:p-3 border border-slate-700 mt-1">
                      <p className="text-white font-mono text-[10px] sm:text-sm break-words">
                        {selectedAlert.rawMessage || selectedAlert.alertType || 'No message'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] text-slate-500">Received</p>
                    <p className="text-slate-300 text-[10px] sm:text-sm">{new Date(selectedAlert.receivedAt).toLocaleString()}</p>
                  </div>
                  {selectedAlert.resolvedAt && (
                    <div>
                      <p className="text-[8px] sm:text-[10px] text-slate-500">Resolved</p>
                      <p className="text-emerald-400 text-[10px] sm:text-sm">{new Date(selectedAlert.resolvedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {canResolve(selectedAlert) && selectedAlert.status === 'PENDING' && (
                <button
                  onClick={() => {
                    handleResolve(selectedAlert.id);
                    setShowModal(false);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Resolve DISARMED Alert
                </button>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm"
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