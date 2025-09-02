import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2, Save, Clock, Users, BookOpen, Calendar, User, GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/components/ui/auth-provider";

const updateAssignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  mode: z.enum(['voice', 'voice_text']),
  facultyName: z.string().min(1, "Faculty name is required"),
  collegeName: z.string().min(1, "College name is required"),
  subjectName: z.string().min(1, "Subject name is required"),
  subjectCode: z.string().min(1, "Subject code is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  autoDelete: z.boolean().default(true),
  questions: z.array(z.object({
    text: z.string().min(3, "Question must be at least 3 characters"),
    answerKey: z.string().min(1, "Answer key is required"),
  })).min(1, "At least one question is required"),
});

type UpdateAssignmentFormData = z.infer<typeof updateAssignmentSchema>;

export default function EditAssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState([{ text: "", answerKey: "" }]);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Redirect if not authenticated or not a teacher
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else if (user?.role !== 'teacher') {
      setLocation('/student-dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: assignmentData, isLoading, error } = useQuery({
    queryKey: ['/api/assignments', id],
    enabled: !!id && isAuthenticated && user?.role === 'teacher',
  });

  const assignment = (assignmentData as any)?.assignment;

  const form = useForm<UpdateAssignmentFormData>({
    resolver: zodResolver(updateAssignmentSchema),
    defaultValues: {
      mode: 'voice_text',
      autoDelete: true,
      questions: [{ text: "", answerKey: "" }],
    },
  });

  // Populate form when assignment data is loaded
  useEffect(() => {
    if (assignment) {
      const formData = {
        title: assignment.title,
        mode: assignment.mode,
        facultyName: assignment.facultyName,
        collegeName: assignment.collegeName,
        subjectName: assignment.subjectName,
        subjectCode: assignment.subjectCode,
        startDate: new Date(assignment.startDate).toISOString().slice(0, 16),
        endDate: new Date(assignment.endDate).toISOString().slice(0, 16),
        autoDelete: assignment.autoDelete,
        questions: assignment.questions.map((q: any) => ({
          text: q.text,
          answerKey: q.answerKey,
        })),
      };
      
      form.reset(formData);
      setQuestions(formData.questions);
    }
  }, [assignment, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAssignmentFormData) => 
      api.request(`/api/assignments/${id}`, { method: 'PUT', body: data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/teacher'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assignments', id] });
      toast({
        title: "✅ Success!",
        description: `Assignment "${data.assignment.title}" updated successfully!`,
      });
      setLocation('/teacher-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update assignment",
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    const newQuestions = [...questions, { text: "", answerKey: "" }];
    setQuestions(newQuestions);
    form.setValue('questions', newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      form.setValue('questions', newQuestions);
    }
  };

  const updateQuestion = (index: number, field: 'text' | 'answerKey', value: string) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
    form.setValue('questions', newQuestions);
  };

  const onSubmit = (data: UpdateAssignmentFormData) => {
    updateMutation.mutate(data);
  };

  const handleGoBack = () => {
    setLocation('/teacher-dashboard');
  };

  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-foreground mb-2">Loading Assignment...</div>
          <p className="text-muted-foreground">Please wait while we fetch the assignment details.</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-lg font-medium text-destructive mb-2">Assignment Not Found</div>
            <p className="text-muted-foreground mb-4">
              The assignment could not be found or you don't have access to it.
            </p>
            <Button onClick={handleGoBack}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="text-primary-foreground w-4 h-4" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                Edit Assignment
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary">Teacher</Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Assignment Overview Card */}
            <Card className="hover-subtle">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <BookOpen className="w-5 h-5 mr-3 text-primary" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Assignment Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter assignment title" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Assignment Mode</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="voice">🎤 Voice Only</SelectItem>
                            <SelectItem value="voice_text">🎤📝 Voice + Text</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Institution Details Card */}
            <Card className="hover-subtle">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <User className="w-5 h-5 mr-3 text-primary" />
                  Institution & Subject Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="facultyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Faculty Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter faculty name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="collegeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">College Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter college name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subjectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Subject Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter subject name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subjectCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Subject Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter subject code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Scheduling Card */}
            <Card className="hover-subtle">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Calendar className="w-5 h-5 mr-3 text-primary" />
                  Assignment Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                          Start Date & Time
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                          End Date & Time
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Questions Card */}
            <Card className="hover-subtle">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Users className="w-5 h-5 mr-3 text-primary" />
                  Questions & Answer Keys
                  <Badge variant="secondary" className="ml-3">
                    {questions.length} Question{questions.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <Card key={index} className="hover-subtle">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-semibold text-foreground flex items-center">
                            <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold mr-3">
                              {index + 1}
                            </span>
                            Question {index + 1}
                          </h5>
                          {questions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(index)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Question Text
                            </label>
                            <Textarea
                              value={question.text}
                              onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                              placeholder="Enter your question here..."
                              rows={3}
                            />
                          </div>

                          <Separator />

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Answer Key / Expected Response
                            </label>
                            <Textarea
                              value={question.answerKey}
                              onChange={(e) => updateQuestion(index, 'answerKey', e.target.value)}
                              placeholder="Enter the expected answer/key points..."
                              rows={2}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add Question Button - Below Questions */}
                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={addQuestion}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Question
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <Card className="hover-subtle">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    <p>Ready to update your assignment?</p>
                    <p>Changes will be saved and students can access the updated version.</p>
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoBack}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateMutation.isPending ? "Updating..." : "Update Assignment"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}