import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Sparkles, BookOpen, Users } from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Footer } from "@/components/ui/footer";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, login, register, isLoggingIn, isRegistering } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'teacher') {
        setLocation('/teacher-dashboard');
      } else {
        setLocation('/student-dashboard');
      }
    }
  }, [isAuthenticated, user, setLocation]);

  const handleLoginSubmit = (data: { email: string; password: string }) => {
    login(data);
  };

  const handleRegisterSubmit = (data: { name: string; email: string; password: string; role: 'teacher' | 'student' }) => {
    register(data);
  };

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 floating">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 backdrop-blur-sm"></div>
      </div>
      <div className="absolute top-40 right-20 floating-delayed">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/20 backdrop-blur-sm"></div>
      </div>
      <div className="absolute bottom-40 left-1/4 floating">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-teal-400/20 to-green-400/20 backdrop-blur-sm"></div>
      </div>

      {/* Header with Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Hero Content */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="max-w-2xl text-center lg:text-left fade-in">
            {/* Logo & Brand */}
            <div className="flex items-center justify-center lg:justify-start mb-8">
              <div className="relative">
                <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center shadow-xl pulse-glow">
                  <GraduationCap className="text-white text-3xl w-10 h-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gradient">
                  EduQuest
                </h1>
                <p className="text-secondary-gradient text-lg font-medium">
                  Digital Learning Platform
                </p>
              </div>
            </div>

            {/* Hero Text */}
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Transform Your 
              <span className="text-gradient block">Learning Experience</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of educators and students in our revolutionary platform. 
              Create, submit, and grade assignments with cutting-edge voice technology 
              and AI-powered insights.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
              <div className="glass-card px-4 py-2 flex items-center gap-2 hover-lift">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Smart Assignments</span>
              </div>
              <div className="glass-card px-4 py-2 flex items-center gap-2 hover-lift">
                <Users className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Collaboration</span>
              </div>
              <div className="glass-card px-4 py-2 flex items-center gap-2 hover-lift">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="max-w-md w-full space-y-8 fade-in stagger-2">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {isRegister ? 'Join the Revolution' : 'Welcome Back'}
              </h3>
              <p className="text-muted-foreground">
                {isRegister ? 'Create your account and start your journey' : 'Sign in to continue your learning'}
              </p>
            </div>

            <Card className="glass-card shadow-xl border-0 card-hover">
              <CardContent className="p-8">
                {!isRegister ? (
                  <LoginForm 
                    onSubmit={handleLoginSubmit} 
                    isLoading={isLoggingIn}
                  />
                ) : (
                  <RegisterForm 
                    onSubmit={handleRegisterSubmit} 
                    isLoading={isRegistering}
                  />
                )}

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-gradient hover:opacity-80 text-sm font-medium transition-opacity duration-200"
                    data-testid="button-toggle-auth-mode"
                  >
                    {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Secure & Private
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  GDPR Compliant
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}