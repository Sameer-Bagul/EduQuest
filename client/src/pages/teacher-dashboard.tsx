import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Users,
  BookOpen,
  TrendingUp,
  Award
} from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { SaasLayout } from "@/components/layouts/saas-layout";
import { DashboardHeader, StatsGrid, MainContent } from "@/components/dashboard";
import { TeacherAssignmentsList, TeacherQuickActions } from "@/components/dashboard/teacher";

export default function TeacherDashboard() {
  // navigation only: use page-based create flow
  // removed modal state; create uses dedicated page (/create-assignment)
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

  const statsCards = [
    {
      value: stats.totalAssignments,
      label: "Total Assignments",
      icon: BookOpen,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      value: stats.activeStudents,
      label: "Active Students",
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      value: stats.pendingReviews,
      label: "Pending Reviews",
      icon: TrendingUp,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      value: `${stats.completionRate}%`,
      label: "Completion Rate",
      icon: Award,
      iconColor: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  return (
    <SaasLayout>
      <div className="min-h-screen bg-theme">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <DashboardHeader
            title="Welcome back,"
            subtitle="Here's what's happening with your classes today."
          >
            <span className="text-theme">{user?.name}</span>
          </DashboardHeader>

          <StatsGrid stats={statsCards} />

          <MainContent
            leftContent={<TeacherAssignmentsList />}
            rightContent={<TeacherQuickActions />}
          />
        </div>
      </div>
    </SaasLayout>
  );
}
