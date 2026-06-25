import { useState, useEffect } from 'react';
import { getLoans, calculateLoan, applyLoan } from '../../services/api';
import { Landmark, Calculator, Plus } from 'lucide-react';
import './Loans.css';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('7.5');
  const [tenure, setTenure] = useState('240');
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Apply for loan state
  const [showApply, setShowApply] = useState(false);
  const [applyType, setApplyType] = useState('Personal Loan');
  const [applyName, setApplyName] = useState('');
  const [applyPrincipal, setApplyPrincipal] = useState('50000');
  const [applyRate, setApplyRate] = useState('8.5');
  const [applyTenure, setApplyTenure] = useState('60');
  const [applying, setApplying] = useState(false);

  const loadLoans = () => {
    getLoans()
      .then(setLoans)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalcLoading(true);
    try {
      const result = await calculateLoan({
        principal: parseFloat(principal),
        rate: parseFloat(rate),
        tenure_months: parseInt(tenure),
      });
      setCalcResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyLoan({
        loan_type: applyType,
        name: applyName || applyType,
        principal: parseFloat(applyPrincipal),
        rate: parseFloat(applyRate),
        tenure_months: parseInt(applyTenure),
      });
      setShowApply(false);
      setApplyName('');
      setApplyPrincipal('50000');
      setApplyRate('8.5');
      setApplyTenure('60');
      setApplyType('Personal Loan');
      loadLoans();
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  // Live EMI preview for apply form
  const getApplyEMI = () => {
    const p = parseFloat(applyPrincipal), r = parseFloat(applyRate) / 12 / 100, n = parseInt(applyTenure);
    if (!p || !r || !n) return null;
    const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return { emi, total: emi * n, interest: emi * n - p };
  };

  return (
    <div className="loans-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1>Loan Management 🏦</h1>
        <button className="btn btn-primary" onClick={() => setShowApply(true)} id="apply-loan-btn">
          <Plus size={18} /> Apply for Loan
        </button>
      </div>

      <div className="loans-grid">
        {/* Active Loans */}
        <div>
          <h2 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Landmark size={20} /> Active Loans
          </h2>
          <div className="loans-active">
            {loans.map((loan, i) => {
              const paidPct = ((loan.principal - loan.remaining) / loan.principal) * 100;
              return (
                <div key={loan.id} className={`loan-card animate-fade-in stagger-${i+1}`}>
                  <div className="loan-card-header">
                    <span className="loan-card-type">{loan.type}</span>
                    <span className={`badge ${loan.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="loan-detail-grid">
                    <div className="loan-detail">
                      <div className="loan-detail-label">Principal</div>
                      <div className="loan-detail-value">{formatCurrency(loan.principal)}</div>
                    </div>
                    <div className="loan-detail">
                      <div className="loan-detail-label">EMI</div>
                      <div className="loan-detail-value">{formatCurrency(loan.emi)}</div>
                    </div>
                    <div className="loan-detail">
                      <div className="loan-detail-label">Rate</div>
                      <div className="loan-detail-value">{loan.rate}%</div>
                    </div>
                    <div className="loan-detail">
                      <div className="loan-detail-label">Remaining</div>
                      <div className="loan-detail-value">{formatCurrency(loan.remaining)}</div>
                    </div>
                  </div>
                  <div className="loan-progress">
                    <div className="loan-progress-label">
                      <span>Paid: {paidPct.toFixed(1)}%</span>
                      <span>Since {loan.start_date}</span>
                    </div>
                    <div className="loan-progress-bar">
                      <div className="loan-progress-fill" style={{ width: `${paidPct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {loans.length === 0 && !loading && (
              <div className="loan-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <p>No active loans</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowApply(true)}>
                  Apply for your first loan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* EMI Calculator */}
        <div>
          <h2 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={20} /> EMI Calculator
          </h2>
          <div className="calc-card">
            <h2>Calculate your EMI</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter loan details to see monthly payments</p>
            <form className="calc-form" onSubmit={handleCalculate}>
              <div className="input-group">
                <label>Loan Amount ($)</label>
                <input className="input-field" type="number" value={principal} onChange={e => setPrincipal(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Annual Interest Rate (%)</label>
                <input className="input-field" type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Tenure (months)</label>
                <input className="input-field" type="number" value={tenure} onChange={e => setTenure(e.target.value)} required />
              </div>
              <button className="btn btn-primary btn-lg" type="submit" disabled={calcLoading}>
                {calcLoading ? 'Calculating...' : 'Calculate EMI'}
              </button>
            </form>

            {calcResult && (
              <div className="calc-result animate-fade-in">
                <div className="calc-result-grid">
                  <div className="calc-result-item">
                    <div className="calc-result-value">{formatCurrency(calcResult.emi)}</div>
                    <div className="calc-result-label">Monthly EMI</div>
                  </div>
                  <div className="calc-result-item">
                    <div className="calc-result-value">{formatCurrency(calcResult.total_payment)}</div>
                    <div className="calc-result-label">Total Payment</div>
                  </div>
                  <div className="calc-result-item">
                    <div className="calc-result-value" style={{ color: 'var(--accent-rose)' }}>
                      {formatCurrency(calcResult.total_interest)}
                    </div>
                    <div className="calc-result-label">Total Interest</div>
                  </div>
                </div>

                {calcResult.schedule && (
                  <div className="calc-schedule">
                    <h4 style={{ marginBottom: 12 }}>Amortization Schedule (First 12 Months)</h4>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>EMI</th>
                          <th>Principal</th>
                          <th>Interest</th>
                          <th>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calcResult.schedule.map(row => (
                          <tr key={row.month}>
                            <td>{row.month}</td>
                            <td>{formatCurrency(row.emi)}</td>
                            <td>{formatCurrency(row.principal)}</td>
                            <td>{formatCurrency(row.interest)}</td>
                            <td>{formatCurrency(row.remaining)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply for Loan Modal */}
      {showApply && (
        <div className="modal-overlay" onClick={() => setShowApply(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h2 style={{ marginBottom: 8 }}>Apply for a Loan</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Fill in the details to apply for a new loan</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Loan Type</label>
                <select className="select-field" value={applyType} onChange={e => setApplyType(e.target.value)}>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Car Loan">Car Loan</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Business Loan">Business Loan</option>
                </select>
              </div>
              <div className="input-group">
                <label>Loan Name (optional)</label>
                <input className="input-field" placeholder="e.g. My Home Loan" value={applyName} onChange={e => setApplyName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label>Principal ($)</label>
                  <input className="input-field" type="number" min="1000" value={applyPrincipal} onChange={e => setApplyPrincipal(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Rate (%)</label>
                  <input className="input-field" type="number" step="0.1" min="0.1" value={applyRate} onChange={e => setApplyRate(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Tenure (months)</label>
                  <input className="input-field" type="number" min="1" value={applyTenure} onChange={e => setApplyTenure(e.target.value)} required />
                </div>
              </div>

              {(() => {
                const preview = getApplyEMI();
                if (!preview) return null;
                return (
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
                    padding: 16, borderRadius: 12, background: 'rgba(124, 77, 255, 0.05)',
                    border: '1px solid rgba(124, 77, 255, 0.12)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Monthly EMI</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{formatCurrency(preview.emi)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Total Payment</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{formatCurrency(preview.total)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Total Interest</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{formatCurrency(preview.interest)}</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setShowApply(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
                {applying ? 'Applying...' : 'Apply for Loan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
