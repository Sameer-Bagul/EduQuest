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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 gradient-bg rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                EduQuest Student Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 px-3 py-2 bg-white/60 rounded-lg cursor-pointer hover:bg-white/70 transition-colors" onClick={() => setLocation('/profile')}>
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover-lift">Student</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/profile')}
                  className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg focus-ring"
                  title="Profile Settings"
                >
                  <User className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg focus-ring"
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Join Assignment</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                value={assignmentCode}
                onChange={(e) => setAssignmentCode(e.target.value)}
                placeholder="Enter assignment code (e.g., DS2024Q3)"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinAssignment()}
              />
              <Button
                onClick={handleJoinAssignment}
                className="bg-primary text-white hover:bg-blue-700 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Join Assignment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <ListTodo className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <CheckCircle className="text-secondary w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 mr-4">
                  <Star className="text-accent w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">My Assignments</h3>
          </div>
          {isLoading ? (
            <div className="p-6">
              <div className="text-center text-gray-500">Loading assignments...</div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-6">
              <div className="text-center text-gray-500">
                No assignments completed yet. Join an assignment using the code above.
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {submissions.map((submission: any) => (
                <div key={submission.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {submission.assignmentTitle || `Assignment ${submission.id.slice(0, 8)}`}
                        </h4>
                        <Badge className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Submitted:</span>{' '}
                          <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Score:</span>{' '}
                          <span className="text-green-600 font-semibold">
                            {Math.round(submission.totalAwarded * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Questions:</span>{' '}
                          <span>{submission.answers.length}</span>
                        </div>
                        <div>
                          <span className="font-medium">Assignment ID:</span>{' '}
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
