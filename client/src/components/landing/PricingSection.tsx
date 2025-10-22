import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingSectionProps {
  setLocation: (path: string) => void;
}

export function PricingSection({ setLocation }: PricingSectionProps) {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: [
        "Up to 5 assignments",
        "Basic voice-to-text",
        "Community support",
        "Limited analytics"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      features: [
        "Unlimited assignments",
        "Advanced AI grading",
        "Real-time collaboration",
        "Full analytics dashboard",
        "Priority support"
      ],
      buttonText: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "/month",
      features: [
        "Everything in Pro",
        "Secure proctoring",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="full-section relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,2,112,0.05),transparent_60%)]" />
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. All plans include our core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`bento-card slide-in-up ${plan.popular ? 'border-primary/50 shadow-xl' : ''}`} 
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`card-pricing-${plan.name.toLowerCase()}`}
              >
                <CardHeader className="text-center pb-4">
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full mb-4 inline-block">
                      Most Popular
                    </div>
                  )}
                  <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-foreground mt-4">
                    {plan.price}
                    <span className="text-lg text-muted-foreground font-normal">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${plan.popular ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90' : 'btn-minimal'}`}
                    onClick={() => setLocation(plan.name === 'Enterprise' ? '/contact' : '/register')}
                    data-testid={`button-pricing-${plan.name.toLowerCase()}`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}