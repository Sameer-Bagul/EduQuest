import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Sparkles, 
  ArrowRight
} from "lucide-react";

interface HeroSectionProps {
  setLocation: (path: string) => void;
  scrollToSection: (id: string) => void;
}

export function HeroSection({ setLocation, scrollToSection }: HeroSectionProps) {
  return (
    <section id="hero" className="full-section gradient-purple relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(111,0,255,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(233,179,251,0.1),transparent_50%)]" />
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="fade-in">
            <Badge className="mb-6 px-6 py-3 glass-card border-primary/40 text-sm font-medium" data-testid="badge-featured">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              AI-Powered Learning Platform
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-foreground mb-8 leading-tight">
              Transform Your
              <span className="block mt-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Learning Journey
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Create, submit, and grade assignments with voice technology, 
              AI insights, and real-time collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={() => setLocation('/register')} 
                className="h-16 px-12 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                data-testid="button-start-trial"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-16 px-12 text-lg rounded-2xl glass-button hover:scale-105 transition-all duration-300"
                data-testid="button-watch-demo"
              >
                Watch Demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-16">
              No credit card required • 14-day free trial • Cancel anytime
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="slide-in-up">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">10k+</div>
                <p className="text-muted-foreground font-medium">Active Students</p>
              </div>
              <div className="slide-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-5xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">500+</div>
                <p className="text-muted-foreground font-medium">Educators</p>
              </div>
              <div className="slide-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">50k+</div>
                <p className="text-muted-foreground font-medium">Assignments Completed</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => scrollToSection('features')}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce glass-button p-3 rounded-full"
            aria-label="Scroll to features"
          />
        </div>
      </div>
    </section>
  );
}