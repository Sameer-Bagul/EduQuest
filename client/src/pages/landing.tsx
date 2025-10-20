import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Star,
  BarChart3,
  Shield,
  Clock
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Footer } from "@/components/ui/footer";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="text-primary-foreground w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">EduQuest</h1>
                <p className="text-xs text-muted-foreground">Digital Learning Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => setLocation('/login')}>
                Sign In
              </Button>
              <Button onClick={() => setLocation('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transform Your
            <span className="text-primary block">Learning Experience</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Create, submit, and grade assignments with cutting-edge voice technology, 
            AI-powered insights, and real-time proctoring features.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" onClick={() => setLocation('/register')} className="h-12 px-8">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8">
              Watch Demo
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Smart Assignments</h3>
              <p className="text-muted-foreground text-sm">Create interactive assignments with voice-to-text capabilities</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Real-time Collaboration</h3>
              <p className="text-muted-foreground text-sm">Connect teachers and students seamlessly</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI-Powered Grading</h3>
              <p className="text-muted-foreground text-sm">Automatic evaluation with intelligent insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Modern Education
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed for the digital classroom
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Secure Proctoring</h3>
                  <p className="text-muted-foreground">Advanced proctoring features ensure academic integrity with real-time monitoring</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">Comprehensive insights into student performance and learning patterns</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Auto-Save & Recovery</h3>
                  <p className="text-muted-foreground">Never lose progress with automatic saving and session recovery</p>
                </div>
              </div>
            </div>

            <Card className="hover-subtle">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Join 1000+ Educators</h3>
                  <p className="text-muted-foreground mb-6">Trusted by educational institutions worldwide</p>
                  <div className="flex justify-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-warning fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">4.9/5 from 500+ reviews</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of educators using EduQuest to enhance their teaching experience
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setLocation('/register')} className="h-12 px-8">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => setLocation('/login')} className="h-12 px-8">
              Sign In
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}