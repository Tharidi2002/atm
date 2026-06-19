import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Clock, MapPin, Radio, RefreshCw } from 'lucide-react';

function App() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  // Backend එකෙන් දත්ත ලබාගැනීමේ ශ්‍රිතය (Fetch Alerts)
  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/alerts');
      const data = await response.json();
      setAlerts(data);
      
      // සටහන් (Stats) ගණනය කිරීම
      const pending = data.filter(a => a.status === 'PENDING').length;
      const resolved = data.filter(a => a.status === 'RESOLVED').length;
      setStats({ total: data.length, pending, resolved });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // සෑම තත්පර 5කට වරක්ම Dashboard එක සජීවීව Refresh වීම (Real-time Simulation)
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
            <Shield className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider uppercase text-white">CENTRALIZED ATM SECURITY</h1>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> LIVE MONITORING SYSTEM
            </p>
          </div>
        </div>
        <button 
          onClick={fetchAlerts} 
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition-all border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Now
        </button>
      </nav>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Analytics/Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-lg shadow-black/20">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Incidents</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-blue-400"><Radio /></div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-lg shadow-black/20">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Threats</p>
              <h3 className="text-3xl font-bold text-red-500 mt-1">{stats.pending}</h3>
            </div>
            <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-red-500"><AlertTriangle /></div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-lg shadow-black/20">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Resolved Cases</p>
              <h3 className="text-3xl font-bold text-emerald-500 mt-1">{stats.resolved}</h3>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400"><CheckCircle2 /></div>
          </div>
        </div>

        {/* Live Alert Logs Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-center">
            <h2 className="text-md font-semibold text-white tracking-wide uppercase">Real-Time Threat Logs</h2>
            <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">Showing latest entries</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-mono">Loading dynamic shield logs...</div>
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono">🎉 System Secure. No security breaches reported.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-mono">
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">ATM Unit</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Zone Intercepted</th>
                    <th className="py-4 px-6">Payload / Message</th>
                    <th className="py-4 px-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-sans text-sm">
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                          alert.status === 'PENDING' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${alert.status === 'PENDING' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></span>
                          {alert.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {alert.atmMachine ? alert.atmMachine.atmCode : 'UNKNOWN'}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {alert.atmMachine ? alert.atmMachine.location : 'External Network Device'}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-amber-400 font-semibold">
                        Zone {alert.zoneNumber ? String(alert.zoneNumber).padStart(2, '0') : '00'}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-400 max-w-xs truncate">
                        {alert.alertType}
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs font-mono">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(alert.receivedAt).toLocaleString()}
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
    </div>
  );
}

export default App;