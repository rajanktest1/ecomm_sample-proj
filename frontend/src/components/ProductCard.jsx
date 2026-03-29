import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product.id, 1, product.name);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-emoji">{product.emoji}</div>
        <div className="product-info">
          <span className="product-category">{product.category}</span>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-rating">
            {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
            <span className="rating-count">({product.review_count})</span>
          </div>
          <div className="product-price">${Number(product.price).toFixed(2)}</div>
        </div>
      </Link>
      <button
        className="btn btn-primary add-to-cart-btn"
        onClick={handleAddToCart}
      >
        🛒 Add to Cart
      </button>
    </div>
  );
}
