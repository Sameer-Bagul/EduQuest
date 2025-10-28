import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  GraduationCap,
  CheckCircle,
  Star,
  Wallet,
  Target
} from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { SaasLayout } from "@/components/layouts/saas-layout";
import { DashboardHeader, StatsGrid, MainContent } from "@/components/dashboard";
import { JoinAssignmentSection, StudentSubmissionsList, StudentSidebar } from "@/components/dashboard/student";

export default function StudentDashboard() {
  const [assignmentCode, setAssignmentCode] = useState("");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else if (user?.role !== 'student') {
      setLocation('/teacher-dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['/api/submissions/student'],
    enabled: isAuthenticated && user?.role === 'student',
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['/api/wallet'],
    enabled: isAuthenticated && user?.role === 'student'
  });

  const submissions = (submissionsData as any)?.submissions || [];

  const stats = {
    tokenBalance: (wallet as any)?.balance || 0,
    completed: submissions.length,
    averageScore: submissions.length > 0 
      ? Math.round(submissions.reduce((acc: number, sub: any) => acc + sub.totalAwarded, 0) / submissions.length * 100)
      : 0,
  };

  const statsCards = [
    {
      value: walletLoading ? '...' : stats.tokenBalance,
      label: "Token Balance",
      icon: Wallet,
      iconColor: "text-primary dark:text-accent",
      bgColor: "bg-primary/10 dark:bg-accent/10"
    },
    {
      value: stats.completed,
      label: "Completed",
      icon: CheckCircle,
      iconColor: "text-success dark:text-success",
      bgColor: "bg-success/10 dark:bg-success/10"
    },
    {
      value: `${stats.averageScore}%`,
      label: "Average Score",
      icon: Star,
      iconColor: "text-warning dark:text-warning",
      bgColor: "bg-warning/10 dark:bg-warning/10"
    },
    {
      value: "7",
      label: "Day Streak",
      icon: Target,
      iconColor: "text-secondary dark:text-secondary",
      bgColor: "bg-secondary/10 dark:bg-secondary/10"
    }
  ];

  if (!isAuthenticated || user?.role !== 'student') {
    return null;
  }

  return (
    <SaasLayout>
      <div className="min-h-screen bg-background dark:bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <DashboardHeader
            title="Welcome back,"
            subtitle="Ready to continue your learning journey?"
          >
            <span className="text-foreground dark:text-foreground">{user?.name}</span>
          </DashboardHeader>

          <StatsGrid stats={statsCards} />

          <MainContent
            leftContent={
              <div>
                <JoinAssignmentSection />
                <StudentSubmissionsList />
              </div>
            }
            rightContent={<StudentSidebar stats={stats} />}
          />
        </div>
      </div>
    </SaasLayout>
  );
}
