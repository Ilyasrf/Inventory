import { useState, useEffect } from 'react';

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'RETURNED'];

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionNote, setActionNote] = useState({});

  const fetchRequests = () => {
    const params = filter !== 'ALL' ? `?status=${filter}` : '';
    fetch(`/api/requests${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { setRequests(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(fetchRequests, [filter]);

  const updateStatus = async (id, status) => {
    const note = actionNote[id] || '';
    await fetch(`/api/requests/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, staffNote: note }),
    });
    setActionNote((prev) => ({ ...prev, [id]: '' }));
    fetchRequests();
  };

  const stats = {
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    total: requests.length,
  };

  if (loading) return <div className="page-content"><div className="loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-content">
      <div className="admin-header">
        <h1>🛡️ Request Dashboard</h1>
        <div className="admin-stats">
          <div className="stat-card glass-card">
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>

      <div className="status-filters">
        {STATUSES.map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No requests</h3>
          <p>No requests match the current filter.</p>
        </div>
      ) : (
        requests.map((req) => (
          <div className="request-card glass-card" key={req.id}>
            <div className="request-card-header">
              <div>
                <div className="request-user">
                  {req.user.avatar && <img src={req.user.avatar} alt="" />}
                  <span>{req.user.displayName} ({req.user.login})</span>
                </div>
                <h3 style={{ marginTop: 8 }}>{req.projectName}</h3>
              </div>
              <div className="request-meta">
                <span className={`badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                <span>{new Date(req.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {req.projectDescription && <div className="request-description">{req.projectDescription}</div>}

            <div className="request-items-list">
              <table>
                <thead><tr><th>Item</th><th style={{ textAlign: 'center' }}>Qty</th></tr></thead>
                <tbody>
                  {req.items.map((ri) => (
                    <tr key={ri.id}>
                      <td>{ri.item.name}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{ri.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {req.status === 'PENDING' && (
              <div className="admin-actions" style={{ flexDirection: 'column', gap: 12 }}>
                <input
                  className="input"
                  placeholder="Staff note (optional)..."
                  value={actionNote[req.id] || ''}
                  onChange={(e) => setActionNote((prev) => ({ ...prev, [req.id]: e.target.value }))}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => updateStatus(req.id, 'APPROVED')}>✓ Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => updateStatus(req.id, 'REJECTED')}>✗ Reject</button>
                </div>
              </div>
            )}

            {req.status === 'APPROVED' && (
              <div className="admin-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(req.id, 'RETURNED')}>↩ Mark Returned</button>
              </div>
            )}

            {req.staffNote && <div className="request-staff-note"><strong>Staff Note:</strong> {req.staffNote}</div>}
          </div>
        ))
      )}
    </div>
  );
}
