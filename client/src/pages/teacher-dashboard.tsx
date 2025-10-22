import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  ClipboardList, 
  Users, 
  Clock, 
  Plus, 
  BarChart3, 
  Eye,
  Edit,
  Calendar,
  TrendingUp,
  BookOpen,
  Award
} from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { CreateAssignmentModal } from "@/components/assignment/create-assignment-modal";
import { SaasLayout } from "@/components/layouts/saas-layout";

export default function TeacherDashboard() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthContext();

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
    activeStudents: 187,
    pendingReviews: assignments.filter((a: any) => new Date(a.endDate) < new Date()).length,
    completionRate: 87,
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

  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  return (
    <SaasLayout>
      <div className="min-h-screen bg-theme">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-theme mb-2">
              Welcome back, <span className="text-theme">{user?.name}</span>
            </h1>
            <p className="text-theme-secondary text-lg">Here's what's happening with your classes today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-theme">{stats.totalAssignments}</div>
                    <div className="text-sm text-theme-secondary">Total Assignments</div>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-theme">{stats.activeStudents}</div>
                    <div className="text-sm text-theme-secondary">Active Students</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-theme">{stats.pendingReviews}</div>
                    <div className="text-sm text-theme-secondary">Pending Reviews</div>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-theme">{stats.completionRate}%</div>
                    <div className="text-sm text-theme-secondary">Completion Rate</div>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assignments List */}
            <div className="lg:col-span-2">
              <Card className="bg-card border border-border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-theme flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                        Your Assignments
                      </CardTitle>
                      <CardDescription className="text-theme-secondary mt-1">Manage and track all your assignments</CardDescription>
                    </div>
                    <Button 
                      onClick={() => setCreateModalOpen(true)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : assignments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme mb-2">No assignments yet</h3>
                      <p className="text-theme-secondary mb-4">Create your first assignment to get started</p>
                      <Button 
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Assignment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((assignment: any) => {
                        const status = getAssignmentStatus(assignment);
                        return (
                          <Card 
                            key={assignment.id} 
                            className="bg-card border border-border hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer"
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                      <GraduationCap className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-theme mb-1 truncate">{assignment.title}</h3>
                                      <p className="text-sm text-theme-secondary line-clamp-2">{assignment.subjectName}</p>
                                    </div>
                                    <Badge variant={status.variant} className="flex-shrink-0">
                                      {status.label}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-theme-secondary">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      {new Date(assignment.startDate).toLocaleDateString()}
                                    </div>
                                    <Badge variant="outline" className="text-theme-secondary border-border">
                                      {assignment.code}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLocation(`/assignments/view/${assignment.id}`);
                                    }}
                                    className="text-theme-secondary hover:text-theme hover:bg-muted"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLocation(`/assignments/edit/${assignment.id}`);
                                    }}
                                    className="text-theme-secondary hover:text-theme hover:bg-muted"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-card border border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-theme">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-10 border-border hover:bg-muted text-theme"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-3 text-purple-600" />
                    <span>New Assignment</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-10 border-border hover:bg-muted text-theme"
                    onClick={() => setLocation('/profile')}
                  >
                    <Users className="w-4 h-4 mr-3 text-blue-600" />
                    <span>View Students</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-10 border-border hover:bg-muted text-theme"
                  >
                    <BarChart3 className="w-4 h-4 mr-3 text-green-600" />
                    <span>Analytics</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-card border border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-theme">Recent Activity</CardTitle>
                  <CardDescription className="text-theme-secondary">Latest updates from your classes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-theme-secondary">
                    <p className="mb-2">No recent activity</p>
                    <p className="text-xs">Activity will appear here as students interact with your assignments</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <CreateAssignmentModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen}
      />
    </SaasLayout>
  );
}
