import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  FileText, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      queryClient.clear();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/colleges', label: 'Colleges', icon: GraduationCap },
    { path: '/assignments', label: 'Assignments', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">EduQuest Admin</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
                data-testid="button-close-sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <a
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => setSidebarOpen(false)}
                      data-testid={`link-${item.label.toLowerCase()}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b bg-card px-6 flex items-center justify-between lg:justify-end">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              data-testid="button-open-sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="text-sm text-muted-foreground">
              Welcome, Admin
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
