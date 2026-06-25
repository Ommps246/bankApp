import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAnalytics, getTransactions, getAccounts } from '../../services/api';
import {
  Wallet, TrendingUp, TrendingDown, Receipt,
  ArrowLeftRight, CreditCard, Landmark, PiggyBank
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './Dashboard.css';

const categoryIcons = {
  income: '💰', housing: '🏠', food: '🍕', transport: '🚗',
  entertainment: '🎬', utilities: '⚡', shopping: '🛍️', investment: '📈',
  transfer: '↔️', business: '💼', insurance: '🛡️', health: '💊', other: '📋'
};

const COLORS = ['#7c4dff', '#00e5ff', '#00e676', '#ffc400', '#ff1744', '#448aff', '#f50057'];

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, txnData] = await Promise.all([
          getAnalytics(),
          getTransactions(),
        ]);
        setAnalytics(analyticsData);
        setTransactions(txnData.slice(0, 6));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="stat-cards">
          {[1,2,3,4].map(i => (
            <div key={i} className="stat-card glass-card" style={{ height: 140, opacity: 0.5 }}>
              <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>Loading...</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Balance',
      value: formatCurrency(analytics?.total_balance || 0),
      change: '+12.5%',
      positive: true,
      icon: Wallet,
      color: 'purple',
    },
    {
      label: 'Total Income',
      value: formatCurrency(analytics?.total_income || 0),
      change: '+8.2%',
      positive: true,
      icon: TrendingUp,
      color: 'cyan',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(analytics?.total_expense || 0),
      change: '-3.1%',
      positive: false,
      icon: TrendingDown,
      color: 'emerald',
    },
    {
      label: 'Transactions',
      value: analytics?.total_transactions || 0,
      change: '+24',
      positive: true,
      icon: Receipt,
      color: 'amber',
    },
  ];

  return (
    <div className="dashboard">
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's your financial overview</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {stats.map((stat, i) => (
          <div key={stat.label} className={`stat-card stat-card-${stat.color} animate-fade-in stagger-${i + 1}`}>
            <div className="stat-card-header">
              <div className={`stat-card-icon ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <span className={`stat-card-change ${stat.positive ? 'positive' : 'negative'}`}>
                {stat.change}
              </span>
            </div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Income vs Spending Chart */}
        <div className="dashboard-section animate-fade-in stagger-5">
          <div className="dashboard-section-header">
            <span className="dashboard-section-title">Income vs Spending</span>
            <span className="badge badge-info">Last 6 Months</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.monthly_spending || []}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e676" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00e676" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c4dff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c4dff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#5c6bc0" fontSize={12} />
                <YAxis stroke="#5c6bc0" fontSize={12} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,19,51,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, backdropFilter: 'blur(20px)', color: '#e8eaf6'
                  }}
                  formatter={(value) => [formatCurrency(value)]}
                />
                <Area type="monotone" dataKey="income" stroke="#00e676" strokeWidth={2} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="spending" stroke="#7c4dff" strokeWidth={2} fill="url(#colorSpending)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section animate-fade-in stagger-6">
          <div className="dashboard-section-header">
            <span className="dashboard-section-title">Quick Actions</span>
          </div>
          <div className="quick-actions">
            <Link to="/transfers" className="quick-action-btn">
              <div className="quick-action-icon" style={{ background: 'rgba(124,77,255,0.15)', color: 'var(--accent-purple)' }}>
                <ArrowLeftRight size={22} />
              </div>
              <span className="quick-action-label">Transfer</span>
            </Link>
            <Link to="/accounts" className="quick-action-btn">
              <div className="quick-action-icon" style={{ background: 'rgba(0,229,255,0.15)', color: 'var(--accent-cyan)' }}>
                <CreditCard size={22} />
              </div>
              <span className="quick-action-label">Accounts</span>
            </Link>
            <Link to="/investments" className="quick-action-btn">
              <div className="quick-action-icon" style={{ background: 'rgba(0,230,118,0.15)', color: 'var(--accent-emerald)' }}>
                <TrendingUp size={22} />
              </div>
              <span className="quick-action-label">Invest</span>
            </Link>
            <Link to="/loans" className="quick-action-btn">
              <div className="quick-action-icon" style={{ background: 'rgba(255,196,0,0.15)', color: 'var(--accent-amber)' }}>
                <Landmark size={22} />
              </div>
              <span className="quick-action-label">Loans</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions + Spending Breakdown */}
      <div className="dashboard-grid">
        {/* Recent Transactions */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <span className="dashboard-section-title">Recent Transactions</span>
            <Link to="/transactions" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          <div className="recent-txn-list">
            {transactions.map((txn) => (
              <div key={txn.id} className="recent-txn-item">
                <div className="recent-txn-icon" style={{ background: 'var(--surface-1)' }}>
                  {categoryIcons[txn.category] || '📋'}
                </div>
                <div className="recent-txn-info">
                  <div className="recent-txn-desc">{txn.description}</div>
                  <div className="recent-txn-date">{txn.date}</div>
                </div>
                <div className={`recent-txn-amount ${txn.type}`}>
                  {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spending Breakdown */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <span className="dashboard-section-title">Spending Breakdown</span>
          </div>
          <div style={{ height: 180, marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.spending_by_category || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="category"
                >
                  {(analytics?.spending_by_category || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,19,51,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, color: '#e8eaf6'
                  }}
                  formatter={(value) => [formatCurrency(value)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="spending-list">
            {(analytics?.spending_by_category || []).slice(0, 5).map((cat, i) => (
              <div key={cat.category} className="spending-item">
                <div className="spending-item-header">
                  <span className="spending-item-label">{cat.category}</span>
                  <span className="spending-item-value">{cat.percentage}%</span>
                </div>
                <div className="spending-bar">
                  <div
                    className="spending-bar-fill"
                    style={{ width: `${cat.percentage}%`, background: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
