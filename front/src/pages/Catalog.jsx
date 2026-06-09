import { useState, useEffect } from 'react';
import ItemCard from '../components/ItemCard';
import RequestCart from '../components/RequestCart';

const CATEGORIES = ['All', 'Boards', 'Sensors', 'Modules', 'Motors', 'Power', 'Accessories'];

export default function Catalog() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category !== 'All') params.set('category', category);

    fetch(`/api/items?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="page-content">
      <div className="catalog-header">
        <h1>Component Catalog</h1>
      </div>

      <div className="catalog-controls">
        <div className="search-box">
          <input
            className="input"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="category-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={category === cat ? 'active' : ''}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>No items found</h3>
          <p>Try a different search or category.</p>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <RequestCart />
    </div>
  );
}
