import React, { useEffect, useState } from 'react';
import { Bell, X, AlertTriangle, MapPin, Clock } from 'lucide-react';

export default function NotificationToast({ alert, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 8000); // තත්පර 8කින් auto close වෙනවා

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-slate-900 border-2 border-red-500/40 rounded-2xl max-w-lg w-full shadow-2xl transform transition-all duration-300 ${
        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2.5 rounded-xl border border-red-500/30 animate-pulse">
              <Bell className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-red-500">●</span>
                NEW ALERT!
              </h3>
              <p className="text-xs text-slate-400">Security incident detected</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* ATM Info */}
          <div className="flex items-center gap-3 bg-slate-950 rounded-xl p-3 border border-slate-800">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">ATM</p>
              <p className="text-white font-mono font-bold">
                {alert.atmMachine?.atmCode || 'UNKNOWN'}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-slate-300 text-sm bg-slate-950 rounded-lg p-2.5 border border-slate-800">
            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span>{alert.atmMachine?.location || 'Unknown Location'}</span>
          </div>

          {/* Zones */}
          {alert.zoneNumbers && alert.zoneNumbers !== '00' && (
            <div className="flex flex-wrap gap-1.5 bg-slate-950 rounded-lg p-2.5 border border-slate-800">
              <span className="text-xs text-slate-400 mr-1">Zones:</span>
              {alert.zoneNumbers.split(',').map((zone, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Z{String(zone).padStart(2, '0')}
                </span>
              ))}
            </div>
          )}

          {/* Message Preview */}
          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
            <p className="text-xs text-slate-400 mb-1">Message</p>
            <p className="text-white text-sm font-mono break-words">
              {alert.alertType?.substring(0, 80) || 'No message'}
              {alert.alertType?.length > 80 && '...'}
            </p>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(alert.receivedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="flex gap-3 p-5 border-t border-slate-800">
          <button
            onClick={handleClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              handleClose();
              // Redirect to dashboard or alerts page
              window.location.href = '/dashboard';
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            View Alert
          </button>
        </div>
      </div>
    </div>
  );
}