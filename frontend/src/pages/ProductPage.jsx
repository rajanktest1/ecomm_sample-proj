import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';

function StarRating({ rating, max = 5 }) {
  return (
    <span className="star-rating" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
    </span>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProduct(id)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addItem(product.id, quantity, product.name);
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="product-detail-skeleton">
          <div className="skeleton skeleton-img" />
          <div className="skeleton-details">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-msg">⚠️ {error}</div>
        <button className="btn btn-outline" onClick={() => navigate('/')}>← Back to Home</button>
      </div>
    );
  }

  if (!product) return null;

  const avgRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length)
    : product.rating;

  return (
    <div className="page">
      <button className="btn btn-outline back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-detail">
        <div className="product-detail-image">
          <div className="detail-emoji">{product.emoji}</div>
          <span className="product-badge">{product.category}</span>
        </div>

        <div className="product-detail-info">
          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-rating">
            <StarRating rating={avgRating} />
            <span className="rating-label">
              {Number(avgRating).toFixed(1)} ({product.review_count} reviews)
            </span>
          </div>

          <div className="detail-price">${Number(product.price).toFixed(2)}</div>

          <p className="detail-description">{product.description}</p>

          <div className="stock-info">
            {product.stock > 10
              ? <span className="in-stock">✅ In Stock ({product.stock} available)</span>
              : product.stock > 0
              ? <span className="low-stock">⚠️ Only {product.stock} left!</span>
              : <span className="out-of-stock">❌ Out of Stock</span>
            }
          </div>

          <div className="add-to-cart-section">
            <div className="quantity-selector">
              <label htmlFor="qty">Quantity:</label>
              <div className="qty-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >−</button>
                <input
                  id="qty"
                  type="number"
                  className="qty-input"
                  value={quantity}
                  min={1}
                  max={product.stock}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 1 && v <= product.stock) setQuantity(v);
                  }}
                  readOnly
                />
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >+</button>
              </div>
            </div>

            <button
              className="btn btn-primary btn-large"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
            >
              {addingToCart ? '⏳ Adding...' : '🛒 Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Customer Reviews ({product.reviews ? product.reviews.length : 0})</h2>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="reviews-list">
            {product.reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <span className="reviewer-name">{review.reviewer_name}</span>
                  <StarRating rating={review.rating} />
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
}
