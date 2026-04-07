const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'invoice_app.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    
    bill_from_name TEXT,
    bill_from_email TEXT,
    bill_from_address TEXT,
    bill_from_phone TEXT,

    client_name TEXT NOT NULL,
    client_email TEXT,
    client_address TEXT,
    client_phone TEXT,

    amount REAL NOT NULL,
    amount_paid REAL DEFAULT 0,
    service_details TEXT NOT NULL,
    is_paid INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );
`);

try {
  db.exec('ALTER TABLE invoices ADD COLUMN amount_paid REAL DEFAULT 0');
} catch (err) {
  // Column might already exist, safe to ignore
}

module.exports = db;
