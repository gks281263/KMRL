import { useState, useCallback, useMemo } from 'react';
import { TrainRecord, TrainStatus, Department, SortField, SortDirection } from '@/types/trains';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface UnifiedTableProps {
  trains: TrainRecord[];
  selectedTrains: Set<string>;
  onTrainSelect: (trainId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onTrainClick: (train: TrainRecord) => void;
  onAddOverride: (trainId: string) => void;
  onForceMarkAvailable: (trainId: string) => void;
  onForceMarkUnavailable: (trainId: string) => void;
  currentSort: { field: SortField; direction: SortDirection };
  onSort: (field: SortField, direction: SortDirection) => void;
  isLoading?: boolean;
}

const getStatusColor = (status: TrainStatus) => {
  switch (status) {
    case 'eligible': return 'success';
    case 'blocked': return 'warning';
    case 'invalid': return 'danger';
    default: return 'neutral';
  }
};

const getCertificateColor = (status: string) => {
  switch (status) {
    case 'valid': return 'success';
    case 'near_expiry': return 'warning';
    case 'expired': return 'danger';
    case 'missing': return 'neutral';
    default: return 'neutral';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB');
};

const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return `${Math.floor(diffMinutes / 1440)}d ago`;
};

const SortIcon = ({ field, currentField, direction }: { field: SortField; currentField: SortField; direction: SortDirection }) => {
  if (field !== currentField) {
    return <span className="text-neutral-400">↕</span>;
  }
  return <span className="text-primary-600">{direction === 'asc' ? '↑' : '↓'}</span>;
};

export const UnifiedTable = ({
  trains,
  selectedTrains,
  onTrainSelect,
  onSelectAll,
  onClearSelection,
  onTrainClick,
  onAddOverride,
  onForceMarkAvailable,
  onForceMarkUnavailable,
  currentSort,
  onSort,
  isLoading = false,
}: UnifiedTableProps) => {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'trainId', 'certificate', 'criticalJobs', 'nonCriticalJobs', 'mileage', 'branding', 'cleaning', 'yardPosition', 'overrides'
  ]));

  const handleSort = useCallback((field: SortField) => {
    const newDirection = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  }, [currentSort, onSort]);

  const toggleColumn = useCallback((column: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  }, []);

  const isAllSelected = useMemo(() => {
    return trains.length > 0 && trains.every(train => selectedTrains.has(train.trainId));
  }, [trains, selectedTrains]);

  const isIndeterminate = useMemo(() => {
    return selectedTrains.size > 0 && selectedTrains.size < trains.length;
  }, [selectedTrains, trains]);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  }, [isAllSelected, onClearSelection, onSelectAll]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      {/* Table Header */}
      <div className="sticky top-0 bg-white border-b border-neutral-200 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={handleSelectAll}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-600">
                {selectedTrains.size} of {trains.length} selected
              </span>
            </div>
            
            {selectedTrains.size > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onClearSelection}
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    // Batch actions would go here
                    console.log('Batch actions for:', Array.from(selectedTrains));
                  }}
                >
                  Batch Actions
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
            >
              Columns
            </Button>
          </div>
        </div>

        {/* Column Visibility Menu */}
        {showColumnMenu && (
          <div className="absolute right-4 top-16 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 z-20 min-w-48">
            <h4 className="font-medium text-neutral-900 mb-3">Visible Columns</h4>
            <div className="space-y-2">
              {[
                { key: 'trainId', label: 'Train ID' },
                { key: 'certificate', label: 'Certificate' },
                { key: 'criticalJobs', label: 'Critical Jobs' },
                { key: 'nonCriticalJobs', label: 'Non-Critical Jobs' },
                { key: 'mileage', label: 'Mileage' },
                { key: 'branding', label: 'Branding' },
                { key: 'cleaning', label: 'Cleaning' },
                { key: 'yardPosition', label: 'Yard Position' },
                { key: 'overrides', label: 'Overrides' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(key)}
                    onChange={() => toggleColumn(key)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-rowcount={trains.length}>
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              
              {visibleColumns.has('trainId') && (
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('trainId')}
                    className="flex items-center space-x-1 hover:text-neutral-700 focus:outline-none"
                    aria-sort={currentSort.field === 'trainId' ? (currentSort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span>Train ID</span>
                    <SortIcon field="trainId" currentField={currentSort.field} direction={currentSort.direction} />
                  </button>
                </th>
              )}

              {visibleColumns.has('certificate') && (
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('certificateExpiry')}
                    className="flex items-center space-x-1 hover:text-neutral-700 focus:outline-none"
                    aria-sort={currentSort.field === 'certificateExpiry' ? (currentSort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span>Certificate</span>
                    <SortIcon field="certificateExpiry" currentField={currentSort.field} direction={currentSort.direction} />
                  </button>
                </th>
              )}

              {visibleColumns.has('criticalJobs') && (
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('criticalJobs')}
                    className="flex items-center space-x-1 hover:text-neutral-700 focus:outline-none"
                    aria-sort={currentSort.field === 'criticalJobs' ? (currentSort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span>Critical Jobs</span>
                    <SortIcon field="criticalJobs" currentField={currentSort.field} direction={currentSort.direction} />
                  </button>
                </th>
              )}

              {visibleColumns.has('nonCriticalJobs') && (
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('nonCriticalJobs')}
                    className="flex items-center space-x-1 hover:text-neutral-700 focus:outline-none"
                    aria-sort={currentSort.field === 'nonCriticalJobs' ? (currentSort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span>Non-Critical Jobs</span>
                    <SortIcon field="nonCriticalJobs" currentField={currentSort.field} direction={currentSort.direction} />
                  </button>
                </th>
              )}

              {visibleColumns.has('mileage') && (
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('mileage')}
                    className="flex items-center space-x-1 hover:text-neutral-700 focus:outline-none"
                    aria-sort={currentSort.field === 'mileage' ? (currentSort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span>Mileage (km)</span>
                    <SortIcon field="mileage" currentField={currentSort.field} direction={currentSort.direction} />
                  </button>
                </th>
              )}

              {visibleColumns.has('branding') && (
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('brandingDelivered')}
                    className="flex items-center space-x-1 hover:text-neutral-700 focus:outline-none"
                    aria-sort={currentSort.field === 'brandingDelivered' ? (currentSort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span>Branding</span>
                    <SortIcon field="brandingDelivered" currentField={currentSort.field} direction={currentSort.direction} />
                  </button>
                </th>
              )}

              {visibleColumns.has('cleaning') && (
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('lastDeepClean')}
                    className="flex items-center space-x-1 hover:text-neutral-700 focus:outline-none"
                    aria-sort={currentSort.field === 'lastDeepClean' ? (currentSort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span>Cleaning</span>
                    <SortIcon field="lastDeepClean" currentField={currentSort.field} direction={currentSort.direction} />
                  </button>
                </th>
              )}

              {visibleColumns.has('yardPosition') && (
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('yardPosition')}
                    className="flex items-center space-x-1 hover:text-neutral-700 focus:outline-none"
                    aria-sort={currentSort.field === 'yardPosition' ? (currentSort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span>Yard Position</span>
                    <SortIcon field="yardPosition" currentField={currentSort.field} direction={currentSort.direction} />
                  </button>
                </th>
              )}

              {visibleColumns.has('overrides') && (
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Overrides
                </th>
              )}

              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-neutral-200">
            {isLoading ? (
              <tr>
                <td colSpan={visibleColumns.size + 3} className="px-4 py-8 text-center text-neutral-500">
                  Loading trains...
                </td>
              </tr>
            ) : trains.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.size + 3} className="px-4 py-8 text-center text-neutral-500">
                  No trains found matching your criteria
                </td>
              </tr>
            ) : (
              trains.map((train) => (
                <tr
                  key={train.trainId}
                  className={cn(
                    'hover:bg-neutral-50 cursor-pointer transition-colors',
                    selectedTrains.has(train.trainId) && 'bg-primary-50'
                  )}
                  onClick={() => onTrainClick(train)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedTrains.has(train.trainId)}
                      onChange={() => onTrainSelect(train.trainId)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>

                  {visibleColumns.has('trainId') && (
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-neutral-900">{train.trainId}</span>
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          `bg-${getStatusColor(train.status)}-100 text-${getStatusColor(train.status)}-700`
                        )}>
                          {train.status}
                        </span>
                      </div>
                    </td>
                  )}

                  {visibleColumns.has('certificate') && (
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            `bg-${getCertificateColor(train.certificate.status)}-100 text-${getCertificateColor(train.certificate.status)}-700`
                          )}>
                            {train.certificate.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-neutral-500">{train.certificate.department}</span>
                        </div>
                        <div className="text-sm text-neutral-600">
                          {formatDate(train.certificate.expiryDate)}
                        </div>
                      </div>
                    </td>
                  )}

                  {visibleColumns.has('criticalJobs') && (
                    <td className="px-4 py-3">
                      <div className="text-center">
                        <span className={cn(
                          'text-lg font-semibold',
                          train.jobs.critical > 0 ? 'text-danger-600' : 'text-neutral-900'
                        )}>
                          {train.jobs.critical}
                        </span>
                      </div>
                    </td>
                  )}

                  {visibleColumns.has('nonCriticalJobs') && (
                    <td className="px-4 py-3">
                      <div className="text-center">
                        <span className="text-lg font-semibold text-neutral-900">
                          {train.jobs.nonCritical}
                        </span>
                      </div>
                    </td>
                  )}

                  {visibleColumns.has('mileage') && (
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="text-lg font-semibold text-neutral-900">
                          {train.mileage.current.toLocaleString()}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {formatRelativeTime(train.mileage.lastUpdate)}
                        </div>
                      </div>
                    </td>
                  )}

                  {visibleColumns.has('branding') && (
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{train.branding.delivered}/{train.branding.target}</span>
                          <span className="text-xs text-neutral-500">{train.branding.percentage}%</span>
                        </div>
                        <div className="w-16 bg-neutral-200 rounded-full h-1">
                          <div
                            className="bg-primary-500 h-1 rounded-full"
                            style={{ width: `${train.branding.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  )}

                  {visibleColumns.has('cleaning') && (
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            train.cleaning.due ? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700'
                          )}>
                            {train.cleaning.due ? 'DUE' : 'OK'}
                          </span>
                          {train.cleaning.bay && (
                            <span className="text-xs text-neutral-500">{train.cleaning.bay}</span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {formatDate(train.cleaning.lastDeepClean)}
                        </div>
                      </div>
                    </td>
                  )}

                  {visibleColumns.has('yardPosition') && (
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="font-medium text-neutral-900">{train.yardPosition.track}</div>
                        {train.yardPosition.bay && (
                          <div className="text-xs text-neutral-500">{train.yardPosition.bay}</div>
                        )}
                      </div>
                    </td>
                  )}

                  {visibleColumns.has('overrides') && (
                    <td className="px-4 py-3">
                      <div className="text-center">
                        {train.overrides.active ? (
                          <span className="px-2 py-1 bg-warning-100 text-warning-700 rounded text-xs font-medium">
                            {train.overrides.count} Active
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-500">None</span>
                        )}
                      </div>
                    </td>
                  )}

                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onAddOverride(train.trainId)}
                      >
                        Override
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onForceMarkAvailable(train.trainId)}
                      >
                        Available
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onForceMarkUnavailable(train.trainId)}
                      >
                        Unavailable
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
