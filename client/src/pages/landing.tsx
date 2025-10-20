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
  Clock,
  Mic,
  Brain,
  Award
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar showAuth={true} />
      
      {/* Hero Section with Diary Aesthetic */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30 rounded-full" data-testid="badge-featured">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              AI-Powered Learning Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Transform Your
              <span className="highlight-marker text-primary block mt-2">
                Learning Journey
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              Create, submit, and grade assignments with voice technology, 
              AI insights, and real-time collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={() => setLocation('/register')} 
                className="h-14 px-10 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all"
                data-testid="button-start-trial"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-10 text-lg rounded-2xl border-2 hover:bg-accent/30"
                data-testid="button-watch-demo"
              >
                Watch Demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* Bento Grid Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto slide-in-right">
            {/* Feature Card 1 - Large */}
            <Card className="bento-card md:col-span-2 lg:col-span-2 lg:row-span-2" data-testid="card-feature-voice">
              <CardContent className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-6 border-2 border-primary/30">
                    <Mic className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Voice-to-Text Technology</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Speak your answers naturally and let our AI convert them to text instantly. 
                    Perfect for accessibility and faster assignment completion.
                  </p>
                </div>
                <div className="mt-6 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">99% accuracy rate</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature Card 2 */}
            <Card className="bento-card" data-testid="card-feature-ai">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-warning/20 to-accent/20 rounded-2xl flex items-center justify-center mb-4 border-2 border-warning/30">
                  <Brain className="w-7 h-7 text-warning" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">AI Grading</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Intelligent evaluation with detailed feedback and insights.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 3 */}
            <Card className="bento-card" data-testid="card-feature-collab">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-success/20 to-primary/20 rounded-2xl flex items-center justify-center mb-4 border-2 border-success/30">
                  <Users className="w-7 h-7 text-success" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Real-time Collaboration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect teachers and students seamlessly in one platform.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 4 */}
            <Card className="bento-card lg:col-span-2" data-testid="card-feature-security">
              <CardContent className="p-6 flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-primary/30">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Secure Proctoring</h3>
                  <p className="text-muted-foreground">
                    Advanced monitoring ensures academic integrity with webcam tracking and browser lockdown.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature Card 5 */}
            <Card className="bento-card" data-testid="card-feature-analytics">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-4 border-2 border-accent/30">
                  <BarChart3 className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Comprehensive insights into performance and learning patterns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section with Diary Paper Effect */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-accent/10 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="fade-in">
              <div className="text-5xl font-bold text-primary mb-2">10k+</div>
              <p className="text-muted-foreground font-medium">Active Students</p>
            </div>
            <div className="fade-in">
              <div className="text-5xl font-bold text-secondary mb-2">500+</div>
              <p className="text-muted-foreground font-medium">Educators</p>
            </div>
            <div className="fade-in">
              <div className="text-5xl font-bold text-warning mb-2">50k+</div>
              <p className="text-muted-foreground font-medium">Assignments Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials with Bento Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Loved by Educators Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what teachers and students are saying about EduQuest
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bento-card" data-testid="card-testimonial-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">
                  "EduQuest has transformed how I manage my classroom. The voice-to-text feature is a game changer!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-foreground font-bold">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Sarah Mitchell</p>
                    <p className="text-sm text-muted-foreground">High School Teacher</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bento-card" data-testid="card-testimonial-2">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">
                  "The AI grading system saves me hours every week. Highly recommended for busy educators."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-success/20 to-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-foreground font-bold">JC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">James Chen</p>
                    <p className="text-sm text-muted-foreground">University Professor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bento-card" data-testid="card-testimonial-3">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">
                  "As a student, I love how easy it is to submit assignments and track my progress in real-time."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-warning/20 to-accent/20 rounded-full flex items-center justify-center">
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
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Card className="bento-card bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20">
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
                Ready to Transform Your Classroom?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of educators using EduQuest to enhance their teaching experience
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => setLocation('/register')} 
                  className="h-14 px-10 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
                  data-testid="button-cta-start"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setLocation('/login')} 
                  className="h-14 px-10 text-lg rounded-2xl border-2"
                  data-testid="button-cta-signin"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
