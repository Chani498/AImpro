import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Ticket,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UserRole } from '@/types/database';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Assets',
    href: '/assets',
    icon: Building2,
  },
  {
    title: 'Tickets',
    href: '/tickets',
    icon: Ticket,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['company_admin', 'it_manager', 'super_admin'],
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    roles: ['company_admin', 'super_admin'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
  },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300',
        isCollapsed ? 'w-[70px]' : 'w-[260px]'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">AIMPro</span>
              <span className="text-[10px] text-muted-foreground -mt-1">Enterprise</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary mx-auto">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', isCollapsed && 'absolute -right-4 top-6 z-50 bg-card border shadow-sm')}
          onClick={onToggle}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'sidebar-nav-item',
                      isActive && 'active',
                      isCollapsed && 'justify-center px-2'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </NavLink>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="ml-2">
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        <div className="border-t p-3">
          {bottomNavItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'sidebar-nav-item',
                      isActive && 'active',
                      isCollapsed && 'justify-center px-2'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </NavLink>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="ml-2">
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </aside>
  );
}
