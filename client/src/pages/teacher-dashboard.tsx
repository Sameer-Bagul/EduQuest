import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ClipboardList, Users, Clock, Plus, BarChart3, LogOut, User, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="text-primary-foreground w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  EduQuest
                </h1>
                <p className="text-xs text-muted-foreground">Teacher Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 cursor-pointer" onClick={() => setLocation('/profile')}>
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-foreground text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground block">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">Educator</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" data-testid="badge-teacher-role">
                  Teacher
                </Badge>
                <ThemeToggle />
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
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-subtle" data-testid="card-total-assignments">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-primary/10 mr-4">
                  <ClipboardList className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Assignments</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalAssignments}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Active assignments managed
              </div>
            </CardContent>
          </Card>

          <Card className="hover-subtle" data-testid="card-active-students">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-success/10 mr-4">
                  <Users className="text-success w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Students</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.activeStudents}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Currently enrolled
              </div>
            </CardContent>
          </Card>

          <Card className="hover-subtle" data-testid="card-pending-reviews">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-warning/10 mr-4">
                  <Clock className="text-warning w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pending Reviews</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.pendingReviews}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Awaiting evaluation
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => setLocation('/create-assignment')}
            className="h-11"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Assignment
          </Button>
          <Button 
            variant="outline" 
            className="h-11"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
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
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
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
