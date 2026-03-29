import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Navbar />
        <Notification />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="*" element={
              <div className="page not-found">
                <h1>404</h1>
                <p>Page not found.</p>
                <a href="/" className="btn btn-primary">Go Home</a>
              </div>
            } />
          </Routes>
        </main>
        <footer className="footer">
          <p>© 2026 ShopEasy. All rights reserved. | Built with React + Node.js + SQLite</p>
        </footer>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;

