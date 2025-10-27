import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Star } from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";

export function StudentSubmissionsList() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuthContext();

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['/api/submissions/student'],
    enabled: isAuthenticated && user?.role === 'student',
  });

  const submissions = (submissionsData as any)?.submissions || [];

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-theme flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
              Your Submissions
            </CardTitle>
            <CardDescription className="text-theme-secondary mt-1">Track your assignment history and scores</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-theme mb-2">No submissions yet</h3>
            <p className="text-theme-secondary mb-4">Join an assignment to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission: any) => (
              <Card
                key={submission.id}
                className="bg-card border border-border hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => setLocation(`/assignment/${submission.assignment.code}`)}
                data-testid={`card-submission-${submission.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-theme mb-1 truncate">
                            {submission.assignment.title}
                          </h3>
                          <p className="text-sm text-theme-secondary">
                            Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(submission.totalAwarded * 100)}%
                          </div>
                          <div className="flex items-center text-orange-600 mt-1">
                            <Star className="w-4 h-4 fill-current mr-1" />
                            <span className="text-sm font-medium">
                              {submission.totalAwarded.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-theme-secondary">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(submission.assignment.startDate).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="text-theme-secondary border-border">
                          {submission.assignment.code}
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