import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Plus, CheckCircle, Star, LogOut, ListTodo, User } from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { useToast } from "@/hooks/use-toast";

export default function StudentDashboard() {
  const [assignmentCode, setAssignmentCode] = useState("");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { toast } = useToast();

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

  const submissions = (submissionsData as any)?.submissions || [];

  // Mock stats - in real implementation, these would come from API
  const stats = {
    activeAssignments: 3,
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
      // Check if assignment exists and is valid
      const response = await fetch(`/api/assignments/code/${assignmentCode}`, {
        credentials: 'include',
      });

      if (response.ok) {
        setLocation(`/assignment/${assignmentCode}`);
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
                <Badge variant="secondary">Student</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/profile')}
                  className="text-muted-foreground hover:text-foreground"
                  title="Profile Settings"
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
                <div className="p-3 rounded-lg bg-primary/10 mr-4">
                  <ListTodo className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Assignments</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeAssignments}</p>
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
      </div>
    </div>
  );
}
