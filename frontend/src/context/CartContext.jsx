import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../services/api';

// Generate a session ID and persist it in localStorage
function getSessionId() {
  let id = localStorage.getItem('cart_session_id');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('cart_session_id', id);
  }
  return id;
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [sessionId] = useState(getSessionId);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);
      const res = await getCart(sessionId);
      setCartItems(res.data.items);
      setCartTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setCartLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1, productName = '') => {
    try {
      await addToCart(sessionId, productId, quantity);
      await fetchCart();
      showNotification(`${productName || 'Item'} added to cart!`);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const updateItem = async (cartItemId, quantity) => {
    try {
      await updateCartItem(sessionId, cartItemId, quantity);
      await fetchCart();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await removeCartItem(sessionId, cartItemId);
      await fetchCart();
      showNotification('Item removed from cart.');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const emptyCart = async () => {
    try {
      await clearCart(sessionId);
      setCartItems([]);
      setCartTotal(0);
      showNotification('Cart cleared.');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, cartTotal, cartCount, cartLoading,
      addItem, updateItem, removeItem, emptyCart,
      notification, showNotification,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
