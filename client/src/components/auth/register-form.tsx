import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import type { College } from "@shared/schema";

interface RegisterFormProps {
  onSubmit: (data: { name: string; email: string; password: string; role: 'teacher' | 'student'; collegeId: string }) => void;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'teacher' | 'student' | ''>('');
  const [collegeId, setCollegeId] = useState("");
  const [collegeOpen, setCollegeOpen] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState("");
  
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    role?: string;
    collegeId?: string;
  }>({});

  const { data: colleges = [] } = useQuery<College[]>({
    queryKey: ['/api/colleges', collegeSearch],
    enabled: true,
  });

  const selectedCollege = colleges.find(c => c.id === collegeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { 
      name?: string; 
      email?: string; 
      password?: string; 
      role?: string;
      collegeId?: string;
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

    if (!collegeId) {
      newErrors.collegeId = "Please select your college";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit({ name, email, password, role: role as 'teacher' | 'student', collegeId });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="register-name" className="text-sm font-medium">
          Full Name
        </Label>
        <Input
          id="register-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="h-11"
          data-testid="input-register-name"
        />
        {errors.name && (
          <p className="text-sm text-red-600" data-testid="error-register-name">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john.doe@example.com"
          className="h-11"
          data-testid="input-register-email"
        />
        {errors.email && (
          <p className="text-sm text-red-600" data-testid="error-register-email">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-sm font-medium">
          Password
        </Label>
        <Input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="h-11"
          data-testid="input-register-password"
        />
        {errors.password && (
          <p className="text-sm text-red-600" data-testid="error-register-password">
            {errors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Register As</Label>
        <RadioGroup value={role} onValueChange={(value) => setRole(value as 'teacher' | 'student')} className="flex space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            <RadioGroupItem value="teacher" id="teacher" data-testid="radio-register-teacher" />
            <Label htmlFor="teacher" className="flex items-center gap-2 cursor-pointer font-normal">
              <GraduationCap className="h-4 w-4" />
              Teacher
            </Label>
          </div>
          <div className="flex items-center space-x-2 flex-1">
            <RadioGroupItem value="student" id="student" data-testid="radio-register-student" />
            <Label htmlFor="student" className="flex items-center gap-2 cursor-pointer font-normal">
              <User className="h-4 w-4" />
              Student
            </Label>
          </div>
        </RadioGroup>
        {errors.role && (
          <p className="text-sm text-red-600" data-testid="error-register-role">
            {errors.role}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">College/University</Label>
        <Popover open={collegeOpen} onOpenChange={setCollegeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={collegeOpen}
              className="w-full h-11 justify-between font-normal"
              data-testid="button-select-college"
            >
              {selectedCollege ? (
                <span className="truncate">{selectedCollege.name}</span>
              ) : (
                <span className="text-muted-foreground">Select your college...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput 
                placeholder="Search colleges..." 
                value={collegeSearch}
                onValueChange={setCollegeSearch}
                data-testid="input-search-college"
              />
              <CommandList>
                <CommandEmpty>No college found.</CommandEmpty>
                <CommandGroup>
                  {colleges.map((college) => (
                    <CommandItem
                      key={college.id}
                      value={college.id}
                      onSelect={() => {
                        setCollegeId(college.id);
                        setCollegeOpen(false);
                      }}
                      data-testid={`college-option-${college.id}`}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          collegeId === college.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{college.name}</span>
                        {college.location && (
                          <span className="text-xs text-muted-foreground">
                            {college.location}{college.country ? `, ${college.country}` : ''}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.collegeId && (
          <p className="text-sm text-red-600" data-testid="error-register-college">
            {errors.collegeId}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        disabled={isLoading}
        data-testid="button-register-submit"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}
