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
      <div className="dashboard-layout min-h-screen">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 slide-in-up">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Welcome back, <span className="text-foreground">{user?.name}</span>
              </h1>
              <p className="text-muted-foreground text-lg">Here's what's happening with your classes today.</p>
            </div>
            <Button 
              onClick={() => setCreateModalOpen(true)}
              size="lg"
              className="btn-minimal h-12 px-6"
              data-testid="button-create-assignment"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Assignment
            </Button>
          </div>

          {/* Stats Grid - Bento Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="dashboard-card slide-in-up" data-testid="card-total-assignments">
              <CardContent className="p-5 stat">
                <div className="flex items-center gap-4">
                  <div className="icon-muted"><ClipboardList className="w-5 h-5" /></div>
                  <div>
                    <div className="stat-number">{stats.totalAssignments}</div>
                    <div className="stat-label">Total Assignments</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card slide-in-up" style={{ animationDelay: '0.1s' }} data-testid="card-active-students">
              <CardContent className="p-5 stat">
                <div className="flex items-center gap-4">
                  <div className="icon-muted"><Users className="w-5 h-5" /></div>
                  <div>
                    <div className="stat-number">{stats.activeStudents}</div>
                    <div className="stat-label">Active Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card slide-in-up" style={{ animationDelay: '0.2s' }} data-testid="card-pending-reviews">
              <CardContent className="p-5 stat">
                <div className="flex items-center gap-4">
                  <div className="icon-muted"><Clock className="w-5 h-5" /></div>
                  <div>
                    <div className="stat-number">{stats.pendingReviews}</div>
                    <div className="stat-label">Pending Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card slide-in-up" style={{ animationDelay: '0.3s' }} data-testid="card-completion-rate">
              <CardContent className="p-5 stat">
                <div className="flex items-center gap-4">
                  <div className="icon-muted"><Award className="w-5 h-5" /></div>
                  <div>
                    <div className="stat-number">{stats.completionRate}%</div>
                    <div className="stat-label">Completion Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assignments List - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card className="dashboard-card slide-in-left">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center">
                        <BookOpen className="w-6 h-6 mr-2 text-primary" />
                        Your Assignments
                      </CardTitle>
                      <CardDescription className="mt-1">Manage and track all your assignments</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                      {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />
                      ))}
                    </div>
                      ) : assignments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 icon-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No assignments yet</h3>
                      <p className="text-muted-foreground mb-4">Create your first assignment to get started</p>
                        <Button 
                          onClick={() => setCreateModalOpen(true)}
                          className="btn-minimal"
                          data-testid="button-create-first"
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
                            className="dashboard-card border hover:scale-[1.02] transition-all cursor-pointer group"
                            data-testid={`card-assignment-${assignment.id}`}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 icon-muted rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                      <GraduationCap className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-foreground mb-1 truncate">{assignment.title}</h3>
                                      <p className="text-sm text-muted-foreground line-clamp-2">{assignment.subjectName}</p>
                                    </div>
                                    <Badge variant={status.variant} className="flex-shrink-0 rounded-lg">
                                      {status.label}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      {new Date(assignment.startDate).toLocaleDateString()}
                                    </div>
                                    <Badge variant="outline" className="rounded-lg">
                                      {assignment.code}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 flex-shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLocation(`/assignments/view/${assignment.id}`);
                                    }}
                                    className="rounded-xl btn-minimal"
                                    data-testid={`button-view-${assignment.id}`}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLocation(`/assignments/edit/${assignment.id}`);
                                    }}
                                    className="rounded-xl btn-minimal"
                                    data-testid={`button-edit-${assignment.id}`}
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

            {/* Sidebar - Quick Actions & Insights */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="dashboard-card slide-in-right">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl h-12 btn-minimal"
                    onClick={() => setCreateModalOpen(true)}
                    data-testid="button-quick-create"
                  >
                    <Plus className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium">New Assignment</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl h-12 btn-minimal"
                    onClick={() => setLocation('/profile')}
                    data-testid="button-quick-students"
                  >
                    <Users className="w-5 h-5 mr-3 text-success" />
                    <span className="font-medium">View Students</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl h-12 btn-minimal"
                    data-testid="button-quick-analytics"
                  >
                    <BarChart3 className="w-5 h-5 mr-3 text-warning" />
                    <span className="font-medium">Analytics</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="dashboard-card slide-in-right" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your classes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
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
