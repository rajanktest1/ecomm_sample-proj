const express = require('express');
const router = express.Router();
const { queryAll, queryOne, saveDatabase } = require('../database/init');

module.exports = (db) => {
  // GET cart items for a session
  router.get('/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;
      const items = queryAll(db, `
        SELECT c.id, c.session_id, c.quantity, c.added_at,
               p.id as product_id, p.name, p.price, p.emoji, p.category, p.stock
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.session_id = ?
        ORDER BY c.added_at DESC
      `, [sessionId]);

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      res.json({ success: true, data: { items, total: parseFloat(total.toFixed(2)) } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST add item to cart
  router.post('/:sessionId/items', (req, res) => {
    try {
      const { sessionId } = req.params;
      const { product_id, quantity = 1 } = req.body;

      if (!product_id || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Invalid product_id or quantity' });
      }

      const pid = parseInt(product_id, 10);
      const qty = parseInt(quantity, 10);
      const product = queryOne(db, 'SELECT * FROM products WHERE id = ?', [pid]);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const existing = queryOne(db, 'SELECT * FROM cart WHERE session_id = ? AND product_id = ?', [sessionId, pid]);

      if (existing) {
        const newQty = Math.min(existing.quantity + qty, product.stock);
        db.run('UPDATE cart SET quantity = ? WHERE id = ?', [newQty, existing.id]);
      } else {
        const finalQty = Math.min(qty, product.stock);
        db.run('INSERT INTO cart (session_id, product_id, quantity) VALUES (?, ?, ?)', [sessionId, pid, finalQty]);
      }

      saveDatabase(db);
      res.json({ success: true, message: 'Item added to cart' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // PUT update item quantity
  router.put('/:sessionId/items/:cartItemId', (req, res) => {
    try {
      const { sessionId, cartItemId } = req.params;
      const { quantity } = req.body;
      const qty = parseInt(quantity, 10);

      if (!qty || qty < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
      }

      const item = queryOne(db, 'SELECT * FROM cart WHERE id = ? AND session_id = ?', [parseInt(cartItemId, 10), sessionId]);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Cart item not found' });
      }

      const product = queryOne(db, 'SELECT stock FROM products WHERE id = ?', [item.product_id]);
      const newQty = Math.min(qty, product.stock);
      db.run('UPDATE cart SET quantity = ? WHERE id = ?', [newQty, parseInt(cartItemId, 10)]);
      saveDatabase(db);

      res.json({ success: true, message: 'Cart updated', quantity: newQty });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // DELETE remove item from cart
  router.delete('/:sessionId/items/:cartItemId', (req, res) => {
    try {
      const { sessionId, cartItemId } = req.params;
      const item = queryOne(db, 'SELECT * FROM cart WHERE id = ? AND session_id = ?', [parseInt(cartItemId, 10), sessionId]);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Cart item not found' });
      }
      db.run('DELETE FROM cart WHERE id = ? AND session_id = ?', [parseInt(cartItemId, 10), sessionId]);
      saveDatabase(db);
      res.json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // DELETE clear entire cart
  router.delete('/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;
      db.run('DELETE FROM cart WHERE session_id = ?', [sessionId]);
      saveDatabase(db);
      res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};

