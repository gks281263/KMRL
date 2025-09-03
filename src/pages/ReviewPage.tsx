import React from 'react';
import { ReviewPage as ReviewPageComponent } from '@/components/optimization/ReviewPage';
import { PlanSummary, XAIAnalysis, WhatIfScenario, PreviewResult } from '@/types/optimization';

// Sample data for demonstration
const samplePlanSummary: PlanSummary = {
  punctuality: 94.2,
  energy: 87.5,
  brandingHours: 156.8,
  totalTrains: 42,
  estimatedSavings: 125000,
};

const sampleTrains = [
  {
    id: 'T101',
    type: 'service' as const,
    status: 'approved',
    explainability: {
      trainId: 'T101',
      factorWeights: [
        { factor: 'branding', weight: 0.35, impact: 'positive', evidence: 'High-visibility route, peak hours' },
        { factor: 'mileage', weight: 0.28, impact: 'neutral', evidence: 'Balanced with fleet average' },
        { factor: 'shunting', weight: 0.22, impact: 'neutral', evidence: 'Minimal yard movements required' },
      ],
      constraintViolations: [],
      alternativeRanks: [
        { scenario: 'branding_priority', rank: 1, score: 0.92, factors: ['branding', 'route_visibility'] },
        { scenario: 'mileage_balance', rank: 3, score: 0.87, factors: ['mileage', 'fleet_balance'] },
      ],
      recommendations: ['Maintain current assignment', 'Consider peak hour branding opportunities'],
    } as XAIAnalysis,
  },
  {
    id: 'T102',
    type: 'standby' as const,
    status: 'pending',
    explainability: {
      trainId: 'T102',
      factorWeights: [
        { factor: 'risk', weight: 0.45, impact: 'negative', evidence: 'Maintenance due in 48h' },
        { factor: 'mileage', weight: 0.30, impact: 'neutral', evidence: 'Below optimal utilization' },
        { factor: 'shunting', weight: 0.25, impact: 'neutral', evidence: 'Available for quick deployment' },
      ],
      constraintViolations: [
        { constraint: 'maintenance_schedule', severity: 'medium', impact: 'Required maintenance within 48 hours' },
      ],
      alternativeRanks: [
        { scenario: 'risk_mitigation', rank: 2, score: 0.78, factors: ['maintenance_schedule', 'safety'] },
        { scenario: 'emergency_response', rank: 1, score: 0.85, factors: ['availability', 'location'] },
      ],
      recommendations: ['Schedule maintenance within 24h', 'Keep on standby for emergency response'],
    } as XAIAnalysis,
  },
  {
    id: 'T103',
    type: 'maintenance' as const,
    status: 'under_review',
    explainability: {
      trainId: 'T103',
      factorWeights: [
        { factor: 'risk', weight: 0.60, impact: 'negative', evidence: 'Safety inspection overdue' },
        { factor: 'shunting', weight: 0.25, impact: 'neutral', evidence: 'Requires specialized bay access' },
        { factor: 'branding', weight: 0.15, impact: 'neutral', evidence: 'Low-visibility maintenance period' },
      ],
      constraintViolations: [
        { constraint: 'safety_inspection', severity: 'high', impact: 'Safety inspection overdue by 72h' },
        { constraint: 'bay_availability', severity: 'medium', impact: 'Specialized bay required' },
      ],
      alternativeRanks: [
        { scenario: 'safety_first', rank: 1, score: 0.95, factors: ['safety_inspection', 'regulatory_compliance'] },
        { scenario: 'efficiency_optimization', rank: 5, score: 0.65, factors: ['bay_availability', 'maintenance_efficiency'] },
      ],
      recommendations: ['Immediate safety inspection required', 'Prioritize specialized bay allocation'],
    } as XAIAnalysis,
  },
  {
    id: 'T104',
    type: 'service' as const,
    status: 'approved',
    explainability: {
      trainId: 'T104',
      factorWeights: [
        { factor: 'mileage', weight: 0.40, impact: 'positive', evidence: 'Optimal route for mileage balance' },
        { factor: 'branding', weight: 0.30, impact: 'neutral', evidence: 'Standard service route' },
        { factor: 'shunting', weight: 0.20, impact: 'neutral', evidence: 'Efficient yard positioning' },
        { factor: 'risk', weight: 0.10, impact: 'neutral', evidence: 'Recent maintenance completed' },
      ],
      constraintViolations: [],
      alternativeRanks: [
        { scenario: 'mileage_optimization', rank: 1, score: 0.89, factors: ['route_efficiency', 'fleet_balance'] },
        { scenario: 'branding_focus', rank: 4, score: 0.76, factors: ['route_visibility', 'passenger_volume'] },
      ],
      recommendations: ['Excellent mileage optimization', 'Consider branding opportunities on return leg'],
    } as XAIAnalysis,
  },
  {
    id: 'T105',
    type: 'standby' as const,
    status: 'approved',
    explainability: {
      trainId: 'T105',
      factorWeights: [
        { factor: 'shunting', weight: 0.35, impact: 'neutral', evidence: 'Strategic standby position' },
        { factor: 'risk', weight: 0.30, impact: 'neutral', evidence: 'Good maintenance status' },
        { factor: 'mileage', weight: 0.20, impact: 'neutral', evidence: 'Available for route coverage' },
        { factor: 'branding', weight: 0.15, impact: 'neutral', evidence: 'Can be deployed for branding if needed' },
      ],
      constraintViolations: [],
      alternativeRanks: [
        { scenario: 'emergency_response', rank: 2, score: 0.82, factors: ['location', 'availability'] },
        { scenario: 'route_coverage', rank: 3, score: 0.78, factors: ['mileage', 'maintenance_status'] },
      ],
      recommendations: ['Maintain strategic standby position', 'Ready for emergency deployment'],
    } as XAIAnalysis,
  },
];

