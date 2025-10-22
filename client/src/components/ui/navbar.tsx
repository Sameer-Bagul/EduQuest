import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  LogOut, 
  User, 
  Settings,
  ChevronDown
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuthContext } from "@/components/ui/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showAuth?: boolean;
}

export function Navbar({ title = "EduQuest", subtitle = "Digital Learning Platform", showAuth = true }: NavbarProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="glass-nav max-w-7xl mx-auto rounded-2xl px-6 shadow-xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo (compact) */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setLocation(isAuthenticated ? (user?.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard') : '/')}
            data-testid="link-logo"
          >
            <div className="w-10 h-10 icon-muted rounded-2xl flex items-center justify-center">
              <GraduationCap className="text-black w-5 h-5" />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            {showAuth && isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center h-10 px-2 rounded-lg"
                    data-testid="button-user-menu"
                  >
                    <div className="w-9 h-9 icon-muted rounded-lg flex items-center justify-center border border-primary/40">
                      <span className="text-foreground text-sm font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl dashboard-card border">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setLocation('/profile')}
                    className="cursor-pointer"
                    data-testid="button-profile"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocation('/settings')}
                    className="cursor-pointer"
                    data-testid="button-settings"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : showAuth ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/login')}
                  className="rounded-lg btn-minimal"
                  data-testid="button-signin"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setLocation('/register')}
                  className="rounded-lg btn-minimal shadow-sm"
                  data-testid="button-getstarted"
                >
                  Get Started
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </nav>
    </div>
  );
}
