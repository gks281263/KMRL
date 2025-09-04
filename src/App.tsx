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
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes with Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><DataIngestionPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/data-ingestion" element={
          <ProtectedRoute>
            <Layout><DataIngestionPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/unified-data-model" element={
          <ProtectedRoute>
            <Layout><UnifiedDataModelPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/validation" element={
          <ProtectedRoute>
            <Layout><ValidationPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/optimization" element={
          <ProtectedRoute>
            <Layout><OptimizationPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <Layout><ResultsPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/review" element={
          <ProtectedRoute>
            <Layout><ReviewPage /></Layout>
          </ProtectedRoute>
        } />
        
        {/* New pages we've created */}
        <Route path="/ops-monitor" element={
          <ProtectedRoute>
            <Layout><OpsMonitorPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout><AnalyticsPage /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Placeholder pages for other roles */}
        <Route path="/maintenance-tracker" element={
          <ProtectedRoute>
            <Layout><div className="p-8"><h1>Maintenance Tracker</h1><p>Maintenance Staff landing page - Coming soon</p></div></Layout>
          </ProtectedRoute>
        } />
        <Route path="/branding-dashboard" element={
          <ProtectedRoute>
            <Layout><div className="p-8"><h1>Branding Dashboard</h1><p>Branding Manager landing page - Coming soon</p></div></Layout>
          </ProtectedRoute>
        } />
        <Route path="/execution-tracking" element={
          <ProtectedRoute>
            <Layout><div className="p-8"><h1>Execution Tracking</h1><p>Depot Ops landing page - Coming soon</p></div></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin-config" element={
          <ProtectedRoute>
            <Layout><div className="p-8"><h1>Admin and Config</h1><p>Admin landing page - Coming soon</p></div></Layout>
          </ProtectedRoute>
        } />
        
        {/* Navigation System Demo */}
        <Route path="/navigation-demo" element={<NavigationDemo />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