const ReviewPage: React.FC = () => {
  const handlePreview = async (scenario: WhatIfScenario): Promise<PreviewResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response based on scenario
    const baseDelta = {
      punctuality: 0,
      energy: 0,
      brandingHours: 0,
    };
    
    // Simulate impact of force includes/excludes
    if (scenario.forceInclude.length > 0) {
      baseDelta.punctuality += 2.1;
      baseDelta.energy -= 1.5;
      baseDelta.brandingHours += 8.2;
    }
    
    if (scenario.forceExclude.length > 0) {
      baseDelta.punctuality -= 1.8;
      baseDelta.energy += 2.1;
      baseDelta.brandingHours -= 6.5;
    }
    
    // Simulate weight modifications
    Object.entries(scenario.weightMods).forEach(([factor, mod]) => {
      if (factor === 'branding' && mod > 0) {
        baseDelta.brandingHours += mod * 0.5;
        baseDelta.punctuality -= mod * 0.1;
      }
      if (factor === 'mileage' && mod > 0) {
        baseDelta.energy += mod * 0.3;
        baseDelta.punctuality += mod * 0.2;
      }
    });
    
    return {
      kpiDelta: {
        ...baseDelta,
        impact: baseDelta.punctuality > 0 ? 'improved' : baseDelta.punctuality < 0 ? 'worsened' : 'unchanged',
      },
      topAssignments: [
        { trainId: 'T101', previousRank: 1, newRank: 1, reason: 'No change in ranking' },
        { trainId: 'T104', previousRank: 2, newRank: 2, reason: 'Maintained position' },
        { trainId: 'T102', previousRank: 3, newRank: 4, reason: 'Maintenance requirements' },
        { trainId: 'T105', previousRank: 4, newRank: 3, reason: 'Improved availability' },
        { trainId: 'T103', previousRank: 5, newRank: 5, reason: 'Safety constraints' },
      ],
      estimatedRuntime: 25,
      confidence: 0.88,
    };
  };

  const handleApprove = (approval: { reason: string; signature?: string }) => {
    console.log('Plan approved:', approval);
    // In real app, this would call the API
    alert(`Plan approved with reason: ${approval.reason}`);
  };

  const handleModifyRerun = () => {
    console.log('Modify and re-run requested');
    // In real app, this would navigate to optimization setup
    alert('Redirecting to optimization setup...');
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <ReviewPageComponent
        planSummary={samplePlanSummary}
        trains={sampleTrains}
        onPreview={handlePreview}
        onApprove={handleApprove}
        onModifyRerun={handleModifyRerun}
      />
    </div>
  );
};

export default ReviewPage;
