import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import AnimatedStars from './components/AnimatedStars';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import MyRequests from './pages/MyRequests';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';

/* ── Auth Context ── */
const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

function ProtectedRoute({ children, staffOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (staffOnly && user.role !== 'STAFF') return <Navigate to="/catalog" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch('/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setCart([]);
  };

  const addToCart = (item, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: Math.min(c.quantity + qty, item.availableQuantity) } : c
        );
      }
      return [...prev, { item, quantity: qty }];
    });
  };

  const updateCartQty = (itemId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.item.id !== itemId));
    } else {
      setCart((prev) => prev.map((c) => (c.item.id === itemId ? { ...c, quantity: qty } : c)));
    }
  };

  const removeFromCart = (itemId) => setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  const clearCart = () => setCart([]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, cart, addToCart, updateCartQty, removeFromCart, clearCart }}>
      <BrowserRouter>
        <AnimatedStars />
        <div className="app-layout" style={{ position: 'relative', zIndex: 1 }}>
          {user && <Navbar />}
          <Routes>
            <Route path="/" element={loading ? <div className="loading"><div className="spinner" /></div> : user ? <Navigate to="/catalog" /> : <Login />} />
            <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute staffOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute staffOnly><AdminInventory /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
