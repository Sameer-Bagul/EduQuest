import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  Wallet, 
  Plus, 
  History, 
  CreditCard,
  IndianRupee,
  DollarSign,
  Calendar,
  TrendingUp,
  Download
} from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { SaasLayout } from "@/components/layouts/saas-layout";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthContext();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [buyTokensOpen, setBuyTokensOpen] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<number>(10);

  // Fetch wallet data
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['/api/wallet'],
    queryFn: () => api.getWallet(),
    enabled: isAuthenticated
  });

  // Fetch transaction history
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions/history'],
    queryFn: () => api.getTransactionHistory(),
    enabled: isAuthenticated
  });

  // Fetch payment history
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/payments/history'],
    queryFn: () => api.getPaymentHistory(),
    enabled: isAuthenticated
  });

  // Token purchase mutation
  const purchaseTokensMutation = useMutation({
    mutationFn: (tokens: number) => api.createTokenPurchaseOrder(tokens),
    onSuccess: (orderData) => {
      handleRazorpayPayment(orderData);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment order",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [isAuthenticated, user, setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        // Refresh user data
        window.location.reload();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to change password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyTokens = () => {
    purchaseTokensMutation.mutate(selectedTokens);
  };

  const handleRazorpayPayment = (orderData: any) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "EduQuest",
      description: `Purchase ${orderData.tokens} E-paper Tokens`,
      order_id: orderData.orderId,
      handler: async (response: any) => {
        try {
          await api.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          
          toast({
            title: "Success",
            description: `${orderData.tokens} tokens added to your wallet!`,
          });
          
          // Refresh wallet and transaction data
          queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
          queryClient.invalidateQueries({ queryKey: ['/api/transactions/history'] });
          queryClient.invalidateQueries({ queryKey: ['/api/payments/history'] });
          
          setBuyTokensOpen(false);
        } catch (error: any) {
          toast({
            title: "Payment Error",
            description: error.message || "Payment verification failed",
            variant: "destructive"
          });
        }
      },
      modal: {
        ondismiss: () => {
          toast({
            title: "Payment Cancelled",
            description: "You can try again anytime",
            variant: "destructive"
          });
        }
      },
      theme: {
        color: "#2563eb"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'INR') {
      return `₹${amount.toFixed(2)}`;
    } else {
      return `$${amount.toFixed(2)}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGoBack = () => {
    if (user?.role === 'teacher') {
      setLocation('/teacher-dashboard');
    } else {
      setLocation('/student-dashboard');
    }
  };

  const getTokenPackagePrice = (tokens: number) => {
    const currency = user?.currency || 'USD';
    const basePrice = currency === 'INR' ? 2 : 0.023;
    return tokens * basePrice;
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SaasLayout>
      <div className="p-8 gradient-purple min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 slide-in-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Account Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-lg">Manage your profile, wallet, and account settings</p>
          </div>
        <Tabs defaultValue="wallet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wallet" data-testid="tab-wallet">
              <Wallet className="w-4 h-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">
              <History className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="payments" data-testid="tab-payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wallet Balance Card */}
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Wallet className="w-5 h-5 mr-2" />
                    E-paper Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2" data-testid="text-token-balance">
                    {walletLoading ? '...' : wallet?.balance || 0}
                  </div>
                  <p className="text-blue-100 text-sm">
                    Available tokens for assignments
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    1 token = 4 questions
                  </p>
                </CardContent>
              </Card>

              {/* Currency Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {user.currency === 'INR' ? <IndianRupee className="w-5 h-5 mr-2" /> : <DollarSign className="w-5 h-5 mr-2" />}
                    Token Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Price per token:</span>
                    <span className="font-semibold">
                      {user.currency === 'INR' ? '₹2.00' : '$0.023'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your currency:</span>
                    <Badge variant="outline">{user.currency || 'USD'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Country:</span>
                    <span>{user.country || 'Unknown'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Buy Tokens Section */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Tokens</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Buy E-paper Tokens to access assignments
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[10, 25, 50, 100].map((tokens) => (
                    <Card 
                      key={tokens} 
                      className={`cursor-pointer transition-colors ${
                        selectedTokens === tokens ? 'ring-2 ring-blue-500' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedTokens(tokens)}
                      data-testid={`card-token-package-${tokens}`}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{tokens}</div>
                        <div className="text-sm text-muted-foreground">tokens</div>
                        <div className="text-lg font-semibold mt-1">
                          {formatCurrency(getTokenPackagePrice(tokens), user.currency || 'USD')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Dialog open={buyTokensOpen} onOpenChange={setBuyTokensOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4" size="lg" data-testid="button-buy-tokens">
                      <Plus className="w-4 h-4 mr-2" />
                      Buy {selectedTokens} Tokens for {formatCurrency(getTokenPackagePrice(selectedTokens), user.currency || 'USD')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Token Purchase</DialogTitle>
                      <DialogDescription>
                        You're about to purchase {selectedTokens} E-paper Tokens for {formatCurrency(getTokenPackagePrice(selectedTokens), user.currency || 'USD')}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex justify-between p-4 bg-muted rounded-lg">
                        <span>Tokens:</span>
                        <span className="font-semibold">{selectedTokens}</span>
                      </div>
                      <div className="flex justify-between p-4 bg-muted rounded-lg">
                        <span>Total Amount:</span>
                        <span className="font-semibold">{formatCurrency(getTokenPackagePrice(selectedTokens), user.currency || 'USD')}</span>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBuyTokensOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleBuyTokens} 
                        disabled={purchaseTokensMutation.isPending}
                        data-testid="button-confirm-purchase"
                      >
                        {purchaseTokensMutation.isPending ? 'Processing...' : 'Proceed to Payment'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Transaction History
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  All token purchases and deductions
                </p>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8">Loading transactions...</div>
                ) : transactions && transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Tokens</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Balance After</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction: any) => (
                        <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                          <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'purchase' ? 'default' : 'secondary'}>
                              {transaction.type === 'purchase' ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                              )}
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {transaction.description}
                          </TableCell>
                          <TableCell className={transaction.type === 'purchase' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'purchase' ? '+' : '-'}{transaction.tokens}
                          </TableCell>
                          <TableCell>
                            {transaction.amount && transaction.currency ? 
                              formatCurrency(transaction.amount, transaction.currency) : 
                              '-'
                            }
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.balanceAfter}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment History
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  All payment orders and receipts
                </p>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-8">Loading payments...</div>
                ) : payments && payments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Tokens</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment: any) => (
                        <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                          <TableCell>{formatDate(payment.createdAt)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.currency}</Badge>
                          </TableCell>
                          <TableCell>{payment.tokens}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                payment.status === 'paid' ? 'default' : 
                                payment.status === 'failed' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.status === 'paid' && (
                              <Button variant="ghost" size="sm" data-testid={`button-download-receipt-${payment.id}`}>
                                <Download className="w-4 h-4 mr-1" />
                                Receipt
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No payments found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={avatarPreview || `/api/auth/avatar/${user.id}`} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-2xl">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Camera className="w-4 h-4" />
                          <span>Change Photo</span>
                        </div>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          data-testid="input-avatar"
                        />
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        data-testid="input-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        data-testid="input-email"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                      data-testid="button-save-profile"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Enter current password"
                        data-testid="input-current-password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        data-testid="input-new-password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        data-testid="input-confirm-password"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                      data-testid="button-change-password"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {isLoading ? 'Updating...' : 'Change Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Account Information */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded" data-testid="text-user-id">
                      {user.id}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                    <p className="text-sm capitalize bg-muted p-2 rounded" data-testid="text-user-role">
                      {user.role}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Currency</Label>
                    <p className="text-sm bg-muted p-2 rounded" data-testid="text-user-currency">
                      {user.currency || 'USD'} ({user.country || 'Unknown'})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </SaasLayout>
  );
}