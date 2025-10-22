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
  Mic,
  Brain,
  Award,
  Zap,
  Target,
  TrendingUp,
  ChevronDown
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar showAuth={true} />
      
      {/* Hero Section - Full Screen */}
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
            >
              <ChevronDown className="w-6 h-6 text-primary" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - Full Screen */}
      <section id="features" className="full-section relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,2,112,0.05),transparent_50%)]" />
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Powerful Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need for modern education in one platform
              </p>
            </div>

            {/* Bento Grid Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature Card 1 - Large */}
              <Card className="bento-card md:col-span-2 lg:col-span-2 lg:row-span-2 slide-in-left" data-testid="card-feature-voice">
                <CardContent className="p-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mb-8 border border-primary/30 shadow-lg">
                      <Mic className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-3xl font-bold text-foreground mb-4">Voice-to-Text Technology</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                      Speak your answers naturally and let our AI convert them to text instantly. 
                      Perfect for accessibility and faster assignment completion with industry-leading accuracy.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-sm text-muted-foreground font-medium">99% accuracy rate</span>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Card 2 */}
              <Card className="bento-card slide-in-right" data-testid="card-feature-ai">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-6 border border-secondary/30">
                    <Brain className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">AI Grading</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Intelligent evaluation with detailed feedback and insights powered by advanced AI.
                  </p>
                </CardContent>
              </Card>

              {/* Feature Card 3 */}
              <Card className="bento-card slide-in-right" style={{ animationDelay: '0.1s' }} data-testid="card-feature-collab">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-success/30">
                    <Users className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Real-time Collaboration</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Connect teachers and students seamlessly in one unified platform.
                  </p>
                </CardContent>
              </Card>

              {/* Feature Card 4 */}
              <Card className="bento-card lg:col-span-2 slide-in-left" style={{ animationDelay: '0.1s' }} data-testid="card-feature-security">
                <CardContent className="p-8 flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center flex-shrink-0 border border-primary/30">
                    <Shield className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">Secure Proctoring</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Advanced monitoring ensures academic integrity with webcam tracking and browser lockdown technology.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Card 5 */}
              <Card className="bento-card slide-in-right" style={{ animationDelay: '0.2s' }} data-testid="card-feature-analytics">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-6 border border-accent/30">
                    <BarChart3 className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Analytics</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Comprehensive insights into performance and learning patterns.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Full Screen */}
      <section id="testimonials" className="full-section gradient-purple relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(111,0,255,0.05),transparent_70%)]" />
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Loved by Educators Worldwide
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what teachers and students are saying about EduQuest
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bento-card slide-in-up" data-testid="card-testimonial-1">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-warning fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed text-lg">
                    "EduQuest has transformed how I manage my classroom. The voice-to-text feature is a game changer!"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full flex items-center justify-center border border-primary/40">
                      <span className="text-foreground font-bold">SM</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Sarah Mitchell</p>
                      <p className="text-sm text-muted-foreground">High School Teacher</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bento-card slide-in-up" style={{ animationDelay: '0.1s' }} data-testid="card-testimonial-2">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-warning fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed text-lg">
                    "The AI grading system saves me hours every week. Highly recommended for busy educators."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-success/30 to-primary/30 rounded-full flex items-center justify-center border border-success/40">
                      <span className="text-foreground font-bold">JC</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">James Chen</p>
                      <p className="text-sm text-muted-foreground">University Professor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bento-card slide-in-up" style={{ animationDelay: '0.2s' }} data-testid="card-testimonial-3">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-warning fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed text-lg">
                    "As a student, I love how easy it is to submit assignments and track my progress in real-time."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/30 to-secondary/30 rounded-full flex items-center justify-center border border-accent/40">
                      <span className="text-foreground font-bold">EP</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Emma Peterson</p>
                      <p className="text-sm text-muted-foreground">College Student</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Screen */}
      <section id="cta" className="full-section relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,2,112,0.1),transparent_60%)]" />
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Card className="bento-card bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/30 slide-in-up">
              <CardContent className="p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/40">
                  <Award className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Ready to Transform Your Classroom?
                </h2>
                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of educators using EduQuest to enhance their teaching experience
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => setLocation('/register')} 
                    className="h-16 px-12 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    data-testid="button-cta-start"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => setLocation('/login')} 
                    className="h-16 px-12 text-lg rounded-2xl glass-button hover:scale-105 transition-all duration-300"
                    data-testid="button-cta-signin"
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
