import { Building2, Ticket, CheckCircle2, Users } from 'lucide-react';
import { KPICard, QuickActions, RecentActivity } from '@/components/dashboard';
import { useAuth } from '@/lib/auth-context';

const mockStats = {
  totalAssets: 1248,
  openTickets: 42,
  closedTickets: 386,
  activeUsers: 156,
  trends: {
    assets: { value: 12, isPositive: true, label: 'vs last month' },
    openTickets: { value: 8, isPositive: false, label: 'vs last month' },
    closedTickets: { value: 23, isPositive: true, label: 'vs last month' },
    activeUsers: { value: 5, isPositive: true, label: 'vs last month' },
  },
};

export function DashboardPage() {
  const { appUser, company } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = appUser?.profile?.first_name;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">
          {getGreeting()} {firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="page-description">
          Here's an overview of your ITSM dashboard
          {company?.name && ` for ${company.name}`}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Assets"
          value={mockStats.totalAssets.toLocaleString()}
          icon={<Building2 className="h-6 w-6 text-primary" />}
          trend={mockStats.trends.assets}
        />
        <KPICard
          title="Open Tickets"
          value={mockStats.openTickets}
          icon={<Ticket className="h-6 w-6 text-warning" />}
          trend={mockStats.trends.openTickets}
        />
        <KPICard
          title="Closed Tickets"
          value={mockStats.closedTickets}
          icon={<CheckCircle2 className="h-6 w-6 text-success" />}
          trend={mockStats.trends.closedTickets}
        />
        <KPICard
          title="Active Users"
          value={mockStats.activeUsers}
          icon={<Users className="h-6 w-6 text-primary" />}
          trend={mockStats.trends.activeUsers}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
}
