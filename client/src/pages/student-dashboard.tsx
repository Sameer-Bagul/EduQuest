import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  GraduationCap, 
  Plus, 
  CheckCircle, 
  Star, 
  LogOut, 
  ListTodo, 
  User, 
  Wallet, 
  AlertTriangle,
  CreditCard,
  IndianRupee,
  DollarSign
} from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function StudentDashboard() {
  const [assignmentCode, setAssignmentCode] = useState("");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { toast } = useToast();
  const [assignmentPreview, setAssignmentPreview] = useState<any>(null);
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [costData, setCostData] = useState<any>(null);

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else if (user?.role !== 'student') {
      setLocation('/teacher-dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['/api/submissions/student'],
    enabled: isAuthenticated && user?.role === 'student',
  });

  // Fetch wallet data
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['/api/wallet'],
    queryFn: () => api.getWallet(),
    enabled: isAuthenticated && user?.role === 'student'
  });

  const submissions = (submissionsData as any)?.submissions || [];

  // Stats calculation
  const stats = {
    tokenBalance: wallet?.balance || 0,
    completed: submissions.length,
    averageScore: submissions.length > 0 
      ? Math.round(submissions.reduce((acc: number, sub: any) => acc + sub.totalAwarded, 0) / submissions.length * 100)
      : 0,
  };

  const formatCurrency = (amount: number, currency?: string) => {
    const curr = currency || user?.currency || 'USD';
    if (curr === 'INR') {
      return `₹${amount.toFixed(2)}`;
    } else {
      return `$${amount.toFixed(2)}`;
    }
  };

  const getTokenPrice = () => {
    const currency = user?.currency || 'USD';
    return currency === 'INR' ? 2 : 0.023;
  };

  const handleJoinAssignment = async () => {
    if (!assignmentCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an assignment code",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if assignment exists and is valid
      const response = await fetch(`/api/assignments/code/${assignmentCode}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const assignment = await response.json();
        setAssignmentPreview(assignment);
        
        // Fetch cost information
        try {
          const costResponse = await api.getAssignmentCost(assignment.id);
          setCostData(costResponse);
          setShowCostDialog(true);
        } catch (error) {
          // If cost fetch fails, proceed without cost display
          console.warn("Failed to fetch assignment cost:", error);
          setLocation(`/assignment/${assignmentCode}`);
        }
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Invalid assignment code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join assignment",
        variant: "destructive",
      });
    }
  };

  const handleConfirmJoin = () => {
    if (assignmentPreview && costData) {
      // Only check balance if wallet data has loaded successfully
      if (!walletLoading && wallet) {
        const userBalance = wallet.balance;
        if (userBalance < costData.tokensRequired) {
          toast({
            title: "Insufficient Tokens",
            description: `You need ${costData.tokensRequired} tokens but only have ${userBalance}. Please purchase more tokens.`,
            variant: "destructive",
          });
          setShowCostDialog(false);
          setLocation('/profile?tab=wallet');
          return;
        }
      }
      // If wallet is still loading or failed, we proceed anyway and let the backend handle validation
    }
    
    setShowCostDialog(false);
    setLocation(`/assignment/${assignmentCode}`);
  };

  const handleStartAssignment = (code: string) => {
    setLocation(`/assignment/${code}`);
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  if (!isAuthenticated || user?.role !== 'student') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="text-primary-foreground w-5 h-5" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                EduQuest Student Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 cursor-pointer" onClick={() => setLocation('/profile')}>
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-foreground text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">{user?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Token Balance Display */}
                <div 
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-colors"
                  onClick={() => setLocation('/profile?tab=wallet')}
                  title="View wallet"
                  data-testid="wallet-balance-display"
                >
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {walletLoading ? '...' : `${stats.tokenBalance} tokens`}
                  </span>
                </div>
                <Badge variant="secondary">Student</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/profile')}
                  className="text-muted-foreground hover:text-foreground"
                  title="Profile Settings"
                  data-testid="button-profile"
                >
                  <User className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to tackle your next assignment?
          </p>
        </div>

        {/* Low Balance Warning */}
        {!walletLoading && stats.tokenBalance < 10 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50" data-testid="alert-low-balance">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <span>
                  Low token balance! You have {stats.tokenBalance} tokens. 
                  Most assignments require 10+ tokens.
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setLocation('/profile?tab=wallet')}
                  className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
                  data-testid="button-buy-tokens-warning"
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Buy Tokens
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Join Assignment Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Join Assignment</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                value={assignmentCode}
                onChange={(e) => setAssignmentCode(e.target.value)}
                placeholder="Enter assignment code (e.g., 123456)"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinAssignment()}
              />
              <Button
                onClick={handleJoinAssignment}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Join Assignment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-subtle">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500/10 mr-4">
                  <Wallet className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">E-paper Tokens</p>
                  <p className="text-2xl font-bold text-foreground">{stats.tokenBalance}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-subtle">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-success/10 mr-4">
                  <CheckCircle className="text-success w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-subtle">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-warning/10 mr-4">
                  <Star className="text-warning w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-foreground">{stats.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <Card>
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-foreground">My Assignments</h3>
          </div>
          {isLoading ? (
            <div className="p-6">
              <div className="text-center text-muted-foreground">Loading assignments...</div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-6">
              <div className="text-center text-muted-foreground">
                No assignments completed yet. Join an assignment using the code above.
              </div>
            </div>
          ) : (
            <div>
              {submissions.map((submission: any) => (
                <div key={submission.id} className="p-6 border-b last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-medium text-foreground">
                          {submission.assignmentTitle || `Assignment ${submission.id.slice(0, 8)}`}
                        </h4>
                        <Badge variant="outline" className="text-success border-success/20 bg-success/10">
                          Completed
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium text-foreground">Submitted:</span>{' '}
                          <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Score:</span>{' '}
                          <span className="text-success font-semibold">
                            {Math.round(submission.totalAwarded * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Questions:</span>{' '}
                          <span>{submission.answers.length}</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Assignment ID:</span>{' '}
                          <span>{submission.assignmentId.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex items-center space-x-3">
                      <Button variant="outline" size="sm">
                        View Results
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Assignment Cost Preview Dialog */}
        <Dialog open={showCostDialog} onOpenChange={setShowCostDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assignment Cost Preview</DialogTitle>
              <DialogDescription>
                Review the token cost before joining this assignment
              </DialogDescription>
            </DialogHeader>
            
            {assignmentPreview && costData && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">{assignmentPreview.title}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Faculty: {assignmentPreview.facultyName}</p>
                    <p>Subject: {assignmentPreview.subjectName} ({assignmentPreview.subjectCode})</p>
                    <p>Questions: {costData.questionCount}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Tokens Required:</span>
                    <div className="flex items-center">
                      <Wallet className="w-4 h-4 mr-1 text-blue-600" />
                      <span className="font-bold text-blue-700" data-testid="text-tokens-required">{costData.tokensRequired}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Your Balance:</span>
                    <div className="flex items-center">
                      <Wallet className="w-4 h-4 mr-1 text-gray-600" />
                      {walletLoading ? (
                        <span className="font-bold text-gray-500" data-testid="text-user-balance">Loading...</span>
                      ) : wallet ? (
                        <span className={`font-bold ${wallet.balance >= costData.tokensRequired ? 'text-green-600' : 'text-red-600'}`} data-testid="text-user-balance">
                          {wallet.balance}
                        </span>
                      ) : (
                        <span className="font-bold text-red-600" data-testid="text-user-balance">Failed to load</span>
                      )}
                    </div>
                  </div>
                  
                  {costData.formattedCost && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Equivalent Cost:</span>
                      <span className="font-bold" data-testid="text-equivalent-cost">
                        {costData.formattedCost}
                      </span>
                    </div>
                  )}
                  
                  {!walletLoading && wallet && wallet.balance < costData.tokensRequired && (
                    <Alert className="border-red-200 bg-red-50" data-testid="alert-insufficient-balance">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Insufficient balance! You need {costData.tokensRequired - wallet.balance} more tokens.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {!walletLoading && !wallet && (
                    <Alert className="border-yellow-200 bg-yellow-50" data-testid="alert-wallet-error">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        Unable to load wallet data. You can still proceed, but token verification will happen during assignment access.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCostDialog(false)}
                data-testid="button-cancel-join"
              >
                Cancel
              </Button>
              {walletLoading ? (
                <Button 
                  disabled
                  data-testid="button-loading"
                >
                  Loading wallet...
                </Button>
              ) : wallet && wallet.balance < (costData?.tokensRequired || 0) ? (
                <Button 
                  onClick={() => {
                    setShowCostDialog(false);
                    setLocation('/profile?tab=wallet');
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                  data-testid="button-buy-tokens-dialog"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buy Tokens
                </Button>
              ) : (
                <Button 
                  onClick={handleConfirmJoin}
                  data-testid="button-confirm-join"
                >
                  Join Assignment
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
