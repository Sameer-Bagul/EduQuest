import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, Mic, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuthContext } from "@/components/ui/auth-provider";
import { VoiceRecorderComponent } from "@/components/assignment/voice-recorder";
import { ProctoringManager } from "@/lib/proctoring";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useElectron } from "@/hooks/use-electron";

export default function AssignmentInterface() {
  const { code } = useParams<{ code: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isElectron, showAlert, enableSecureMode } = useElectron();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const proctoringRef = useRef<ProctoringManager | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else if (user?.role !== 'student') {
      setLocation('/teacher-dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch assignment data
  const { data: assignmentData, isLoading, error } = useQuery({
    queryKey: ['/api/assignments/code', code],
    enabled: !!code && isAuthenticated && user?.role === 'student',
  });

  const assignment = (assignmentData as any)?.assignment;

  // Initialize proctoring and timer
  useEffect(() => {
    if (!assignment) return;

    // Start proctoring with enhanced security for desktop app
    proctoringRef.current = new ProctoringManager((event) => {
      console.log('Proctoring event:', event);
      
      // Show desktop alerts for critical events
      if (isElectron && (event.severity === 'critical' || event.severity === 'high')) {
        const alertMessage = getAlertMessage(event);
        showAlert(alertMessage, event.severity);
      }
      
      // In a real implementation, send events to server
    });
    
    // Enable enhanced security mode for desktop app
    if (isElectron) {
      enableSecureMode();
    }
    
    proctoringRef.current.start();

    // Calculate time remaining
    const endTime = new Date(assignment.endDate).getTime();
    const now = new Date().getTime();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    setTimeRemaining(remaining);

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      proctoringRef.current?.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [assignment]);

  const submitMutation = useMutation({
    mutationFn: api.submitAssignment,
    onSuccess: (data) => {
      proctoringRef.current?.stop();
      queryClient.invalidateQueries({ queryKey: ['/api/submissions/student'] });
      toast({
        title: "Assignment Submitted!",
        description: `Your score: ${Math.round(data.totalAwarded * 100)}%`,
      });
      setLocation('/student-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit assignment",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleAutoSubmit = () => {
    if (assignment && !isSubmitting) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!assignment || isSubmitting) return;

    setIsSubmitting(true);
    const submissionData = {
      assignmentCode: code!,
      answers: assignment.questions.map((question: any) => ({
        questionId: question.id,
        text: answers[question.id] || '',
        sttMeta: { submittedAt: new Date().toISOString() },
      })),
    };

    submitMutation.mutate(submissionData);
  };

  const handleSaveProgress = () => {
    toast({
      title: "Progress Saved",
      description: "Your answers have been saved locally",
    });
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAlertMessage = (event: any) => {
    switch (event.type) {
      case 'tab_change':
        return `Tab switching detected! This is your ${event.details?.switchCount || 1} violation. Please stay focused on the assignment.`;
      case 'copy_attempt':
        return 'Copy/paste operations are not allowed during the assignment.';
      case 'paste_attempt':
        return 'Pasting content is prohibited. Please type your answers manually.';
      case 'key_combination':
        return 'Unauthorized keyboard shortcuts detected. Please use only standard typing.';
      case 'screen_capture':
        return 'Screen capture attempt detected! This is a serious violation.';
      case 'suspicious_activity':
        return `Suspicious activity detected: ${event.details?.alert || 'Please maintain focus on the assignment'}`;
      default:
        return 'Security violation detected. Please maintain academic integrity.';
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < assignment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (!isAuthenticated || user?.role !== 'student') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading assignment...</div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-lg font-medium text-red-600 mb-2">Assignment Not Available</div>
            <p className="text-gray-600 mb-4">
              The assignment code is invalid or the assignment is not currently active.
            </p>
            <Button onClick={() => setLocation('/student-dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = assignment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assignment.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === assignment.questions.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Proctoring Header */}
      <div className="bg-red-50 border-b border-red-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Proctored Assignment - Do not switch tabs
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-red-700">
              <Mic className="w-4 h-4" />
              <span>Audio monitoring active</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-red-800">
              Time Remaining: {formatTime(timeRemaining)}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Assignment Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
          <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
            <div>Subject: <span className="font-medium">{assignment.subjectName} ({assignment.subjectCode})</span></div>
            <div>Faculty: <span className="font-medium">{assignment.facultyName}</span></div>
            <div>Questions: <span className="font-medium">{assignment.questions.length}</span></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {assignment.questions.length}
            </span>
            <span className="text-sm text-gray-500">Progress</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                {currentQuestion.text}
              </h2>
            </div>

            <VoiceRecorderComponent
              onTranscriptChange={(transcript) => handleAnswerChange(currentQuestion.id, transcript)}
              initialTranscript={answers[currentQuestion.id] || ''}
              allowTextEdit={assignment.mode === 'voice_text'}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0 || isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleSaveProgress}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>

            {!isLastQuestion ? (
              <Button
                onClick={nextQuestion}
                disabled={isSubmitting}
                className="bg-primary text-white hover:bg-blue-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-secondary text-white hover:bg-green-600"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
