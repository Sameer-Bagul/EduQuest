import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ClipboardList, Users, Clock, Plus, BarChart3, LogOut } from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { CreateAssignmentModal } from "@/components/assignment/create-assignment-modal";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 gradient-bg rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                EduQuest Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 px-3 py-2 bg-white/60 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover-lift" data-testid="badge-teacher-role">
                  Teacher
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg focus-ring"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 fade-in">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover-lift" data-testid="card-total-assignments">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 mr-4 shadow-lg">
                  <ClipboardList className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Assignments</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {stats.totalAssignments}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  <span>Active assignments managed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover-lift" data-testid="card-active-students">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 mr-4 shadow-lg">
                  <Users className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Students</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                    {stats.activeStudents}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 status-active"></div>
                  <span>Currently enrolled</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover-lift" data-testid="card-pending-reviews">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mr-4 shadow-lg">
                  <Clock className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Reviews</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">
                    {stats.pendingReviews}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-2 status-warning"></div>
                  <span>Awaiting evaluation</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Assignment
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>

        {/* Assignments List */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Assignments</h3>
          </div>
          {isLoading ? (
            <div className="p-6">
              <div className="text-center text-gray-500">Loading assignments...</div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-6">
              <div className="text-center text-gray-500">
                No assignments yet. Create your first assignment to get started.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment: any) => {
                    const status = getAssignmentStatus(assignment);
                    return (
                      <tr key={assignment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              Code: {assignment.code}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{assignment.subjectName}</div>
                          <div className="text-sm text-gray-500">{assignment.subjectCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(assignment.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-900">
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
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
