import {
  Building2,
  Ticket,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Add Asset',
    description: 'Register new IT equipment',
    icon: Building2,
    href: '/assets/new',
    color: 'text-primary',
  },
  {
    title: 'Create Ticket',
    description: 'Report an issue',
    icon: Ticket,
    href: '/tickets/new',
    color: 'text-warning',
  },
  {
    title: 'Add User',
    description: 'Invite team members',
    icon: Users,
    href: '/users/new',
    color: 'text-success',
  },
  {
    title: 'View Reports',
    description: 'Analyze performance',
    icon: AlertTriangle,
    href: '/reports',
    color: 'text-destructive',
  },
];

interface RecentActivity {
  id: string;
  type: 'ticket' | 'asset' | 'user';
  action: string;
  description: string;
  time: string;
  status: 'completed' | 'pending' | 'in_progress';
}

const recentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'ticket',
    action: 'Ticket Resolved',
    description: 'Ticket #1234 - Network connectivity issue',
    time: '5 minutes ago',
    status: 'completed',
  },
  {
    id: '2',
    type: 'asset',
    action: 'Asset Assigned',
    description: 'Laptop DEP-001 assigned to John Doe',
    time: '1 hour ago',
    status: 'completed',
  },
  {
    id: '3',
    type: 'ticket',
    action: 'Ticket Created',
    description: 'Ticket #1235 - Software installation request',
    time: '2 hours ago',
    status: 'pending',
  },
  {
    id: '4',
    type: 'user',
    action: 'User Onboarded',
    description: 'Jane Smith joined the team',
    time: '3 hours ago',
    status: 'completed',
  },
  {
    id: '5',
    type: 'ticket',
    action: 'Ticket In Progress',
    description: 'Ticket #1233 - Printer not working',
    time: '4 hours ago',
    status: 'in_progress',
  },
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  pending: {
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  in_progress: {
    icon: AlertTriangle,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
};

export function QuickActions() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="flex items-center gap-3 rounded-lg border bg-background p-4 hover:bg-accent transition-colors"
          >
            <div className={cn('rounded-lg p-2 bg-muted', action.color)}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-sm">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RecentActivity() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Activity</h3>
        <Link to="/activity" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {recentActivity.map((activity) => {
          const config = statusConfig[activity.status];
          const Icon = config.icon;

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn('rounded-lg p-2', config.bg)}>
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
