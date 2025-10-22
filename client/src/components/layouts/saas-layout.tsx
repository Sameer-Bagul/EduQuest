import { useLocation } from "wouter";
import { useAuthContext } from "@/components/ui/auth-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  User,
  Settings,
  Wallet,
  BarChart3,
  LogOut,
  GraduationCap,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SaasLayoutProps {
  children: React.ReactNode;
}

export function SaasLayout({ children }: SaasLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const teacherNavItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/teacher-dashboard",
    },
    {
      title: "Create Assignment",
      icon: Plus,
      url: "/create-assignment",
    },
    {
      title: "My Assignments",
      icon: ClipboardList,
      url: "/teacher-dashboard",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      url: "/teacher-dashboard",
    },
  ];

  const studentNavItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/student-dashboard",
    },
    {
      title: "My Submissions",
      icon: BookOpen,
      url: "/student-dashboard",
    },
    {
      title: "Wallet",
      icon: Wallet,
      url: "/profile?tab=wallet",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      url: "/student-dashboard",
    },
  ];

  const commonNavItems = [
    {
      title: "Profile",
      icon: User,
      url: "/profile",
    },
    {
      title: "Settings",
      icon: Settings,
      url: "/settings",
    },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  return (
    <SidebarProvider>
      <Sidebar variant="floating" className="glass-sidebar">
        <SidebarHeader className="p-4">
          <div
            className="flex items-center cursor-pointer group mb-2"
            onClick={() => setLocation(isTeacher ? '/teacher-dashboard' : '/student-dashboard')}
          >
            <div className="w-10 h-10 icon-muted mr-3 flex items-center justify-center">
              <GraduationCap className="text-primary-foreground w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">EduQuest</h1>
              <p className="text-xs text-muted-foreground">Digital Learning</p>
            </div>
          </div>
          <SidebarSeparator />
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
              Main Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => setLocation(item.url)}
                      isActive={location === item.url}
                      className="glass-button my-0.5"
                      data-testid={`sidebar-${item.title.toLowerCase().replace(' ', '-')}`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-2" />

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
              Account
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {commonNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => setLocation(item.url)}
                      isActive={location === item.url}
                      className="glass-button my-0.5"
                      data-testid={`sidebar-${item.title.toLowerCase()}`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <SidebarSeparator className="mb-2" />
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start btn-minimal h-auto p-3"
                data-testid="sidebar-user-menu"
              >
                <div className="flex items-center w-full">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl flex items-center justify-center border border-primary/40 mr-3">
                    <span className="text-foreground text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 dashboard-card">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocation('/profile')}
                className="cursor-pointer"
                data-testid="dropdown-profile"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation('/settings')}
                className="cursor-pointer"
                data-testid="dropdown-settings"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
                data-testid="dropdown-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Top Bar */}
        <header className="glass-nav sticky top-0 z-40 flex h-16 items-center gap-4 px-6 border-b">
          <SidebarTrigger className="glass-button" />
          <div className="flex-1" />
          <ThemeToggle />
          <Badge
            variant="secondary"
            className="glass-card px-3 py-1.5"
            data-testid="badge-user-role"
          >
            {isTeacher ? 'Teacher' : 'Student'}
          </Badge>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
