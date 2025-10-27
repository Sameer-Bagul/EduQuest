import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  Clock
} from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { useToast } from "@/hooks/use-toast";

export function TeacherAssignmentsList() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthContext();
  const { toast } = useToast();

  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['/api/assignments/teacher'],
    enabled: isAuthenticated && user?.role === 'teacher',
  });

  const assignments = (assignmentsData as any)?.assignments || [];

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Assignment deleted successfully",
        });
        // Refresh the page to update the list
        window.location.reload();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete assignment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-theme flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
              Your Assignments
            </CardTitle>
            <CardDescription className="text-theme-secondary mt-1">
              Manage and track your created assignments
            </CardDescription>
          </div>
          <Button
            onClick={() => setLocation('/create-assignment')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            data-testid="button-create-assignment"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-theme mb-2">No assignments yet</h3>
            <p className="text-theme-secondary mb-4">Create your first assignment to get started</p>
            <Button
              onClick={() => setLocation('/create-assignment')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment: any) => (
              <Card
                key={assignment.id}
                className="bg-card border border-border hover:border-purple-200 hover:shadow-sm transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-theme mb-1 truncate">
                            {assignment.title}
                          </h3>
                          <p className="text-sm text-theme-secondary">
                            {assignment.subjectName} • {assignment.questionCount} questions
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/assignment-analytics/${assignment.id}`)}
                            className="border-border text-theme hover:bg-muted"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/edit-assignment/${assignment.id}`)}
                            className="border-border text-theme hover:bg-muted"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="border-border text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-theme-secondary">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {assignment.submissionCount || 0} submissions
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(assignment.startDate).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="text-theme-secondary border-border">
                          {assignment.code}
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
  );
}