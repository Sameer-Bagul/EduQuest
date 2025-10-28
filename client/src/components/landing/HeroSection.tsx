import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Sparkles, 
  ArrowRight,
  ChevronDown
} from "lucide-react";

interface HeroSectionProps {
  setLocation: (path: string) => void;
  scrollToSection: (id: string) => void;
}

export function HeroSection({ setLocation, scrollToSection }: HeroSectionProps) {
  return (
    <section id="hero" className="full-section relative overflow-hidden bg-background dark:bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animated-gradient opacity-20" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,119,182,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(0,180,216,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(0,180,216,0.2),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(72,202,228,0.2),transparent_50%)]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <Badge className="mb-6 px-6 py-3 glass-card border-primary/40 text-sm font-medium hover-lift" data-testid="badge-featured">
              <Sparkles className="w-4 h-4 mr-2 inline text-primary dark:text-accent" />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI-Powered Learning Platform
              </span>
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-foreground dark:text-foreground mb-8 leading-tight">
              Transform Your
              <span className="block mt-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Learning Journey
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground dark:text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Create, submit, and grade assignments with voice technology, 
              AI insights, and real-time collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={() => setLocation('/register')} 
                className="h-16 px-12 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-white dark:text-white"
                data-testid="button-start-trial"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-16 px-12 text-lg rounded-2xl glass-button hover:scale-105 transition-all duration-300 text-foreground dark:text-foreground"
                data-testid="button-watch-demo"
              >
                Watch Demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-16">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* Browser Mockup with Dashboard Preview */}
          <div className="max-w-6xl mx-auto mb-20 slide-in-up">
            <div className="glass-card p-2 rounded-3xl shadow-2xl hover-lift">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 dark:border-border/30 bg-muted/30 dark:bg-muted/10 rounded-t-3xl">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-background/60 dark:bg-background/40 rounded-lg text-xs text-muted-foreground dark:text-muted-foreground">
                    <GraduationCap className="w-3 h-3 text-primary dark:text-accent" />
                    <span>eduquest.app/dashboard</span>
                  </div>
                </div>
              </div>
              
              {/* Browser Content - Dashboard Preview */}
              <div className="relative rounded-b-3xl overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background dark:from-background dark:via-muted/10 dark:to-background">
                <div className="p-8">
                  {/* Mini Dashboard Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground dark:text-foreground">Welcome back, Alex!</h3>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Here's your learning overview</p>
                    </div>
                    <div className="glass-card px-4 py-2 rounded-xl">
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground">Current Streak</div>
                      <div className="text-2xl font-bold text-primary dark:text-accent">12 days 🔥</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="glass-card p-4 rounded-xl">
                      <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-accent dark:to-secondary">24</div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">Assignments</div>
                    </div>
                    <div className="glass-card p-4 rounded-xl">
                      <div className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent dark:from-secondary dark:to-primary">94%</div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">Avg. Score</div>
                    </div>
                    <div className="glass-card p-4 rounded-xl">
                      <div className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent dark:from-primary dark:to-accent">18h</div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">Study Time</div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground dark:text-foreground">Recent Activity</h4>
                      <Badge className="glass-effect text-xs text-primary dark:text-accent">Live</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 dark:bg-muted/10">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-sm text-foreground dark:text-foreground flex-1">Completed: Math Assignment #5</span>
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground">2m ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 dark:bg-muted/10">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-sm text-foreground dark:text-foreground flex-1">Graded: Physics Quiz</span>
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground">15m ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="slide-in-up text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-accent dark:to-secondary mb-2">10k+</div>
              <p className="text-muted-foreground dark:text-muted-foreground font-medium">Active Students</p>
            </div>
            <div className="slide-in-up text-center" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent dark:from-secondary dark:to-primary mb-2">500+</div>
              <p className="text-muted-foreground dark:text-muted-foreground font-medium">Educators</p>
            </div>
            <div className="slide-in-up text-center" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent dark:from-primary dark:to-accent mb-2">50k+</div>
              <p className="text-muted-foreground dark:text-muted-foreground font-medium">Assignments Completed</p>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => scrollToSection('features')}
              className="animate-bounce glass-button p-4 rounded-full hover-lift inline-flex items-center justify-center"
              aria-label="Scroll to features"
              data-testid="button-scroll-features"
            >
              <ChevronDown className="w-6 h-6 text-primary dark:text-accent" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
