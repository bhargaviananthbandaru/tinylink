import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

function StatsPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats/${code}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Short URL not found');
        }
      } catch (err) {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [code]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="stats-loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="app">
        <div className="container">
          <div className="stats-error">
            <h2>{error || 'Not found'}</h2>
            <button onClick={() => navigate('/')} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <button onClick={() => navigate('/')} className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h1>URL Statistics</h1>
          <p>Detailed analytics for your short link</p>
        </header>

        <main className="main">
          <div className="stats-container">
            <div className="stats-card stats-hero">
              <div className="stats-hero-content">
                <h2>Short Code</h2>
                <div className="stats-code">
                  <code>{stats.shortCode}</code>
                  <button 
                    onClick={() => copyToClipboard(stats.shortUrl)}
                    className="btn-icon"
                    title="Copy URL"
                  >
                    {copied ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </button>
                </div>
                <a href={stats.shortUrl} target="_blank" rel="noopener noreferrer" className="stats-link">
                  {stats.shortUrl}
                </a>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stats-card">
                <div className="stats-card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <h3>Total Clicks</h3>
                <p className="stats-number">{stats.clicks.toLocaleString()}</p>
              </div>

              <div className="stats-card">
                <div className="stats-card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h3>Created</h3>
                <p className="stats-date">
                  {new Date(stats.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="stats-time">
                  {new Date(stats.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="stats-card">
                <div className="stats-card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h3>Last Clicked</h3>
                {stats.lastClickedAt ? (
                  <>
                    <p className="stats-date">
                      {new Date(stats.lastClickedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="stats-time">
                      {new Date(stats.lastClickedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </>
                ) : (
                  <p className="stats-never">Never clicked</p>
                )}
              </div>
            </div>

            <div className="stats-card stats-destination">
              <h3>Destination URL</h3>
              <div className="destination-url">
                <a href={stats.originalUrl} target="_blank" rel="noopener noreferrer">
                  {stats.originalUrl}
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StatsPage;
