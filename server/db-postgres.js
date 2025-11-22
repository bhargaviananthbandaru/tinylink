const { Pool } = require('pg');

// PostgreSQL configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Initialize PostgreSQL tables
const initializePostgresDB = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      original_url TEXT NOT NULL,
      short_code VARCHAR(255) UNIQUE NOT NULL,
      clicks INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_clicked_at TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
  `;

  try {
    await pool.query(createTableQuery);
    console.log('PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('Error initializing PostgreSQL database:', error);
    throw error;
  }
};

// Initialize on startup
initializePostgresDB();

// Database operations
const dbOperations = {
  // Create a new shortened URL
  async createUrl(originalUrl, shortCode) {
    const query = 'INSERT INTO urls (original_url, short_code) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [originalUrl, shortCode]);
    return {
      id: result.rows[0].id,
      original_url: result.rows[0].original_url,
      short_code: result.rows[0].short_code,
      clicks: result.rows[0].clicks,
      created_at: result.rows[0].created_at,
      last_clicked_at: result.rows[0].last_clicked_at
    };
  },

  // Find URL by short code
  async findByShortCode(shortCode) {
    const query = 'SELECT * FROM urls WHERE short_code = $1';
    const result = await pool.query(query, [shortCode]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return {
      id: result.rows[0].id,
      original_url: result.rows[0].original_url,
      short_code: result.rows[0].short_code,
      clicks: result.rows[0].clicks,
      created_at: result.rows[0].created_at,
      last_clicked_at: result.rows[0].last_clicked_at
    };
  },

  // Increment click count
  async incrementClicks(shortCode) {
    const query = 'UPDATE urls SET clicks = clicks + 1, last_clicked_at = CURRENT_TIMESTAMP WHERE short_code = $1';
    await pool.query(query, [shortCode]);
  },

  // Get all URLs
  async getAllUrls() {
    const query = 'SELECT * FROM urls ORDER BY created_at DESC';
    const result = await pool.query(query);
    
    return result.rows.map(row => ({
      id: row.id,
      original_url: row.original_url,
      short_code: row.short_code,
      clicks: row.clicks,
      created_at: row.created_at,
      last_clicked_at: row.last_clicked_at
    }));
  },

  // Delete a URL
  async deleteUrl(shortCode) {
    const query = 'DELETE FROM urls WHERE short_code = $1';
    await pool.query(query, [shortCode]);
  },

  // Get statistics for a specific URL
  async getStats(shortCode) {
    const query = 'SELECT * FROM urls WHERE short_code = $1';
    const result = await pool.query(query, [shortCode]);
    return { changes: result.rowCount };
    
    if (result.rows.length === 0) {
      return null;
    }

    return {
      id: result.rows[0].id,
      original_url: result.rows[0].original_url,
      short_code: result.rows[0].short_code,
      clicks: result.rows[0].clicks,
      created_at: result.rows[0].created_at,
      last_clicked_at: result.rows[0].last_clicked_at
    };
  }
};

module.exports = { dbOperations, pool };
