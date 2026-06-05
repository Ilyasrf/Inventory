import { NavLink } from 'react-router-dom';
import { useAuth } from '../App';

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>MAKINA MASTERS</h1>
        <span className="badge-role">{user.role}</span>
      </div>

      <div className="navbar-links">
        <NavLink to="/catalog" className={({ isActive }) => isActive ? 'active' : ''}>
          📦 Catalog
        </NavLink>
        <NavLink to="/my-requests" className={({ isActive }) => isActive ? 'active' : ''}>
          📋 My Requests
        </NavLink>
        {user.role === 'STAFF' && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              🛡️ Dashboard
            </NavLink>
            <NavLink to="/admin/inventory" className={({ isActive }) => isActive ? 'active' : ''}>
              ⚙️ Inventory
            </NavLink>
          </>
        )}
      </div>

      <div className="navbar-user">
        {user.avatar && <img src={user.avatar} alt={user.login} />}
        <span>{user.displayName}</span>
        <button className="btn btn-sm btn-secondary" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
