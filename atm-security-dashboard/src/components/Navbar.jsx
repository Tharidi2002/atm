import React from 'react';
import { 
  Shield, RefreshCw, LogOut, Building, MapPin, Home, 
  LayoutDashboard, Server, AlertTriangle, Smartphone,
  Users, Settings, Bell, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Navbar({ onRefresh }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('selectedBankId');
    localStorage.removeItem('selectedBranchId');
    navigate('/login');
  };

  // Current page එක check කරන්න
  const isActive = (path) => location.pathname === path;

  // Role-based navigation items
  const renderNavLinks = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return (
          <>
            <Link
              to="/banks"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/banks')
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400'
              }`}
            >
              <Building className="w-4 h-4" /> 
              <span className="hidden xs:inline">Banks</span>
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/dashboard')
                  ? 'bg-slate-700/50 border-slate-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Home className="w-4 h-4" /> 
              <span className="hidden xs:inline">Dashboard</span>
            </Link>
          </>
        );

      case 'BANK_ADMIN':
        return (
          <>
            <Link
              to="/bank-dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/bank-dashboard')
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> 
              <span className="hidden xs:inline">Dashboard</span>
            </Link>
            <Link
              to="/bank-select"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/bank-select') || isActive('/branches')
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400'
              }`}
            >
              <Building className="w-4 h-4" /> 
              <span className="hidden xs:inline">Branches</span>
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/dashboard')
                  ? 'bg-slate-700/50 border-slate-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Home className="w-4 h-4" /> 
              <span className="hidden xs:inline">Home</span>
            </Link>
          </>
        );

      case 'BRANCH_ADMIN':
        return (
          <>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/dashboard')
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> 
              <span className="hidden xs:inline">Alerts</span>
            </Link>
            <Link
              to="/atms"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/atms')
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400'
              }`}
            >
              <Server className="w-4 h-4" /> 
              <span className="hidden xs:inline">ATMs</span>
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/dashboard')
                  ? 'bg-slate-700/50 border-slate-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Home className="w-4 h-4" /> 
              <span className="hidden xs:inline">Home</span>
            </Link>
          </>
        );

      case 'BANK_USER':
        return (
          <>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/dashboard')
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> 
              <span className="hidden xs:inline">Alerts</span>
            </Link>
            <Link
              to="/atms"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/atms')
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400'
              }`}
            >
              <Smartphone className="w-4 h-4" /> 
              <span className="hidden xs:inline">ATMs</span>
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                isActive('/dashboard')
                  ? 'bg-slate-700/50 border-slate-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Home className="w-4 h-4" /> 
              <span className="hidden xs:inline">Home</span>
            </Link>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur px-3 sm:px-6 py-2 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 sticky top-0 z-50">
      {/* Logo Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="bg-red-500/10 p-1.5 sm:p-2 rounded-lg border border-red-500/20">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-500 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xs sm:text-sm lg:text-lg font-bold tracking-wider uppercase text-white leading-tight">
            ATM SECURITY
          </h1>
          <p className="text-[8px] sm:text-[10px] lg:text-xs text-slate-400 font-mono flex items-center gap-1">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            {user?.role || 'LIVE'} MONITORING
          </p>
        </div>
      </div>
      
      {/* Navigation & Actions */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 w-full sm:w-auto flex-wrap justify-center sm:justify-end">
        {/* Role-based Navigation Links */}
        {renderNavLinks()}

        {/* User Info */}
        <span className="text-[8px] sm:text-[10px] lg:text-xs text-slate-400 hidden md:block truncate max-w-[80px] lg:max-w-none">
          👤 {user?.fullName?.split(' ')[0] || 'User'}
        </span>
        
        {/* Refresh Button */}
        <button 
          onClick={onRefresh}
          className="flex items-center gap-1 sm:gap-2 bg-slate-800 hover:bg-slate-700 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg text-[10px] sm:text-xs lg:text-sm transition-all border border-slate-700"
        >
          <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" /> 
          <span className="hidden xs:inline">Refresh</span>
        </button>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 sm:gap-2 bg-red-500/10 hover:bg-red-500/20 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg text-[10px] sm:text-xs lg:text-sm transition-all border border-red-500/20 text-red-400"
        >
          <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" /> 
          <span className="hidden xs:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}