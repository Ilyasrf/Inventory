import { useState } from 'react';
import { useAuth } from '../App';

export default function RequestCart() {
  const { cart, updateCartQty, removeFromCart, clearCart } = useAuth();
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (cart.length === 0 && !open) return null;

  const handleSubmit = async () => {
    if (!projectName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectName,
          projectDescription: projectDesc,
          items: cart.map((c) => ({ itemId: c.item.id, quantity: c.quantity })),
        }),
      });
      if (res.ok) {
        setSuccess(true);
        clearCart();
        setProjectName('');
        setProjectDesc('');
        setTimeout(() => { setSuccess(false); setOpen(false); }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button className="cart-fab" onClick={() => setOpen(true)} title="View request cart">
        Cart
        {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
      </button>

      {/* Side Panel */}
      {open && (
        <>
          <div className="cart-overlay" onClick={() => setOpen(false)} />
          <div className="cart-panel">
            <div className="cart-panel-header">
              <h2>Request Cart</h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {success ? (
              <div className="cart-empty">
                <p>Request submitted successfully!</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="cart-empty">
                <p>Your cart is empty.<br />Browse the catalog and add items.</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((c) => (
                    <div className="cart-item" key={c.item.id}>
                      <div className="cart-item-info">
                        <h4>{c.item.name}</h4>
                        <p>{c.item.availableQuantity} available</p>
                      </div>
                      <div className="cart-item-actions">
                        <button onClick={() => c.quantity <= 1 ? removeFromCart(c.item.id) : updateCartQty(c.item.id, c.quantity - 1)}>−</button>
                        <span>{c.quantity}</span>
                        <button onClick={() => updateCartQty(c.item.id, Math.min(c.quantity + 1, c.item.availableQuantity))}>+</button>
                        <button className="cart-item-remove" onClick={() => removeFromCart(c.item.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-form">
                  <div className="form-group">
                    <label>Project Name *</label>
                    <input className="input" placeholder="e.g. Smart Home Controller" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>What are you building?</label>
                    <textarea className="textarea" placeholder="Describe your project so the staff knows what the items are for..." value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting || !projectName.trim()}>
                    {submitting ? 'Submitting…' : 'Submit Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
