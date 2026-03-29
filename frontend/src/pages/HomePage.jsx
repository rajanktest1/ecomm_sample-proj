import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ category: '', search: '', sort: '' });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;

    getProducts(params)
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput }));
  };

  const handleCategoryChange = (cat) => {
    setFilters((f) => ({ ...f, category: cat }));
  };

  const handleSortChange = (sort) => {
    setFilters((f) => ({ ...f, sort }));
  };

  const clearFilters = () => {
    setFilters({ category: '', search: '', sort: '' });
    setSearchInput('');
  };

  return (
    <div className="page">
      <div className="hero">
        <h1>🛍️ Welcome to ShopEasy</h1>
        <p>Discover amazing products at unbeatable prices</p>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select
            value={filters.sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Default</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {(filters.category || filters.search || filters.sort) && (
          <button className="btn btn-outline" onClick={clearFilters}>
            ✕ Clear Filters
          </button>
        )}

        <span className="product-count">
          {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
        </span>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product-card skeleton" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span>😕</span>
          <p>No products found. Try adjusting your filters.</p>
          <button className="btn btn-primary" onClick={clearFilters}>Show All Products</button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
