import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Calendar, Clock, Users, User } from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { api } from "@/lib/api";

export default function ViewAssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthContext();

  // Redirect if not authenticated or not a teacher
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else if (user?.role !== 'teacher') {
      setLocation('/student-dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: assignmentData, isLoading, error } = useQuery({
    queryKey: ['/api/assignments', id],
    enabled: !!id && isAuthenticated && user?.role === 'teacher',
  });

  const assignment = (assignmentData as any)?.assignment;

  const handleGoBack = () => {
    setLocation('/teacher-dashboard');
  };

  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-foreground mb-2">Loading Assignment...</div>
          <p className="text-muted-foreground">Please wait while we fetch the assignment details.</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-lg font-medium text-destructive mb-2">Assignment Not Found</div>
            <p className="text-muted-foreground mb-4">
              The assignment could not be found or you don't have access to it.
            </p>
            <Button onClick={handleGoBack}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAssignmentStatus = () => {
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);

    if (now < startDate) {
      return { label: 'Upcoming', variant: 'secondary' as const };
    } else if (now > endDate) {
      return { label: 'Expired', variant: 'destructive' as const };
    } else {
      return { label: 'Active', variant: 'default' as const };
    }
  };

  const status = getAssignmentStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-lg font-semibold text-foreground">
                View Assignment
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary">Teacher</Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-foreground text-2xl">
                <BookOpen className="w-6 h-6 mr-3 text-primary" />
                {assignment.title}
              </CardTitle>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Assignment Code</h4>
                <p className="text-3xl font-mono font-bold text-primary">{assignment.code}</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Mode</h4>
                <Badge variant="outline">
                  {assignment.mode === 'voice' ? '🎤 Voice Only' : '🎤📝 Voice + Text'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Institution Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <User className="w-5 h-5 mr-3 text-primary" />
              Institution Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-1">Faculty Name</h4>
                <p className="text-muted-foreground">{assignment.facultyName}</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">College Name</h4>
                <p className="text-muted-foreground">{assignment.collegeName}</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Subject Name</h4>
                <p className="text-muted-foreground">{assignment.subjectName}</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Subject Code</h4>
                <p className="text-muted-foreground">{assignment.subjectCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Calendar className="w-5 h-5 mr-3 text-primary" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-1 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  Start Date & Time
                </h4>
                <p className="text-muted-foreground">
                  {new Date(assignment.startDate).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  End Date & Time
                </h4>
                <p className="text-muted-foreground">
                  {new Date(assignment.endDate).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Users className="w-5 h-5 mr-3 text-primary" />
              Questions ({assignment.questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assignment.questions.map((question: any, index: number) => (
                <Card key={question.id} className="hover-subtle">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Question</h5>
                          <p className="text-muted-foreground">{question.text}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Answer Key</h5>
                          <p className="text-muted-foreground">{question.answerKey}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button
            onClick={() => setLocation(`/assignments/edit/${assignment.id}`)}
            className="px-8"
          >
            Edit Assignment
          </Button>
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="px-8"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}