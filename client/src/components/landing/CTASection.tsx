import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight } from "lucide-react";

interface CTASectionProps {
  setLocation: (path: string) => void;
}

export function CTASection({ setLocation }: CTASectionProps) {
  return (
    <section id="cta" className="full-section relative bg-gradient-blue dark:bg-gradient-blue">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,119,182,0.12),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(0,180,216,0.15),transparent_60%)]" />
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Card className="bento-card bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 dark:from-accent/10 dark:via-secondary/10 dark:to-primary/10 border-2 border-primary/30 dark:border-accent/30 slide-in-up hover-lift">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/30 to-secondary/30 dark:from-accent/30 dark:to-secondary/30 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/40 dark:border-accent/40 hover-lift">
                <Award className="w-12 h-12 text-primary dark:text-accent" />
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground dark:text-foreground mb-6">
                Ready to Transform Your Classroom?
              </h2>
              <p className="text-xl text-muted-foreground dark:text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of educators using EduQuest to enhance their teaching experience
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => setLocation('/register')} 
                  className="h-16 px-12 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-white dark:text-white"
                  data-testid="button-cta-start"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setLocation('/login')} 
                  className="h-16 px-12 text-lg rounded-2xl glass-button hover:scale-105 transition-all duration-300 text-foreground dark:text-foreground"
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
  );
}
