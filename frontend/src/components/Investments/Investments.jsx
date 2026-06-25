import { useState, useEffect } from 'react';
import { getInvestments, buyInvestment } from '../../services/api';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import './Investments.css';

const COLORS = ['#7c4dff', '#00e5ff', '#00e676', '#ffc400', '#ff1744', '#448aff', '#f50057'];

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function Investments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Buy investment modal state
  const [showBuy, setShowBuy] = useState(false);
  const [invSymbol, setInvSymbol] = useState('');
  const [invName, setInvName] = useState('');
  const [invShares, setInvShares] = useState('10');
  const [invBuyPrice, setInvBuyPrice] = useState('');
  const [invType, setInvType] = useState('stock');
  const [buying, setBuying] = useState(false);

  const loadInvestments = () => {
    getInvestments()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const handleBuy = async () => {
    setBuying(true);
    try {
      await buyInvestment({
        symbol: invSymbol.toUpperCase(),
        name: invName || invSymbol.toUpperCase(),
        shares: parseFloat(invShares),
        buy_price: parseFloat(invBuyPrice),
        type: invType,
      });
      setShowBuy(false);
      setInvSymbol('');
      setInvName('');
      setInvShares('10');
      setInvBuyPrice('');
      setInvType('stock');
      loadInvestments();
    } catch (err) {
      console.error(err);
    } finally {
      setBuying(false);
    }
  };

  if (loading || !data) {
    return <div className="investments-page"><h1>Loading portfolio...</h1></div>;
  }

  const chartData = data.investments.map(inv => ({
    name: inv.symbol,
    value: inv.current_value,
  }));

  const barData = data.investments.map(inv => ({
    name: inv.symbol,
    gain: Math.round(inv.gain_loss),
  }));

  return (
    <div className="investments-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1>Investment Portfolio 📈</h1>
        <button className="btn btn-primary" onClick={() => setShowBuy(true)} id="buy-investment-btn">
          <Plus size={18} /> Buy Investment
        </button>
      </div>

      <div className="portfolio-summary">
        <div className="portfolio-stat animate-fade-in stagger-1">
          <div className="portfolio-stat-value" style={{ color: 'var(--accent-purple)' }}>
            {formatCurrency(data.total_invested)}
          </div>
          <div className="portfolio-stat-label">Total Invested</div>
        </div>
        <div className="portfolio-stat animate-fade-in stagger-2">
          <div className="portfolio-stat-value" style={{ color: 'var(--accent-cyan)' }}>
            {formatCurrency(data.total_current)}
          </div>
          <div className="portfolio-stat-label">Current Value</div>
        </div>
        <div className="portfolio-stat animate-fade-in stagger-3">
          <div className="portfolio-stat-value" style={{ color: data.total_gain_loss >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {data.total_gain_loss >= 0 ? '+' : ''}{formatCurrency(data.total_gain_loss)}
          </div>
          <div className="portfolio-stat-label">Total P&L</div>
        </div>
        <div className="portfolio-stat animate-fade-in stagger-4">
          <div className="portfolio-stat-value" style={{ color: data.total_gain_loss_pct >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {data.total_gain_loss_pct >= 0 ? '+' : ''}{data.total_gain_loss_pct.toFixed(2)}%
          </div>
          <div className="portfolio-stat-label">Return Rate</div>
        </div>
      </div>

      <div className="investments-grid">
        <div className="investment-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3>Holdings</h3>
            <span className="badge badge-purple">{data.investments.length} assets</span>
          </div>
          {data.investments.map((inv, i) => (
            <div key={inv.id} className={`investment-item animate-fade-in stagger-${Math.min(i+1, 6)}`}>
              <div className={`inv-symbol ${inv.type}`}>{inv.symbol}</div>
              <div className="inv-info">
                <div className="inv-name">{inv.name}</div>
                <div className="inv-shares">{inv.shares} shares @ {formatCurrency(inv.buy_price)}</div>
              </div>
              <div className="inv-values">
                <div className="inv-current">{formatCurrency(inv.current_value)}</div>
                <div className={`inv-gain ${inv.gain_loss >= 0 ? 'positive' : 'negative'}`}>
                  {inv.gain_loss >= 0 ? <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} /> : <TrendingDown size={12} style={{ display: 'inline', marginRight: 4 }} />}
                  {inv.gain_loss >= 0 ? '+' : ''}{inv.gain_loss_pct.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
          {data.investments.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <p>No investments yet</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowBuy(true)}>
                Buy your first investment
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="inv-chart-section">
            <h3 style={{ marginBottom: 16 }}>Portfolio Allocation</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'rgba(15,19,51,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e8eaf6' }}
                  formatter={(v) => [formatCurrency(v)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="inv-chart-section">
            <h3 style={{ marginBottom: 16 }}>Profit / Loss by Asset</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#5c6bc0" fontSize={12} />
                <YAxis stroke="#5c6bc0" fontSize={12} tickFormatter={v => `$${v > 0 ? v : v}`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,19,51,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e8eaf6' }}
                  formatter={(v) => [formatCurrency(v)]}
                />
                <Bar dataKey="gain" radius={[4,4,0,0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.gain >= 0 ? '#00e676' : '#ff1744'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Buy Investment Modal */}
      {showBuy && (
        <div className="modal-overlay" onClick={() => setShowBuy(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h2 style={{ marginBottom: 8 }}>Buy Investment</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Enter details to add a new investment to your portfolio</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label>Symbol / Ticker</label>
                  <input className="input-field" placeholder="e.g. AAPL" value={invSymbol} onChange={e => setInvSymbol(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Company Name</label>
                  <input className="input-field" placeholder="e.g. Apple Inc." value={invName} onChange={e => setInvName(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                <div style={{
                  padding: 16, borderRadius: 12, background: 'rgba(124, 77, 255, 0.05)',
                  border: '1px solid rgba(124, 77, 255, 0.12)', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Total Investment</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{formatCurrency(parseFloat(invShares) * parseFloat(invBuyPrice))}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setShowBuy(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBuy} disabled={buying || !invSymbol || !invBuyPrice}>
                {buying ? 'Buying...' : 'Buy Investment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
