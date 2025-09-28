import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Star, Palette, Users, Rocket } from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { RegisterForm } from "@/components/auth/register-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthRegisterPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, register, isRegistering } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'teacher') {
        setLocation('/teacher-dashboard');
      } else {
        setLocation('/student-dashboard');
      }
    }
  }, [isAuthenticated, user, setLocation]);

  const handleRegisterSubmit = (data: { name: string; email: string; password: string; role: 'teacher' | 'student' }) => {
    register(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-orange-900 dark:to-purple-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-16 right-20 opacity-10">
        <Star className="w-28 h-28 text-orange-400 floating" />
      </div>
      <div className="absolute bottom-24 left-12 opacity-10">
        <Palette className="w-22 h-22 text-purple-400 floating" style={{animationDelay: '1s'}} />
      </div>
      <div className="absolute top-1/3 right-1/4 opacity-10">
        <Users className="w-18 h-18 text-blue-400 floating" style={{animationDelay: '2s'}} />
      </div>
      
      {/* Header */}
      <header className="border-b border-white/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/')} 
                className="mr-6 font-heading hover:text-orange-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <GraduationCap className="text-white w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600">
                    EduQuest
                  </h1>
                  <p className="text-xs font-handwriting text-blue-500 -mt-1">
                    Let's start your journey! ✨
                  </p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-8 relative z-10">
        <div className="w-full max-w-lg">
          <div className="text-center mb-12 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce-in">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 mb-4">
              Join EduQuest!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-body mb-2">
              Start your amazing learning journey today
            </p>
            <div className="font-handwriting text-xl text-blue-500">
              Adventure awaits! 🚀
            </div>
          </div>

          <Card className="edu-card shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-orange-100 dark:border-purple-700 animate-slide-up">
            <CardContent className="p-8">
              <RegisterForm 
                onSubmit={handleRegisterSubmit} 
                isLoading={isRegistering}
              />

              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-orange-50 to-purple-50 dark:from-gray-700 dark:to-purple-900 rounded-2xl p-6">
                  <p className="text-gray-700 dark:text-gray-300 font-body">
                    Already part of our community?
                  </p>
                  <button
                    type="button"
                    onClick={() => setLocation('/login')}
                    className="mt-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 font-heading font-semibold text-lg transition-all duration-300 hover:scale-105"
                  >
                    Welcome Back! 🎉
                  </button>
                  <div className="font-handwriting text-blue-500 text-sm mt-2">
                    We missed you!
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}