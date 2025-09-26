import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen } from "lucide-react";

interface RegisterFormProps {
  onSubmit: (data: { name: string; email: string; password: string; role: 'teacher' | 'student' }) => void;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'teacher' | 'student' | ''>('');
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    role?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { 
      name?: string; 
      email?: string; 
      password?: string; 
      role?: string;
    } = {};
    
    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!role) {
      newErrors.role = "Please select a role";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit({ name, email, password, role: role as 'teacher' | 'student' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="register-name" className="block text-sm font-heading font-semibold text-gray-800 dark:text-gray-200">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 dark:border-orange-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 font-body"
            data-testid="input-register-name"
          />
        </div>
        {errors.name && (
          <div className="flex items-center space-x-2 text-red-500">
            <p className="text-sm font-body" data-testid="error-register-name">
              {errors.name}
            </p>
            <div className="font-handwriting text-xs">Let's try again! 😊</div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="register-email" className="block text-sm font-heading font-semibold text-gray-800 dark:text-gray-200">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 dark:border-blue-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-body"
            data-testid="input-register-email"
          />
        </div>
        {errors.email && (
          <div className="flex items-center space-x-2 text-red-500">
            <p className="text-sm font-body" data-testid="error-register-email">
              {errors.email}
            </p>
            <div className="font-handwriting text-xs">Check that email! 📧</div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="register-password" className="block text-sm font-heading font-semibold text-gray-800 dark:text-gray-200">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="w-full pl-12 pr-12 py-3 border-2 border-purple-200 dark:border-purple-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 font-body"
            data-testid="input-register-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <div className="flex items-center space-x-2 text-red-500">
            <p className="text-sm font-body" data-testid="error-register-password">
              {errors.password}
            </p>
            <div className="font-handwriting text-xs">Make it strong! 💪</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-heading font-semibold text-gray-800 dark:text-gray-200">
          I am a...
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
            role === 'teacher' 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105' 
              : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
          }`}>
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={role === 'teacher'}
              onChange={(e) => setRole(e.target.value as 'teacher')}
              className="sr-only"
              data-testid="radio-register-teacher"
            />
            <div className="flex flex-col items-center space-y-2 w-full">
              <GraduationCap className={`w-8 h-8 ${role === 'teacher' ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className={`text-sm font-heading font-semibold ${role === 'teacher' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                Teacher
              </span>
              <div className="font-handwriting text-xs text-gray-500">Inspire & guide!</div>
            </div>
          </label>
          
          <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
            role === 'student' 
              ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 shadow-lg scale-105' 
              : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
          }`}>
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === 'student'}
              onChange={(e) => setRole(e.target.value as 'student')}
              className="sr-only"
              data-testid="radio-register-student"
            />
            <div className="flex flex-col items-center space-y-2 w-full">
              <BookOpen className={`w-8 h-8 ${role === 'student' ? 'text-purple-500' : 'text-gray-400'}`} />
              <span className={`text-sm font-heading font-semibold ${role === 'student' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                Student
              </span>
              <div className="font-handwriting text-xs text-gray-500">Learn & grow!</div>
            </div>
          </label>
        </div>
        {errors.role && (
          <div className="flex items-center justify-center space-x-2 text-red-500">
            <p className="text-sm font-body" data-testid="error-register-role">
              {errors.role}
            </p>
            <div className="font-handwriting text-xs">Choose your path! ✨</div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-heading text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          disabled={isLoading}
          data-testid="button-register-submit"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            'Join the Adventure! 🌟'
          )}
        </Button>
      </div>
    </form>
  );
}