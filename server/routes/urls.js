const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const { dbOperations } = require('../db');

// Create shortened URL
router.post('/shorten', async (req, res) => {
  try {
    const { originalUrl, customCode } = req.body;

    // Validate URL
    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Use custom code if provided, otherwise generate one
    let shortCode;
    if (customCode) {
      // Validate custom code (alphanumeric, 3-20 chars)
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(customCode)) {
        return res.status(400).json({ error: 'Custom code must be 3-20 alphanumeric characters, hyphens, or underscores' });
      }
      
      // Check if custom code already exists
      const existing = await dbOperations.findByShortCode(customCode);
      if (existing) {
        return res.status(409).json({ error: 'Custom code already in use' });
      }
      
      shortCode = customCode;
    } else {
      shortCode = nanoid(7);
    }

    // Save to database
    await dbOperations.createUrl(originalUrl, shortCode);

    // Return shortened URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const shortUrl = `${baseUrl}/${shortCode}`;

    res.status(201).json({
      originalUrl,
      shortUrl,
      shortCode,
      message: 'URL shortened successfully'
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all URLs
router.get('/urls', async (req, res) => {
  try {
    const urls = await dbOperations.getAllUrls();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    
    const formattedUrls = urls.map(url => ({
      id: url.id,
      originalUrl: url.original_url,
      shortUrl: `${baseUrl}/${url.short_code}`,
      shortCode: url.short_code,
      clicks: url.clicks,
      createdAt: url.created_at,
      lastClickedAt: url.last_clicked_at
    }));

    res.json(formattedUrls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get URL statistics
router.get('/stats/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const stats = await dbOperations.getStats(shortCode);

    if (!stats) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    res.json({
      shortCode,
      originalUrl: stats.original_url,
      shortUrl: `${baseUrl}/${shortCode}`,
      clicks: stats.clicks,
      createdAt: stats.created_at,
      lastClickedAt: stats.last_clicked_at
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete URL
router.delete('/urls/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const result = await dbOperations.deleteUrl(shortCode);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
