<<<<<<< HEAD
# ShopEasy E-Commerce Website

A full-stack 3-tier e-commerce web application built with React, Node.js, and SQLite.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  TIER 1 - Frontend               │
│          React + Vite (port 3000)                │
│  ┌─────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Home    │  │  Product    │  │   Cart      │  │
│  │ Page    │  │  Detail     │  │   Page      │  │
│  └─────────┘  └─────────────┘  └─────────────┘  │
└───────────────────┬─────────────────────────────┘
                    │ HTTP/REST API
┌───────────────────▼─────────────────────────────┐
│                  TIER 2 - Backend                │
│          Node.js + Express (port 5000)           │
│  ┌──────────────────┐  ┌───────────────────────┐ │
│  │  /api/products   │  │    /api/cart          │ │
│  │  GET /           │  │    GET /:sessionId    │ │
│  │  GET /:id        │  │    POST /:sid/items   │ │
│  │  GET /meta/cats  │  │    PUT /:sid/items/:id│ │
│  └──────────────────┘  │    DELETE /:sid/items │ │
│                        └───────────────────────┘ │
└───────────────────┬─────────────────────────────┘
                    │ sql.js
┌───────────────────▼─────────────────────────────┐
│                  TIER 3 - Database               │
│               SQLite (sql.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ products │  │   cart   │  │    reviews    │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────┘
```

## Features

- **Home Page**: 25 sample products with emoji icons, search, category filtering, and sort options
- **Product Page**: Full product description, star ratings, quantity selector, add-to-cart button, and user reviews
- **Cart Page**: Item list with quantity update/delete controls, order summary with tax and shipping calculation, checkout button

## Project Structure

```
Ecom_sample proj/
├── start.bat              ← Run this to start everything
├── backend/
│   ├── server.js          ← Express server entry point
│   ├── package.json
│   ├── database/
│   │   ├── init.js        ← Database initialization & seeding
│   │   ├── schema.sql     ← SQL schema definition
│   │   └── ecommerce.db   ← SQLite database file (auto-generated)
│   └── routes/
│       ├── products.js    ← Product CRUD routes
│       └── cart.js        ← Shopping cart routes
└── frontend/
    ├── vite.config.js     ← Vite config with API proxy
    ├── src/
    │   ├── App.jsx        ← Root component + routing
    │   ├── context/
    │   │   └── CartContext.jsx   ← Global cart state
    │   ├── services/
    │   │   └── api.js     ← API client functions
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Notification.jsx
    │   │   └── ProductCard.jsx
    │   └── pages/
    │       ├── HomePage.jsx
    │       ├── ProductPage.jsx
    │       └── CartPage.jsx
    └── package.json
```

## Database Schema

### products
| Column       | Type    | Description                  |
|--------------|---------|------------------------------|
| id           | INTEGER | Primary key (autoincrement)  |
| name         | TEXT    | Product name                 |
| description  | TEXT    | Full product description     |
| price        | REAL    | Price in USD                 |
| category     | TEXT    | Product category             |
| emoji        | TEXT    | Emoji used as product image  |
| stock        | INTEGER | Available stock quantity     |
| rating       | REAL    | Average rating (1–5)         |
| review_count | INTEGER | Total number of reviews      |
| created_at   | TEXT    | Timestamp                    |

### cart
| Column     | Type    | Description                             |
|------------|---------|-----------------------------------------|
| id         | INTEGER | Primary key (autoincrement)             |
| session_id | TEXT    | Browser session identifier              |
| product_id | INTEGER | FK → products.id                        |
| quantity   | INTEGER | Quantity in cart                        |
| added_at   | TEXT    | Timestamp                               |

### reviews
| Column        | Type    | Description                    |
|---------------|---------|--------------------------------|
| id            | INTEGER | Primary key (autoincrement)    |
| product_id    | INTEGER | FK → products.id               |
| reviewer_name | TEXT    | Name of reviewer               |
| rating        | INTEGER | Rating 1–5                     |
| comment       | TEXT    | Review text                    |
| created_at    | TEXT    | Timestamp                      |

## API Endpoints

### Products
| Method | Endpoint                     | Description                        |
|--------|------------------------------|------------------------------------|
| GET    | /api/products                | Get all products (with filters)    |
| GET    | /api/products/:id            | Get single product with reviews    |
| GET    | /api/products/meta/categories| Get all distinct categories        |

**Query params**: `category`, `search`, `sort` (price_asc, price_desc, rating, name)

### Cart
| Method | Endpoint                              | Description                 |
|--------|---------------------------------------|-----------------------------|
| GET    | /api/cart/:sessionId                  | Get cart items & total      |
| POST   | /api/cart/:sessionId/items            | Add item to cart            |
| PUT    | /api/cart/:sessionId/items/:itemId    | Update item quantity        |
| DELETE | /api/cart/:sessionId/items/:itemId    | Remove item from cart       |
| DELETE | /api/cart/:sessionId                  | Clear entire cart           |

## Quick Start

### Option 1: Double-click `start.bat`
This opens two terminal windows — one for the backend, one for the frontend.

### Option 2: Manual start

**Terminal 1 — Backend:**
```bash
cd backend
npm install
node server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npx vite --port 3000
```

Then open **http://localhost:3000** in your browser.
=======
# ecomm_sample-proj
A full-stack 3-tier e-commerce web application built with React, Node.js, and SQLite.
>>>>>>> db331333d3b9b90b806ebab810a8805f486c8a67
