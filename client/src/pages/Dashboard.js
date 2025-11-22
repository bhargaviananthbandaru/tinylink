import { useState, useEffect, useCallback } from 'react';
import '../App.css';

const AlertMessage = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`alert ${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="alert-close">×</button>
    </div>
  );
};

const UrlCard = ({ url, onCopy, onDelete, onViewStats, index }) => (
  <div className="url-card" style={{ '--index': index }}>
    <div className="url-content">
      <div className="url-original">
        <a href={url.originalUrl} target="_blank" rel="noopener noreferrer">
          {url.originalUrl.length > 60
            ? url.originalUrl.substring(0, 60) + '...'
            : url.originalUrl}
        </a>
      </div>
      <div className="url-short">
        <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
          {url.shortUrl}
        </a>
      </div>
      <div className="url-stats">
        <span>{url.clicks} clicks</span>
        <span>•</span>
        <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
        {url.lastClickedAt && (
          <>
            <span>•</span>
            <span>Last click: {new Date(url.lastClickedAt).toLocaleDateString()}</span>
          </>
        )}
      </div>
    </div>
    <div className="url-actions">
      <button
        onClick={() => onViewStats(url.shortCode)}
        className="btn-icon"
        aria-label="View Stats"
        title="View detailed stats"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
      </button>
      <button
        onClick={() => onCopy(url.shortUrl)}
        className="btn-icon"
        aria-label="Copy URL"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <button
        onClick={() => onDelete(url.shortCode)}
        className="btn-icon btn-delete"
        aria-label="Delete URL"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </div>
);

function Dashboard() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [urls, setUrls] = useState([]);
  const [filteredUrls, setFilteredUrls] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [showCustomCode, setShowCustomCode] = useState(false);

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ message, type });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert({ message: '', type: '' });
  }, []);

  const fetchUrls = useCallback(async () => {
    try {
      const response = await fetch('/api/urls');
      const data = await response.json();
      setUrls(data);
    } catch (err) {
      console.error('Error fetching URLs:', err);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUrls(urls);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = urls.filter(url => 
        url.originalUrl.toLowerCase().includes(query) ||
        url.shortCode.toLowerCase().includes(query) ||
        url.shortUrl.toLowerCase().includes(query)
      );
      setFilteredUrls(filtered);
    }
  }, [searchQuery, urls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl.trim()) return;

    setLoading(true);
    closeAlert();

    try {
      const body = { originalUrl: originalUrl.trim() };
      if (customCode.trim()) {
        body.customCode = customCode.trim();
      }

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('URL shortened successfully!');
        setOriginalUrl('');
        setCustomCode('');
        setShowCustomCode(false);
        await fetchUrls();
      } else {
        showAlert(data.error || 'Failed to shorten URL', 'error');
      }
    } catch (err) {
      showAlert('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showAlert('Copied to clipboard!');
    } catch (err) {
      showAlert('Failed to copy', 'error');
    }
  }, [showAlert]);

  const deleteUrl = useCallback(async (shortCode) => {
    if (!window.confirm('Delete this URL?')) return;

    try {
      const response = await fetch(`/api/urls/${shortCode}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showAlert('URL deleted');
        await fetchUrls();
      } else {
        showAlert('Failed to delete URL', 'error');
      }
    } catch (err) {
      showAlert('Network error', 'error');
    }
  }, [fetchUrls, showAlert]);

  const viewStats = useCallback((shortCode) => {
    window.location.href = `/code/${shortCode}`;
  }, []);

  return (
    <div className="app">
      <AlertMessage message={alert.message} type={alert.type} onClose={closeAlert} />
      
      <div className="container">
        <header className="header">
          <h1>TinyLink</h1>
          <p>URL shortener dashboard</p>
        </header>

        <main className="main">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-inputs">
              <input
                type="url"
                placeholder="Paste your long URL here"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
                disabled={loading}
                className="input"
              />
              {showCustomCode && (
                <input
                  type="text"
                  placeholder="Custom code (optional, 3-20 chars)"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  disabled={loading}
                  className="input input-custom"
                  pattern="[a-zA-Z0-9_-]{3,20}"
                  title="3-20 alphanumeric characters, hyphens, or underscores"
                />
              )}
            </div>
            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowCustomCode(!showCustomCode)}
                className="btn-secondary"
                disabled={loading}
              >
                {showCustomCode ? 'Hide' : 'Custom Code'}
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creating...' : 'Shorten'}
              </button>
            </div>
          </form>

          {urls.length > 0 && (
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by URL or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input search-input"
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
          )}

          {filteredUrls.length > 0 ? (
            <div className="urls-list">
              {filteredUrls.map((url, index) => (
                <UrlCard
                  key={url.id}
                  url={url}
                  index={index}
                  onCopy={copyToClipboard}
                  onDelete={deleteUrl}
                  onViewStats={viewStats}
                />
              ))}
            </div>
          ) : urls.length > 0 ? (
            <div className="empty-state">
              <p>No URLs match your search.</p>
            </div>
          ) : (
            <div className="empty-state">
              <p>No URLs yet. Create your first one above.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
