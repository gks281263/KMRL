import { useState } from 'react';
import { ValidationRule } from '@/types/validation';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface ValidationRulesListProps {
  rules: ValidationRule[];
  className?: string;
}

const getRuleIcon = (category: string) => {
  switch (category) {
    case 'certificate': return '📋';
    case 'maintenance': return '🔧';
    case 'cleaning': return '🧹';
    case 'yard': return '🚉';
    case 'service': return '🚆';
    default: return '📋';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'danger';
    case 'warning': return 'warning';
    case 'info': return 'primary';
    default: return 'neutral';
  }
};

const getDepartmentColor = (department?: string) => {
  switch (department) {
    case 'RS': return 'primary';
    case 'Signalling': return 'warning';
    case 'Telecom': return 'success';
    case 'all': return 'neutral';
    default: return 'neutral';
  }
};

export const ValidationRulesList = ({ rules, className }: ValidationRulesListProps) => {
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  const toggleRule = (ruleId: string) => {
    setExpandedRules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  };

  return (
    <Card className={cn('p-4', className)}>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Validation Rules</h3>
      
      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="border border-neutral-200 rounded-lg">
            <button
              onClick={() => toggleRule(rule.id)}
              className="w-full p-3 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getRuleIcon(rule.category)}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-neutral-900">{rule.name}</h4>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      `bg-${getSeverityColor(rule.severity)}-100 text-${getSeverityColor(rule.severity)}-700`
                    )}>
                      {rule.severity}
                    </span>
                    {rule.department && rule.department !== 'all' && (
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        `bg-${getDepartmentColor(rule.department)}-100 text-${getDepartmentColor(rule.department)}-700`
                      )}>
                        {rule.department}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{rule.description}</p>
                </div>
              </div>
              <span className="text-neutral-400">
                {expandedRules.has(rule.id) ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedRules.has(rule.id) && (
              <div className="px-3 pb-3 border-t border-neutral-200 bg-neutral-50">
                <div className="pt-3 space-y-2">
                  <div>
                    <h5 className="text-sm font-medium text-neutral-900 mb-1">Rule Details</h5>
                    <p className="text-sm text-neutral-600">{rule.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-neutral-700">Category:</span>
                      <span className="ml-2 text-neutral-600 capitalize">{rule.category}</span>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Severity:</span>
                      <span className="ml-2 text-neutral-600 capitalize">{rule.severity}</span>
                    </div>
                    {rule.department && (
                      <div>
                        <span className="font-medium text-neutral-700">Department:</span>
                        <span className="ml-2 text-neutral-600">{rule.department}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <h6 className="text-sm font-medium text-neutral-900 mb-1">Validation Logic</h6>
                    <div className="text-sm text-neutral-600 space-y-1">
                      {rule.id === 'certificate_validity' && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Check certificate expiry date for all departments</li>
                          <li>Fail if any certificate is expired or missing</li>
                          <li>Allow override with supervisor approval</li>
                        </ul>
                      )}
                      {rule.id === 'critical_jobcards_closed' && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Query Maximo for open critical jobs</li>
                          <li>Fail if any critical jobs are open</li>
                          <li>Require job closure before eligibility</li>
                        </ul>
                      )}
                      {rule.id === 'cleaning_schedule' && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Check if cleaning is overdue</li>
                          <li>Verify cleaning slot availability</li>
                          <li>Block if overdue and no slots available</li>
                        </ul>
                      )}
                      {rule.id === 'yard_capacity' && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Calculate current yard occupancy</li>
                          <li>Check against maximum capacity limits</li>
                          <li>Block if capacity exceeded</li>
                        </ul>
                      )}
                      {rule.id === 'minimum_service_targets' && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Ensure minimum service trains available</li>
                          <li>Maintain standby targets</li>
                          <li>Block if targets not met</li>
                        </ul>
                      )}
                      {rule.id === 'stabling_geometry' && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Check track geometry constraints</li>
                          <li>Verify stabling position feasibility</li>
                          <li>Block if geometry conflicts exist</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
