import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, FileText, ClipboardCheck, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: collegeStats } = useQuery({
    queryKey: ['/api/admin/college-stats'],
  });

  const { data: revenueStats } = useQuery({
    queryKey: ['/api/admin/revenue-stats'],
  });

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500' },
    { title: 'Teachers', value: stats?.totalTeachers || 0, icon: Users, color: 'text-purple-500' },
    { title: 'Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-green-500' },
    { title: 'Colleges', value: stats?.totalColleges || 0, icon: GraduationCap, color: 'text-orange-500' },
    { title: 'Assignments', value: stats?.totalAssignments || 0, icon: FileText, color: 'text-pink-500' },
    { title: 'Submissions', value: stats?.totalSubmissions || 0, icon: ClipboardCheck, color: 'text-cyan-500' },
  ];

  const topColleges = collegeStats?.slice(0, 10) || [];
  const collegeChartData = topColleges.map(c => ({
    name: c.collegeName.length > 20 ? c.collegeName.substring(0, 20) + '...' : c.collegeName,
    students: c.studentCount,
    teachers: c.teacherCount,
    revenue: c.revenue,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your EduQuest platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid={`text-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600" data-testid="text-total-revenue">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              From {stats?.totalUsers || 0} users across {stats?.totalColleges || 0} colleges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg. submissions/assignment</span>
              <span className="font-semibold">
                {stats?.totalAssignments > 0 ? (stats.totalSubmissions / stats.totalAssignments).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg. users/college</span>
              <span className="font-semibold">
                {stats?.totalColleges > 0 ? (stats.totalUsers / stats.totalColleges).toFixed(1) : 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {revenueStats && revenueStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" name="Revenue (₹)" strokeWidth={2} />
                <Line type="monotone" dataKey="transactions" stroke="#8b5cf6" name="Transactions" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {collegeChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Colleges by Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={collegeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#10b981" name="Students" />
                <Bar dataKey="teachers" fill="#8b5cf6" name="Teachers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {collegeStats && collegeStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Colleges by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collegeStats.slice(0, 5).map((college, index) => (
                <div key={college.collegeId} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`college-revenue-${index}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{college.collegeName}</div>
                      <div className="text-sm text-muted-foreground">
                        {college.studentCount} students, {college.teacherCount} teachers
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(college.revenue)}</div>
                    <div className="text-xs text-muted-foreground">{college.userCount} total users</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
