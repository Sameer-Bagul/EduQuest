import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="full-section gradient-blue dark:gradient-blue relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,119,182,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(0,180,216,0.12),transparent_70%)]" />
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground dark:text-foreground mb-6">
              Loved by Educators Worldwide
            </h2>
            <p className="text-xl text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
              See what teachers and students are saying about EduQuest
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bento-card slide-in-up hover-lift" data-testid="card-testimonial-1">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning dark:text-warning fill-current" />
                  ))}
                </div>
                <p className="text-foreground dark:text-foreground mb-6 leading-relaxed text-lg">
                  "EduQuest has transformed how I manage my classroom. The voice-to-text feature is a game changer!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-secondary/30 dark:from-accent/30 dark:to-secondary/30 rounded-full flex items-center justify-center border border-primary/40 dark:border-accent/40">
                    <span className="text-foreground dark:text-foreground font-bold">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground dark:text-foreground">Sarah Mitchell</p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">High School Teacher</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bento-card slide-in-up hover-lift" style={{ animationDelay: '0.1s' }} data-testid="card-testimonial-2">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning dark:text-warning fill-current" />
                  ))}
                </div>
                <p className="text-foreground dark:text-foreground mb-6 leading-relaxed text-lg">
                  "The AI grading system saves me hours every week. Highly recommended for busy educators."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-success/30 to-primary/30 dark:from-success/30 dark:to-accent/30 rounded-full flex items-center justify-center border border-success/40 dark:border-success/40">
                    <span className="text-foreground dark:text-foreground font-bold">JC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground dark:text-foreground">James Chen</p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">University Professor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bento-card slide-in-up hover-lift" style={{ animationDelay: '0.2s' }} data-testid="card-testimonial-3">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning dark:text-warning fill-current" />
                  ))}
                </div>
                <p className="text-foreground dark:text-foreground mb-6 leading-relaxed text-lg">
                  "As a student, I love how easy it is to submit assignments and track my progress in real-time."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/30 to-secondary/30 dark:from-primary/30 dark:to-secondary/30 rounded-full flex items-center justify-center border border-accent/40 dark:border-primary/40">
                    <span className="text-foreground dark:text-foreground font-bold">EP</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground dark:text-foreground">Emma Peterson</p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">College Student</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
