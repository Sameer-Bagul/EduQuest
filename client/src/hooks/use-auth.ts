import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const loginSuccessShown = useRef(false);
  const registerSuccessShown = useRef(false);

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (response.status === 401) {
          return null;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        return response.json();
      } catch (err) {
        return null;
      }
    }
  });

  // Show success toasts when authentication is confirmed
  useEffect(() => {
    if (user?.user && !isLoading) {
      // Check if this is a result of a recent login/register
      const isRecentLogin = loginSuccessShown.current === false;
      const isRecentRegister = registerSuccessShown.current === false;

      if (isRecentLogin) {
        loginSuccessShown.current = true;
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else if (isRecentRegister) {
        registerSuccessShown.current = true;
        toast({
          title: "Success",
          description: "Account created successfully",
        });
      }
    }
  }, [user, isLoading, toast]);

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: async () => {
      // Reset the flag to allow showing success toast
      loginSuccessShown.current = false;
      // Invalidate and refetch the user query to verify authentication worked
      await refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: api.register,
    onSuccess: async () => {
      // Reset the flag to allow showing success toast
      registerSuccessShown.current = false;
      // Invalidate and refetch the user query to verify authentication worked
      await refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      // Reset flags for next login/register
      loginSuccessShown.current = false;
      registerSuccessShown.current = false;
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.clear();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    },
    onError: (error: any) => {
      // Even if logout API fails, clear local state
      loginSuccessShown.current = false;
      registerSuccessShown.current = false;
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been logged out",
      });
    },
  });

  return {
    user: (user as any)?.user,
    isLoading,
    isAuthenticated: !!(user as any)?.user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    refetchUser: refetch,
  };
}
