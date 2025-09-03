# Optimization Setup Components

This directory contains the components for the train optimization setup page, allowing users to configure multi-objective weights and solver parameters for train scheduling optimization.

## Components

### OptimizeSetup
The main component that orchestrates the entire optimization setup page.

**Features:**
- Three-panel layout (weights, options, solver control)
- Real-time weight validation (must sum to 100%)
- Preset configurations for common use cases
- Interactive optimization simulation
- Progress tracking and logging

**Props:** None (self-contained component)

**Usage:**
```tsx
import { OptimizeSetup } from '@/components/optimization';

export const MyPage = () => {
  return <OptimizeSetup />;
};
```

### WeightSlider
A customizable slider component for adjusting objective weights.

**Features:**
- Visual color-coded feedback
- Tooltip with detailed information
- Preview text showing impact of changes
- Accessibility support with ARIA labels
- Responsive design

**Props:**
```tsx
interface WeightSliderProps {
  label: string;           // Display label for the weight
  value: number;           // Current weight value (0-100)
  onChange: (value: number) => void; // Callback for value changes
  tooltip: string;         // Tooltip content
  preview: string;         // Preview text showing impact
  color: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  disabled?: boolean;      // Whether the slider is disabled
  className?: string;      // Additional CSS classes
}
```

**Usage:**
```tsx
import { WeightSlider } from '@/components/optimization';

<WeightSlider
  label="Branding Priority"
  value={50}
  onChange={(value) => setBrandingWeight(value)}
  tooltip="Prioritizes trains with advertising contracts near expiry"
  preview="What changes when increased: Favors trains with advertising contracts near expiry"
  color="accent"
/>
```

### SolverLog
Displays real-time optimization progress, metrics, and logs.

**Features:**
- Progress bar with smooth animations
- Live metrics (iterations, objective value)
- Feasibility status indicator
- Structured log display with color coding
- Cancel button during optimization

**Props:**
```tsx
interface SolverLogProps {
  isRunning: boolean;      // Whether optimization is currently running
  progress: number;        // Progress percentage (0-100)
  currentIteration: number; // Current iteration count
  currentObjectiveValue: number; // Current objective function value
  feasibility: 'feasible' | 'infeasible' | 'unknown';
  logs: Array<{           // Array of log entries
    timestamp: string;
    message: string;
    level: 'info' | 'warning' | 'error' | 'success';
  }>;
  onCancel: () => void;   // Callback for cancel action
  className?: string;      // Additional CSS classes
}
```

**Usage:**
```tsx
import { SolverLog } from '@/components/optimization';

<SolverLog
  isRunning={isOptimizing}
  progress={45}
  currentIteration={1234}
  currentObjectiveValue={0.85}
  feasibility="feasible"
  logs={optimizationLogs}
  onCancel={handleCancel}
/>
```

## Preset Configurations

The system includes several preset configurations:

1. **Default (Ops)** - Balanced approach for general operations
2. **Branding-first** - Prioritizes advertising and marketing needs
3. **Reliability-first** - Focuses on safety and compliance
4. **Energy-minimization** - Optimizes for fuel efficiency and reduced movements

## Color Psychology

The components use a carefully designed color scheme:

- **Primary (Blue)**: Trust, reliability - main actions and navigation
- **Success (Green)**: Valid states, completion
- **Warning (Amber/Orange)**: Attention needed, near-threshold items
- **Danger (Red)**: Errors, invalid states, expired items
- **Accent (Teal)**: Branding and marketing elements

## Accessibility Features

- Full keyboard navigation support
- Proper ARIA attributes and labels
- Sufficient color contrast (WCAG AA compliant)
- Screen reader friendly tooltips
- Focus management during interactions

## Testing

Each component includes comprehensive test coverage:

- Unit tests for all props and interactions
- Accessibility testing
- Edge case handling
- Mock data and scenarios

Run tests with:
```bash
npm test -- --run src/components/optimization/
```

## Design Principles

- **Clean, Google-like minimal UI** with lots of whitespace
- **Left-aligned content** for easy scanning
- **Clear typography** with proper hierarchy
- **Subtle elevation** using shadows and borders
- **2xl-rounded cards** for modern, friendly appearance
- **Government product feel** - authoritative yet usable

## Responsive Design

- Desktop-first approach
- Breakpoints at 1024px, 768px, and 480px
- Grid layout adapts to screen size
- Touch-friendly controls on mobile devices

## Internationalization

All text content uses the `t()` translation function for i18n readiness. Translation keys are defined in `src/utils/i18n.ts`.

## Future Enhancements

- Integration with real optimization APIs
- Advanced constraint visualization
- Performance analytics dashboard
- Export/import of configurations
- Collaborative optimization sessions
