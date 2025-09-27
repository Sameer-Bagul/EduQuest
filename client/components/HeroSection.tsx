import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { BookOpen, Users, ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  const [, setLocation] = useLocation();

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Floating elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <BookOpen className="w-16 h-16 text-blue-400 floating" />
      </div>
      <div className="absolute top-32 right-16 opacity-20">
        <Users className="w-20 h-20 text-purple-400 floating" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute bottom-20 left-1/4 opacity-20">
        <Sparkles className="w-12 h-12 text-orange-400 floating" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="inline-block mb-8">
          <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
            ✨ Transform Your Learning Experience
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 text-gray-900 dark:text-white leading-tight">
          Digital Assignments
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500">
            Made Amazing
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
          Experience voice-powered assignments with AI evaluation, real-time proctoring, and beautiful analytics. 
          Perfect for educators and students who want to make learning engaging and effective.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Button 
            size="lg" 
            onClick={() => setLocation('/register')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-heading shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 group"
            data-testid="button-hero-getstarted"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setLocation('/login')}
            className="px-8 py-4 text-lg font-heading border-2 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
            data-testid="button-hero-signin"
          >
            Sign In
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Happy Students</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">500+</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Educators</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">50K+</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Assignments Completed</div>
          </div>
        </div>
      </div>
    </section>
  );
}