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
      <div className="p-8 gradient-purple min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 slide-in-up">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user?.name}</span>
            </h1>
            <p className="text-muted-foreground text-lg">Ready to continue your learning journey?</p>
          </div>

          {/* Stats Grid - Bento Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bento-card slide-in-up" data-testid="card-token-balance">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl flex items-center justify-center border border-primary/40">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {walletLoading ? '...' : stats.tokenBalance}
                </div>
                <p className="text-sm text-muted-foreground font-medium">Token Balance</p>
              </CardContent>
            </Card>

            <Card className="bento-card slide-in-up" style={{ animationDelay: '0.1s' }} data-testid="card-completed">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-success/30 to-primary/30 rounded-2xl flex items-center justify-center border border-success/40">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stats.completed}</div>
                <p className="text-sm text-muted-foreground font-medium">Completed</p>
              </CardContent>
            </Card>

            <Card className="bento-card slide-in-up" style={{ animationDelay: '0.2s' }} data-testid="card-average-score">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-warning/30 to-accent/30 rounded-2xl flex items-center justify-center border border-warning/40">
                    <Trophy className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stats.averageScore}%</div>
                <p className="text-sm text-muted-foreground font-medium">Average Score</p>
              </CardContent>
            </Card>

            <Card className="bento-card slide-in-up" style={{ animationDelay: '0.3s' }} data-testid="card-streak">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/30 to-secondary/30 rounded-2xl flex items-center justify-center border border-accent/40">
                    <Target className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">7</div>
                <p className="text-sm text-muted-foreground font-medium">Day Streak</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Join Assignment - Large Card */}
            <div className="lg:col-span-2">
              <Card className="bento-card mb-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20 slide-in-left">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Plus className="w-6 h-6 mr-2 text-primary" />
                    Join New Assignment
                  </CardTitle>
                  <CardDescription>Enter the assignment code provided by your teacher</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter assignment code"
                      value={assignmentCode}
                      onChange={(e) => setAssignmentCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinAssignment()}
                      className="h-12 text-lg rounded-xl border-2"
                      data-testid="input-assignment-code"
                    />
                    <Button 
                      onClick={handleJoinAssignment}
                      size="lg"
                      className="rounded-xl h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                      data-testid="button-join-assignment"
                    >
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Submissions List */}
              <Card className="bento-card slide-in-left" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center">
                        <BookOpen className="w-6 h-6 mr-2 text-primary" />
                        Your Submissions
                      </CardTitle>
                      <CardDescription className="mt-1">Track your assignment history and scores</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No submissions yet</h3>
                      <p className="text-muted-foreground mb-4">Join an assignment to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((submission: any) => (
                        <Card 
                          key={submission.id}
                          className="glass-card border hover:scale-[1.02] transition-all cursor-pointer group"
                          onClick={() => setLocation(`/assignment/${submission.assignment.code}`)}
                          data-testid={`card-submission-${submission.id}`}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-success/30 to-primary/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-success/40">
                                    <CheckCircle className="w-5 h-5 text-success" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground mb-1 truncate">
                                      {submission.assignment.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-2xl font-bold text-primary">
                                      {Math.round(submission.totalAwarded * 100)}%
                                    </div>
                                    <div className="flex items-center text-warning mt-1">
                                      <Star className="w-4 h-4 fill-current mr-1" />
                                      <span className="text-sm font-medium">
                                        {submission.totalAwarded.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(submission.assignment.startDate).toLocaleDateString()}
                                  </div>
                                  <Badge variant="outline" className="rounded-lg">
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

            {/* Sidebar - Wallet & Quick Actions */}
            <div className="space-y-6">
              {/* Wallet Card */}
              <Card className="bento-card slide-in-right">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-primary" />
                    Token Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/20">
                    <div className="text-4xl font-bold text-foreground mb-2">
                      {walletLoading ? '...' : stats.tokenBalance}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-4">Available Tokens</p>
                    <Button 
                      onClick={() => setLocation('/profile?tab=wallet')}
                      className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-105 transition-all"
                      data-testid="button-add-tokens"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tokens
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Tokens are used to take assignments
                  </p>
                </CardContent>
              </Card>

              {/* Performance Card */}
              <Card className="bento-card slide-in-right" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Award className="w-5 h-5 mr-2 text-warning" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Score</span>
                      <span className="text-lg font-bold text-foreground">{stats.averageScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="text-lg font-bold text-foreground">{stats.completed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Streak</span>
                      <span className="text-lg font-bold text-foreground">7 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievement Badge */}
              <Card className="bento-card bg-gradient-to-br from-warning/5 to-accent/5 border-2 border-warning/20 slide-in-right" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-warning/30">
                    <Trophy className="w-8 h-8 text-warning" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Keep it up!</h3>
                  <p className="text-sm text-muted-foreground">
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
        <DialogContent className="rounded-2xl glass-card">
          <DialogHeader>
            <DialogTitle className="text-2xl">Assignment Details</DialogTitle>
            <DialogDescription>Review the assignment information before joining</DialogDescription>
          </DialogHeader>
          
          {assignmentPreview && costData && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <h3 className="font-semibold text-foreground mb-2">{assignmentPreview.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{assignmentPreview.subjectName}</p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Questions:</span>
                    <div className="font-semibold text-foreground">{costData.questionCount}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-2 border-primary/20 rounded-xl bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Token Cost:</span>
                  <span className="text-2xl font-bold text-primary">{costData.tokensRequired} tokens</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Balance:</span>
                  <span className="font-semibold text-foreground">{stats.tokenBalance} tokens</span>
                </div>
              </div>

              {wallet && stats.tokenBalance < costData.tokensRequired && (
                <div className="p-4 border-2 border-destructive/20 rounded-xl bg-destructive/5">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-destructive mb-1">Insufficient Tokens</p>
                      <p className="text-muted-foreground">
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
              className="rounded-xl glass-button"
              data-testid="button-cancel-join"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmJoin}
              className="rounded-xl bg-gradient-to-r from-primary to-secondary"
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
