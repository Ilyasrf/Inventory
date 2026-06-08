import { useState, useEffect } from 'react';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/requests', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { 
        setRequests(data); 
        setLoading(false);
        // Mark as seen in the background if there are unseen requests
        const hasUnseen = data.some(r => !r.userSeen && (r.status === 'APPROVED' || r.status === 'REJECTED'));
        if (hasUnseen) {
          fetch('/api/requests/seen', { method: 'PUT', credentials: 'include' }).catch(console.error);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content"><div className="loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-content">
      <div className="requests-header">
        <h1>My Requests</h1>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <h3>No requests yet</h3>
          <p>Browse the catalog and submit your first request.</p>
        </div>
      ) : (
        requests.map((req) => (
          <div className="request-card glass-card" key={req.id}>
            <div className="request-card-header">
              <h3>{req.projectName}</h3>
              <div className="request-meta">
                {req.processedBy && <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>by {req.processedBy}</span>}
                <span className={`badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                <span>{new Date(req.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {req.projectDescription && (
              <div className="request-description">{req.projectDescription}</div>
            )}

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

            {req.staffNote && (
              <div className="request-staff-note">
                <strong>Staff Note:</strong> {req.staffNote}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
