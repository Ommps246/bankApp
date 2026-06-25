import { useState, useEffect } from 'react';
import { getAccounts, makeTransfer } from '../../services/api';
import { ArrowDown, CheckCircle2 } from 'lucide-react';
import './Transfers.css';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function Transfers() {
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    if (fromAccount === toAccount) {
      setError('Cannot transfer to the same account');
      return;
    }
    setLoading(true);
    try {
      await makeTransfer({
        from_account: fromAccount,
        to_account: toAccount,
        amount: parseFloat(amount),
        description: description || 'Fund Transfer',
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        setDescription('');
        getAccounts().then(setAccounts);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="transfers-page">
        <div className="transfer-container">
          <div className="transfer-card">
            <div className="transfer-success animate-fade-in">
              <div className="transfer-success-icon">
                <CheckCircle2 size={40} />
              </div>
              <h2>Transfer Successful!</h2>
              <p>{formatCurrency(parseFloat(amount))} has been transferred</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transfers-page">
      <h1>Send Money 💸</h1>
      <div className="transfer-container">
        <div className="transfer-card">
          <h2>New Transfer</h2>
          <p>Transfer funds between your accounts instantly</p>

          <form className="transfer-form" onSubmit={handleTransfer}>
            {error && <div className="login-error">{error}</div>}

            <div className="input-group">
              <label>From Account</label>
              <select className="select-field" value={fromAccount} onChange={e => setFromAccount(e.target.value)} required>
                <option value="">Select source account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.account_number}) — {formatCurrency(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="transfer-arrow">
              <ArrowDown size={24} />
            </div>

            <div className="input-group">
              <label>To Account</label>
              <select className="select-field" value={toAccount} onChange={e => setToAccount(e.target.value)} required>
                <option value="">Select destination account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.account_number}) — {formatCurrency(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Amount</label>
              <input
                className="transfer-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="$0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Description (optional)</label>
              <input
                className="input-field"
                placeholder="e.g. Rent payment"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Processing...' : 'Send Transfer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
