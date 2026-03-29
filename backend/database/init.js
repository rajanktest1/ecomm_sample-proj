const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'ecommerce.db');

let dbInstance = null;

function saveDatabase(db) {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Helper: run a SELECT and return rows as array of objects
function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: run a SELECT and return first row
function queryOne(db, sql, params = []) {
  const rows = queryAll(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

async function initializeDatabase() {
  const SQL = await initSqlJs();

  let db;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('Database loaded from file.');
  } else {
    db = new SQL.Database();
    createSchema(db);
    seedProducts(db);
    seedReviews(db);
    saveDatabase(db);
    console.log('Database created and seeded successfully.');
  }

  dbInstance = db;
  return db;
}

function createSchema(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      emoji TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 100,
      rating REAL NOT NULL DEFAULT 4.0,
      review_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      added_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(session_id, product_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      reviewer_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);
}

function seedProducts(db) {
  const products = [
    { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones with 30hr battery life, deep bass, and crystal-clear audio. Perfect for music lovers and remote workers alike.', price: 79.99, category: 'Electronics', emoji: '🎧', stock: 50, rating: 4.5, review_count: 128 },
    { name: 'Running Sneakers', description: 'Lightweight performance running shoes with memory foam insole, breathable mesh upper, and durable rubber outsole. Available in multiple colors.', price: 59.99, category: 'Footwear', emoji: '👟', stock: 75, rating: 4.3, review_count: 95 },
    { name: 'Coffee Maker', description: 'Programmable 12-cup drip coffee maker with built-in grinder, thermal carafe, and auto-clean function. Brew your perfect cup every morning.', price: 49.99, category: 'Kitchen', emoji: '☕', stock: 30, rating: 4.6, review_count: 204 },
    { name: 'Leather Wallet', description: 'Slim genuine leather bifold wallet with RFID blocking technology. Features 6 card slots, 2 cash compartments, and a clear ID window.', price: 29.99, category: 'Accessories', emoji: '👛', stock: 100, rating: 4.4, review_count: 67 },
    { name: 'Yoga Mat', description: 'Non-slip eco-friendly TPE yoga mat, 6mm thick with alignment lines. Includes carrying strap. Perfect for yoga, pilates, and home workouts.', price: 34.99, category: 'Sports', emoji: '🧘', stock: 60, rating: 4.7, review_count: 312 },
    { name: 'Mechanical Keyboard', description: 'Compact TKL mechanical keyboard with Cherry MX switches, RGB backlighting, and USB-C connectivity. Satisfying tactile feedback for gaming and typing.', price: 89.99, category: 'Electronics', emoji: '⌨️', stock: 40, rating: 4.8, review_count: 189 },
    { name: 'Sunglasses', description: 'Polarized UV400 sunglasses with lightweight TR90 frame. Blocks 100% UVA/UVB rays. Ideal for driving, beach, and outdoor activities.', price: 24.99, category: 'Accessories', emoji: '🕶️', stock: 80, rating: 4.2, review_count: 53 },
    { name: 'Backpack', description: 'Durable 30L travel laptop backpack with USB charging port, anti-theft zipper, and padded shoulder straps. Fits laptops up to 15.6 inches.', price: 44.99, category: 'Bags', emoji: '🎒', stock: 55, rating: 4.5, review_count: 147 },
    { name: 'Smartwatch', description: 'Feature-rich smartwatch with heart rate monitor, GPS, sleep tracking, and 7-day battery life. Compatible with iOS and Android.', price: 129.99, category: 'Electronics', emoji: '⌚', stock: 35, rating: 4.6, review_count: 276 },
    { name: 'Potted Succulent', description: 'Beautiful hand-picked succulent in a decorative ceramic pot. Low maintenance, drought-tolerant, and perfect for desk or windowsill decoration.', price: 14.99, category: 'Plants', emoji: '🌵', stock: 90, rating: 4.9, review_count: 83 },
    { name: 'Cookware Set', description: '10-piece non-stick cookware set including fry pans, saucepans, and stockpot. Dishwasher-safe, oven-safe up to 400F, with ergonomic handles.', price: 119.99, category: 'Kitchen', emoji: '🍳', stock: 25, rating: 4.4, review_count: 161 },
    { name: 'Dumbbell Set', description: 'Adjustable dumbbell set ranging from 5 to 50 lbs. Space-saving design with quick weight change. Replaces 15 sets of weights.', price: 249.99, category: 'Sports', emoji: '🏋️', stock: 20, rating: 4.7, review_count: 234 },
    { name: 'Scented Candle', description: 'Hand-poured soy wax candle with essential oil blend (lavender & vanilla). 60-hour burn time. Packaged in a reusable glass jar.', price: 18.99, category: 'Home', emoji: '🕯️', stock: 120, rating: 4.8, review_count: 392 },
    { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with 2.4GHz connectivity, 1600 DPI optical sensor, and silent click buttons. Up to 18 months battery life on a single AA battery.', price: 22.99, category: 'Electronics', emoji: '🖱️', stock: 65, rating: 4.3, review_count: 78 },
    { name: 'Water Bottle', description: 'Insulated stainless steel water bottle that keeps drinks cold for 24 hrs or hot for 12 hrs. BPA-free, leak-proof lid, 32oz capacity.', price: 27.99, category: 'Sports', emoji: '💧', stock: 95, rating: 4.6, review_count: 518 },
    { name: 'Desk Lamp', description: 'LED desk lamp with 5 color modes, 7 brightness levels, and USB charging port. Touch-sensitive controls with memory function and eye-care technology.', price: 32.99, category: 'Home', emoji: '💡', stock: 45, rating: 4.5, review_count: 99 },
    { name: 'Hiking Boots', description: 'Waterproof mid-cut hiking boots with Vibram outsole, cushioned midsole, and ankle support. Suitable for all-terrain hiking and trekking.', price: 99.99, category: 'Footwear', emoji: '🥾', stock: 38, rating: 4.7, review_count: 142 },
    { name: 'Board Game', description: 'Award-winning strategy board game for 2-6 players. Ages 14+. Average playtime 90 minutes. Great for family game night!', price: 39.99, category: 'Toys', emoji: '🎲', stock: 70, rating: 4.8, review_count: 267 },
    { name: 'Perfume', description: 'Elegant floral-woody fragrance with notes of jasmine, rose, and sandalwood. Long-lasting 8-hour wear. 50ml Eau de Parfum spray bottle.', price: 64.99, category: 'Beauty', emoji: '🌸', stock: 55, rating: 4.4, review_count: 88 },
    { name: 'Bicycle Helmet', description: 'Lightweight CPSC-certified cycling helmet with 18 air vents, adjustable fit dial, and detachable visor. Suitable for road and mountain biking.', price: 54.99, category: 'Sports', emoji: '🪖', stock: 42, rating: 4.6, review_count: 113 },
    { name: 'Throw Pillow Set', description: 'Set of 4 decorative throw pillows in complementary colors. Soft velvet cover, hypoallergenic filling, hidden zipper. 18x18 inches each.', price: 36.99, category: 'Home', emoji: '🛋️', stock: 85, rating: 4.5, review_count: 176 },
    { name: 'Bluetooth Speaker', description: 'Portable waterproof Bluetooth speaker with 360 degree surround sound, 20-hour battery life, and dual microphone. IPX7 water resistant rating.', price: 49.99, category: 'Electronics', emoji: '🔊', stock: 60, rating: 4.7, review_count: 341 },
    { name: 'Chefs Knife', description: 'Professional 8-inch German steel chefs knife with full tang construction, ergonomic pakkawood handle, and razor-sharp edge. Dishwasher safe.', price: 44.99, category: 'Kitchen', emoji: '🔪', stock: 50, rating: 4.9, review_count: 228 },
    { name: 'Resistance Bands', description: 'Set of 5 latex resistance bands with varying tension levels (10-50 lbs). Includes carry bag and exercise guide. Great for home workouts and physical therapy.', price: 19.99, category: 'Sports', emoji: '💪', stock: 110, rating: 4.6, review_count: 459 },
    { name: 'Puzzle 1000pc', description: '1000-piece jigsaw puzzle featuring a stunning panoramic landscape. High-quality thick cardboard pieces, linen finish to reduce glare. Finished size: 27x20 inches.', price: 21.99, category: 'Toys', emoji: '🧩', stock: 78, rating: 4.7, review_count: 195 }
  ];

  for (const p of products) {
    db.run(
      `INSERT INTO products (name, description, price, category, emoji, stock, rating, review_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.description, p.price, p.category, p.emoji, p.stock, p.rating, p.review_count]
    );
  }
  console.log(`Seeded ${products.length} products.`);
}

function seedReviews(db) {
  const reviews = [
    { product_id: 1, reviewer_name: 'Alex M.', rating: 5, comment: 'Absolutely love these! The noise cancellation is top-notch and battery lasts forever.' },
    { product_id: 1, reviewer_name: 'Sarah K.', rating: 4, comment: 'Great sound quality. A bit tight on my head initially but comfortable after break-in.' },
    { product_id: 1, reviewer_name: 'James L.', rating: 5, comment: 'Best headphones I have owned. Crystal clear audio and very comfortable for long sessions.' },
    { product_id: 2, reviewer_name: 'Maria T.', rating: 4, comment: 'Very lightweight and comfortable. Great for daily runs. True to size.' },
    { product_id: 2, reviewer_name: 'Kevin P.', rating: 5, comment: 'Amazing grip and cushioning. My feet feel great even after long distance runs.' },
    { product_id: 2, reviewer_name: 'Lisa R.', rating: 3, comment: 'Decent shoes but the sole wore out faster than I expected.' },
    { product_id: 3, reviewer_name: 'David W.', rating: 5, comment: 'Makes perfect coffee every time. The thermal carafe keeps it hot for hours!' },
    { product_id: 3, reviewer_name: 'Emily C.', rating: 4, comment: 'Great machine, easy to program. The built-in grinder is a huge plus.' },
    { product_id: 3, reviewer_name: 'Robert H.', rating: 5, comment: 'Replaced my old drip machine and could not be happier. Excellent value.' },
    { product_id: 4, reviewer_name: 'Tom B.', rating: 5, comment: 'Slim and stylish. Fits perfectly in my pocket. RFID protection is a great feature.' },
    { product_id: 4, reviewer_name: 'Anna S.', rating: 4, comment: 'Good quality leather. Bought as a gift and the recipient loved it.' },
    { product_id: 5, reviewer_name: 'Nina F.', rating: 5, comment: 'Perfect thickness and grip. Does not slip even during hot yoga. Love the alignment lines!' },
    { product_id: 5, reviewer_name: 'Chris D.', rating: 5, comment: 'Excellent mat for the price. Very easy to clean and rolls up neatly with the strap.' },
    { product_id: 5, reviewer_name: 'Priya N.', rating: 4, comment: 'Good quality mat, comfortable and non-slip. Happy with the purchase.' },
    { product_id: 6, reviewer_name: 'Jake T.', rating: 5, comment: 'The tactile feedback is amazing. RGB lighting looks fantastic. My favourite keyboard!' },
    { product_id: 6, reviewer_name: 'Monica G.', rating: 5, comment: 'Excellent build quality. The switches are very satisfying to type on.' },
    { product_id: 6, reviewer_name: 'Ryan A.', rating: 4, comment: 'Great keyboard for gaming and work. Compact TKL layout is perfect for my desk.' },
    { product_id: 7, reviewer_name: 'Sophie W.', rating: 4, comment: 'Lightweight and stylish. Great UV protection for summer drives.' },
    { product_id: 8, reviewer_name: 'Liam O.', rating: 5, comment: 'Excellent backpack! Fits my laptop perfectly and the USB port is very convenient.' },
    { product_id: 9, reviewer_name: 'Zoe H.', rating: 5, comment: 'This smartwatch is incredible. Heart rate monitoring is very accurate.' },
  ];

  for (const r of reviews) {
    db.run(
      `INSERT INTO reviews (product_id, reviewer_name, rating, comment) VALUES (?, ?, ?, ?)`,
      [r.product_id, r.reviewer_name, r.rating, r.comment]
    );
  }
  console.log(`Seeded ${reviews.length} reviews.`);
}

function getDb() {
  return dbInstance;
}

module.exports = { initializeDatabase, saveDatabase, queryAll, queryOne, getDb };

