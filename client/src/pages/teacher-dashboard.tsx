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
      iconColor: "text-primary dark:text-accent",
      bgColor: "bg-primary/10 dark:bg-accent/10"
    },
    {
      value: stats.activeStudents,
      label: "Active Students",
      icon: Users,
      iconColor: "text-secondary dark:text-secondary",
      bgColor: "bg-secondary/10 dark:bg-secondary/10"
    },
    {
      value: stats.pendingReviews,
      label: "Pending Reviews",
      icon: TrendingUp,
      iconColor: "text-warning dark:text-warning",
      bgColor: "bg-warning/10 dark:bg-warning/10"
    },
    {
      value: `${stats.completionRate}%`,
      label: "Completion Rate",
      icon: Award,
      iconColor: "text-success dark:text-success",
      bgColor: "bg-success/10 dark:bg-success/10"
    }
  ];

  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  return (
    <SaasLayout>
      <div className="min-h-screen bg-background dark:bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <DashboardHeader
            title="Welcome back,"
            subtitle="Here's what's happening with your classes today."
          >
            <span className="text-foreground dark:text-foreground">{user?.name}</span>
          </DashboardHeader>

          <StatsGrid stats={statsCards} />

          <MainContent
            leftContent={<TeacherAssignmentsList />}
          />
        </div>
      </div>
    </SaasLayout>
  );
}
