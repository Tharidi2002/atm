const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
  // Auth
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  // Banks
  getBanks: async () => {
    const response = await fetch(`${API_BASE_URL}/banks`);
    return response.json();
  },

  createBank: async (bankData) => {
    const response = await fetch(`${API_BASE_URL}/banks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bankData),
    });
    return response.json();
  },

  // Branches
  getBranchesByBank: async (bankId) => {
    const response = await fetch(`${API_BASE_URL}/branches/bank/${bankId}`);
    return response.json();
  },

  createBranch: async (branchData) => {
    const response = await fetch(`${API_BASE_URL}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData),
    });
    return response.json();
  },

  // ATMs
  getAtmsByBranch: async (branchId) => {
    const response = await fetch(`${API_BASE_URL}/atms/branch/${branchId}`);
    return response.json();
  },

  createAtm: async (atmData) => {
    const response = await fetch(`${API_BASE_URL}/atms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(atmData),
    });
    return response.json();
  },

  // Alerts
  getAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    return response.json();
  },

  getAlertsByBranch: async (branchId) => {
    const response = await fetch(`${API_BASE_URL}/alerts/branch/${branchId}`);
    return response.json();
  },

  resolveAlert: async (alertId, userId) => {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  },

  simulateSMS: async (simNumber, message) => {
    const response = await fetch(`${API_BASE_URL}/alerts/sms-simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simNumber, message }),
    });
    return response.json();
  },
};