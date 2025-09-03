# Operations Monitoring System

A real-time monitoring dashboard for morning train operations, providing live updates on service departures, incident management, and standby train deployment.

## Features

### Live Monitoring
- **Real-time Updates**: WebSocket-based live updates for all operational data
- **Live Clock**: IST timezone clock with second precision
- **Connection Status**: Visual indicator for WebSocket connection health
- **Auto-reconnection**: Automatic reconnection with exponential backoff

### Service Departures
- **Planned vs Actual**: Compare planned departure times with actual times
- **Variance Calculation**: Automatic calculation of delays in minutes/hours
- **Status Tracking**: Real-time status updates (scheduled, boarding, departed, delayed, cancelled, fault)
- **Quick Actions**: Mark as boarded, report faults with one click

### Incident Management
- **Quick Templates**: Pre-defined fault templates for common issues
- **Severity Levels**: Low, medium, high, critical severity classification
- **Fault Codes**: Standardized fault code system (MECH-001, ELEC-002, etc.)
- **Real-time Logging**: Live incident log with timestamps

### Standby Deployment
- **Available Trains**: Real-time view of available standby trains
- **Deployment Tracking**: Track deployed standby trains and their replacements
- **Auto-deploy Policy**: Configurable automatic deployment rules
- **Capacity Management**: Track train capacity and maintenance schedules

### System Health
- **Operational Snapshot**: Real-time system health metrics
- **Performance Indicators**: On-time performance, delay statistics
- **Resource Utilization**: Standby train availability and usage
- **System Status**: Operational, degraded, critical status levels

## Architecture

### Frontend Components
```
src/
├── pages/
│   └── OpsMonitorPage.tsx          # Main monitoring dashboard
├── components/
│   └── operations/
│       └── IncidentModal.tsx      # Incident reporting modal
├── hooks/
│   └── useOperationsData.ts       # Data management hook
├── services/api/
│   ├── operations.ts              # REST API service
│   └── opsSocket.ts               # WebSocket service
└── types/
    └── operations.ts              # TypeScript definitions
```

### Data Flow
1. **Initial Load**: REST API calls to load current state
2. **Real-time Updates**: WebSocket connection for live updates
3. **User Actions**: REST API calls for state changes
4. **Broadcast**: WebSocket broadcasts updates to all connected clients

### WebSocket Message Types
- `departure_update`: Service departure status changes
- `incident_created`: New incident reported
- `incident_updated`: Incident status updates
- `standby_deployed`: Standby train deployment
- `system_status`: System health snapshot

## API Endpoints

### Service Departures
- `GET /api/ops/departures/` - Get all service departures
- `PATCH /api/ops/departures/{id}/status/` - Update departure status
- `POST /api/ops/departures/{id}/board/` - Mark as boarded

### Incidents
- `GET /api/ops/incidents/` - Get all incidents
- `POST /api/ops/incidents/` - Create new incident
- `PATCH /api/ops/incidents/{id}/` - Update incident
- `GET /api/ops/fault-templates/` - Get fault templates

### Standby Trains
- `GET /api/ops/standby/` - Get standby trains
- `POST /api/ops/standby/deploy/` - Deploy standby train
- `GET /api/ops/standby/deployments/` - Get deployments

### System Status
- `GET /api/ops/snapshot/` - Get system snapshot
- `GET /api/ops/auto-deploy-policy/` - Get auto-deploy policy
- `PUT /api/ops/auto-deploy-policy/` - Update auto-deploy policy

### WebSocket
- `WS /api/ops/stream/` - Real-time event stream

## Usage

### Basic Setup
```typescript
import { OpsMonitorPage } from '@/pages/OpsMonitorPage';

// Add to your routing
<Route path="/ops" element={<OpsMonitorPage />} />
```

### Custom Hook Usage
```typescript
import { useOperationsData } from '@/hooks/useOperationsData';

function MyComponent() {
  const {
    departures,
    incidents,
    isLoading,
    isConnected,
    markBoarded,
    reportIncident
  } = useOperationsData();

  // Use the data and actions
}
```

