import { useAuth } from '../App';

export default function ItemCard({ item }) {
  const { cart, addToCart, updateCartQty, removeFromCart } = useAuth();
  const inCart = cart.find((c) => c.item.id === item.id);
  const available = item.availableQuantity;

  const stockClass = available === 0 ? 'no-stock' : available <= 2 ? 'low-stock' : 'in-stock';
  const stockLabel = available === 0 ? 'Out of stock' : `${available} / ${item.totalQuantity}`;

  return (
    <div className="item-card glass-card">
      <div className="item-image">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" />
        ) : (
          <span className="item-placeholder"></span>
        )}
      </div>
      <div className="item-body">
        <div className="item-name">{item.name}</div>
        <div className="item-desc">{item.description}</div>
        <div className="item-footer">
          <span className={`item-stock ${stockClass}`}>{stockLabel}</span>
          {!inCart ? (
            <button
              className="add-btn"
              disabled={available === 0}
              onClick={() => addToCart(item)}
            >
              + Add
            </button>
          ) : (
            <div className="qty-controls">
              <button onClick={() => inCart.quantity <= 1 ? removeFromCart(item.id) : updateCartQty(item.id, inCart.quantity - 1)}>−</button>
              <span>{inCart.quantity}</span>
              <button onClick={() => updateCartQty(item.id, Math.min(inCart.quantity + 1, available))} disabled={inCart.quantity >= available}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
