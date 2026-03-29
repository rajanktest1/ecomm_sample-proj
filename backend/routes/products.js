const express = require('express');
const router = express.Router();
const { queryAll, queryOne } = require('../database/init');

module.exports = (db) => {
  // GET all products (with optional filter/sort)
  router.get('/', (req, res) => {
    try {
      const { category, search, sort } = req.query;
      let sql = 'SELECT * FROM products';
      const params = [];
      const conditions = [];

      if (category) {
        conditions.push('category = ?');
        params.push(category);
      }
      if (search) {
        conditions.push('(name LIKE ? OR description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const sortMap = {
        price_asc: 'price ASC',
        price_desc: 'price DESC',
        rating: 'rating DESC',
        name: 'name ASC',
      };
      sql += ' ORDER BY ' + (sortMap[sort] || 'id ASC');

      const products = queryAll(db, sql, params);
      res.json({ success: true, data: products });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET categories meta (must come before /:id)
  router.get('/meta/categories', (req, res) => {
    try {
      const rows = queryAll(db, 'SELECT DISTINCT category FROM products ORDER BY category');
      res.json({ success: true, data: rows.map(r => r.category) });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET single product by id
  router.get('/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

      const product = queryOne(db, 'SELECT * FROM products WHERE id = ?', [id]);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      const reviews = queryAll(db, 'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [id]);
      res.json({ success: true, data: { ...product, reviews } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};