### WebSocket Integration
```typescript
import { operationsSocket } from '@/services/api/opsSocket';

operationsSocket.connect({
  onDepartureUpdate: (departure) => {
    // Handle departure updates
  },
  onIncidentCreated: (incident) => {
    // Handle new incidents
  }
});
```

## Testing

### Component Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test OpsMonitorPage.test.tsx

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage
- **OpsMonitorPage**: Main dashboard functionality
- **IncidentModal**: Incident reporting form
- **OperationsSocket**: WebSocket connection management
- **useOperationsData**: Data management hook

## Configuration

### Auto-deploy Policy
```typescript
interface AutoDeployPolicy {
  enabled: boolean;              // Enable automatic deployment
  thresholdMinutes: number;      // Auto-deploy if delay exceeds this
  maxStandbyUsage: number;       // Maximum standby trains to use
  requireConfirmation: boolean;  // Require manual confirmation
  notifyStakeholders: boolean;   // Send notifications
}
```

### Fault Templates
```typescript
interface FaultTemplate {
  id: string;
  code: string;                  // e.g., "MECH-001"
  description: string;           // Human-readable description
  category: 'mechanical' | 'electrical' | 'operational' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  commonSolutions: string[];    // Suggested solutions
  estimatedResolutionTime: number; // Minutes
}
```

## Error Handling

### Network Failures
- **Offline Detection**: Visual indicators for connection loss
- **Local Caching**: Cache incident logs for offline reporting
- **Auto-retry**: Automatic retry for failed API calls
- **Graceful Degradation**: Continue operation with cached data

### WebSocket Failures
- **Automatic Reconnection**: Exponential backoff strategy
- **Fallback Polling**: Switch to polling if WebSocket fails
- **Connection Health**: Real-time connection status monitoring
- **Error Recovery**: Graceful handling of malformed messages

## Performance Considerations

### Real-time Updates
- **Debounced Updates**: Prevent excessive re-renders
- **Virtual Scrolling**: Handle large datasets efficiently
- **Optimistic Updates**: Immediate UI feedback for user actions
- **Background Sync**: Sync data in background when connection restored

### Memory Management
- **Connection Cleanup**: Proper WebSocket cleanup on unmount
- **Event Listener Cleanup**: Remove event listeners to prevent leaks
- **Data Pagination**: Load data in chunks for large datasets
- **Cache Management**: Implement LRU cache for frequently accessed data

## Security

### Authentication
- **Role-based Access**: Different permissions for different roles
- **Session Management**: Secure session handling
- **API Authorization**: Proper authorization headers for API calls

### Data Protection
- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize user-generated content
- **CSRF Protection**: Implement CSRF tokens for state-changing operations

## Deployment

### Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=https://api.kmrl.gov.in
VITE_WS_BASE_URL=wss://api.kmrl.gov.in

# Feature Flags
VITE_ENABLE_AUTO_DEPLOY=true
VITE_ENABLE_NOTIFICATIONS=true

# Monitoring
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=info
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          operations: ['./src/pages/OpsMonitorPage.tsx']
        }
      }
    }
  }
});
```

## Monitoring and Analytics

### Performance Metrics
- **Page Load Time**: Track initial page load performance
- **WebSocket Latency**: Monitor real-time update latency
- **API Response Times**: Track API endpoint performance
- **Error Rates**: Monitor error frequency and types

### User Analytics
- **Feature Usage**: Track which features are used most
- **User Journeys**: Analyze user interaction patterns
- **Error Tracking**: Monitor user-reported issues
- **Performance Monitoring**: Track user experience metrics

## Future Enhancements

### Planned Features
- **Mobile App**: Native mobile application
- **Push Notifications**: Real-time push notifications
- **Advanced Analytics**: Machine learning for predictive maintenance
- **Integration APIs**: Third-party system integrations

### Technical Improvements
- **Service Workers**: Offline functionality
- **GraphQL**: More efficient data fetching
- **WebAssembly**: Performance-critical operations
- **Progressive Web App**: PWA capabilities
