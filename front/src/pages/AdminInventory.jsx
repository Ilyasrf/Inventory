import { useState, useEffect } from 'react';

const CATEGORIES = ['Boards', 'Sensors', 'Modules', 'Motors', 'Power', 'Accessories', 'Other'];

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | item obj for edit
  const [form, setForm] = useState({ name: '', description: '', category: 'Other', totalQuantity: 1, image: null });

  const fetchItems = () => {
    fetch('/api/items', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(fetchItems, []);

  const openAdd = () => {
    setForm({ name: '', description: '', category: 'Other', totalQuantity: 1, image: null });
    setModal('add');
  };

  const openEdit = (item) => {
    setForm({ name: item.name, description: item.description, category: item.category, totalQuantity: item.totalQuantity, image: null });
    setModal(item);
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('category', form.category);
    fd.append('totalQuantity', form.totalQuantity);
    if (form.image) fd.append('image', form.image);

    const isEdit = modal !== 'add';
    const url = isEdit ? `/api/items/${modal.id}` : '/api/items';
    const method = isEdit ? 'PUT' : 'POST';

    await fetch(url, { method, credentials: 'include', body: fd });
    setModal(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/items/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchItems();
  };

  if (loading) return <div className="page-content"><div className="loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-content">
      <div className="admin-header">
        <h1>⚙️ Inventory Management</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Available</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.imageUrl ? (
                      <img className="item-thumb" src={item.imageUrl} alt="" />
                    ) : (
                      <div className="item-thumb-placeholder">🔧</div>
                    )}
                  </td>
                  <td><strong>{item.name}</strong><br/><span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{item.description}</span></td>
                  <td><span className="badge badge-category">{item.category}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{item.availableQuantity}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{item.totalQuantity}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Add New Item' : 'Edit Item'}</h2>
              <button onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Total Quantity</label>
                <input className="input" type="number" min="0" value={form.totalQuantity} onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input className="input" type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.name.trim()}>
                {modal === 'add' ? 'Add Item' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
