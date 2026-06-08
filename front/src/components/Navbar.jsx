import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/my-requests') {
      setNotifications(0);
    } else if (user && user.role !== 'STAFF') {
      fetch('/api/requests', { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const finished = data.filter(r => 
            (r.status === 'APPROVED' || r.status === 'REJECTED') && !r.userSeen
          );
          setNotifications(finished.length);
        })
        .catch(console.error);
    }
  }, [user, location.pathname]);

  if (!user) return null;

  const isAdmin = user.role === 'STAFF';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>MAKINA MASTERS</h1>
        <span className="badge-role">{isAdmin ? 'ADMIN' : 'MEMBER'}</span>
      </div>

      <div className="navbar-links">
        <NavLink to="/catalog" className={({ isActive }) => isActive ? 'active' : ''}>
          Catalog
        </NavLink>
        {!isAdmin && (
          <NavLink to="/my-requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            My Requests
            {notifications > 0 && <span className="nav-badge">{notifications}</span>}
          </NavLink>
        )}
        {isAdmin && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/inventory" className={({ isActive }) => isActive ? 'active' : ''}>
              Inventory
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
