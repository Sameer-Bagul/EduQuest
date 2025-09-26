import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ClipboardList, Users, Clock, Plus, BarChart3, LogOut, User, Sparkles, BookOpen, Award, TrendingUp, Eye, Edit, Calendar, Target, Briefcase, Crown } from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { CreateAssignmentModal } from "@/components/assignment/create-assignment-modal";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function TeacherDashboard() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuthContext();

  // Redirect if not authenticated or not a teacher
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else if (user?.role !== 'teacher') {
      setLocation('/student-dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['/api/assignments/teacher'],
    enabled: isAuthenticated && user?.role === 'teacher',
  });

  const assignments = (assignmentsData as any)?.assignments || [];

  const stats = {
    totalAssignments: assignments.length,
    activeStudents: 187, // This would come from API in real implementation
    pendingReviews: assignments.filter((a: any) => new Date(a.endDate) < new Date()).length,
  };

  const getAssignmentStatus = (assignment: any) => {
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);

    if (now < startDate) {
      return { label: 'Scheduled', variant: 'secondary' as const };
    } else if (now > endDate) {
      return { label: 'Ended', variant: 'destructive' as const };
    } else if (endDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { label: 'Ending Soon', variant: 'outline' as const };
    } else {
      return { label: 'Active', variant: 'default' as const };
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 relative">
      {/* Background decorative elements - Professional style */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 opacity-3">
          <BookOpen className="w-40 h-40 text-indigo-400 floating" />
        </div>
        <div className="absolute bottom-32 right-16 opacity-3">
          <Award className="w-36 h-36 text-purple-400 floating" style={{animationDelay: '1s'}} />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-3">
          <Target className="w-28 h-28 text-blue-400 floating" style={{animationDelay: '2s'}} />
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-white/20 bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 sticky top-0 z-50 shadow-lg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center mr-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">
                  EduQuest
                </h1>
                <p className="text-sm font-handwriting text-blue-600 -mt-1">
                  Teacher Dashboard ✨
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => setLocation('/profile')}>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-white text-lg font-heading font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-lg font-heading font-bold text-gray-800 dark:text-white">{user?.name}</span>
                  <div className="flex items-center">
                    <Crown className="w-3 h-3 text-amber-500 mr-1" />
                    <span className="text-sm font-handwriting text-amber-600 dark:text-amber-400">Educator</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none shadow-lg px-4 py-2" data-testid="badge-teacher-role">
                  <Crown className="w-4 h-4 mr-1" />
                  Teacher
                </Badge>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/profile')}
                  className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors hover:scale-110"
                  title="Profile Settings"
                >
                  <User className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors hover:scale-110"
                  data-testid="button-logout"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce-in">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-600 mb-4">
            Welcome, Professor {user?.name}!
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 font-body mb-2">
            Empowering minds, one assignment at a time
          </p>
          <div className="font-handwriting text-xl text-indigo-600">
            Your classroom awaits! 🎓
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="hover-lift bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/50 dark:to-blue-800/50 border-2 border-indigo-200 dark:border-indigo-700 shadow-xl animate-bounce-in" data-testid="card-total-assignments">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-heading font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Total Assignments</p>
                  <p className="text-4xl font-heading font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                    {stats.totalAssignments}
                  </p>
                  <div className="font-handwriting text-indigo-500 text-sm">Your creations! 📝</div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ClipboardList className="text-white w-8 h-8" />
                </div>
              </div>
              <div className="mt-4 text-sm font-body text-indigo-600 dark:text-indigo-400">
                Active assignments managed
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/50 dark:to-green-800/50 border-2 border-emerald-200 dark:border-emerald-700 shadow-xl animate-bounce-in" style={{animationDelay: '0.2s'}} data-testid="card-active-students">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-heading font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Active Students</p>
                  <p className="text-4xl font-heading font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                    {stats.activeStudents}
                  </p>
                  <div className="font-handwriting text-emerald-500 text-sm">Growing minds! 🌱</div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="text-white w-8 h-8" />
                </div>
              </div>
              <div className="mt-4 text-sm font-body text-emerald-600 dark:text-emerald-400">
                Currently enrolled
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/50 dark:to-orange-800/50 border-2 border-amber-200 dark:border-amber-700 shadow-xl animate-bounce-in" style={{animationDelay: '0.4s'}} data-testid="card-pending-reviews">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-heading font-semibold text-amber-600 dark:text-amber-400 mb-2">Pending Reviews</p>
                  <p className="text-4xl font-heading font-bold text-amber-700 dark:text-amber-300 mb-2">
                    {stats.pendingReviews}
                  </p>
                  <div className="font-handwriting text-amber-500 text-sm">Time to grade! ⏰</div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="text-white w-8 h-8" />
                </div>
              </div>
              <div className="mt-4 text-sm font-body text-amber-600 dark:text-amber-400">
                Awaiting evaluation
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12 animate-slide-up">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-heading font-bold text-gray-800 dark:text-white mb-2">Quick Actions</h2>
            <div className="font-handwriting text-lg text-indigo-600">What would you like to do today? ✨</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
            <Button
              onClick={() => setLocation('/create-assignment')}
              className="h-16 px-8 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-heading text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105"
            >
              <Plus className="w-6 h-6 mr-3" />
              <div>
                <div>Create New Assignment</div>
                <div className="font-handwriting text-sm opacity-90">Build something amazing!</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 px-8 border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-900/30 font-heading text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <BarChart3 className="w-6 h-6 mr-3" />
              <div>
                <div>View Analytics</div>
                <div className="font-handwriting text-sm opacity-70">See the insights!</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Assignments List */}
        <Card>
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-foreground">Recent Assignments</h3>
          </div>
          {isLoading ? (
            <div className="p-6">
              <div className="text-center text-muted-foreground">Loading assignments...</div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-6">
              <div className="text-center text-muted-foreground">
                No assignments yet. Create your first assignment to get started.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment: any) => {
                    const status = getAssignmentStatus(assignment);
                    return (
                      <tr key={assignment.id} className="border-b last:border-b-0">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {assignment.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Code: {assignment.code}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground">{assignment.subjectName}</div>
                          <div className="text-sm text-muted-foreground">{assignment.subjectCode}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {new Date(assignment.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary/80"
                            onClick={() => setLocation(`/assignments/view/${assignment.id}`)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => setLocation(`/assignments/edit/${assignment.id}`)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <CreateAssignmentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
