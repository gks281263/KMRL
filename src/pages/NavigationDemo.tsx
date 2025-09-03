import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Mock pages for demonstration
const DashboardPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-neutral-900 mb-4">Dashboard</h1>
    <p className="text-neutral-600">Welcome to the Metro System dashboard.</p>
  </div>
);

const DataPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-neutral-900 mb-4">Data Ingestion</h1>
    <p className="text-neutral-600">Manage data sources and imports.</p>
  </div>
);

const ValidationPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-neutral-900 mb-4">Validation</h1>
    <p className="text-neutral-600">Validate data quality and integrity.</p>
  </div>
);

const OptimizationPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-neutral-900 mb-4">Optimization Setup</h1>
    <p className="text-neutral-600">Configure optimization parameters.</p>
  </div>
);

const ResultsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-neutral-900 mb-4">Results</h1>
    <p className="text-neutral-600">View optimization results and analytics.</p>
  </div>
);

const ReviewPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-neutral-900 mb-4">Review & What-if</h1>
    <p className="text-neutral-600">Review and simulate different scenarios.</p>
  </div>
);

const OpsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-neutral-900 mb-4">Execution Tracking</h1>
    <p className="text-neutral-600">Track execution progress and status.</p>
  </div>
);

const AnalyticsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-neutral-900 mb-4">Analytics</h1>
    <p className="text-neutral-600">Advanced analytics and insights.</p>
  </div>
);

const AdminPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-neutral-900 mb-4">Admin & Config</h1>
    <p className="text-neutral-600">System administration and configuration.</p>
  </div>
);

const RoleSelector: React.FC<{ onRoleChange: (roles: string[]) => void }> = ({ onRoleChange }) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Supervisor']);

  const roles = [
    { id: 'Supervisor', label: 'Supervisor', description: 'Full access to most features' },
    { id: 'Maintenance Staff', label: 'Maintenance Staff', description: 'Limited access to validation and maintenance' },
    { id: 'Branding Manager', label: 'Branding Manager', description: 'Access to branding and optimization features' },
    { id: 'Depot Ops', label: 'Depot Ops', description: 'Execution tracking and operations' },
    { id: 'Admin', label: 'Admin', description: 'Full system access including admin features' }
  ];

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleApplyRoles = () => {
    onRoleChange(selectedRoles);
  };

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Role Selector</h2>
      <p className="text-sm text-neutral-600 mb-4">
        Select user roles to test RBAC navigation. You can select multiple roles.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {roles.map((role) => (
          <label key={role.id} className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedRoles.includes(role.id)}
              onChange={() => handleRoleToggle(role.id)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-neutral-900">{role.label}</div>
              <div className="text-xs text-neutral-500">{role.description}</div>
            </div>
          </label>
        ))}
      </div>
      
      <Button onClick={handleApplyRoles} variant="primary">
        Apply Roles & Refresh Navigation
      </Button>
      
      <div className="mt-3 text-xs text-neutral-500">
        <strong>Current roles:</strong> {selectedRoles.join(', ') || 'None'}
      </div>
    </Card>
  );
};

const NavigationDemo: React.FC = () => {
  const [userRoles, setUserRoles] = useState<string[]>(['Supervisor']);
  const [queryClient] = useState(() => new QueryClient());

  // Override the mock API to use selected roles
  const mockFetchUserProfile = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      userId: 'demo-user',
      name: 'Demo User',
      roles: userRoles
    };
  };

  // Override the query function
  queryClient.setQueryData(['userProfile'], {
    userId: 'demo-user',
    name: 'Demo User',
    roles: userRoles
  });

  const handleRoleChange = (newRoles: string[]) => {
    setUserRoles(newRoles);
    // Force a refetch by invalidating the query
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex h-screen bg-neutral-50">
          <Sidebar />
          
          <main className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <div className="p-6">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Navigation System Demo
                </h1>
                <p className="text-neutral-600 mb-6">
                  This demo showcases the RBAC navigation system. Use the role selector below to test different user permissions.
                </p>
                
                <RoleSelector onRoleChange={handleRoleChange} />
                
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Current Route</h2>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/data" element={<DataPage />} />
                    <Route path="/validation" element={<ValidationPage />} />
                    <Route path="/optimization" element={<OptimizationPage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/review" element={<ReviewPage />} />
                    <Route path="/ops" element={<OpsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default NavigationDemo;
