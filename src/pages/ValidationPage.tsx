import { useState, useEffect } from 'react';
import { 
  ValidationRule, 
  TrainValidationResult, 
  ValidationRunResponse, 
  OverrideRequest,
  RemediationChecklist,
  EscalationRequest 
} from '@/types/validation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ValidationRulesList } from '@/components/validation/ValidationRulesList';
import { OverrideModal } from '@/components/validation/OverrideModal';
import { cn } from '@/utils/cn';

// Mock validation rules
const validationRules: ValidationRule[] = [
  {
    id: 'certificate_validity',
    name: 'Certificate Validity Required',
    description: 'All trains must have valid certificates for RS, Signalling, and Telecom departments',
    category: 'certificate',
    severity: 'critical',
    department: 'all',
  },
  {
    id: 'critical_jobcards_closed',
    name: 'Critical Jobcards Must Be Closed',
    description: 'All critical maintenance jobs must be completed before train eligibility',
    category: 'maintenance',
    severity: 'critical',
  },
  {
    id: 'cleaning_schedule',
    name: 'Cleaning Schedule Compliance',
    description: 'Trains must be cleaned according to schedule or have available cleaning slots',
    category: 'cleaning',
    severity: 'warning',
  },
  {
    id: 'yard_capacity',
    name: 'Yard Capacity Limits',
    description: 'Yard capacity must not exceed maximum limits for safe operations',
    category: 'yard',
    severity: 'warning',
  },
  {
    id: 'minimum_service_targets',
    name: 'Minimum Service Targets',
    description: 'Minimum number of service trains and standby targets must be maintained',
    category: 'service',
    severity: 'info',
  },
  {
    id: 'stabling_geometry',
    name: 'Stabling Geometry Constraints',
    description: 'Train stabling positions must comply with track geometry requirements',
    category: 'yard',
    severity: 'info',
  },
];

// Mock validation results
const mockValidationResults: ValidationRunResponse = {
  invalid: [
    {
      trainId: 'T001',
      status: 'invalid',
      reasons: ['certificate_validity', 'critical_jobcards_closed'],
      evidence: {
        certificate: {
          status: 'expired',
          expiryDate: '2025-08-15',
          department: 'Telecom',
          certificateNumber: 'CERT-T001-TEL',
          issuingAuthority: 'Telecom Authority',
        },
        maximo: {
          criticalJobs: 2,
          openJobs: 3,
          jobDetails: [
            {
              id: 'JOB001',
              description: 'Brake system inspection',
              priority: 'critical',
              status: 'open',
              dueDate: '2025-09-01',
            },
            {
              id: 'JOB002',
              description: 'Electrical system check',
              priority: 'critical',
              status: 'open',
              dueDate: '2025-09-02',
            },
          ],
          lastSync: '2025-09-02T22:00:00Z',
        },
      },
      lastValidated: '2025-09-02T22:00:00Z',
      overrides: [],
    },
    {
      trainId: 'T003',
      status: 'invalid',
      reasons: ['certificate_validity'],
      evidence: {
        certificate: {
          status: 'missing',
          expiryDate: '',
          department: 'RS',
          certificateNumber: '',
          issuingAuthority: '',
        },
      },
      lastValidated: '2025-09-02T22:00:00Z',
      overrides: [],
    },
  ],
  blocked: [
    {
      trainId: 'T002',
      status: 'blocked',
      reasons: ['cleaning_schedule', 'yard_capacity'],
      evidence: {
        cleaning: {
          due: true,
          lastDeepClean: '2025-08-25',
          nextScheduled: '2025-09-03',
          availableSlots: [],
          bayAssignment: 'B2',
        },
        yard: {
          currentCapacity: 95,
          maxCapacity: 100,
          trackAvailability: [
            {
              track: 'T2',
              available: false,
              currentTrain: 'T002',
              capacity: 1,
              geometry: 'standard',
            },
          ],
          stablingGeometry: {
            track: 'T2',
            bay: 'B2',
            feasible: false,
            constraints: ['Track maintenance in progress'],
            alternativePositions: ['T3-B3', 'T4-B1'],
          },
          lastUpdate: '2025-09-02T21:45:00Z',
        },
      },
      lastValidated: '2025-09-02T21:45:00Z',
      overrides: [
        {
          id: 'OV001',
          trainId: 'T002',
          rule: 'cleaning_schedule',
          reason: 'Emergency service requirement',
          expiresAt: '2025-09-03T06:00:00Z',
          createdBy: 'supervisor',
          createdAt: '2025-09-02T20:00:00Z',
          status: 'active',
        },
      ],
    },
  ],
  eligible: ['T004', 'T005'],
  summary: {
    totalTrains: 5,
    invalidCount: 2,
    blockedCount: 1,
    eligibleCount: 2,
    lastRun: '2025-09-02T22:00:00Z',
    duration: 45,
  },
};

