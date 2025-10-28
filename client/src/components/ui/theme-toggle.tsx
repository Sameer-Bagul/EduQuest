import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="glass-effect hover-lift transition-all duration-300 relative overflow-hidden group"
      data-testid="button-theme-toggle"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-warning dark:text-warning" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary dark:text-accent" />
      <div className="absolute inset-0 bg-gradient-to-r from-warning/20 to-primary/20 dark:from-primary/20 dark:to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
