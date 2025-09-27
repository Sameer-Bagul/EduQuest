import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { GraduationCap, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";

export function NavigationHeader() {
  const [, setLocation] = useLocation();

  return (
    <header className="border-b border-white/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <div className="flex items-center group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                EduQuest
              </h1>
              <p className="text-sm font-handwriting text-orange-500 -mt-1">
                Where Learning Comes Alive! ✨
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/login')}
              className="font-heading hover:text-blue-600 transition-colors"
              data-testid="button-signin"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => setLocation('/register')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-heading shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              data-testid="button-getstarted"
            >
              Get Started
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}