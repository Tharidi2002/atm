import React from 'react';
import { Shield, RefreshCw, LogOut, Building, MapPin, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Navbar({ onRefresh }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('selectedBankId');
    navigate('/login');
  };

  // Current page එක check කරන්න
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          <Shield className="w-6 h-6 text-red-500 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wider uppercase text-white">ATM SECURITY</h1>
          <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            {user?.role || 'LIVE'} MONITORING
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-center sm:justify-end">
        {/* Super Admin - Banks Link */}
        {user?.role === 'SUPER_ADMIN' && (
          <Link
            to="/banks"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
              isActive('/banks')
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400'
            }`}
          >
            <Building className="w-4 h-4" /> Banks
          </Link>
        )}

        {/* Bank Admin - Dashboard Link */}
        {user?.role === 'BANK_ADMIN' && (
          <>
            <Link
              to="/bank-select"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/bank-select') || isActive('/branches')
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400'
              }`}
            >
              <Building className="w-4 h-4" /> Branches
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/dashboard')
                  ? 'bg-slate-700/50 border-slate-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Home className="w-4 h-4" /> Dashboard
            </Link>
            
          </>
        )}

        {/* Branch Admin - ATMs Link */}
        {user?.role === 'BRANCH_ADMIN' && (
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
              isActive('/dashboard')
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
            }`}
          >
            <MapPin className="w-4 h-4" /> ATMs
          </Link>
        )}

        <span className="text-xs text-slate-400 hidden sm:block">👤 {user?.fullName || 'User'}</span>
        
        <button 
          onClick={onRefresh}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm transition-all border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-lg text-sm transition-all border border-red-500/20 text-red-400"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </nav>
  );
}