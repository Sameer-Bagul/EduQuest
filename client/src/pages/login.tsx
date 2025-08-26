import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="text-white text-2xl w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Digital Assignment Platform
          </h2>
          <p className="text-gray-600">
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <Card className="shadow-lg">
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
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                data-testid="button-toggle-auth-mode"
              >
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}