export const ValidationPage = () => {
  const [validationResults, setValidationResults] = useState<ValidationRunResponse>(mockValidationResults);
  const [isRunningValidation, setIsRunningValidation] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainValidationResult | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideTrain, setOverrideTrain] = useState<{ trainId: string; rule: ValidationRule } | null>(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [isApplyingOverride, setIsApplyingOverride] = useState(false);

  // Check if escalation is needed
  const needsEscalation = validationResults.summary.eligibleCount === 0;

  const runValidation = async () => {
    setIsRunningValidation(true);
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update results (in real app, this would come from API)
    setValidationResults(mockValidationResults);
    setIsRunningValidation(false);
  };

  const handleViewEvidence = (train: TrainValidationResult) => {
    setSelectedTrain(train);
    setShowEvidenceModal(true);
  };

  const handleOverride = (trainId: string, rule: ValidationRule) => {
    setOverrideTrain({ trainId, rule });
    setShowOverrideModal(true);
  };

  const applyOverride = async (override: OverrideRequest) => {
    setIsApplyingOverride(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the train's overrides
    setValidationResults(prev => ({
      ...prev,
      invalid: prev.invalid.map(train => 
        train.trainId === override.trainId 
          ? {
              ...train,
              overrides: [...train.overrides, {
                id: `OV${Date.now()}`,
                trainId: override.trainId,
                rule: override.rule,
                reason: override.reason,
                expiresAt: override.expiresAt,
                createdBy: 'supervisor',
                createdAt: new Date().toISOString(),
                status: 'active',
              }]
            }
          : train
      ),
      blocked: prev.blocked.map(train => 
        train.trainId === override.trainId 
          ? {
              ...train,
              overrides: [...train.overrides, {
                id: `OV${Date.now()}`,
                trainId: override.trainId,
                rule: override.rule,
                reason: override.reason,
                expiresAt: override.expiresAt,
                createdBy: 'supervisor',
                createdAt: new Date().toISOString(),
                status: 'active',
              }]
            }
          : train
      ),
    }));
    
    setIsApplyingOverride(false);
  };

  const getRuleIcon = (ruleId: string) => {
    switch (ruleId) {
      case 'certificate_validity': return '📋';
      case 'critical_jobcards_closed': return '🔧';
      case 'cleaning_schedule': return '🧹';
      case 'yard_capacity': return '🚉';
      case 'minimum_service_targets': return '🚆';
      case 'stabling_geometry': return '📐';
      default: return '⚠️';
    }
  };

  const getRuleColor = (ruleId: string) => {
    switch (ruleId) {
      case 'certificate_validity': return 'danger';
      case 'critical_jobcards_closed': return 'danger';
      case 'cleaning_schedule': return 'warning';
      case 'yard_capacity': return 'warning';
      case 'minimum_service_targets': return 'primary';
      case 'stabling_geometry': return 'primary';
      default: return 'neutral';
    }
  };

  const getRemediationChecklist = (train: TrainValidationResult): RemediationChecklist => {
    const recommendations: RemediationChecklist = {
      trainId: train.trainId,
      recommendations: [],
      priority: 'high',
      estimatedTime: '2-4 hours',
      requiredApprovals: [],
    };

    if (train.reasons.includes('certificate_validity')) {
      recommendations.recommendations.push({
        action: 'Renew Certificate',
        description: 'Contact Telecom Authority to renew expired certificate',
        responsible: 'Telecom Department',
        estimatedTime: '1-2 days',
        dependencies: [],
        status: 'pending',
      });
      recommendations.requiredApprovals.push('Telecom Authority');
    }

    if (train.reasons.includes('critical_jobcards_closed')) {
      recommendations.recommendations.push({
        action: 'Complete Critical Jobs',
        description: 'Complete brake system inspection and electrical system check',
        responsible: 'Maintenance Team',
        estimatedTime: '2-3 hours',
        dependencies: ['Parts availability'],
        status: 'pending',
      });
      recommendations.requiredApprovals.push('Maintenance Supervisor');
    }

    if (train.reasons.includes('cleaning_schedule')) {
      recommendations.recommendations.push({
        action: 'Schedule Cleaning',
        description: 'Book cleaning slot at next available bay',
        responsible: 'Cleaning Team',
        estimatedTime: '1 hour',
        dependencies: ['Bay availability'],
        status: 'pending',
      });
    }

    return recommendations;
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Validation Dashboard</h1>
            <p className="text-neutral-600 mt-1">Hard-rule validations with supervisor override capabilities</p>
          </div>
          <div className="flex items-center space-x-4">
            {needsEscalation && (
              <Button
                variant="danger"
                onClick={() => setShowEscalationModal(true)}
              >
                Escalate
              </Button>
            )}
            <Button
              variant="primary"
              onClick={runValidation}
              loading={isRunningValidation}
              disabled={isRunningValidation}
            >
              {isRunningValidation ? 'Running Validation...' : 'Run Validation'}
            </Button>
          </div>
        </div>

        {/* Validation Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-neutral-900">{validationResults.summary.totalTrains}</div>
            <div className="text-sm text-neutral-600">Total Trains</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-danger-600">{validationResults.summary.invalidCount}</div>
            <div className="text-sm text-neutral-600">Invalid</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-warning-600">{validationResults.summary.blockedCount}</div>
            <div className="text-sm text-neutral-600">Blocked</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success-600">{validationResults.summary.eligibleCount}</div>
            <div className="text-sm text-neutral-600">Eligible</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Rules List */}
          <div className="lg:col-span-1">
            <ValidationRulesList rules={validationRules} />
          </div>

          {/* Right Column - Train Panels */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Invalid Trains Panel */}
              <Card className="border-danger-200">
                <div className="bg-danger-50 border-b border-danger-200 p-4">
                  <h3 className="text-lg font-semibold text-danger-800">Invalid Trains</h3>
                  <p className="text-sm text-danger-600">{validationResults.invalid.length} trains</p>
                </div>
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {validationResults.invalid.map((train) => (
                    <div key={train.trainId} className="border border-danger-200 rounded-lg p-3 bg-danger-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-danger-900">Train {train.trainId}</h4>
                        <div className="flex space-x-1">
                          {train.reasons.map((reason) => (
                            <span key={reason} className="text-lg" title={reason}>
                              {getRuleIcon(reason)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {train.reasons.map((reason) => (
                            <span key={reason} className={cn(
                              'px-2 py-1 rounded text-xs font-medium',
                              `bg-${getRuleColor(reason)}-100 text-${getRuleColor(reason)}-700`
                            )}>
                              {reason.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewEvidence(train)}
                          >
                            View Evidence
                          </Button>
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleOverride(train.trainId, validationRules.find(r => r.id === train.reasons[0])!)}
                          >
                            Override
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {validationResults.invalid.length === 0 && (
                    <div className="text-center text-neutral-500 py-8">
                      No invalid trains
                    </div>
                  )}
                </div>
              </Card>

              {/* Blocked Trains Panel */}
              <Card className="border-warning-200">
                <div className="bg-warning-50 border-b border-warning-200 p-4">
                  <h3 className="text-lg font-semibold text-warning-800">Blocked Trains</h3>
                  <p className="text-sm text-warning-600">{validationResults.blocked.length} trains</p>
                </div>
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {validationResults.blocked.map((train) => (
                    <div key={train.trainId} className="border border-warning-200 rounded-lg p-3 bg-warning-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-warning-900">Train {train.trainId}</h4>
                        <div className="flex space-x-1">
                          {train.reasons.map((reason) => (
                            <span key={reason} className="text-lg" title={reason}>
                              {getRuleIcon(reason)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {train.reasons.map((reason) => (
                            <span key={reason} className={cn(
                              'px-2 py-1 rounded text-xs font-medium',
                              `bg-${getRuleColor(reason)}-100 text-${getRuleColor(reason)}-700`
                            )}>
                              {reason.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                        {train.overrides.length > 0 && (
                          <div className="text-xs text-warning-700">
                            {train.overrides.length} override(s) active
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewEvidence(train)}
                          >
                            View Evidence
                          </Button>
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleOverride(train.trainId, validationRules.find(r => r.id === train.reasons[0])!)}
                          >
                            Override
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {validationResults.blocked.length === 0 && (
                    <div className="text-center text-neutral-500 py-8">
                      No blocked trains
                    </div>
                  )}
                </div>
              </Card>

              {/* Eligible Trains Panel */}
              <Card className="border-success-200">
                <div className="bg-success-50 border-b border-success-200 p-4">
                  <h3 className="text-lg font-semibold text-success-800">Eligible Trains</h3>
                  <p className="text-sm text-success-600">{validationResults.eligible.length} trains</p>
                </div>
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {validationResults.eligible.map((trainId) => (
                    <div key={trainId} className="border border-success-200 rounded-lg p-3 bg-success-50">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-success-900">Train {trainId}</h4>
                        <span className="text-success-600">✓</span>
                      </div>
                      <div className="text-xs text-success-600 mt-1">
                        All validation rules passed
                      </div>
                    </div>
                  ))}
                  {validationResults.eligible.length === 0 && (
                    <div className="text-center text-neutral-500 py-8">
                      No eligible trains
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Modal */}
      <Modal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
        title={`Train ${selectedTrain?.trainId} Evidence`}
        size="lg"
      >
        {selectedTrain && (
          <div className="space-y-6">
            {/* Failed Rules */}
            <div>
              <h4 className="font-medium text-neutral-900 mb-3">Failed Rules</h4>
              <div className="space-y-2">
                {selectedTrain.reasons.map((reason) => {
                  const rule = validationRules.find(r => r.id === reason);
                  return (
                    <div key={reason} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                      <span className="text-lg">{getRuleIcon(reason)}</span>
                      <div>
                        <div className="font-medium text-neutral-900">{rule?.name}</div>
                        <div className="text-sm text-neutral-600">{rule?.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evidence Details */}
            <div>
              <h4 className="font-medium text-neutral-900 mb-3">Evidence</h4>
              <div className="space-y-4">
                {selectedTrain.evidence.certificate && (
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <h5 className="font-medium text-neutral-900 mb-2">Certificate</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-600">Status:</span>
                        <span className="ml-2 font-medium">{selectedTrain.evidence.certificate.status}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Department:</span>
                        <span className="ml-2 font-medium">{selectedTrain.evidence.certificate.department}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Expiry:</span>
                        <span className="ml-2 font-medium">{selectedTrain.evidence.certificate.expiryDate || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Number:</span>
                        <span className="ml-2 font-medium">{selectedTrain.evidence.certificate.certificateNumber || 'N/A'}</span>
                      </div>
                    </div>
                    {selectedTrain.evidence.certificate.fileUrl && (
                      <Button variant="secondary" size="sm" className="mt-2">
                        View Certificate
                      </Button>
                    )}
                  </div>
                )}

                {selectedTrain.evidence.maximo && (
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <h5 className="font-medium text-neutral-900 mb-2">Maximo Jobs</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-neutral-600">Critical Jobs:</span>
                        <span className="ml-2 font-medium">{selectedTrain.evidence.maximo.criticalJobs}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Open Jobs:</span>
                        <span className="ml-2 font-medium">{selectedTrain.evidence.maximo.openJobs}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {selectedTrain.evidence.maximo.jobDetails.map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div>
                            <div className="font-medium text-neutral-900">{job.description}</div>
                            <div className="text-sm text-neutral-600">Due: {job.dueDate}</div>
                          </div>
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            job.priority === 'critical' ? 'bg-danger-100 text-danger-700' : 'bg-warning-100 text-warning-700'
                          )}>
                            {job.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTrain.evidence.cleaning && (
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <h5 className="font-medium text-neutral-900 mb-2">Cleaning Schedule</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-600">Due:</span>
                        <span className="ml-2 font-medium">{selectedTrain.evidence.cleaning.due ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Last Clean:</span>
                        <span className="ml-2 font-medium">{selectedTrain.evidence.cleaning.lastDeepClean}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Next Scheduled:</span>
                        <span className="ml-2 font-medium">{selectedTrain.evidence.cleaning.nextScheduled}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Available Slots:</span>
                        <span className="ml-2 font-medium">{selectedTrain.evidence.cleaning.availableSlots.length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Remediation Checklist */}
            <div>
              <h4 className="font-medium text-neutral-900 mb-3">Recommended Actions</h4>
              <div className="space-y-2">
                {getRemediationChecklist(selectedTrain).recommendations.map((item, index) => (
                  <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                    <div className="font-medium text-neutral-900">{item.action}</div>
                    <div className="text-sm text-neutral-600 mt-1">{item.description}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Responsible: {item.responsible} • Est. Time: {item.estimatedTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Override Modal */}
      {overrideTrain && (
        <OverrideModal
          isOpen={showOverrideModal}
          onClose={() => {
            setShowOverrideModal(false);
            setOverrideTrain(null);
          }}
          trainId={overrideTrain.trainId}
          rule={overrideTrain.rule}
          onOverride={applyOverride}
          isLoading={isApplyingOverride}
        />
      )}

      {/* Escalation Modal */}
      <Modal
        isOpen={showEscalationModal}
        onClose={() => setShowEscalationModal(false)}
        title="Escalate to Duty Officer"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <h4 className="font-medium text-danger-800 mb-2">No Eligible Trains Available</h4>
            <p className="text-sm text-danger-700">
              All trains are currently invalid or blocked. This requires immediate attention from the duty officer.
            </p>
          </div>
          
          <div>
            <label htmlFor="escalation-message" className="block text-sm font-medium text-neutral-700 mb-2">
              Escalation Message
            </label>
            <textarea
              id="escalation-message"
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              defaultValue={`URGENT: No eligible trains available for service.

Summary:
- Invalid trains: ${validationResults.summary.invalidCount}
- Blocked trains: ${validationResults.summary.blockedCount}
- Eligible trains: ${validationResults.summary.eligibleCount}

Please review and provide guidance on immediate actions required.`}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowEscalationModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                // In real app, this would send the escalation
                console.log('Escalation sent');
                setShowEscalationModal(false);
              }}
            >
              Send Escalation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
