import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StatsPage from './pages/StatsPage';
import HealthCheck from './pages/HealthCheck';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/code/:code" element={<StatsPage />} />
        <Route path="/healthz" element={<HealthCheck />} />
      </Routes>
    </Router>
  );
}

export default App;
