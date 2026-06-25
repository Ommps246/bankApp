import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as apiLogin, register as apiRegister } from '../../services/api';
import { Lock, User, Mail, Eye, EyeOff } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await apiRegister({ username, password, name, email });
      } else {
        data = await apiLogin(username, password);
      }
      if (data.success) {
        loginUser(data.user, data.token);
        navigate('/');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message || 'Connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (user) => {
    if (user === 'user') {
      setUsername('john_doe');
      setPassword('password123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-orb"></div>
        <div className="login-bg-orb"></div>
        <div className="login-bg-orb"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🏦</div>
          <h1>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isRegister ? 'Start your financial journey' : 'Sign in to your BankApp account'}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          {isRegister && (
            <>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label>Username</label>
            <input
              className="input-field"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              id="login-username"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-lg login-btn" type="submit" disabled={loading} id="login-submit">
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <div className="login-register-link">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </div>
        </form>

        {!isRegister && (
          <>
            <div className="login-divider"><span>DEMO ACCOUNTS</span></div>
            <div className="login-demo">
              <p>Try with demo credentials</p>
              <div className="login-demo-creds">
                <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('user')} type="button">
                  <User size={14} /> User Demo
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('admin')} type="button">
                  <Lock size={14} /> Admin Demo
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
