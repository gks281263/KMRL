import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { DataIngestionPage } from './pages/DataIngestionPage';
import { UnifiedDataModelPage } from './pages/UnifiedDataModelPage';
import { ValidationPage } from './pages/ValidationPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { ResultsPage } from './pages/ResultsPage';
import ReviewPage from './pages/ReviewPage';
import { OpsMonitorPage } from './pages/OpsMonitorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import NavigationDemo from './pages/NavigationDemo';
import { Layout } from './components/Layout';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Protected routes with Layout */}
        <Route path="/data-ingestion" element={<Layout><DataIngestionPage /></Layout>} />
        <Route path="/unified-data-model" element={<Layout><UnifiedDataModelPage /></Layout>} />
        <Route path="/validation" element={<Layout><ValidationPage /></Layout>} />
        <Route path="/optimization" element={<Layout><OptimizationPage /></Layout>} />
        <Route path="/results" element={<Layout><ResultsPage /></Layout>} />
        <Route path="/review" element={<Layout><ReviewPage /></Layout>} />
        
        {/* New pages we've created */}
        <Route path="/ops-monitor" element={<Layout><OpsMonitorPage /></Layout>} />
        <Route path="/analytics" element={<Layout><AnalyticsPage /></Layout>} />
        
        {/* Placeholder pages for other roles */}
        <Route path="/maintenance-tracker" element={<Layout><div className="p-8"><h1>Maintenance Tracker</h1><p>Maintenance Staff landing page - Coming soon</p></div></Layout>} />
        <Route path="/branding-dashboard" element={<Layout><div className="p-8"><h1>Branding Dashboard</h1><p>Branding Manager landing page - Coming soon</p></div></Layout>} />
        <Route path="/execution-tracking" element={<Layout><div className="p-8"><h1>Execution Tracking</h1><p>Depot Ops landing page - Coming soon</p></div></Layout>} />
        <Route path="/admin-config" element={<Layout><div className="p-8"><h1>Admin and Config</h1><p>Admin landing page - Coming soon</p></div></Layout>} />
        
        {/* Navigation System Demo */}
        <Route path="/navigation-demo" element={<NavigationDemo />} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
