import React, { useState } from 'react';
import { ResultsPage as ResultsPageComponent } from '@/components/optimization/ResultsPage';
import { OptimizationResult } from '@/types/optimization';

// Sample data for demonstration
const sampleResult: OptimizationResult = {
  service: [
    {
      trainId: 'T101',
      startTime: '05:15',
      routeId: 'R1',
      rationale: ['branding', 'mileage_balance'],
      assignedTrack: 'TRK-01',
      estimatedDuration: 120,
      priority: 1,
    },
    {
      trainId: 'T102',
      startTime: '05:30',
      routeId: 'R2',
      rationale: ['risk_mitigation', 'shunting_minimization'],
      assignedTrack: 'TRK-02',
      estimatedDuration: 90,
      priority: 2,
    },
    {
      trainId: 'T103',
      startTime: '06:00',
      routeId: 'R3',
      rationale: ['branding', 'mileage_balance', 'risk_mitigation'],
      assignedTrack: 'TRK-03',
      estimatedDuration: 150,
      priority: 3,
    },
  ],
  standby: [
    {
      trainId: 'T201',
      priorityRank: 1,
      triggerCondition: 'Service disruption on R1',
      standbyLocation: 'Yard A',
      estimatedStandbyTime: 45,
      alternativeRoutes: ['R1A', 'R1B'],
    },
    {
      trainId: 'T202',
      priorityRank: 2,
      triggerCondition: 'Peak hour demand',
      standbyLocation: 'Yard B',
      estimatedStandbyTime: 30,
      alternativeRoutes: ['R2A'],
    },
  ],
  maintenance: [
    {
      trainId: 'T301',
      bay: 'Bay 1',
      plannedWork: 'Brake system inspection',
      eta: '08:00',
      estimatedDuration: 180,
      maintenanceType: 'scheduled',
      assignedTechnicians: ['Tech A', 'Tech B'],
    },
    {
      trainId: 'T302',
      bay: 'Bay 2',
      plannedWork: 'Engine maintenance',
      eta: '09:30',
      estimatedDuration: 240,
      maintenanceType: 'scheduled',
      assignedTechnicians: ['Tech C'],
    },
  ],
  yardMap: {
    tracks: [
      { id: 'TRK-01', name: 'Track 1', x: 50, y: 50, length: 200, width: 30, status: 'occupied', assignedTrain: 'T101' },
      { id: 'TRK-02', name: 'Track 2', x: 50, y: 100, length: 200, width: 30, status: 'occupied', assignedTrain: 'T102' },
      { id: 'TRK-03', name: 'Track 3', x: 50, y: 150, length: 200, width: 30, status: 'occupied', assignedTrain: 'T103' },
      { id: 'TRK-04', name: 'Track 4', x: 50, y: 200, length: 200, width: 30, status: 'available' },
      { id: 'TRK-05', name: 'Track 5', x: 50, y: 250, length: 200, width: 30, status: 'maintenance' },
      { id: 'BAY-01', name: 'Bay 1', x: 300, y: 50, length: 150, width: 40, status: 'occupied', assignedTrain: 'T301' },
      { id: 'BAY-02', name: 'Bay 2', x: 300, y: 120, length: 150, width: 40, status: 'occupied', assignedTrain: 'T302' },
    ],
    paths: [
      {
        id: 'PATH-01',
        fromTrack: 'TRK-01',
        toTrack: 'BAY-01',
        path: [{ x: 250, y: 65 }, { x: 300, y: 70 }],
        estimatedTime: 15,
        conflicts: [],
      },
    ],
    trains: [
      {
        id: 'T101',
        trackId: 'TRK-01',
        position: { x: 150, y: 65 },
        assignedTask: 'Service Route R1',
        status: 'stationary',
      },
      {
        id: 'T102',
        trackId: 'TRK-02',
        position: { x: 150, y: 115 },
        assignedTask: 'Service Route R2',
        status: 'stationary',
      },
      {
        id: 'T103',
        trackId: 'TRK-03',
        position: { x: 150, y: 165 },
        assignedTask: 'Service Route R3',
        status: 'stationary',
      },
      {
        id: 'T301',
        trackId: 'BAY-01',
        position: { x: 375, y: 70 },
        assignedTask: 'Brake system inspection',
        status: 'stationary',
      },
      {
        id: 'T302',
        trackId: 'BAY-02',
        position: { x: 375, y: 140 },
        assignedTask: 'Engine maintenance',
        status: 'stationary',
      },
    ],
  },
  meta: {
    jobId: 'OPT-001',
    timestamp: '2024-01-15T10:30:00Z',
    feasibilityScore: 94,
    totalTrains: 7,
    approvalStatus: 'pending',
    requiredApprovals: ['Depot Ops', 'Signalling'],
  },
};

export const ResultsPage: React.FC = () => {
  const [result, setResult] = useState<OptimizationResult>(sampleResult);

  const handleApprove = () => {
    console.log('Approving optimization...');
    // In a real app, this would call the approval API
    setResult(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        approvalStatus: 'approved',
        requiredApprovals: [],
      },
    }));
  };

  const handleTrackReassignment = (trainId: string, newTrackId: string) => {
    console.log(`Reassigning train ${trainId} to track ${newTrackId}`);
    // In a real app, this would call the reassignment API
    setResult(prev => ({
      ...prev,
      yardMap: {
        ...prev.yardMap,
        tracks: prev.yardMap.tracks.map(track => ({
          ...track,
          status: track.id === newTrackId ? 'occupied' : track.status,
          assignedTrain: track.id === newTrackId ? trainId : track.assignedTrain,
        })),
        trains: prev.yardMap.trains.map(train => 
          train.id === trainId 
            ? { ...train, trackId: newTrackId }
            : train
        ),
      },
    }));
  };

  const handleReoptimize = () => {
    console.log('Re-optimizing with new track assignments...');
    // In a real app, this would call the re-optimization API
  };

  return (
    <ResultsPageComponent
      result={result}
      onApprove={handleApprove}
      onTrackReassignment={handleTrackReassignment}
      onReoptimize={handleReoptimize}
    />
  );
};
