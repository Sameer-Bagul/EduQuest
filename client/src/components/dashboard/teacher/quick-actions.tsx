import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  BarChart3,
  Users,
  Settings,
  FileText,
  TrendingUp
} from "lucide-react";

export function TeacherQuickActions() {
  const [, setLocation] = useLocation();

  const quickActions = [
    {
      icon: Plus,
      label: "Create Assignment",
      description: "Set up a new assignment",
      action: () => setLocation('/create-assignment'),
      color: "bg-purple-600 hover:bg-purple-700",
      iconColor: "text-white"
    },
    {
      icon: BarChart3,
      label: "View Analytics",
      description: "Check assignment performance",
      action: () => setLocation('/assignment-analytics'),
      color: "bg-blue-600 hover:bg-blue-700",
      iconColor: "text-white"
    },
    {
      icon: Users,
      label: "Student Submissions",
      description: "Review student work",
      action: () => setLocation('/assignment-submissions'),
      color: "bg-green-600 hover:bg-green-700",
      iconColor: "text-white"
    },
    {
      icon: FileText,
      label: "Assignment Templates",
      description: "Use pre-built templates",
      action: () => setLocation('/create-assignment?template=true'),
      color: "bg-orange-600 hover:bg-orange-700",
      iconColor: "text-white"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-theme flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              className={`w-full justify-start h-auto p-4 ${action.color} ${action.iconColor}`}
              variant="default"
            >
              <div className="flex items-center gap-3">
                <action.icon className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">{action.label}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-theme flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setLocation('/profile')}
            variant="outline"
            className="w-full border-border text-theme hover:bg-muted"
          >
            Manage Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}