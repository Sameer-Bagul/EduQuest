import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, X } from "lucide-react";

interface Question {
  id: string;
  text: string;
  studentAnswer: string;
  expectedAnswer: string;
  score: number;
}

interface ResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission?: {
    id: string;
    assignmentTitle: string;
    submissionDate: string;
    totalScore: number;
    questions: Question[];
  } | null;
}

export function ResultsModal({ open, onOpenChange, submission }: ResultsModalProps) {
  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    console.log("Downloading results...");
  };

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Assignment Results
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score Summary */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-green-900">
                    {submission.assignmentTitle}
                  </h4>
                  <p className="text-green-700">
                    Submitted on {new Date(submission.submissionDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(submission.totalScore * 100)}%
                  </div>
                  <div className="text-sm text-green-700">Total Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Results */}
          <div className="space-y-6">
            {submission.questions.map((question, index) => (
              <Card key={question.id} className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium text-gray-900">Question {index + 1}</h5>
                    <div className="text-right">
                      <Badge 
                        variant={question.score >= 0.7 ? "default" : "secondary"}
                        className={question.score >= 0.7 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {Math.round(question.score * 100)}%
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">Similarity Score</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Question:</label>
                      <p className="text-gray-900 mt-1">{question.text}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Your Answer:</label>
                      <div className="text-gray-900 mt-1 bg-gray-50 rounded-lg p-3">
                        {question.studentAnswer}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Expected Answer:</label>
                      <div className="text-gray-600 mt-1 bg-blue-50 rounded-lg p-3">
                        {question.expectedAnswer}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Results
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-primary text-white hover:bg-blue-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
