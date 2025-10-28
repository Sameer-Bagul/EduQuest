import { Card, CardContent } from "@/components/ui/card";
import { 
  Mic, 
  Brain, 
  Users, 
  Shield, 
  BarChart3, 
  CheckCircle
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="full-section relative bg-gradient-blue dark:bg-gradient-blue">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(0,119,182,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_30%,rgba(0,180,216,0.12),transparent_50%)]" />
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground dark:text-foreground mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
              Everything you need for modern education in one platform
            </p>
          </div>

          {/* Bento Grid Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Card 1 - Large */}
            <Card className="bento-card md:col-span-2 lg:col-span-2 lg:row-span-2 slide-in-left" data-testid="card-feature-voice">
              <CardContent className="p-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-accent/20 dark:to-secondary/20 rounded-3xl flex items-center justify-center mb-8 border border-primary/30 dark:border-accent/30 shadow-lg hover-lift">
                    <Mic className="w-10 h-10 text-primary dark:text-accent" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground dark:text-foreground mb-4">Voice-to-Text Technology</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground text-lg leading-relaxed mb-6">
                    Speak your answers naturally and let our AI convert them to text instantly. 
                    Perfect for accessibility and faster assignment completion with industry-leading accuracy.
                  </p>
                </div>
                <div className="mt-6 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success dark:text-success" />
                  <span className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">99% accuracy rate</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature Card 2 */}
            <Card className="bento-card slide-in-right" data-testid="card-feature-ai">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-accent/20 dark:from-secondary/20 dark:to-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-secondary/30 dark:border-secondary/30 hover-lift">
                  <Brain className="w-8 h-8 text-secondary dark:text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground dark:text-foreground mb-3">AI Grading</h3>
                <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  Intelligent evaluation with detailed feedback and insights powered by advanced AI.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 3 */}
            <Card className="bento-card slide-in-right" style={{ animationDelay: '0.1s' }} data-testid="card-feature-collab">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-primary/20 dark:from-success/20 dark:to-accent/20 rounded-2xl flex items-center justify-center mb-6 border border-success/30 dark:border-success/30 hover-lift">
                  <Users className="w-8 h-8 text-success dark:text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground dark:text-foreground mb-3">Real-time Collaboration</h3>
                <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  Connect teachers and students seamlessly in one unified platform.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 4 */}
            <Card className="bento-card lg:col-span-2 slide-in-left" style={{ animationDelay: '0.1s' }} data-testid="card-feature-security">
              <CardContent className="p-8 flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 dark:from-accent/20 dark:to-primary/20 rounded-3xl flex items-center justify-center flex-shrink-0 border border-primary/30 dark:border-accent/30 hover-lift">
                  <Shield className="w-10 h-10 text-primary dark:text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground dark:text-foreground mb-3">Secure Proctoring</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                    Advanced monitoring ensures academic integrity with webcam tracking and browser lockdown technology.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature Card 5 */}
            <Card className="bento-card slide-in-right" style={{ animationDelay: '0.2s' }} data-testid="card-feature-analytics">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-secondary/20 dark:from-primary/20 dark:to-secondary/20 rounded-2xl flex items-center justify-center mb-6 border border-accent/30 dark:border-primary/30 hover-lift">
                  <BarChart3 className="w-8 h-8 text-accent dark:text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground dark:text-foreground mb-3">Analytics</h3>
                <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  Comprehensive insights into performance and learning patterns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
