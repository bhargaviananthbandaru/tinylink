require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const { dbOperations } = require('./db');
const urlRoutes = require('./routes/urls');

const app = express();
const PORT = process.env.PORT || 5000;
const startTime = Date.now();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API health check endpoint for monitoring (JSON response)
app.get('/api/health', async (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  try {
    // Get database statistics
    const urls = await dbOperations.getAllUrls();
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
    const activeUrls = urls.filter(url => url.clicks > 0).length;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptime,
        formatted: `${hours}h ${minutes}m ${seconds}s`
      },
      database: {
        totalUrls,
        totalClicks,
        activeUrls,
        inactiveUrls: totalUrls - activeUrls
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        memory: {
          total: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
          free: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
          used: `${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB`
        },
        cpus: os.cpus().length,
        hostname: os.hostname()
      },
      process: {
        pid: process.pid,
        memoryUsage: {
          rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
          heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
        }
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Failed to retrieve database statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// Legacy health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api', urlRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Redirect route (must come after API routes and static files)
// Exclude React routes like /healthz, /code/
app.get('/:shortCode', async (req, res, next) => {
  const { shortCode } = req.params;
  
  // Skip if it's a known React route
  if (shortCode === 'healthz' || shortCode === 'code' || shortCode === 'static') {
    return next();
  }
  
  try {
    // Find URL in database
    const urlData = await dbOperations.findByShortCode(shortCode);

    if (!urlData) {
      // If not found and in production, let React handle it
      if (process.env.NODE_ENV === 'production') {
        return next();
      }
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Increment click count
    await dbOperations.incrementClicks(shortCode);

    // Redirect to original URL
    res.redirect(urlData.original_url);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all route for React Router in production (must be last)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});

module.exports = app;
