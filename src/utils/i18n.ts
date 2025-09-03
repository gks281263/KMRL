// Simple translation function for i18n-ready strings
// In a real application, this would integrate with a proper i18n library like react-i18next

type TranslationKey = 
  | 'login.title'
  | 'login.username'
  | 'login.password'
  | 'login.rememberMe'
  | 'login.signIn'
  | 'login.forgotPassword'
  | 'login.needHelp'
  | 'login.contactEmail'
  | 'login.roleSelection'
  | 'login.autoDetectRole'
  | 'login.mfa.title'
  | 'login.mfa.description'
  | 'login.mfa.placeholder'
  | 'login.mfa.resend'
  | 'login.mfa.countdown'
  | 'login.errors.invalidCredentials'
  | 'login.errors.rateLimit'
  | 'login.errors.serviceUnavailable'
  | 'login.errors.otpInvalid'
  | 'login.errors.otpExpired'
  | 'roles.supervisor'
  | 'roles.maintenanceStaff'
  | 'roles.brandingManager'
  | 'roles.depotOps'
  | 'roles.admin'
  | 'optimize.title'
  | 'optimize.subtitle'
  | 'optimize.weights.title'
  | 'optimize.weights.branding'
  | 'optimize.weights.mileage'
  | 'optimize.weights.shunting'
  | 'optimize.weights.risk'
  | 'optimize.options.title'
  | 'optimize.options.hardRules'
  | 'optimize.options.softRelaxations'
  | 'optimize.options.maxRuntime'
  | 'optimize.options.gapThreshold'
  | 'optimize.solver.title'
  | 'optimize.solver.run'
  | 'optimize.solver.cancel'
  | 'optimize.solver.progress'
  | 'optimize.solver.metrics'
  | 'optimize.presets.title'
  | 'optimize.presets.default'
  | 'optimize.presets.brandingFirst'
  | 'optimize.presets.reliabilityFirst'
  | 'optimize.presets.energyMinimization'
  | 'optimize.tooltips.branding'
  | 'optimize.tooltips.mileage'
  | 'optimize.tooltips.shunting'
  | 'optimize.tooltips.risk'
  | 'optimize.preview.branding'
  | 'optimize.preview.mileage'
  | 'optimize.preview.shunting'
  | 'optimize.preview.risk'
  | 'results.title'
  | 'results.subtitle'
  | 'results.summary.service'
  | 'results.summary.standby'
  | 'results.summary.maintenance'
  | 'results.summary.feasibility'
  | 'results.tabs.service'
  | 'results.tabs.standby'
  | 'results.tabs.maintenance'
  | 'results.tabs.yardMap'
  | 'results.table.trainId'
  | 'results.table.startTime'
  | 'results.table.routeId'
  | 'results.table.rationale'
  | 'results.table.action'
  | 'results.table.priorityRank'
  | 'results.table.triggerCondition'
  | 'results.table.bay'
  | 'results.table.plannedWork'
  | 'results.table.eta'
  | 'results.table.forceExclude'
  | 'results.table.viewExplainability'
  | 'results.table.markException'
  | 'results.table.sendNote'
  | 'results.export.title'
  | 'results.export.pdf'
  | 'results.export.excel'
  | 'results.export.notify'
  | 'results.export.notifyDepotOps'
  | 'results.export.notifySignalling'
  | 'results.approve.title'
  | 'results.approve.confirm'
  | 'results.approve.pending'
  | 'results.approve.finalize'
  | 'results.yardMap.tooltip.title'
  | 'results.yardMap.tooltip.assignedTask'
  | 'results.yardMap.tooltip.shuntingPath'
  | 'results.yardMap.dragDrop'
  | 'results.yardMap.reoptimize'
  | 'results.explainability.title'
  | 'results.explainability.contributingFactors'
  | 'results.explainability.evidence'
  | 'results.explainability.close'
  | 'review.title'
  | 'review.subtitle'
  | 'review.planSummary.title'
  | 'review.planSummary.punctuality'
  | 'review.planSummary.energy'
  | 'review.planSummary.brandingHours'
  | 'review.trains.title'
  | 'review.trains.explainability'
  | 'review.trains.viewDetails'
  | 'review.whatIf.title'
  | 'review.whatIf.forceInclude'
  | 'review.whatIf.forceExclude'
  | 'review.whatIf.weightMods'
  | 'review.whatIf.branding'
  | 'review.whatIf.mileage'
  | 'review.whatIf.shunting'
  | 'review.whatIf.risk'
  | 'review.whatIf.preview'
  | 'review.whatIf.previewRunning'
  | 'review.whatIf.kpiDelta'
  | 'review.whatIf.improved'
  | 'review.whatIf.worsened'
  | 'review.whatIf.unchanged'
  | 'review.actions.approve'
  | 'review.actions.modifyRerun'
  | 'review.actions.confirmApproval'
  | 'review.actions.approvalReason'
  | 'review.actions.digitalSignature'
  | 'review.actions.password'
  | 'review.actions.consequences'
  | 'review.actions.notifications'
  | 'review.actions.lockRecords'
  | 'review.actions.cancel'
  | 'review.actions.confirm'
  | 'review.lastUpdated'
  | 'review.planSummary.totalTrains'
  | 'review.planSummary.estimatedSavings'
  | 'review.trains.trainId'
  | 'review.trains.type'
  | 'review.trains.viewExplainability'
  | 'review.actions.approvePlan'
  | 'review.xai.title'
  | 'review.xai.factorWeights'
  | 'review.xai.constraintViolations'
  | 'review.xai.alternativeRanks'
  | 'review.xai.close'
  | 'ops.monitor.title'
  | 'ops.monitor.subtitle'
  | 'ops.monitor.connected'
  | 'ops.monitor.disconnected'
  | 'ops.monitor.refresh'
  | 'ops.monitor.lastUpdated'
  | 'ops.monitor.departures'
  | 'ops.monitor.services'
  | 'ops.monitor.incidents'
  | 'ops.monitor.noIncidents'
  | 'ops.monitor.standbyDeployment'
  | 'ops.monitor.availableStandby'
  | 'ops.monitor.deployedStandby'
  | 'ops.departures.train'
  | 'ops.departures.planned'
  | 'ops.departures.actual'
  | 'ops.departures.variance'
  | 'ops.departures.status'
  | 'ops.departures.actions'
  | 'ops.departures.markBoarded'
  | 'ops.departures.reportFault'
  | 'ops.departures.status.scheduled'
  | 'ops.departures.status.boarding'
  | 'ops.departures.status.departed'
  | 'ops.departures.status.delayed'
  | 'ops.departures.status.cancelled'
  | 'ops.departures.status.fault'
  | 'ops.incident.title'
  | 'ops.incident.quickTemplates'
  | 'ops.incident.trainId'
  | 'ops.incident.serviceId'
  | 'ops.incident.type'
  | 'ops.incident.types.mechanical'
  | 'ops.incident.types.electrical'
  | 'ops.incident.types.operational'
  | 'ops.incident.types.safety'
  | 'ops.incident.types.other'
  | 'ops.incident.severity'
  | 'ops.incident.severity.low'
  | 'ops.incident.severity.medium'
  | 'ops.incident.severity.high'
  | 'ops.incident.severity.critical'
  | 'ops.incident.faultCode'
  | 'ops.incident.description'
  | 'ops.incident.descriptionPlaceholder'
  | 'ops.incident.report'
  | 'ops.snapshot.totalServices'
  | 'ops.snapshot.onTime'
  | 'ops.snapshot.delayed'
  | 'ops.snapshot.cancelled'
  | 'ops.snapshot.incidents'
  | 'ops.snapshot.availableStandby'
  | 'ops.snapshot.deployedStandby'
  | 'ops.snapshot.systemStatus'
  | 'ops.standby.capacity'
  | 'ops.standby.deployed'
  | 'common.cancel'
  | 'common.dismiss'
  | 'common.loading'
  | 'analytics.title'
  | 'analytics.subtitle'
  | 'analytics.kpis.punctuality'
  | 'analytics.kpis.mileageVariance'
  | 'analytics.kpis.brandingCompliance'
  | 'analytics.kpis.cleaningCompliance'
  | 'analytics.kpis.shuntingEnergy'
  | 'analytics.charts.mileageVariance'
  | 'analytics.charts.brandingCompliance'
  | 'analytics.charts.shuntingHeatmap'
  | 'analytics.ml.datasets'
  | 'analytics.ml.export'
  | 'analytics.ml.retrain'
  | 'analytics.ml.status.ready'
  | 'analytics.ml.status.missingFields'
  | 'analytics.ml.status.stale'
  | 'analytics.ml.exportFormat.csv'
  | 'analytics.ml.exportFormat.json'
  | 'analytics.ml.exportFormat.parquet'
  | 'analytics.dateRange.select'
  | 'analytics.dateRange.compareToPrevious'
  | 'analytics.actions.refresh'
  | 'analytics.actions.export'
  | 'analytics.actions.retrain'
  | 'analytics.noData'
  | 'analytics.loading'
  | 'nav.dashboard'
  | 'nav.dataIngestion'
  | 'nav.unifiedDataModel'
  | 'nav.validation'
  | 'nav.optimization'
  | 'nav.results'
  | 'nav.review'
  | 'nav.opsMonitor'
  | 'nav.analytics'
  | 'nav.maintenance'
  | 'nav.branding'
  | 'nav.execution'
  | 'nav.admin'
  | 'nav.logout';

