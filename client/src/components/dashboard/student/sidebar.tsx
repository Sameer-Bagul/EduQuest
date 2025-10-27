import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Award, Trophy, Plus } from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { api } from "@/lib/api";

interface StudentSidebarProps {
  stats: {
    tokenBalance: number;
    completed: number;
    averageScore: number;
  };
}

export function StudentSidebar({ stats }: StudentSidebarProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuthContext();

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['/api/wallet'],
    queryFn: () => api.getWallet(),
    enabled: isAuthenticated && user?.role === 'student'
  });

  const currentBalance = wallet?.balance || stats.tokenBalance;

  return (
    <div className="space-y-6">
      {/* Wallet Card */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-theme flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-purple-600" />
            Token Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="text-4xl font-bold text-theme mb-2">
              {walletLoading ? '...' : currentBalance}
            </div>
            <p className="text-sm text-theme-secondary font-medium mb-4">Available Tokens</p>
            <Button
              onClick={() => setLocation('/profile?tab=wallet')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              data-testid="button-add-tokens"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tokens
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Tokens are used to take assignments
          </p>
        </CardContent>
      </Card>

      {/* Performance Card */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-theme flex items-center">
            <Award className="w-5 h-5 mr-2 text-orange-600" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Average Score</span>
              <span className="text-lg font-bold text-theme">{stats.averageScore}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Completed</span>
              <span className="text-lg font-bold text-theme">{stats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Streak</span>
              <span className="text-lg font-bold text-theme">7 days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badge */}
      <Card className="bg-orange-50 border border-orange-200 shadow-sm">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="font-bold text-theme mb-2">Keep it up!</h3>
          <p className="text-sm text-theme-secondary">
            You're on a 7-day learning streak
          </p>
        </CardContent>
      </Card>
    </div>
  );
}