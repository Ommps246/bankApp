import { useState, useEffect } from 'react';
import { getAdminUsers, getAdminStats, deleteUser } from '../../services/api';
import { Users, Wallet, Receipt, TrendingUp, Trash2, Shield } from 'lucide-react';
import './AdminPanel.css';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        getAdminUsers(),
        getAdminStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const adminStats = stats ? [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: '#7c4dff', bg: 'rgba(124,77,255,0.12)' },
    { label: 'Total Accounts', value: stats.total_accounts, icon: Wallet, color: '#00e5ff', bg: 'rgba(0,229,255,0.12)' },
    { label: 'Total Transactions', value: stats.total_transactions, icon: Receipt, color: '#00e676', bg: 'rgba(0,230,118,0.12)' },
    { label: 'System Balance', value: formatCurrency(stats.total_balance), icon: TrendingUp, color: '#ffc400', bg: 'rgba(255,196,0,0.12)' },
  ] : [];

  return (
    <div className="admin-page">
      <h1>Admin Panel 🛡️</h1>

      {/* System Stats */}
      <div className="admin-stats">
        {adminStats.map((stat, i) => (
          <div key={stat.label} className={`admin-stat-card animate-fade-in stagger-${i+1}`}>
            <div className="admin-stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div className="admin-stat-value">{stat.value}</div>
            <div className="admin-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Additional Stats Row */}
      {stats && (
        <div className="admin-stats" style={{ marginBottom: 28 }}>
          <div className="admin-stat-card">
            <div className="admin-stat-value" style={{ color: 'var(--accent-emerald)', fontSize: '1.2rem' }}>
              {formatCurrency(stats.total_deposits)}
            </div>
            <div className="admin-stat-label">Total Deposits</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value" style={{ color: 'var(--accent-rose)', fontSize: '1.2rem' }}>
              {formatCurrency(stats.total_withdrawals)}
            </div>
            <div className="admin-stat-label">Total Withdrawals</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value" style={{ color: 'var(--accent-amber)', fontSize: '1.2rem' }}>
              {stats.active_loans}
            </div>
            <div className="admin-stat-label">Active Loans</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value" style={{ color: 'var(--accent-purple)', fontSize: '1.2rem' }}>
              {stats.total_investments}
            </div>
            <div className="admin-stat-label">Total Investments</div>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>User Management</h2>
          <span className="badge badge-purple">{users.length} users</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Accounts</th>
              <th>Total Balance</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} className={`animate-fade-in stagger-${Math.min(i+1, 6)}`}>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-user-avatar" style={{ background: user.role === 'admin' ? 'var(--gradient-amber)' : 'var(--gradient-primary)' }}>
                      {user.avatar}
                    </div>
                    <div>
                      <div className="admin-user-name">{user.name}</div>
                      <div className="admin-user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-info'}`}>
                    {user.role === 'admin' && <Shield size={12} style={{ marginRight: 4 }} />}
                    {user.role}
                  </span>
                </td>
                <td>{user.accounts_count}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(user.total_balance)}</td>
                <td style={{ color: 'var(--text-muted)' }}>{user.created_at}</td>
                <td>
                  <div className="admin-actions">
                    {user.role !== 'admin' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user.id)}
                        title="Delete user"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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
