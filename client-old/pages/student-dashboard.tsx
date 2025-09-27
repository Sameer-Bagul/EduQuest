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
  DollarSign,
  BookOpen,
  Trophy,
  TrendingUp,
  Sparkles,
  Heart,
  Code,
  Target,
  Zap
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 opacity-5">
          <BookOpen className="w-32 h-32 text-blue-400 floating" />
        </div>
        <div className="absolute bottom-32 right-16 opacity-5">
          <Trophy className="w-28 h-28 text-purple-400 floating" style={{animationDelay: '1s'}} />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-5">
          <Target className="w-24 h-24 text-orange-400 floating" style={{animationDelay: '2s'}} />
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-white/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-lg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Student Portal
                </h1>
                <p className="text-xs font-handwriting text-orange-500 -mt-1">
                  Your learning adventure! ✨
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => setLocation('/profile')}>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-heading font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-heading font-semibold text-gray-800 dark:text-white">{user?.name}</span>
                  <div className="font-handwriting text-xs text-blue-500 -mt-1">Awesome learner! 🌟</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Token Balance Display */}
                <div 
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-xl cursor-pointer hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-800/50 dark:hover:to-purple-800/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                  onClick={() => setLocation('/profile?tab=wallet')}
                  title="View wallet"
                  data-testid="wallet-balance-display"
                >
                  <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-heading font-bold text-blue-700 dark:text-blue-300">
                    {walletLoading ? '...' : `${stats.tokenBalance} tokens`}
                  </span>
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none shadow-lg">
                  Student
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/profile')}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors hover:scale-110"
                  title="Profile Settings"
                  data-testid="button-profile"
                >
                  <User className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors hover:scale-110"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce-in">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 mb-4">
            Welcome back, {user?.name}! 
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 font-body mb-2">
            Ready to tackle your next assignment?
          </p>
          <div className="font-handwriting text-2xl text-blue-500">
            Let's learn something amazing today! 🚀
          </div>
        </div>

        {/* Low Balance Warning */}
        {!walletLoading && stats.tokenBalance < 10 && (
          <Alert className="mb-8 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 shadow-lg animate-pulse" data-testid="alert-low-balance">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-heading font-semibold">Low token balance! </span>
                  <span className="font-body">You have {stats.tokenBalance} tokens. Most assignments require 10+ tokens.</span>
                  <div className="font-handwriting text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Time to refuel! ⛽
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setLocation('/profile?tab=wallet')}
                  className="ml-4 border-orange-400 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-900/30 font-heading shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  data-testid="button-buy-tokens-warning"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buy Tokens
                  <Zap className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Join Assignment Section */}
        <Card className="mb-10 edu-card shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-100 dark:border-purple-700 animate-slide-up">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold text-gray-800 dark:text-white mb-1">Join Assignment</h3>
                <div className="font-handwriting text-blue-500">Enter the magic code! ✨</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={assignmentCode}
                  onChange={(e) => setAssignmentCode(e.target.value)}
                  placeholder="Enter assignment code (e.g., 123456)"
                  className="pl-12 pr-4 py-4 border-2 border-blue-200 dark:border-purple-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-body text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinAssignment()}
                />
                <Code className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
              </div>
              <Button
                onClick={handleJoinAssignment}
                className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-heading text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 whitespace-nowrap"
              >
                <Plus className="w-5 h-5 mr-2" />
                Join Adventure
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="hover-lift bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 border-2 border-blue-200 dark:border-blue-700 shadow-xl animate-bounce-in">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-heading font-semibold text-blue-600 dark:text-blue-400 mb-2">E-paper Tokens</p>
                  <p className="text-4xl font-heading font-bold text-blue-700 dark:text-blue-300 mb-2">{stats.tokenBalance}</p>
                  <div className="font-handwriting text-blue-500 text-sm">Fuel for learning! ⛽</div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Wallet className="text-white w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/50 dark:to-emerald-800/50 border-2 border-green-200 dark:border-green-700 shadow-xl animate-bounce-in" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-heading font-semibold text-green-600 dark:text-green-400 mb-2">Completed</p>
                  <p className="text-4xl font-heading font-bold text-green-700 dark:text-green-300 mb-2">{stats.completed}</p>
                  <div className="font-handwriting text-green-500 text-sm">Great progress! 🎯</div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="text-white w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/50 dark:to-yellow-800/50 border-2 border-orange-200 dark:border-orange-700 shadow-xl animate-bounce-in" style={{animationDelay: '0.4s'}}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-heading font-semibold text-orange-600 dark:text-orange-400 mb-2">Average Score</p>
                  <p className="text-4xl font-heading font-bold text-orange-700 dark:text-orange-300 mb-2">{stats.averageScore}%</p>
                  <div className="font-handwriting text-orange-500 text-sm">You're awesome! 🌟</div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Trophy className="text-white w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <Card className="edu-card shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-purple-100 dark:border-blue-700 animate-slide-up">
          <div className="px-8 py-6 border-b border-purple-100 dark:border-blue-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold text-gray-800 dark:text-white">My Assignments</h3>
                <div className="font-handwriting text-purple-500 text-sm -mt-1">Your learning journey! 📚</div>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="p-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-spin">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-heading font-semibold text-gray-700 dark:text-gray-300">Loading assignments...</div>
                <div className="font-handwriting text-blue-500 mt-2">Hold tight! ⏳</div>
              </div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-xl font-heading font-bold text-gray-600 dark:text-gray-400 mb-2">
                  No assignments completed yet
                </h4>
                <p className="text-gray-500 dark:text-gray-500 font-body mb-4">
                  Join an assignment using the code above to start your learning journey!
                </p>
                <div className="font-handwriting text-lg text-blue-500">
                  Your first adventure awaits! 🚀
                </div>
              </div>
            </div>
          ) : (
            <div>
              {submissions.map((submission: any, index: number) => (
                <div key={submission.id} className="p-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-heading font-bold text-gray-800 dark:text-white mb-1">
                            {submission.assignmentTitle || `Assignment ${submission.id.slice(0, 8)}`}
                          </h4>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none shadow-lg">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                          <span className="font-heading font-semibold text-blue-600 dark:text-blue-400 text-sm">Submitted</span>
                          <p className="text-blue-800 dark:text-blue-200 font-body font-medium mt-1">
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                          <span className="font-heading font-semibold text-green-600 dark:text-green-400 text-sm">Score</span>
                          <p className="text-green-800 dark:text-green-200 font-heading font-bold text-lg mt-1">
                            {Math.round(submission.totalAwarded * 100)}%
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                          <span className="font-heading font-semibold text-purple-600 dark:text-purple-400 text-sm">Questions</span>
                          <p className="text-purple-800 dark:text-purple-200 font-body font-medium mt-1">
                            {submission.answers.length}
                          </p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                          <span className="font-heading font-semibold text-orange-600 dark:text-orange-400 text-sm">Assignment ID</span>
                          <p className="text-orange-800 dark:text-orange-200 font-body font-medium mt-1">
                            {submission.assignmentId.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-8 flex items-center space-x-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/30 font-heading shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 font-handwriting text-green-500 text-sm">
                    Great work on this one! 🎉
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
