import { 
  Database, 
  CheckCircle, 
  Settings, 
  BarChart3, 
  FileText, 
  Play, 
  TrendingUp, 
  Shield, 
  LogOut,
  Home,
  Monitor,
  Activity
} from 'lucide-react';
import { t } from '@/utils/i18n';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  roles: string[];
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  isAdmin?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: "home",
    label: t('nav.dashboard'),
    path: "/",
    roles: ["Supervisor", "Maintenance Staff", "Branding Manager", "Depot Ops", "Admin"],
    icon: Home,
    description: "Main dashboard overview"
  },
  {
    id: "dataHub",
    label: t('nav.dataIngestion'),
    path: "/data-ingestion",
    roles: ["Supervisor"],
    icon: Database,
    description: "Import and manage data sources"
  },
  {
    id: "unifiedData",
    label: t('nav.unifiedDataModel'),
    path: "/unified-data-model",
    roles: ["Supervisor"],
    icon: Database,
    description: "View and manage unified data model"
  },
  {
    id: "validation",
    label: t('nav.validation'),
    path: "/validation",
    roles: ["Supervisor", "Maintenance Staff"],
    icon: CheckCircle,
    description: "Validate data quality and integrity"
  },
  {
    id: "setup",
    label: t('nav.optimization'),
    path: "/optimization",
    roles: ["Supervisor", "Branding Manager"],
    icon: Settings,
    description: "Configure optimization parameters"
  },
  {
    id: "results",
    label: t('nav.results'),
    path: "/results",
    roles: ["Supervisor"],
    icon: BarChart3,
    description: "View optimization results"
  },
  {
    id: "review",
    label: t('nav.review'),
    path: "/review",
    roles: ["Supervisor"],
    icon: FileText,
    description: "Review and simulate scenarios"
  },
  {
    id: "opsMonitor",
    label: t('nav.opsMonitor'),
    path: "/ops-monitor",
    roles: ["Depot Ops", "Supervisor"],
    icon: Monitor,
    description: "Live monitoring for morning operations"
  },
  {
    id: "analytics",
    label: t('nav.analytics'),
    path: "/analytics",
    roles: ["Supervisor", "Admin"],
    icon: TrendingUp,
    description: "Advanced analytics and insights"
  },
  {
    id: "maintenance",
    label: t('nav.maintenance'),
    path: "/maintenance-tracker",
    roles: ["Maintenance Staff"],
    icon: Activity,
    description: "Track maintenance activities"
  },
  {
    id: "branding",
    label: t('nav.branding'),
    path: "/branding-dashboard",
    roles: ["Branding Manager"],
    icon: BarChart3,
    description: "Branding compliance and metrics"
  },
  {
    id: "execution",
    label: t('nav.execution'),
    path: "/execution-tracking",
    roles: ["Depot Ops"],
    icon: Play,
    description: "Track execution progress"
  },
  {
    id: "admin",
    label: t('nav.admin'),
    path: "/admin-config",
    roles: ["Admin"],
    icon: Shield,
    description: "System administration",
    isAdmin: true
  }
];

export const getMenuItemsForRole = (userRoles: string[]): MenuItem[] => {
  return menuItems.filter(item => 
    item.roles.some(role => userRoles.includes(role))
  );
};

export const isPathAccessible = (path: string, userRoles: string[]): boolean => {
  const item = menuItems.find(item => item.path === path);
  return item ? item.roles.some(role => userRoles.includes(role)) : false;
};
