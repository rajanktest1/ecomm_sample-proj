const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Products
export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/products${query ? '?' + query : ''}`);
};

export const getProduct = (id) => request(`/products/${id}`);

export const getCategories = () => request('/products/meta/categories');

// Cart
export const getCart = (sessionId) => request(`/cart/${sessionId}`);

export const addToCart = (sessionId, product_id, quantity = 1) =>
  request(`/cart/${sessionId}/items`, {
    method: 'POST',
    body: JSON.stringify({ product_id, quantity }),
  });

export const updateCartItem = (sessionId, cartItemId, quantity) =>
  request(`/cart/${sessionId}/items/${cartItemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });

export const removeCartItem = (sessionId, cartItemId) =>
  request(`/cart/${sessionId}/items/${cartItemId}`, { method: 'DELETE' });

export const clearCart = (sessionId) =>
  request(`/cart/${sessionId}`, { method: 'DELETE' });
