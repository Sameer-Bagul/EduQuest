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
    <Card className="glass-card hover-lift border-primary/20 dark:border-accent/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground dark:text-foreground flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary dark:text-accent" />
              Your Assignments
            </CardTitle>
            <CardDescription className="text-muted-foreground dark:text-muted-foreground mt-1">
              Manage and track your created assignments
            </CardDescription>
          </div>
          <Button
            onClick={() => setLocation('/create-assignment')}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white dark:text-white shadow-lg hover-lift"
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
              <div key={i} className="h-24 glass-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-accent/20 dark:to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30 dark:border-accent/30">
              <BookOpen className="w-8 h-8 text-primary dark:text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">No assignments yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground mb-4">Create your first assignment to get started</p>
            <Button
              onClick={() => setLocation('/create-assignment')}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white dark:text-white shadow-lg hover-lift"
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
                className="glass-card hover-lift border-primary/10 dark:border-accent/10"
                data-testid={`card-assignment-${assignment.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-accent/20 dark:to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/30 dark:border-accent/30">
                          <BookOpen className="w-5 h-5 text-primary dark:text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground dark:text-foreground mb-1 truncate">
                            {assignment.title}
                          </h3>
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                            {assignment.subjectName} • {assignment.questionCount} questions
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/assignments/view/${assignment.id}`)}
                            className="glass-button hover-lift text-primary dark:text-accent"
                            data-testid={`button-view-${assignment.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/assignments/edit/${assignment.id}`)}
                            className="glass-button hover-lift text-secondary dark:text-secondary"
                            data-testid={`button-edit-${assignment.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="glass-button hover-lift text-destructive dark:text-destructive"
                            data-testid={`button-delete-${assignment.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {assignment.submissionCount || 0} submissions
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(assignment.startDate).toLocaleDateString()}
                        </div>
                        <Badge className="glass-effect bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-accent/10 dark:to-secondary/10 text-primary dark:text-accent border-primary/30 dark:border-accent/30">
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
