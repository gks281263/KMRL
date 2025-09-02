import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { DataIngestionPage } from './pages/DataIngestionPage';
import { UnifiedDataModelPage } from './pages/UnifiedDataModelPage';
import { ValidationPage } from './pages/ValidationPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Role-specific landing pages based on flowchart */}
        <Route path="/data-ingestion" element={<DataIngestionPage />} />
        <Route path="/unified-data-model" element={<UnifiedDataModelPage />} />
        <Route path="/validation" element={<ValidationPage />} />
        <Route path="/maintenance-tracker" element={<div className="p-8"><h1>Maintenance Tracker</h1><p>Maintenance Staff landing page - Coming soon</p></div>} />
        <Route path="/branding-dashboard" element={<div className="p-8"><h1>Branding Dashboard</h1><p>Branding Manager landing page - Coming soon</p></div>} />
        <Route path="/execution-tracking" element={<div className="p-8"><h1>Execution Tracking</h1><p>Depot Ops landing page - Coming soon</p></div>} />
        <Route path="/admin-config" element={<div className="p-8"><h1>Admin and Config</h1><p>Admin landing page - Coming soon</p></div>} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
