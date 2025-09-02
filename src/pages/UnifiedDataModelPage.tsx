import { useState, useEffect } from 'react';
import { TrainStatus, Department, TrainDetails, OverrideRequest } from '@/types/trains';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UnifiedTable } from '@/components/trains/UnifiedTable';
import { TrainDrawer } from '@/components/trains/TrainDrawer';
import { useTrainsQuery } from '@/hooks/useTrainsQuery';
import { cn } from '@/utils/cn';

export const UnifiedDataModelPage = () => {
  const {
    trains,
    pagination,
    selectedTrains,
    isLoading,
    queryParams,
    updateFilters,
    updateSort,
    goToPage,
    nextPage,
    prevPage,
    toggleTrainSelection,
    selectAllTrains,
    clearSelection,
    getTrainDetails,
  } = useTrainsQuery();

  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TrainStatus>('all');
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>(['all']);
  const [showStaleBanner, setShowStaleBanner] = useState(false);

  // Check for stale snapshot (mock - in real app this would come from API)
  useEffect(() => {
    // Simulate stale snapshot check
    const isStale = Math.random() > 0.7; // 30% chance of stale
    setShowStaleBanner(isStale);
  }, []);

  const handleTrainClick = async (train: any) => {
    try {
      const details = await getTrainDetails(train.trainId);
      setSelectedTrain(details);
      setShowDrawer(true);
    } catch (error) {
      console.error('Failed to load train details:', error);
    }
  };

  const handleAddOverride = async (override: OverrideRequest) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Adding override:', override);
    
    // Close drawer and refresh data
    setShowDrawer(false);
    setSelectedTrain(null);
  };

  const handleForceMarkAvailable = async (trainId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Force marking available:', trainId);
  };

  const handleForceMarkUnavailable = async (trainId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Force marking unavailable:', trainId);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateFilters({ search: value });
  };

  const handleStatusFilter = (status: TrainStatus) => {
    setSelectedStatus(status);
    updateFilters({ status });
  };

  const handleDepartmentFilter = (department: Department) => {
    setSelectedDepartments(prev => {
      if (department === 'all') {
        return ['all'];
      }
      
      const newDepartments = prev.includes('all') 
        ? [department]
        : prev.includes(department)
          ? prev.filter(d => d !== department)
          : [...prev, department];
      
      return newDepartments.length === 0 ? ['all'] : newDepartments;
    });
  };

  const handleRefreshSnapshot = () => {
    setShowStaleBanner(false);
    // In real app, this would trigger a data refresh
    console.log('Refreshing snapshot...');
  };

  const statusCounts = {
    all: trains.length,
    eligible: trains.filter(t => t.status === 'eligible').length,
    blocked: trains.filter(t => t.status === 'blocked').length,
    invalid: trains.filter(t => t.status === 'invalid').length,
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Unified Data Model</h1>
          <p className="text-neutral-600 mt-1">Searchable, filterable view of all train records after ingestion</p>
        </div>

        {/* Stale Snapshot Banner */}
        {showStaleBanner && (
          <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-warning-600">⚠</span>
                <div>
                  <h3 className="text-sm font-medium text-warning-800">Stale Snapshot</h3>
                  <p className="text-sm text-warning-700">Data may be outdated. Consider refreshing the snapshot.</p>
                </div>
              </div>
              <Button
                variant="warning"
                size="sm"
                onClick={handleRefreshSnapshot}
              >
                Refresh Snapshot
              </Button>
            </div>
          </div>
        )}

        {/* Global Filters */}
        <Card className="p-6 mb-6">
          <div className="space-y-6">
            {/* Status Filters */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All', count: statusCounts.all },
                  { key: 'eligible', label: 'Eligible', count: statusCounts.eligible },
                  { key: 'blocked', label: 'Blocked', count: statusCounts.blocked },
                  { key: 'invalid', label: 'Invalid', count: statusCounts.invalid },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => handleStatusFilter(key as TrainStatus)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                      selectedStatus === key
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    )}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
            </div>

            {/* Department Filters */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Department</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All Departments' },
                  { key: 'RS', label: 'RS' },
                  { key: 'Signalling', label: 'Signalling' },
                  { key: 'Telecom', label: 'Telecom' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleDepartmentFilter(key as Department)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                      selectedDepartments.includes(key as Department)
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Search</h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by Train ID..."
                  className="w-full px-4 py-2 pl-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="absolute left-3 top-2.5 text-neutral-400">🔍</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-neutral-600">
            Showing {trains.length} of {pagination.total} trains
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
          <div className="text-sm text-neutral-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>

        {/* Table */}
        <div className="mb-6">
          <UnifiedTable
            trains={trains}
            selectedTrains={selectedTrains}
            onTrainSelect={toggleTrainSelection}
            onSelectAll={selectAllTrains}
            onClearSelection={clearSelection}
            onTrainClick={handleTrainClick}
            onAddOverride={(trainId) => {
              // This would open a modal or trigger the override flow
              console.log('Add override for:', trainId);
            }}
            onForceMarkAvailable={handleForceMarkAvailable}
            onForceMarkUnavailable={handleForceMarkUnavailable}
            currentSort={queryParams.sort!}
            onSort={updateSort}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={prevPage}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={cn(
                        'px-3 py-1 text-sm rounded',
                        pagination.page === pageNum
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={nextPage}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Train Details Drawer */}
        <TrainDrawer
          isOpen={showDrawer}
          onClose={() => {
            setShowDrawer(false);
            setSelectedTrain(null);
          }}
          train={selectedTrain}
          onAddOverride={handleAddOverride}
          onForceMarkAvailable={handleForceMarkAvailable}
          onForceMarkUnavailable={handleForceMarkUnavailable}
        />
      </div>
    </div>
  );
};
