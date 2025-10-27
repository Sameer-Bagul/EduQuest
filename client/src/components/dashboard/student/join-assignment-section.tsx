import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, AlertTriangle } from "lucide-react";
import { useAuthContext } from "@/components/ui/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface JoinAssignmentSectionProps {
  onAssignmentJoined?: () => void;
}

export function JoinAssignmentSection({ onAssignmentJoined }: JoinAssignmentSectionProps) {
  const [assignmentCode, setAssignmentCode] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [assignmentPreview, setAssignmentPreview] = useState<any>(null);
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [costData, setCostData] = useState<any>(null);

  const handleJoinAssignment = async () => {
    if (!assignmentCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an assignment code",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/assignments/code/${assignmentCode}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const assignment = await response.json();
        setAssignmentPreview(assignment);

        try {
          const costResponse = await api.getAssignmentCost(assignment.id);
          setCostData(costResponse);
          setShowCostDialog(true);
        } catch (error) {
          console.warn("Failed to fetch assignment cost:", error);
          setLocation(`/assignment/${assignmentCode}`);
        }
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Invalid assignment code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join assignment",
        variant: "destructive",
      });
    }
  };

  const handleConfirmJoin = () => {
    if (assignmentPreview && costData) {
      // Check if user has enough tokens (this would be handled by the API)
      setShowCostDialog(false);
      setLocation(`/assignment/${assignmentCode}`);
      onAssignmentJoined?.();
    }
  };

  return (
    <>
      <Card className="bg-card border border-border shadow-sm mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-theme flex items-center">
            <Plus className="w-5 h-5 mr-2 text-purple-600" />
            Join New Assignment
          </CardTitle>
          <CardDescription className="text-theme-secondary">Enter the assignment code provided by your teacher</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter assignment code"
              value={assignmentCode}
              onChange={(e) => setAssignmentCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinAssignment()}
              className="h-12 text-lg rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              data-testid="input-assignment-code"
            />
            <Button
              onClick={handleJoinAssignment}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white h-12 px-8"
              data-testid="button-join-assignment"
            >
              Join
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCostDialog} onOpenChange={setShowCostDialog}>
        <DialogContent className="rounded-lg bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-theme">Assignment Details</DialogTitle>
            <DialogDescription className="text-theme-secondary">Review the assignment information before joining</DialogDescription>
          </DialogHeader>

          {assignmentPreview && costData && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-theme mb-2">{assignmentPreview.title}</h3>
                <p className="text-sm text-theme-secondary mb-3">{assignmentPreview.subjectName}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-theme-secondary">Questions:</span>
                    <div className="font-semibold text-theme">{costData.questionCount}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-theme-secondary">Token Cost:</span>
                  <span className="text-2xl font-bold text-purple-600">{costData.tokensRequired} tokens</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-theme-secondary">Your Balance:</span>
                  <span className="font-semibold text-theme">{user?.tokenBalance || 0} tokens</span>
                </div>
              </div>

              {(user?.tokenBalance || 0) < costData.tokensRequired && (
                <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-red-600 mb-1">Insufficient Tokens</p>
                      <p className="text-theme-secondary">
                        You need {costData.tokensRequired - (user?.tokenBalance || 0)} more tokens to join this assignment.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCostDialog(false)}
              className="border-border text-theme hover:bg-muted"
              data-testid="button-cancel-join"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmJoin}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              data-testid="button-confirm-join"
            >
              Join Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}