const API_BASE = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('bankapp_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// ─── Auth ───
export const login = (username, password) =>
  fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then(handleResponse);

export const register = (userData) =>
  fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  }).then(handleResponse);

// ─── Accounts ───
export const getAccounts = () =>
  fetch(`${API_BASE}/accounts`, { headers: getHeaders() }).then(handleResponse);

export const createAccount = (data) =>
  fetch(`${API_BASE}/accounts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

// ─── Transfers ───
export const makeTransfer = (data) =>
  fetch(`${API_BASE}/transfer`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

// ─── Transactions ───
export const getTransactions = () =>
  fetch(`${API_BASE}/transactions`, { headers: getHeaders() }).then(handleResponse);

// ─── Analytics ───
export const getAnalytics = () =>
  fetch(`${API_BASE}/analytics`, { headers: getHeaders() }).then(handleResponse);

// ─── Investments ───
export const getInvestments = () =>
  fetch(`${API_BASE}/investments`, { headers: getHeaders() }).then(handleResponse);

export const buyInvestment = (data) =>
  fetch(`${API_BASE}/investments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

// ─── Loans ───
export const getLoans = () =>
  fetch(`${API_BASE}/loans`, { headers: getHeaders() }).then(handleResponse);

export const applyLoan = (data) =>
  fetch(`${API_BASE}/loans`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const calculateLoan = (data) =>
  fetch(`${API_BASE}/loans/calculate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

// ─── Admin ───
export const getAdminUsers = () =>
  fetch(`${API_BASE}/admin/users`, { headers: getHeaders() }).then(handleResponse);

export const getAdminStats = () =>
  fetch(`${API_BASE}/admin/stats`, { headers: getHeaders() }).then(handleResponse);

export const deleteUser = (userId) =>
  fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  }).then(handleResponse);
