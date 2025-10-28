import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Eye } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';
import type { Assignment } from '@shared/schema';

export function AssignmentsPage() {
  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ['/api/admin/assignments'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/assignments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/assignments'] });
    },
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete assignment "${title}"? This will also delete all submissions.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-assignments-title">Assignments Management</h1>
        <p className="text-muted-foreground">View and manage all assignments across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assignments {assignments && `(${assignments.length})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading assignments...</div>
          ) : assignments && assignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id} data-testid={`row-assignment-${assignment.id}`}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-xs">
                        {assignment.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm">
                      {assignment.subjectName}
                      <div className="text-xs text-muted-foreground">{assignment.subjectCode}</div>
                    </TableCell>
                    <TableCell className="text-sm">{assignment.collegeName}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignment.mode === 'voice' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {assignment.mode}
                      </span>
                    </TableCell>
                    <TableCell>{assignment.questions.length}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(assignment.startDate)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(assignment.endDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View details"
                          data-testid={`button-view-${assignment.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(assignment.id, assignment.title)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${assignment.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No assignments found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
