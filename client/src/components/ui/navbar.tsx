import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  LogOut, 
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
  showNavLinks?: boolean;
}

export function Navbar({ title = "EduQuest", subtitle = "Digital Learning Platform", showAuth = true, showNavLinks = false }: NavbarProps) {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLandingPage = location === '/';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="glass-nav max-w-7xl mx-auto rounded-2xl px-6 shadow-xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => setLocation(isAuthenticated ? (user?.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard') : '/')}
              data-testid="link-logo"
            >
              <div className="w-10 h-10 icon-muted rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
                <GraduationCap className="text-primary dark:text-accent w-5 h-5" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-accent dark:to-secondary hidden md:block">
                EduQuest
              </span>
            </div>

            {/* Navigation Links - Only show on landing page */}
            {isLandingPage && !isAuthenticated && (
              <div className="hidden lg:flex items-center gap-1">
                <Button
                  variant="ghost"
                  onClick={() => scrollToSection('features')}
                  className="text-foreground dark:text-foreground hover:text-primary dark:hover:text-accent transition-colors"
                  data-testid="link-features"
                >
                  Features
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => scrollToSection('testimonials')}
                  className="text-foreground dark:text-foreground hover:text-primary dark:hover:text-accent transition-colors"
                  data-testid="link-testimonials"
                >
                  Testimonials
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => scrollToSection('cta')}
                  className="text-foreground dark:text-foreground hover:text-primary dark:hover:text-accent transition-colors"
                  data-testid="link-pricing"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            {showAuth && isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center h-10 px-2 rounded-lg glass-effect hover-lift"
                    data-testid="button-user-menu"
                  >
                    <div className="w-9 h-9 icon-muted rounded-lg flex items-center justify-center border border-primary/40 dark:border-accent/40">
                      <span className="text-foreground dark:text-foreground text-sm font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground dark:text-muted-foreground ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl dashboard-card border glass-card">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-foreground dark:text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setLocation(user?.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard')}
                    className="cursor-pointer text-foreground dark:text-foreground hover:text-primary dark:hover:text-accent"
                    data-testid="button-dashboard"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive dark:text-destructive focus:text-destructive dark:focus:text-destructive"
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
                  className="rounded-lg btn-minimal text-foreground dark:text-foreground"
                  data-testid="button-signin"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setLocation('/register')}
                  className="rounded-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-sm hover-lift text-white dark:text-white"
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
