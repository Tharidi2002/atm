import React, { useState } from 'react';
import { 
  MapPin, Clock, MessageSquare, Phone, Bell, AlertTriangle, 
  Eye, X, CheckCircle, Check
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import LoadingSkeleton from './LoadingSkeleton';

export default function AlertTable({ 
  alerts, 
  loading, 
  tableContainerRef,
  onResolve,
  userRole 
}) {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const getMessageIcon = (alertType) => {
    if (!alertType) return <MessageSquare className="w-4 h-4 text-slate-400" />;
    const lower = alertType.toLowerCase();
    if (lower.includes('call') || lower.includes('voice') || lower.includes('incoming')) {
      return <Phone className="w-4 h-4 text-blue-400" />;
    }
    if (lower.includes('alarm') || lower.includes('alert')) {
      return <Bell className="w-4 h-4 text-red-400" />;
    }
    if (lower.includes('zone')) {
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
    return <MessageSquare className="w-4 h-4 text-slate-400" />;
  };

  const getMessagePreview = (alertType) => {
    if (!alertType) return 'No message';
    if (alertType.length > 35) {
      return alertType.substring(0, 35) + '...';
    }
    return alertType;
  };

  const renderZoneBadges = (zoneNumbers) => {
    if (!zoneNumbers || zoneNumbers === '00' || zoneNumbers === '0') {
      return <span className="text-slate-500 text-xs">No Zone</span>;
    }
    const zones = zoneNumbers.split(',').map(z => z.trim()).filter(z => z !== '');
    if (zones.length === 0) return <span className="text-slate-500 text-xs">No Zone</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {zones.map((zone, index) => (
          <span key={index} className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Z{String(zone).padStart(2, '0')}
          </span>
        ))}
      </div>
    );
  };

  const handleMessageClick = (alert) => {
    setSelectedAlert(alert);
    setShowMessageModal(true);
  };

  const handleResolve = async (alertId) => {
    if (resolvingId) return;
    if (!window.confirm('Are you sure you want to resolve this alert?')) return;
    
    setResolvingId(alertId);
    try {
      await onResolve(alertId);
    } catch (error) {
      console.error('Error resolving:', error);
    } finally {
      setResolvingId(null);
    }
  };

  // 🔥 Check if user can resolve (BANK_USER or BRANCH_ADMIN)
  const canResolve = userRole === 'BANK_USER' || userRole === 'BRANCH_ADMIN';

  if (loading) return <LoadingSkeleton />;
  if (alerts.length === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 text-center">
        <div className="text-emerald-400 font-mono text-lg">🎉 System Secure. No alerts.</div>
      </div>
    );
  }

  return (
    <>
      <div ref={tableContainerRef} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden overflow-y-auto max-h-[600px] scroll-smooth">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-900/95 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-mono z-10 backdrop-blur">
              <tr>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">ATM</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Zones</th>
                <th className="py-4 px-6">Message</th>
                <th className="py-4 px-6">Time</th>
                {canResolve && (
                  <th className="py-4 px-6 text-center">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-900/40 transition-colors cursor-pointer">
                  <td className="py-4 px-6"><StatusBadge status={alert.status} /></td>
                  <td className="py-4 px-6 font-mono font-bold text-white text-sm">
                    {alert.atmMachine?.atmCode || 'UNKNOWN'}
                  </td>
                  <td className="py-4 px-6 text-slate-300 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate max-w-[150px]">{alert.atmMachine?.location || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">{renderZoneBadges(alert.zoneNumbers)}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleMessageClick(alert)}
                      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group max-w-xs"
                    >
                      {getMessageIcon(alert.alertType)}
                      <span className="text-sm font-mono group-hover:text-blue-400 transition-colors truncate">
                        {getMessagePreview(alert.alertType)}
                      </span>
                      <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    </button>
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-xs font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      {new Date(alert.receivedAt).toLocaleString()}
                    </div>
                  </td>
                  {canResolve && (
                    <td className="py-4 px-6">
                      {alert.status === 'PENDING' ? (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolvingId === alert.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors text-xs disabled:opacity-50"
                        >
                          {resolvingId === alert.id ? (
                            'Processing...'
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" /> Resolve
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">✓ Resolved</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-slate-800">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 hover:bg-slate-900/40 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={alert.status} />
                  <span className="font-mono font-bold text-white text-sm">
                    {alert.atmMachine?.atmCode || 'UNKNOWN'}
                  </span>
                </div>
                <button
                  onClick={() => handleMessageClick(alert)}
                  className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0"
                >
                  {getMessageIcon(alert.alertType)}
                </button>
              </div>
              
              <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{alert.atmMachine?.location || 'Unknown'}</span>
              </div>

              <div className="flex items-center gap-1 mb-1 flex-wrap">
                {renderZoneBadges(alert.zoneNumbers)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMessageClick(alert)}
                  className="flex-1 text-left text-xs text-slate-400 hover:text-white transition-colors truncate"
                >
                  {getMessagePreview(alert.alertType)}
                </button>
                <Eye className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {new Date(alert.receivedAt).toLocaleString()}
                </div>
                {canResolve && alert.status === 'PENDING' && (
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
          ))}
        </div>
      </div>

      {/* Message Details Modal */}
      {showMessageModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                {getMessageIcon(selectedAlert.alertType)}
                <h2 className="text-xl font-bold text-white">Message Details</h2>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-950 rounded-xl p-4 border border-slate-800">
                <div>
                  <p className="text-xs text-slate-400">ATM Code</p>
                  <p className="text-white font-mono font-bold">
                    {selectedAlert.atmMachine?.atmCode || 'UNKNOWN'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <StatusBadge status={selectedAlert.status} />
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="text-slate-300">{selectedAlert.atmMachine?.location || 'Unknown'}</p>
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <p className="text-xs text-slate-400 mb-2">Affected Zones</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.zoneNumbers && selectedAlert.zoneNumbers !== '00' ? (
                    selectedAlert.zoneNumbers.split(',').map((zone, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-bold">
                        Zone {String(zone).padStart(2, '0')}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">No Zone</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Full Message
                </p>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <p className="text-white font-mono text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {selectedAlert.rawMessage || selectedAlert.alertType || 'No message'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-sm border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Received: {new Date(selectedAlert.receivedAt).toLocaleString()}</span>
                </div>
                {canResolve && selectedAlert.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      handleResolve(selectedAlert.id);
                      setShowMessageModal(false);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors text-sm"
                  >
                    <Check className="w-4 h-4" /> Resolve Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}