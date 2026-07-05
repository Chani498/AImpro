import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  Building2,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TopNavProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

const mockNotifications = [
  {
    id: 1,
    title: 'New ticket assigned',
    message: 'Ticket #1234 has been assigned to you',
    time: '5 min ago',
    unread: true,
  },
  {
    id: 2,
    title: 'Asset maintenance due',
    message: 'Laptop DEP-001 requires maintenance',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 3,
    title: 'Ticket resolved',
    message: 'Ticket #1230 has been resolved',
    time: '2 hours ago',
    unread: false,
  },
];

export function TopNav({ onMenuClick, isSidebarCollapsed }: TopNavProps) {
  const { appUser, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const userInitials = appUser?.profile
    ? `${appUser.profile.first_name?.[0] || ''}${appUser.profile.last_name?.[0] || ''}`
    : appUser?.email?.[0]?.toUpperCase() || 'U';

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 lg:px-6 transition-all duration-300',
        isSidebarCollapsed ? 'left-[70px]' : 'left-[260px]'
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className={cn('relative', searchOpen ? 'w-64' : 'w-auto')}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className={cn(
              'pl-9 bg-background transition-all duration-300',
              searchOpen ? 'w-full' : 'w-[200px] lg:w-[300px]'
            )}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h4 className="font-semibold">Notifications</h4>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary">
                Mark all as read
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-3 border-b px-4 py-3 hover:bg-muted/50 cursor-pointer',
                    notification.unread && 'bg-primary/5'
                  )}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                  {notification.unread && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
            <div className="border-t p-2">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={appUser?.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">
                  {appUser?.profile?.first_name} {appUser?.profile?.last_name}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {appUser?.profile?.role?.replace('_', ' ')}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {appUser?.profile?.first_name} {appUser?.profile?.last_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {appUser?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            {appUser?.company && (
              <DropdownMenuItem onClick={() => navigate('/settings/company')}>
                <Building2 className="mr-2 h-4 w-4" />
                Company Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
