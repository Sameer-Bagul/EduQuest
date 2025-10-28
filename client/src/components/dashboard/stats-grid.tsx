import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCard {
  value: string | number;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

interface StatsGridProps {
  stats: StatCard[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="glass-card hover-lift border-primary/20 dark:border-accent/20"
          data-testid={`stat-card-${index}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-accent dark:to-secondary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">{stat.label}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-accent/20 dark:to-secondary/20 rounded-xl flex items-center justify-center border border-primary/30 dark:border-accent/30">
                <stat.icon className="w-6 h-6 text-primary dark:text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
