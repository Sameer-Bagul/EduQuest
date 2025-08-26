import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RegisterFormProps {
  onSubmit: (data: { name: string; email: string; password: string; role: 'teacher' | 'student' }) => void;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          id="register-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          data-testid="input-register-name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600" data-testid="error-register-name">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          data-testid="input-register-email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" data-testid="error-register-email">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          data-testid="input-register-password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600" data-testid="error-register-password">
            {errors.password}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Register As
        </label>
        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={role === 'teacher'}
              onChange={(e) => setRole(e.target.value as 'teacher')}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              data-testid="radio-register-teacher"
            />
            <span className="text-sm text-gray-700">Teacher</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === 'student'}
              onChange={(e) => setRole(e.target.value as 'student')}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              data-testid="radio-register-student"
            />
            <span className="text-sm text-gray-700">Student</span>
          </label>
        </div>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600" data-testid="error-register-role">
            {errors.role}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={isLoading}
        data-testid="button-register-submit"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}