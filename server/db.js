const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Check if we should use PostgreSQL (production) or SQLite (development)
if (process.env.DATABASE_URL) {
  console.log('Using PostgreSQL database');
  module.exports = require('./db-postgres');
} else {
  console.log('Using SQLite database for development');

const dbPath = process.env.DB_PATH || './database.sqlite';

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_url TEXT NOT NULL,
      short_code TEXT UNIQUE NOT NULL,
      clicks INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_clicked_at DATETIME
    )
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Database initialized successfully');
      // Add column if it doesn't exist (for existing databases)
      db.run('ALTER TABLE urls ADD COLUMN last_clicked_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding column:', err.message);
        }
      });
    }
  });
}

// Database operations
const dbOperations = {
  // Create a new shortened URL
  createUrl: (originalUrl, shortCode) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO urls (original_url, short_code) VALUES (?, ?)';
      db.run(query, [originalUrl, shortCode], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, originalUrl, shortCode });
        }
      });
    });
  },

  // Find URL by short code
  findByShortCode: (shortCode) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM urls WHERE short_code = ?';
      db.get(query, [shortCode], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Increment click count
  incrementClicks: (shortCode) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE urls SET clicks = clicks + 1, last_clicked_at = CURRENT_TIMESTAMP WHERE short_code = ?';
      db.run(query, [shortCode], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  },

  // Get all URLs
  getAllUrls: () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM urls ORDER BY created_at DESC';
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Delete URL by short code
  deleteUrl: (shortCode) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM urls WHERE short_code = ?';
      db.run(query, [shortCode], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  },

  // Get statistics for a URL
  getStats: (shortCode) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT original_url, clicks, created_at, last_clicked_at FROM urls WHERE short_code = ?';
      db.get(query, [shortCode], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
};

module.exports = { db, dbOperations };

} // End SQLite configuration
