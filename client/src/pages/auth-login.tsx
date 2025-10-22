import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLoginPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, login, isLoggingIn, isLoading } = useAuthContext();

  useEffect(() => {
    // Only redirect when we have confirmed authentication and user data is loaded
    if (isAuthenticated && user && !isLoading) {
      if (user.role === 'teacher') {
        setLocation('/teacher-dashboard');
      } else {
        setLocation('/student-dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, setLocation]);

  const handleLoginSubmit = (data: { email: string; password: string }) => {
    login(data);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => setLocation('/')} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="text-primary-foreground w-4 h-4" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">EduQuest</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">
              Sign in to your EduQuest account
            </p>
          </div>

          <Card className="clean-card">
            <CardContent className="p-6">
              <LoginForm
                onSubmit={handleLoginSubmit}
                isLoading={isLoggingIn}
              />

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setLocation('/register')}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}