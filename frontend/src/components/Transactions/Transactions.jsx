import { useState, useEffect } from 'react';
import { getTransactions } from '../../services/api';
import { Search } from 'lucide-react';
import './Transactions.css';

const categoryIcons = {
  income: '💰', housing: '🏠', food: '🍕', transport: '🚗',
  entertainment: '🎬', utilities: '⚡', shopping: '🛍️', investment: '📈',
  transfer: '↔️', business: '💼', insurance: '🛡️', health: '💊', other: '📋'
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then(data => { setTransactions(data); setFiltered(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = transactions;
    if (search) {
      result = result.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));
    }
    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }
    setFiltered(result);
  }, [search, typeFilter, categoryFilter, transactions]);

  const categories = [...new Set(transactions.map(t => t.category))];

  return (
    <div className="transactions-page">
      <h1>Transaction History 📋</h1>

      <div className="transactions-filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, maxWidth: '100%' }}
          />
        </div>
        <select className="select-field" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="credit">Credits</option>
          <option value="debit">Debits</option>
        </select>
        <select className="select-field" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="badge badge-purple" style={{ alignSelf: 'center' }}>
          {filtered.length} transactions
        </span>
      </div>

      <div className="transactions-table-wrapper">
        {filtered.length === 0 ? (
          <div className="txn-empty">
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</p>
            <p>No transactions found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn, i) => (
                <tr key={txn.id} className={`animate-fade-in stagger-${Math.min(i + 1, 6)}`}>
                  <td>
                    <div className="txn-desc-cell">
                      <span className="txn-type-icon" style={{ background: 'var(--surface-1)' }}>
                        {categoryIcons[txn.category] || '📋'}
                      </span>
                      {txn.description}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                      {txn.category}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{txn.date}</td>
                  <td><span className="badge badge-success">Completed</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`txn-amount ${txn.type}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
