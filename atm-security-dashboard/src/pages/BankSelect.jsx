import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ChevronRight, AlertCircle, Shield } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function BankSelect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'BANK_ADMIN') {
      navigate('/dashboard');
      return;
    }

    loadBanks();
  }, [user]);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const data = await api.getBanks();
      
      // 🔥 IMPORTANT: Bank Admin ට තමන්ගේ bank එක විතරයි පෙන්වන්න
      // user.bankId එක use කරලා filter කරන්න
      const filteredBanks = data.filter(bank => bank.id === user?.bankId);
      
      // Super Admin වගේ bankId එක null නම් ඔක්කොම පෙන්වන්න
      setBanks(filteredBanks.length > 0 ? filteredBanks : data);
      
    } catch (error) {
      setError('Failed to load banks');
    } finally {
      setLoading(false);
    }
  };

  const selectBank = (bankId) => {
    localStorage.setItem('selectedBankId', bankId);
    navigate('/branches');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading banks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-blue-500/10 p-3 rounded-2xl inline-block border border-blue-500/20">
            <Building className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mt-4">Select Your Bank</h1>
          <p className="text-slate-400 text-sm">Choose the bank you want to manage</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {banks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No banks available</p>
            <p className="text-slate-500 text-sm mt-2">Please contact system administrator</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => selectBank(bank.id)}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <Building className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-semibold">{bank.bankName}</h3>
                    <p className="text-slate-400 text-sm">{bank.bankCode}</p>
                    {bank.address && (
                      <p className="text-slate-500 text-xs mt-0.5">{bank.address}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}