import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';
import type { College } from '@shared/schema';

export function CollegesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);

  const { data: colleges, isLoading } = useQuery<College[]>({
    queryKey: ['/api/colleges'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/colleges/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/colleges'] });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete college "${name}"? This will affect all associated users.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-colleges-title">Colleges Management</h1>
          <p className="text-muted-foreground">Manage educational institutions</p>
        </div>
        <Button
          onClick={() => { setShowForm(true); setEditingCollege(null); }}
          data-testid="button-add-college"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add College
        </Button>
      </div>

      {showForm && (
        <CollegeForm
          college={editingCollege}
          onClose={() => { setShowForm(false); setEditingCollege(null); }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            All Colleges {colleges && `(${colleges.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading colleges...</div>
          ) : colleges && colleges.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colleges.map((college) => (
                  <TableRow key={college.id} data-testid={`row-college-${college.id}`}>
                    <TableCell className="font-medium">{college.name}</TableCell>
                    <TableCell>{college.location || '-'}</TableCell>
                    <TableCell>{college.country || '-'}</TableCell>
                    <TableCell>
                      {college.type && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {college.type}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(college.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingCollege(college); setShowForm(true); }}
                          data-testid={`button-edit-${college.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(college.id, college.name)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${college.id}`}
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
            <div className="text-center py-8 text-muted-foreground">No colleges found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CollegeForm({ college, onClose }: { college: College | null; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: college?.name || '',
    location: college?.location || '',
    country: college?.country || '',
    type: college?.type || 'university',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (college) {
        return apiRequest(`/api/admin/colleges/${college.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest('/api/admin/colleges', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/colleges'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{college ? 'Edit College' : 'Create New College'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">College Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-college-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
                data-testid="input-college-location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Country"
                data-testid="input-college-country"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              data-testid="select-college-type"
            >
              <option value="university">University</option>
              <option value="college">College</option>
              <option value="institute">Institute</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} data-testid="button-submit">
              {mutation.isPending ? 'Saving...' : college ? 'Update College' : 'Create College'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
