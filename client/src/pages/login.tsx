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
    <div className="min-h-screen bg-background">
      {/* Header with Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Hero Content */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-lg text-center lg:text-left">
            {/* Logo & Brand */}
            <div className="flex items-center justify-center lg:justify-start mb-12">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-primary-foreground w-6 h-6" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-foreground">
                  EduQuest
                </h1>
                <p className="text-muted-foreground text-sm">
                  Digital Learning Platform
                </p>
              </div>
            </div>

            {/* Hero Text */}
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              Transform Your Learning Experience
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Create, submit, and grade assignments with voice technology and AI-powered insights.
            </p>

            {/* Simple Feature List */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-foreground">Smart Assignment Creation</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-foreground">Real-time Collaboration</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-foreground">AI-Powered Grading</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-muted/30">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-muted-foreground">
                {isRegister ? 'Start your learning journey today' : 'Sign in to continue'}
              </p>
            </div>

            <Card className="clean-card">
              <CardContent className="p-6">
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
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                    data-testid="button-toggle-auth-mode"
                  >
                    {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}