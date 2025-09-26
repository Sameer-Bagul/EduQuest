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
  Palette,
  Brain,
  Trophy,
  Heart,
  Zap,
  Globe
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Footer } from "@/components/ui/footer";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Navigation Header */}
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
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setLocation('/register')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-heading shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Get Started
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <BookOpen className="w-16 h-16 text-blue-400 floating" />
        </div>
        <div className="absolute top-32 right-16 opacity-20">
          <Palette className="w-20 h-20 text-purple-400 floating" style={{animationDelay: '1s'}} />
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-20">
          <Brain className="w-12 h-12 text-orange-400 floating" style={{animationDelay: '2s'}} />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 px-6 py-2 text-base font-heading shadow-lg animate-bounce-in">
            🚀 Now Available for Educational Institutions
          </Badge>
          
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold mb-4 leading-tight animate-fade-in">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500">
                Transform Your
              </span>
              <br />
              <span className="relative">
                Learning Experience
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60"></div>
              </span>
            </h1>
            
            <div className="font-handwriting text-3xl text-orange-500 mb-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
              "Making assignments fun again!" ✍️
            </div>
          </div>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-body animate-fade-in" style={{animationDelay: '0.6s'}}>
            Create, submit, and grade assignments with cutting-edge voice technology, 
            AI-powered insights, and real-time proctoring features. Join the future of education today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-fade-in" style={{animationDelay: '0.9s'}}>
            <Button 
              size="lg" 
              onClick={() => setLocation('/register')} 
              className="h-14 px-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-heading text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 px-10 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-heading text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Globe className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto animate-slide-up" style={{animationDelay: '1.2s'}}>
            <div className="text-center group hover-lift">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300 transform group-hover:scale-110">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl text-gray-800 dark:text-white mb-3">Smart Assignments</h3>
              <p className="text-gray-600 dark:text-gray-300 font-body">Create interactive assignments with voice-to-text capabilities and AI assistance</p>
              <div className="font-handwriting text-orange-500 text-sm mt-2">So easy! 📝</div>
            </div>
            
            <div className="text-center group hover-lift">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-purple-500/25 transition-all duration-300 transform group-hover:scale-110">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl text-gray-800 dark:text-white mb-3">Real-time Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-300 font-body">Connect teachers and students seamlessly in a digital learning environment</p>
              <div className="font-handwriting text-purple-500 text-sm mt-2">Connect & Learn! 🤝</div>
            </div>
            
            <div className="text-center group hover-lift">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-orange-500/25 transition-all duration-300 transform group-hover:scale-110">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl text-gray-800 dark:text-white mb-3">AI-Powered Grading</h3>
              <p className="text-gray-600 dark:text-gray-300 font-body">Automatic evaluation with intelligent insights and personalized feedback</p>
              <div className="font-handwriting text-orange-500 text-sm mt-2">Smart grading! 🧠</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/60 dark:bg-gray-800/30 backdrop-blur-sm relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-orange-100/20 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-orange-900/10"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="font-handwriting text-2xl text-purple-500 mb-4 animate-fade-in">
              Check out these amazing features! ✨
            </div>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 animate-fade-in">
              Everything You Need for Modern Education
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-body animate-fade-in">
              Comprehensive tools designed for the digital classroom of tomorrow
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 animate-fade-in">
              <div className="group hover-lift bg-white/80 dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-gray-800 dark:text-white mb-3">Secure Proctoring</h3>
                    <p className="text-gray-600 dark:text-gray-300 font-body leading-relaxed">Advanced proctoring features ensure academic integrity with real-time monitoring and smart detection</p>
                    <div className="font-handwriting text-blue-500 text-sm mt-2">Keep it fair! 🔒</div>
                  </div>
                </div>
              </div>
              
              <div className="group hover-lift bg-white/80 dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-gray-800 dark:text-white mb-3">Analytics Dashboard</h3>
                    <p className="text-gray-600 dark:text-gray-300 font-body leading-relaxed">Comprehensive insights into student performance and learning patterns with beautiful visualizations</p>
                    <div className="font-handwriting text-purple-500 text-sm mt-2">Data made pretty! 📊</div>
                  </div>
                </div>
              </div>
              
              <div className="group hover-lift bg-white/80 dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-orange-100 dark:border-orange-800">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-gray-800 dark:text-white mb-3">Auto-Save & Recovery</h3>
                    <p className="text-gray-600 dark:text-gray-300 font-body leading-relaxed">Never lose progress with automatic saving and intelligent session recovery technology</p>
                    <div className="font-handwriting text-orange-500 text-sm mt-2">No stress, no mess! ⚡</div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="hover-lift bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900 border-2 border-blue-200 dark:border-purple-700 shadow-2xl animate-bounce-in">
              <CardContent className="p-10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-gray-800 dark:text-white mb-4">Join 1000+ Educators</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 font-body text-lg">Trusted by educational institutions worldwide</p>
                  <div className="flex justify-center space-x-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-7 h-7 text-yellow-400 fill-current drop-shadow-md" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-heading font-semibold">4.9/5 from 500+ reviews</p>
                  <div className="font-handwriting text-purple-500 text-lg mt-4">We're loved! 💜</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-16 w-32 h-32 bg-white/5 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="font-handwriting text-3xl text-white/90 mb-6 animate-fade-in">
            Join the educational revolution! 🌟
          </div>
          <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6 animate-fade-in leading-tight">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-white/90 mb-12 font-body max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Join thousands of educators using EduQuest to enhance their teaching experience and make learning more engaging for students worldwide
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10 animate-bounce-in">
            <Button 
              size="lg" 
              onClick={() => setLocation('/register')} 
              className="h-14 px-10 bg-white text-blue-600 hover:bg-gray-100 font-heading text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setLocation('/login')} 
              className="h-14 px-10 border-2 border-white text-white hover:bg-white hover:text-purple-600 font-heading text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Users className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto animate-fade-in">
            <p className="text-white/80 font-body">
              ✨ No credit card required • 🎯 14-day free trial • 🚀 Cancel anytime
            </p>
            <div className="font-handwriting text-white text-lg mt-2">
              What are you waiting for? 😊
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}