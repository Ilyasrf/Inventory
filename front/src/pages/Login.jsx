import { useState } from 'react';
import { useAuth } from '../App';

export default function Login() {
  const { setUser } = useAuth();
  const backendUrl = import.meta.env.VITE_API_URL || '';
  const [tab, setTab] = useState('member');
  const [adminName, setAdminName] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: adminName, password: adminPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        setUser(data);
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-card">
        <h1>MAKINA MASTERS</h1>
        <p className="subtitle">Robotics · AI · IoT — Inventory System</p>

        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'member' ? 'active' : ''}`}
            onClick={() => { setTab('member'); setError(''); }}
          >
            Member
          </button>
          <button
            className={`login-tab ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => { setTab('admin'); setError(''); }}
          >
            Admin
          </button>
        </div>

        {tab === 'member' ? (
          <div className="login-tab-content">
            <a href={`${backendUrl}/auth/42`} className="btn-42">
              <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
                <polygon points="20,8 20,36 34,22 34,8" fill="white"/>
                <polygon points="20,36 34,22 34,50 20,50" fill="white" opacity="0.7"/>
                <polygon points="34,22 48,8 48,36 34,36" fill="white"/>
                <polygon points="34,36 48,36 48,50 34,50" fill="white" opacity="0.7"/>
              </svg>
              Login with 42 Intra
            </a>
            <p className="login-hint">Members authenticate with their 42 Intra account</p>
          </div>
        ) : (
          <form className="login-tab-content" onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>Email or Name</label>
              <input
                className="input"
                type="text"
                placeholder="Admin email or name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="Password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                required
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
            <p className="login-hint">Inventory guardians only</p>
          </form>
        )}

        <p className="club-info">
          Based at 1337 MED
        </p>
      </div>
    </div>
  );
}
