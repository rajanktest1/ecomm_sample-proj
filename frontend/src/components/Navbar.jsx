import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          🛍️ ShopEasy
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <button
            className="cart-btn"
            onClick={() => navigate('/cart')}
            aria-label="Shopping Cart"
          >
            🛒 Cart
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
