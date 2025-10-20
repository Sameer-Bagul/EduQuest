import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  LogOut, 
  User, 
  Settings,
  Menu
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
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <nav className="popup-nav max-w-7xl mx-auto backdrop-blur-lg bg-card/95 dark:bg-card/90">
        <div className="flex justify-between items-center h-14">
          {/* Logo Section */}
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => setLocation(isAuthenticated ? (user?.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard') : '/')}
            data-testid="link-logo"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mr-3 shadow-md group-hover:shadow-lg transition-all">
              <GraduationCap className="text-primary-foreground w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>
              <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {showAuth && isAuthenticated && user ? (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center space-x-2 h-11 px-3 rounded-xl hover:bg-accent/50"
                      data-testid="button-user-menu"
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center border-2 border-primary/30">
                        <span className="text-foreground text-sm font-semibold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="hidden sm:block text-left">
                        <span className="text-sm font-semibold text-foreground block leading-tight">{user?.name}</span>
                        <span className="text-xs text-muted-foreground font-medium capitalize">{user?.role}</span>
                      </div>
                      <Menu className="w-4 h-4 text-muted-foreground ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setLocation('/profile')}
                      className="cursor-pointer rounded-lg"
                      data-testid="button-profile"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setLocation('/settings')}
                      className="cursor-pointer rounded-lg"
                      data-testid="button-settings"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive rounded-lg"
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Badge 
                  variant="secondary" 
                  className="hidden sm:inline-flex rounded-lg px-3 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30"
                  data-testid="badge-user-role"
                >
                  {user?.role === 'teacher' ? 'Teacher' : 'Student'}
                </Badge>
              </>
            ) : showAuth ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => setLocation('/login')}
                  className="rounded-xl"
                  data-testid="button-signin"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => setLocation('/register')}
                  className="rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md"
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
