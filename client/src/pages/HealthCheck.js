import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function HealthCheck() {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('Health data:', data); // Debug log
        setHealth(data);
      } catch (err) {
        console.error('Failed to fetch health:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="stats-loading">Loading...</div>
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
          <h1>System Health</h1>
          <p>Server status and system information</p>
        </header>

        <main className="main">
          {!health ? (
            <div className="stats-error">
              <h2>No health data available</h2>
            </div>
          ) : (
            <div className="stats-container">
            <div className="stats-card stats-hero health-status">
              <div className="health-indicator">
                <div className={`status-dot ${health?.status === 'healthy' ? 'status-healthy' : 'status-error'}`}></div>
                <h2>{health?.status === 'healthy' ? 'System Healthy' : 'System Error'}</h2>
              </div>
              <p className="stats-time">{health?.timestamp && new Date(health.timestamp).toLocaleString()}</p>
            </div>

            <div className="stats-grid">
              <div className="stats-card">
                <h3>Uptime</h3>
                <p className="stats-number">{health.uptime?.formatted || 'N/A'}</p>
                <p className="stats-label">{health.uptime?.seconds ? health.uptime.seconds.toLocaleString() + ' seconds' : 'N/A'}</p>
              </div>

              <div className="stats-card">
                <h3>Platform</h3>
                <p className="stats-text">{health.system?.platform || 'N/A'}</p>
                <p className="stats-label">{health.system?.arch || 'N/A'} architecture</p>
              </div>

              <div className="stats-card">
                <h3>Node.js</h3>
                <p className="stats-text">{health.system?.nodeVersion || 'N/A'}</p>
                <p className="stats-label">Runtime version</p>
              </div>

              <div className="stats-card">
                <h3>CPU Cores</h3>
                <p className="stats-number">{health.system?.cpus || 'N/A'}</p>
                <p className="stats-label">Available cores</p>
              </div>
            </div>

            {health.database && (
              <div className="stats-card">
                <h3>Database Statistics</h3>
                <div className="memory-grid">
                  <div className="memory-item">
                    <span className="memory-label">Total URLs</span>
                    <span className="memory-value">{health.database.totalUrls?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="memory-item">
                    <span className="memory-label">Total Clicks</span>
                    <span className="memory-value">{health.database.totalClicks?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="memory-item">
                    <span className="memory-label">Active URLs</span>
                    <span className="memory-value">{health.database.activeUrls?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="memory-item">
                    <span className="memory-label">Inactive URLs</span>
                    <span className="memory-value">{health.database.inactiveUrls?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="stats-card">
              <h3>System Memory</h3>
              <div className="memory-grid">
                <div className="memory-item">
                  <span className="memory-label">Total</span>
                  <span className="memory-value">{health.system?.memory?.total || 'N/A'}</span>
                </div>
                <div className="memory-item">
                  <span className="memory-label">Used</span>
                  <span className="memory-value">{health.system?.memory?.used || 'N/A'}</span>
                </div>
                <div className="memory-item">
                  <span className="memory-label">Free</span>
                  <span className="memory-value">{health.system?.memory?.free || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <h3>Process Memory</h3>
              <div className="memory-grid">
                <div className="memory-item">
                  <span className="memory-label">RSS</span>
                  <span className="memory-value">{health.process?.memoryUsage?.rss || 'N/A'}</span>
                </div>
                <div className="memory-item">
                  <span className="memory-label">Heap Total</span>
                  <span className="memory-value">{health.process?.memoryUsage?.heapTotal || 'N/A'}</span>
                </div>
                <div className="memory-item">
                  <span className="memory-label">Heap Used</span>
                  <span className="memory-value">{health.process?.memoryUsage?.heapUsed || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <h3>Process Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Process ID</span>
                  <span className="info-value">{health.process?.pid || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Hostname</span>
                  <span className="info-value">{health.system?.hostname || 'N/A'}</span>
                </div>
              </div>
            </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}export default HealthCheck;
