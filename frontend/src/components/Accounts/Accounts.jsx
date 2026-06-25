import { useState, useEffect } from 'react';
import { getAccounts, createAccount, applyLoan, buyInvestment, getInvestments, getLoans } from '../../services/api';
import { PiggyBank, CreditCard, Briefcase, Plus, Landmark, TrendingUp } from 'lucide-react';
import './Accounts.css';

const typeIcons = {
  savings: PiggyBank,
  checking: CreditCard,
  business: Briefcase,
  loan: Landmark,
  investment: TrendingUp,
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loans, setLoans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState('savings');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  // Loan fields
  const [loanPrincipal, setLoanPrincipal] = useState('50000');
  const [loanRate, setLoanRate] = useState('8.5');
  const [loanTenure, setLoanTenure] = useState('60');
  const [loanType, setLoanType] = useState('Personal Loan');

  // Investment fields
  const [invSymbol, setInvSymbol] = useState('');
  const [invName, setInvName] = useState('');
  const [invShares, setInvShares] = useState('10');
  const [invBuyPrice, setInvBuyPrice] = useState('');
  const [invType, setInvType] = useState('stock');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [accs, lns, invs] = await Promise.all([
        getAccounts(),
        getLoans().catch(() => []),
        getInvestments().catch(() => ({ investments: [] })),
      ]);
      setAccounts(accs);
      setLoans(lns);
      setInvestments(invs.investments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setNewName('');
    setNewType('savings');
    setLoanPrincipal('50000');
    setLoanRate('8.5');
    setLoanTenure('60');
    setLoanType('Personal Loan');
    setInvSymbol('');
    setInvName('');
    setInvShares('10');
    setInvBuyPrice('');
    setInvType('stock');
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      if (newType === 'loan') {
        // Create a loan via the dedicated loans API
        await applyLoan({
          loan_type: loanType,
          name: newName || loanType,
          principal: parseFloat(loanPrincipal),
          rate: parseFloat(loanRate),
          tenure_months: parseInt(loanTenure),
        });
      } else if (newType === 'investment') {
        // Create an investment via the investments API
        await buyInvestment({
          symbol: invSymbol.toUpperCase(),
          name: invName || invSymbol.toUpperCase(),
          shares: parseFloat(invShares),
          buy_price: parseFloat(invBuyPrice),
          type: invType,
        });
      } else {
        await createAccount({ type: newType, name: newName || `New ${newType} Account` });
      }
      resetModal();
      loadAll();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Combine all items for display
  const allItems = [
    ...accounts.map(a => ({ ...a, _category: 'account' })),
    ...loans.map(l => ({ ...l, _category: 'loan', type: 'loan', name: l.type || 'Loan', balance: l.remaining || l.principal })),
    ...investments.map(inv => ({ ...inv, _category: 'investment', type: 'investment', name: inv.name || inv.symbol, balance: inv.current_value || 0 })),
  ];

  return (
    <div className="accounts-page">
      <div className="accounts-header">
        <div>
          <h1>Your Accounts & Assets</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Total Balance: <strong style={{ color: 'var(--accent-emerald)', fontSize: '1.1rem' }}>{formatCurrency(totalBalance)}</strong>
            {loans.length > 0 && (
              <span style={{ marginLeft: 16, color: 'var(--accent-amber)' }}>
                Loans: <strong>{formatCurrency(loans.reduce((s, l) => s + (l.remaining || l.principal || 0), 0))}</strong>
              </span>
            )}
            {investments.length > 0 && (
              <span style={{ marginLeft: 16, color: 'var(--accent-cyan)' }}>
                Investments: <strong>{formatCurrency(investments.reduce((s, inv) => s + (inv.current_value || 0), 0))}</strong>
              </span>
            )}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="new-account-btn">
          <Plus size={18} /> New Account
        </button>
      </div>

      {/* Account Type Filters */}
      <div className="account-type-pills">
        <span className="type-pill active">All ({allItems.length})</span>
        {accounts.length > 0 && <span className="type-pill">🏦 Accounts ({accounts.length})</span>}
        {loans.length > 0 && <span className="type-pill">🏛️ Loans ({loans.length})</span>}
        {investments.length > 0 && <span className="type-pill">📈 Investments ({investments.length})</span>}
      </div>

      <div className="accounts-grid">
        {/* Regular accounts */}
        {accounts.map((acc, i) => {
          const Icon = typeIcons[acc.type] || CreditCard;
          return (
            <div key={acc.id} className={`account-card ${acc.type} animate-fade-in stagger-${i + 1}`}>
              <div className="account-card-bg" />
              <div className="account-card-type">
                <Icon size={14} />
                {acc.type}
              </div>
              <div className="account-card-name">{acc.name}</div>
              <div className="account-card-number">{acc.account_number}</div>
              <div className="account-card-balance-label">Available Balance</div>
              <div className="account-card-balance">{formatCurrency(acc.balance)}</div>
            </div>
          );
        })}

        {/* Loan cards */}
        {loans.map((loan, i) => {
          const paidPct = loan.principal > 0 ? ((loan.principal - (loan.remaining || 0)) / loan.principal) * 100 : 0;
          return (
            <div key={loan.id} className={`account-card loan animate-fade-in stagger-${accounts.length + i + 1}`}>
              <div className="account-card-bg" />
              <div className="account-card-type">
                <Landmark size={14} />
                loan
              </div>
              <div className="account-card-name">{loan.type || 'Loan'}</div>
              <div className="account-card-number">Rate: {loan.rate}% · EMI: {formatCurrency(loan.emi || 0)}</div>
              <div className="loan-mini-progress">
                <div className="loan-mini-progress-bar" style={{ width: `${paidPct}%` }} />
              </div>
              <div className="account-card-balance-label">Remaining Balance</div>
              <div className="account-card-balance">{formatCurrency(loan.remaining || loan.principal)}</div>
              <div className="loan-badge-row">
                <span className={`mini-badge ${loan.status === 'active' ? 'mini-badge-success' : 'mini-badge-warning'}`}>{loan.status || 'active'}</span>
                <span className="mini-badge mini-badge-info">Paid {paidPct.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}

        {/* Investment cards */}
        {investments.map((inv, i) => (
          <div key={inv.id} className={`account-card investment animate-fade-in stagger-${accounts.length + loans.length + i + 1}`}>
            <div className="account-card-bg" />
            <div className="account-card-type">
              <TrendingUp size={14} />
              investment
            </div>
            <div className="account-card-name">{inv.name || inv.symbol}</div>
            <div className="account-card-number">{inv.symbol} · {inv.shares} shares @ {formatCurrency(inv.buy_price)}</div>
            <div className="account-card-balance-label">Current Value</div>
            <div className="account-card-balance">{formatCurrency(inv.current_value || 0)}</div>
            <div className="loan-badge-row">
              <span className={`mini-badge ${(inv.gain_loss || 0) >= 0 ? 'mini-badge-success' : 'mini-badge-danger'}`}>
                {(inv.gain_loss || 0) >= 0 ? '+' : ''}{(inv.gain_loss_pct || 0).toFixed(1)}%
              </span>
              <span className="mini-badge mini-badge-info">{inv.type || 'stock'}</span>
            </div>
          </div>
        ))}

        <div className="new-account-card" onClick={() => setShowModal(true)}>
          <div className="new-account-icon"><Plus size={24} /></div>
          <span style={{ fontWeight: 600 }}>Add New Account</span>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetModal}>
          <div className="modal-content modal-wide" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 8 }}>Create New Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Choose an account type and fill in the details</p>

            {/* Type Selector Tiles */}
            <div className="type-selector">
              {[
                { value: 'savings', icon: '🏦', label: 'Savings', desc: 'Earn interest on deposits' },
                { value: 'checking', icon: '💳', label: 'Checking', desc: 'Everyday transactions' },
                { value: 'business', icon: '💼', label: 'Business', desc: 'For your business needs' },
                { value: 'loan', icon: '🏛️', label: 'Loan', desc: 'Apply for a loan' },
                { value: 'investment', icon: '📈', label: 'Investment', desc: 'Buy stocks & assets' },
              ].map(t => (
                <div
                  key={t.value}
                  className={`type-tile ${newType === t.value ? 'type-tile-active' : ''}`}
                  onClick={() => setNewType(t.value)}
                >
                  <span className="type-tile-icon">{t.icon}</span>
                  <span className="type-tile-label">{t.label}</span>
                  <span className="type-tile-desc">{t.desc}</span>
                </div>
              ))}
            </div>

            {/* Standard account fields */}
            {(newType === 'savings' || newType === 'checking' || newType === 'business') && (
              <div className="modal-fields animate-fade-in">
                <div className="input-group">
                  <label>Account Name</label>
                  <input className="input-field" placeholder="e.g. Vacation Fund" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
              </div>
            )}

            {/* Loan fields */}
            {newType === 'loan' && (
              <div className="modal-fields animate-fade-in">
                <div className="input-group">
                  <label>Loan Type</label>
                  <select className="select-field" value={loanType} onChange={e => setLoanType(e.target.value)}>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Car Loan">Car Loan</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Business Loan">Business Loan</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Loan Name (optional)</label>
                  <input className="input-field" placeholder="e.g. My Home Loan" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>Principal Amount ($)</label>
                    <input className="input-field" type="number" min="1000" value={loanPrincipal} onChange={e => setLoanPrincipal(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Interest Rate (%)</label>
                    <input className="input-field" type="number" step="0.1" min="0.1" value={loanRate} onChange={e => setLoanRate(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Tenure (months)</label>
                    <input className="input-field" type="number" min="1" value={loanTenure} onChange={e => setLoanTenure(e.target.value)} required />
                  </div>
                </div>
                {loanPrincipal && loanRate && loanTenure && (() => {
                  const p = parseFloat(loanPrincipal), r = parseFloat(loanRate) / 12 / 100, n = parseInt(loanTenure);
                  const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
                  return (
                    <div className="loan-preview">
                      <div className="loan-preview-item">
                        <span className="loan-preview-label">Monthly EMI</span>
                        <span className="loan-preview-value">{formatCurrency(emi)}</span>
                      </div>
                      <div className="loan-preview-item">
                        <span className="loan-preview-label">Total Payment</span>
                        <span className="loan-preview-value">{formatCurrency(emi * n)}</span>
                      </div>
                      <div className="loan-preview-item">
                        <span className="loan-preview-label">Total Interest</span>
                        <span className="loan-preview-value" style={{ color: 'var(--accent-rose)' }}>{formatCurrency(emi * n - p)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Investment fields */}
            {newType === 'investment' && (
              <div className="modal-fields animate-fade-in">
                <div className="input-row">
                  <div className="input-group">
                    <label>Symbol / Ticker</label>
                    <input className="input-field" placeholder="e.g. AAPL" value={invSymbol} onChange={e => setInvSymbol(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Company Name</label>
                    <input className="input-field" placeholder="e.g. Apple Inc." value={invName} onChange={e => setInvName(e.target.value)} />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>Number of Shares</label>
                    <input className="input-field" type="number" min="0.01" step="0.01" value={invShares} onChange={e => setInvShares(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Buy Price per Share ($)</label>
                    <input className="input-field" type="number" min="0.01" step="0.01" value={invBuyPrice} onChange={e => setInvBuyPrice(e.target.value)} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Investment Type</label>
                  <select className="select-field" value={invType} onChange={e => setInvType(e.target.value)}>
                    <option value="stock">Stock</option>
                    <option value="etf">ETF</option>
                    <option value="mutual_fund">Mutual Fund</option>
                    <option value="crypto">Crypto</option>
                    <option value="bond">Bond</option>
                  </select>
                </div>
                {invShares && invBuyPrice && (
                  <div className="loan-preview">
                    <div className="loan-preview-item">
                      <span className="loan-preview-label">Total Investment</span>
                      <span className="loan-preview-value">{formatCurrency(parseFloat(invShares) * parseFloat(invBuyPrice))}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={resetModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : newType === 'loan' ? 'Apply for Loan' : newType === 'investment' ? 'Buy Investment' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
