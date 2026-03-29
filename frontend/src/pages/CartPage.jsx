import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function CartItem({ item, onUpdate, onRemove }) {
  const [qty, setQty] = useState(item.quantity);
  const [updating, setUpdating] = useState(false);

  const handleQtyChange = async (newQty) => {
    if (newQty < 1 || newQty > item.stock) return;
    setQty(newQty);
    setUpdating(true);
    await onUpdate(item.id, newQty);
    setUpdating(false);
  };

  const handleRemove = async () => {
    await onRemove(item.id);
  };

  return (
    <div className="cart-item">
      <Link to={`/product/${item.product_id}`} className="cart-item-emoji-link">
        <div className="cart-item-emoji">{item.emoji}</div>
      </Link>

      <div className="cart-item-details">
        <Link to={`/product/${item.product_id}`} className="cart-item-name">
          {item.name}
        </Link>
        <span className="cart-item-category">{item.category}</span>
        <div className="cart-item-unit-price">${Number(item.price).toFixed(2)} each</div>
      </div>

      <div className="cart-item-controls">
        <div className="qty-controls">
          <button
            className="qty-btn"
            onClick={() => handleQtyChange(qty - 1)}
            disabled={qty <= 1 || updating}
          >−</button>
          <span className="qty-display">{qty}</span>
          <button
            className="qty-btn"
            onClick={() => handleQtyChange(qty + 1)}
            disabled={qty >= item.stock || updating}
          >+</button>
        </div>
        <div className="cart-item-subtotal">
          ${(Number(item.price) * qty).toFixed(2)}
        </div>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleRemove}
          aria-label={`Remove ${item.name}`}
        >
          🗑️ Remove
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { cartItems, cartTotal, cartLoading, updateItem, removeItem, emptyCart } = useCart();
  const navigate = useNavigate();
  const [clearing, setClearing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return;
    setClearing(true);
    await emptyCart();
    setClearing(false);
  };

  const handleCheckout = () => {
    setCheckingOut(true);
    // Simulate checkout process
    setTimeout(() => {
      alert('🎉 Order placed successfully! Thank you for shopping with ShopEasy!');
      emptyCart();
      setCheckingOut(false);
      navigate('/');
    }, 1500);
  };

  if (cartLoading) {
    return (
      <div className="page">
        <h1>🛒 Shopping Cart</h1>
        <div className="loading-state">Loading your cart...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <h1>🛒 Shopping Cart</h1>
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you have not added anything yet.</p>
          <Link to="/" className="btn btn-primary">
            🛍️ Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = cartTotal > 50 ? 0 : 5.99;
  const tax = parseFloat((cartTotal * 0.08).toFixed(2));
  const grandTotal = parseFloat((cartTotal + shipping + tax).toFixed(2));

  return (
    <div className="page">
      <h1>🛒 Shopping Cart</h1>

      <div className="cart-layout">
        {/* Cart Items Column */}
        <div className="cart-items-col">
          <div className="cart-items-header">
            <span>{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</span>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleClearCart}
              disabled={clearing}
            >
              {clearing ? 'Clearing...' : '🗑️ Clear Cart'}
            </button>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="cart-actions">
            <Link to="/" className="btn btn-outline">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-lines">
            <div className="summary-line">
              <span>Subtotal ({itemCount} items)</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'free-shipping' : ''}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            {shipping === 0 && (
              <div className="shipping-note">🎉 You qualify for free shipping!</div>
            )}
            {shipping > 0 && (
              <div className="shipping-note">
                Add ${(50 - cartTotal).toFixed(2)} more for free shipping
              </div>
            )}
            <div className="summary-line">
              <span>Estimated Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-line summary-total">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            className="btn btn-primary btn-large btn-block"
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? '⏳ Processing...' : '💳 Proceed to Checkout'}
          </button>

          <div className="secure-badge">
            🔒 Secure Checkout
          </div>
        </div>
      </div>
    </div>
  );
}
