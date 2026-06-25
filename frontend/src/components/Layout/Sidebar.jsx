import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Wallet, ArrowLeftRight, Receipt, TrendingUp,
  Landmark, ShieldCheck, LogOut
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { label: 'MAIN', items: [
    { path: '/', icon: LayoutDashboard, text: 'Dashboard' },
    { path: '/accounts', icon: Wallet, text: 'Accounts' },
    { path: '/transfers', icon: ArrowLeftRight, text: 'Transfers' },
    { path: '/transactions', icon: Receipt, text: 'Transactions' },
  ]},
  { label: 'FINANCE', items: [
    { path: '/investments', icon: TrendingUp, text: 'Investments' },
    { path: '/loans', icon: Landmark, text: 'Loans' },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏦</div>
        <div className="sidebar-logo-text"><span>Bank</span>App</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon />
                {item.text}
              </NavLink>
            ))}
          </div>
        ))}

        {user?.role === 'admin' && (
          <div>
            <div className="sidebar-section-label">ADMIN</div>
            <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck />
              Admin Panel
            </NavLink>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
          <div className="sidebar-avatar">{user?.avatar || 'U'}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{user?.role || 'user'}</div>
          </div>
          <LogOut size={18} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </aside>
  );
}
