import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  GraduationCap, 
  Plus, 
  CheckCircle, 
  Star, 
  Wallet, 
  AlertTriangle,
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  Calendar,
  Award
} from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { SaasLayout } from "@/components/layouts/saas-layout";

export default function StudentDashboard() {
  const [assignmentCode, setAssignmentCode] = useState("");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthContext();
  const { toast } = useToast();
  const [assignmentPreview, setAssignmentPreview] = useState<any>(null);
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [costData, setCostData] = useState<any>(null);

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

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['/api/wallet'],
    queryFn: () => api.getWallet(),
    enabled: isAuthenticated && user?.role === 'student'
  });

  const submissions = (submissionsData as any)?.submissions || [];

  const stats = {
    tokenBalance: wallet?.balance || 0,
    completed: submissions.length,
    averageScore: submissions.length > 0 
      ? Math.round(submissions.reduce((acc: number, sub: any) => acc + sub.totalAwarded, 0) / submissions.length * 100)
      : 0,
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
      const response = await fetch(`/api/assignments/code/${assignmentCode}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const assignment = await response.json();
        setAssignmentPreview(assignment);
        
        try {
          const costResponse = await api.getAssignmentCost(assignment.id);
          setCostData(costResponse);
          setShowCostDialog(true);
        } catch (error) {
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
    }
    
    setShowCostDialog(false);
    setLocation(`/assignment/${assignmentCode}`);
  };

  if (!isAuthenticated || user?.role !== 'student') {
    return null;
  }

  return (
    <SaasLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="text-gray-900">{user?.name}</span>
            </h1>
            <p className="text-gray-600 text-lg">Ready to continue your learning journey?</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {walletLoading ? '...' : stats.tokenBalance}
                    </div>
                    <div className="text-sm text-gray-600">Token Balance</div>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.averageScore}%</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">7</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Join Assignment & Submissions */}
            <div className="lg:col-span-2">
              {/* Join Assignment */}
              <Card className="bg-white border border-gray-200 shadow-sm mb-8">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-purple-600" />
                    Join New Assignment
                  </CardTitle>
                  <CardDescription className="text-gray-600">Enter the assignment code provided by your teacher</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter assignment code"
                      value={assignmentCode}
                      onChange={(e) => setAssignmentCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinAssignment()}
                      className="h-12 text-lg rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      data-testid="input-assignment-code"
                    />
                    <Button
                      onClick={handleJoinAssignment}
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700 text-white h-12 px-8"
                      data-testid="button-join-assignment"
                    >
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Submissions List */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                        Your Submissions
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-1">Track your assignment history and scores</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
                      <p className="text-gray-600 mb-4">Join an assignment to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((submission: any) => (
                        <Card
                          key={submission.id}
                          className="bg-white border border-gray-200 hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer"
                          onClick={() => setLocation(`/assignment/${submission.assignment.code}`)}
                          data-testid={`card-submission-${submission.id}`}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                      {submission.assignment.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-2xl font-bold text-purple-600">
                                      {Math.round(submission.totalAwarded * 100)}%
                                    </div>
                                    <div className="flex items-center text-orange-600 mt-1">
                                      <Star className="w-4 h-4 fill-current mr-1" />
                                      <span className="text-sm font-medium">
                                        {submission.totalAwarded.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(submission.assignment.startDate).toLocaleDateString()}
                                  </div>
                                  <Badge variant="outline" className="text-gray-600 border-gray-300">
                                    {submission.assignment.code}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Wallet Card */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-purple-600" />
                    Token Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {walletLoading ? '...' : stats.tokenBalance}
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-4">Available Tokens</p>
                    <Button
                      onClick={() => setLocation('/profile?tab=wallet')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      data-testid="button-add-tokens"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tokens
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Tokens are used to take assignments
                  </p>
                </CardContent>
              </Card>

              {/* Performance Card */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-orange-600" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Score</span>
                      <span className="text-lg font-bold text-gray-900">{stats.averageScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="text-lg font-bold text-gray-900">{stats.completed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Streak</span>
                      <span className="text-lg font-bold text-gray-900">7 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievement Badge */}
              <Card className="bg-orange-50 border border-orange-200 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Keep it up!</h3>
                  <p className="text-sm text-gray-600">
                    You're on a 7-day learning streak
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Dialog */}
      <Dialog open={showCostDialog} onOpenChange={setShowCostDialog}>
        <DialogContent className="rounded-lg bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900">Assignment Details</DialogTitle>
            <DialogDescription className="text-gray-600">Review the assignment information before joining</DialogDescription>
          </DialogHeader>

          {assignmentPreview && costData && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{assignmentPreview.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{assignmentPreview.subjectName}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Questions:</span>
                    <div className="font-semibold text-gray-900">{costData.questionCount}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Token Cost:</span>
                  <span className="text-2xl font-bold text-purple-600">{costData.tokensRequired} tokens</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Your Balance:</span>
                  <span className="font-semibold text-gray-900">{stats.tokenBalance} tokens</span>
                </div>
              </div>

              {wallet && stats.tokenBalance < costData.tokensRequired && (
                <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-red-600 mb-1">Insufficient Tokens</p>
                      <p className="text-gray-600">
                        You need {costData.tokensRequired - stats.tokenBalance} more tokens to join this assignment.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCostDialog(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              data-testid="button-cancel-join"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmJoin}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              data-testid="button-confirm-join"
            >
              Join Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SaasLayout>
  );
}
