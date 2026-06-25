import { useLocation } from 'react-router-dom';
import { Search, Bell, Settings } from 'lucide-react';
import './Header.css';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Welcome back!' },
  '/accounts': { title: 'Accounts', subtitle: 'Manage your accounts' },
  '/transfers': { title: 'Transfers', subtitle: 'Send & receive money' },
  '/transactions': { title: 'Transactions', subtitle: 'Transaction history' },
  '/investments': { title: 'Investments', subtitle: 'Your portfolio' },
  '/loans': { title: 'Loans', subtitle: 'Loan management' },
  '/admin': { title: 'Admin Panel', subtitle: 'System administration' },
};

export default function Header() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'BankApp', subtitle: '' };

  return (
    <header className="header">
      <div className="header-left">
        <div>
          <div className="header-title">{pageInfo.title}</div>
          <div className="header-subtitle">{pageInfo.subtitle}</div>
        </div>
      </div>
      <div className="header-right">
        <div className="header-search">
          <Search />
          <input type="text" placeholder="Search transactions..." />
        </div>
        <button className="header-icon-btn" id="notifications-btn">
          <Bell size={18} />
          <span className="header-notification-dot"></span>
        </button>
        <button className="header-icon-btn" id="settings-btn">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
