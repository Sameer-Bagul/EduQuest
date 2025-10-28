import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit2, Filter } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';
import type { User } from '@shared/schema';

export function UsersPage() {
  const [filter, setFilter] = useState<'all' | 'teacher' | 'student' | 'admin'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users', filter !== 'all' ? `?role=${filter}` : ''],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete user "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-users-title">Users Management</h1>
          <p className="text-muted-foreground">Manage teachers, students, and admins</p>
        </div>
        <Button
          onClick={() => { setShowForm(true); setEditingUser(null); }}
          data-testid="button-add-user"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          data-testid="button-filter-all"
        >
          <Filter className="h-4 w-4 mr-2" />
          All Users
        </Button>
        <Button
          variant={filter === 'teacher' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('teacher')}
          data-testid="button-filter-teacher"
        >
          Teachers
        </Button>
        <Button
          variant={filter === 'student' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('student')}
          data-testid="button-filter-student"
        >
          Students
        </Button>
        <Button
          variant={filter === 'admin' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('admin')}
          data-testid="button-filter-admin"
        >
          Admins
        </Button>
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={() => { setShowForm(false); setEditingUser(null); }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {filter === 'all' ? 'All Users' : `${filter.charAt(0).toUpperCase() + filter.slice(1)}s`}
            {users && ` (${users.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>{user.tokenBalance || 0}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingUser(user); setShowForm(true); }}
                          data-testid={`button-edit-${user.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${user.id}`}
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
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserForm({ user, onClose }: { user: User | null; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'student',
    tokenBalance: user?.tokenBalance || 0,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (user) {
        return apiRequest(`/api/admin/users/${user.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
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
        <CardTitle>{user ? 'Edit User' : 'Create New User'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="input-user-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                data-testid="input-user-email"
              />
            </div>
          </div>
          
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                data-testid="input-user-password"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                data-testid="select-user-role"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokens">Token Balance</Label>
              <Input
                id="tokens"
                type="number"
                value={formData.tokenBalance}
                onChange={(e) => setFormData({ ...formData, tokenBalance: parseInt(e.target.value) || 0 })}
                data-testid="input-user-tokens"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} data-testid="button-submit">
              {mutation.isPending ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
