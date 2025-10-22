import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/components/ui/auth-provider";
import { SaasLayout } from "@/components/layouts/saas-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Shield,
  Trash2,
  Save,
  KeyRound
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Tab = 'profile' | 'security' | 'notifications' | 'appearance' | 'danger';

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      return apiRequest('PATCH', '/api/user/profile', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (values: z.infer<typeof passwordSchema>) => {
      return apiRequest('PATCH', '/api/user/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', '/api/user/account');
    },
    onSuccess: () => {
      logout();
      setLocation('/');
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(values);
  };

  const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    updatePasswordMutation.mutate(values);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'appearance' as Tab, label: 'Appearance', icon: Palette },
    { id: 'danger' as Tab, label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <SaasLayout>
      <div className="p-8 gradient-purple min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 slide-in-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-muted-foreground text-lg">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="bento-card sticky top-28">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/50 text-foreground font-semibold'
                              : 'hover:bg-accent/30 text-muted-foreground hover:text-foreground'
                          }`}
                          data-testid={`button-tab-${tab.id}`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {activeTab === 'profile' && (
                <Card className="bento-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-primary" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Your name" data-testid="input-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="your@email.com" data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center space-x-4">
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                            className="rounded-xl"
                            data-testid="button-save-profile"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card className="bento-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span>Security Settings</span>
                    </CardTitle>
                    <CardDescription>Manage your password and security preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <KeyRound className="w-5 h-5 mr-2 text-primary" />
                        Change Password
                      </h3>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" placeholder="••••••••" data-testid="input-current-password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" placeholder="••••••••" data-testid="input-new-password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" placeholder="••••••••" data-testid="input-confirm-password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            disabled={updatePasswordMutation.isPending}
                            className="rounded-xl"
                            data-testid="button-update-password"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'notifications' && (
                <Card className="bento-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5 text-primary" />
                      <span>Notification Preferences</span>
                    </CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Notification settings coming soon...</p>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'appearance' && (
                <Card className="bento-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Palette className="w-5 h-5 text-primary" />
                      <span>Appearance</span>
                    </CardTitle>
                    <CardDescription>Customize the look and feel</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Appearance settings coming soon...</p>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'danger' && (
                <Card className="bento-card border-destructive/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-destructive">
                      <Trash2 className="w-5 h-5" />
                      <span>Danger Zone</span>
                    </CardTitle>
                    <CardDescription>Irreversible and destructive actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border-2 border-destructive/20 rounded-xl bg-destructive/5">
                        <h3 className="font-semibold text-foreground mb-2">Delete Account</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              className="rounded-xl"
                              data-testid="button-delete-account"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl" data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteAccountMutation.mutate()}
                                className="rounded-xl bg-destructive hover:bg-destructive/90"
                                data-testid="button-confirm-delete"
                              >
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </SaasLayout>
  );
}
