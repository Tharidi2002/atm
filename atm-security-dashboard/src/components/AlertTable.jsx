import React from 'react';
import { MapPin, Clock, MessageSquare, Phone, Bell, AlertTriangle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import LoadingSkeleton from './LoadingSkeleton';

export default function AlertTable({ alerts, loading, tableContainerRef }) {
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

  if (loading) return <LoadingSkeleton />;
  if (alerts.length === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 text-center">
        <div className="text-emerald-400 font-mono text-lg">🎉 System Secure. No alerts.</div>
      </div>
    );
  }

  return (
    <div ref={tableContainerRef} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden overflow-y-auto max-h-[600px] scroll-smooth">
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
                  <div className="flex items-center gap-2 text-slate-400 group max-w-xs">
                    {getMessageIcon(alert.alertType)}
                    <span className="text-sm font-mono truncate">{alert.alertType?.substring(0, 50) || 'No message'}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-400 text-xs font-mono whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    {new Date(alert.receivedAt).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}