const translations: Record<TranslationKey, string> = {
  'login.title': 'KMRL Train Induction — Secure Access',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.rememberMe': 'Remember me',
  'login.signIn': 'Sign In',
  'login.forgotPassword': 'Forgot password?',
  'login.needHelp': 'Need help? Contact:',
  'login.contactEmail': 'ops@kmrl.gov.in',
  'login.roleSelection': 'Role Selection',
  'login.autoDetectRole': 'Auto-detect role',
  'login.mfa.title': 'Two-Factor Authentication',
  'login.mfa.description': 'Enter the 6-digit code sent to your device',
  'login.mfa.placeholder': 'Enter 6-digit code',
  'login.mfa.resend': 'Resend OTP',
  'login.mfa.countdown': 'Resend available in {seconds}s',
  'login.errors.invalidCredentials': 'Invalid username or password',
  'login.errors.rateLimit': 'Too many attempts. Please try again in {seconds} seconds',
  'login.errors.serviceUnavailable': 'Authentication service is temporarily unavailable',
  'login.errors.otpInvalid': 'Invalid OTP code',
  'login.errors.otpExpired': 'OTP code has expired',
  'roles.supervisor': 'Supervisor',
  'roles.maintenanceStaff': 'Maintenance Staff',
  'roles.brandingManager': 'Branding Manager',
  'roles.depotOps': 'Depot Ops',
  'roles.admin': 'Admin',
  'optimize.title': 'Train Optimization Setup',
  'optimize.subtitle': 'Configure multi-objective weights and solver parameters for train scheduling optimization',
  'optimize.weights.title': 'Objective Weights',
  'optimize.weights.branding': 'Branding Priority',
  'optimize.weights.mileage': 'Mileage Balancing',
  'optimize.weights.shunting': 'Shunting Minimization',
  'optimize.weights.risk': 'Risk Mitigation',
  'optimize.options.title': 'Solver Options',
  'optimize.options.hardRules': 'Enforce hard rules always (locked)',
  'optimize.options.softRelaxations': 'Allow soft relaxations',
  'optimize.options.maxRuntime': 'Max runtime (mins)',
  'optimize.options.gapThreshold': 'Solution gap threshold (%)',
  'optimize.solver.title': 'Solver Control',
  'optimize.solver.run': 'Run optimization',
  'optimize.solver.cancel': 'Cancel',
  'optimize.solver.progress': 'Progress',
  'optimize.solver.metrics': 'Live Metrics',
  'optimize.presets.title': 'Preset Configurations',
  'optimize.presets.default': 'Default (Ops)',
  'optimize.presets.brandingFirst': 'Branding-first',
  'optimize.presets.reliabilityFirst': 'Reliability-first',
  'optimize.presets.energyMinimization': 'Energy-minimization',
  'optimize.tooltips.branding': 'Prioritizes trains with advertising contracts near expiry',
  'optimize.tooltips.mileage': 'Balances train usage across the fleet',
  'optimize.tooltips.shunting': 'Minimizes unnecessary train movements in depots',
  'optimize.tooltips.risk': 'Reduces operational risk and safety concerns',
  'optimize.preview.branding': 'What changes when increased: Favors trains with advertising contracts near expiry',
  'optimize.preview.mileage': 'What changes when increased: Better distribution of workload across all trains',
  'optimize.preview.shunting': 'What changes when increased: Reduces depot movements and fuel consumption',
  'optimize.preview.risk': 'What changes when increased: Prioritizes safety and compliance requirements',
  'results.title': 'Optimization Results',
  'results.subtitle': 'Detailed view of the optimized train schedule',
  'results.summary.service': 'Service Trains',
  'results.summary.standby': 'Standby Trains',
  'results.summary.maintenance': 'Maintenance Trains',
  'results.summary.feasibility': 'Feasibility Check',
  'results.tabs.service': 'Service',
  'results.tabs.standby': 'Standby',
  'results.tabs.maintenance': 'Maintenance',
  'results.tabs.yardMap': 'Yard Map',
  'results.table.trainId': 'Train ID',
  'results.table.startTime': 'Start Time',
  'results.table.routeId': 'Route ID',
  'results.table.rationale': 'Rationale',
  'results.table.action': 'Action',
  'results.table.priorityRank': 'Priority Rank',
  'results.table.triggerCondition': 'Trigger Condition',
  'results.table.bay': 'Bay',
  'results.table.plannedWork': 'Planned Work',
  'results.table.eta': 'ETA',
  'results.table.forceExclude': 'Force Exclude',
  'results.table.viewExplainability': 'View Explainability',
  'results.table.markException': 'Mark Exception',
  'results.table.sendNote': 'Send Note',
  'results.export.title': 'Export Results',
  'results.export.pdf': 'Export PDF',
  'results.export.excel': 'Export Excel',
  'results.export.notify': 'Notify All',
  'results.export.notifyDepotOps': 'Notify Depot Ops',
  'results.export.notifySignalling': 'Notify Signalling',
  'results.approve.title': 'Approve Optimization',
  'results.approve.confirm': 'Confirm Approval',
  'results.approve.pending': 'Pending Approval',
  'results.approve.finalize': 'Finalize Optimization',
  'results.yardMap.tooltip.title': 'Yard Map',
  'results.yardMap.tooltip.assignedTask': 'Assigned Task',
  'results.yardMap.tooltip.shuntingPath': 'Shunting Path',
  'results.yardMap.dragDrop': 'Drag and Drop to Reorganize',
  'results.yardMap.reoptimize': 'Re-optimize',
  'results.explainability.title': 'Explainability',
  'results.explainability.contributingFactors': 'Contributing Factors',
  'results.explainability.evidence': 'Evidence',
  'results.explainability.close': 'Close',
  'review.title': 'Review Optimization',
  'review.subtitle': 'Analyze and refine the optimized train schedule',
  'review.planSummary.title': 'Plan Summary',
  'review.planSummary.punctuality': 'Punctuality',
  'review.planSummary.energy': 'Energy Efficiency',
  'review.planSummary.brandingHours': 'Branding Hours',
  'review.trains.title': 'Trains',
  'review.trains.explainability': 'Explainability',
  'review.trains.viewDetails': 'View Details',
  'review.whatIf.title': 'What If?',
  'review.whatIf.forceInclude': 'Force Include',
  'review.whatIf.forceExclude': 'Force Exclude',
  'review.whatIf.weightMods': 'Weight Modifications',
  'review.whatIf.branding': 'Branding',
  'review.whatIf.mileage': 'Mileage',
  'review.whatIf.shunting': 'Shunting',
  'review.whatIf.risk': 'Risk',
  'review.whatIf.preview': 'Preview',
  'review.whatIf.previewRunning': 'Preview Running',
  'review.whatIf.kpiDelta': 'KPI Delta',
  'review.whatIf.improved': 'Improved',
  'review.whatIf.worsened': 'Worsened',
  'review.whatIf.unchanged': 'Unchanged',
  'review.actions.approve': 'Approve',
  'review.actions.modifyRerun': 'Modify & Rerun',
  'review.actions.confirmApproval': 'Confirm Approval',
  'review.actions.approvalReason': 'Approval Reason',
  'review.actions.digitalSignature': 'Digital Signature',
  'review.actions.password': 'Password',
  'review.actions.consequences': 'Consequences',
  'review.actions.notifications': 'Notifications',
  'review.actions.lockRecords': 'Lock Records',
  'review.actions.cancel': 'Cancel',
  'review.actions.confirm': 'Confirm',
  'review.lastUpdated': 'Last Updated',
  'review.planSummary.totalTrains': 'Total Trains',
  'review.planSummary.estimatedSavings': 'Estimated Savings',
  'review.trains.trainId': 'Train ID',
  'review.trains.type': 'Type',
  'review.trains.viewExplainability': 'View Explainability',
  'review.actions.approvePlan': 'Approve Plan',
  'review.xai.title': 'XAI Analysis',
  'review.xai.factorWeights': 'Factor Weights',
  'review.xai.constraintViolations': 'Constraint Violations',
  'review.xai.alternativeRanks': 'Alternative Ranks',
  'review.xai.close': 'Close',
  'ops.monitor.title': 'Operations Monitor',
  'ops.monitor.subtitle': 'Live monitoring for morning operations',
  'ops.monitor.connected': 'Connected',
  'ops.monitor.disconnected': 'Disconnected',
  'ops.monitor.refresh': 'Refresh',
  'ops.monitor.lastUpdated': 'Last Updated',
  'ops.monitor.departures': 'Service Departures',
  'ops.monitor.services': 'services',
  'ops.monitor.incidents': 'Incident Log',
  'ops.monitor.noIncidents': 'No incidents reported',
  'ops.monitor.standbyDeployment': 'Standby Deployment',
  'ops.monitor.availableStandby': 'Available Standby',
  'ops.monitor.deployedStandby': 'Deployed Standby',
  'ops.departures.train': 'Train',
  'ops.departures.planned': 'Planned',
  'ops.departures.actual': 'Actual',
  'ops.departures.variance': 'Variance',
  'ops.departures.status': 'Status',
  'ops.departures.actions': 'Actions',
  'ops.departures.markBoarded': 'Mark Boarded',
  'ops.departures.reportFault': 'Report Fault',
  'ops.departures.status.scheduled': 'Scheduled',
  'ops.departures.status.boarding': 'Boarding',
  'ops.departures.status.departed': 'Departed',
  'ops.departures.status.delayed': 'Delayed',
  'ops.departures.status.cancelled': 'Cancelled',
  'ops.departures.status.fault': 'Fault',
  'ops.incident.title': 'Report Incident',
  'ops.incident.quickTemplates': 'Quick Templates',
  'ops.incident.trainId': 'Train ID',
  'ops.incident.serviceId': 'Service ID',
  'ops.incident.type': 'Type',
  'ops.incident.types.mechanical': 'Mechanical',
  'ops.incident.types.electrical': 'Electrical',
  'ops.incident.types.operational': 'Operational',
  'ops.incident.types.safety': 'Safety',
  'ops.incident.types.other': 'Other',
  'ops.incident.severity': 'Severity',
  'ops.incident.severity.low': 'Low',
  'ops.incident.severity.medium': 'Medium',
  'ops.incident.severity.high': 'High',
  'ops.incident.severity.critical': 'Critical',
  'ops.incident.faultCode': 'Fault Code',
  'ops.incident.description': 'Description',
  'ops.incident.descriptionPlaceholder': 'Describe the incident in detail...',
  'ops.incident.report': 'Report Incident',
  'ops.snapshot.totalServices': 'Total Services',
  'ops.snapshot.onTime': 'On Time',
  'ops.snapshot.delayed': 'Delayed',
  'ops.snapshot.cancelled': 'Cancelled',
  'ops.snapshot.incidents': 'Active Incidents',
  'ops.snapshot.availableStandby': 'Available',
  'ops.snapshot.deployedStandby': 'Deployed',
  'ops.snapshot.systemStatus': 'System Status',
  'ops.standby.capacity': 'capacity',
  'ops.standby.deployed': 'Deployed',
  'common.cancel': 'Cancel',
  'common.dismiss': 'Dismiss',
  'common.loading': 'Loading...',
  'analytics.title': 'Analytics Dashboard',
  'analytics.subtitle': 'KPI visualization and ML data preparation',
  'analytics.kpis.punctuality': 'Punctuality',
  'analytics.kpis.mileageVariance': 'Mileage Variance',
  'analytics.kpis.brandingCompliance': 'Branding Compliance',
  'analytics.kpis.cleaningCompliance': 'Cleaning Compliance',
  'analytics.kpis.shuntingEnergy': 'Shunting Energy',
  'analytics.charts.mileageVariance': 'Mileage Variance Over Time',
  'analytics.charts.brandingCompliance': 'Branding Compliance by Train Type',
  'analytics.charts.shuntingHeatmap': 'Yard Shunting Time by Track & Hour',
  'analytics.ml.datasets': 'ML Datasets',
  'analytics.ml.export': 'Export ML Dataset',
  'analytics.ml.retrain': 'Trigger Retrain',
  'analytics.ml.status.ready': 'Ready',
  'analytics.ml.status.missingFields': 'Missing Fields',
  'analytics.ml.status.stale': 'Stale',
  'analytics.ml.exportFormat.csv': 'CSV',
  'analytics.ml.exportFormat.json': 'JSON',
  'analytics.ml.exportFormat.parquet': 'Parquet',
  'analytics.dateRange.select': 'Select Date Range',
  'analytics.dateRange.compareToPrevious': 'Compare to Previous Period',
  'analytics.actions.refresh': 'Refresh',
  'analytics.actions.export': 'Export',
  'analytics.actions.retrain': 'Retrain',
  'analytics.noData': 'No data available',
  'analytics.loading': 'Loading...',
  'nav.dashboard': 'Dashboard',
  'nav.dataIngestion': 'Data Ingestion',
  'nav.unifiedDataModel': 'Unified Data Model',
  'nav.validation': 'Validation',
  'nav.optimization': 'Optimization Setup',
  'nav.results': 'Results',
  'nav.review': 'Review & What-if',
  'nav.opsMonitor': 'Operations Monitor',
  'nav.analytics': 'Analytics',
  'nav.maintenance': 'Maintenance Tracker',
  'nav.branding': 'Branding Dashboard',
  'nav.execution': 'Execution Tracking',
  'nav.admin': 'Admin & Config',
  'nav.logout': 'Logout',
};

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  let translation = translations[key] || key;
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, String(value));
    });
  }
  
  return translation;
}
