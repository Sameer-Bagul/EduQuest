import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2, Save, Clock, Users, BookOpen, Calendar, User, GraduationCap, Wallet, Calculator, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/components/ui/auth-provider";
import { SaasLayout } from "@/components/layouts/saas-layout";

const createAssignmentSchema = z.object({
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

type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;

export default function CreateAssignmentPage() {
  const [questions, setQuestions] = useState([{ text: "", answerKey: "" }]);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else if (user?.role !== 'teacher') {
      setLocation('/student-dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  const form = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      mode: 'voice_text',
      autoDelete: true,
      questions: [{ text: "", answerKey: "" }],
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createAssignment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/teacher'] });
      toast({
        title: "Success!",
        description: `Assignment "${data.assignment.title}" created successfully with code: ${data.assignment.code}`,
      });
      setLocation('/teacher-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
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

  const onSubmit = (data: CreateAssignmentFormData) => {
    createMutation.mutate(data);
  };

  const getTokenRequirements = () => {
    const questionCount = questions.filter(q => q.text.trim()).length;
    const tokensRequired = Math.ceil(questionCount / 4);
    const totalCost = tokensRequired * 2;
    
    return {
      questionCount,
      tokensRequired,
      totalCost,
      formattedCost: `₹${totalCost.toFixed(2)}`
    };
  };

  const tokenInfo = getTokenRequirements();

  const handleGoBack = () => {
    setLocation('/teacher-dashboard');
  };

  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  return (
    <SaasLayout>
      <div className="min-h-screen bg-background dark:bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8 fade-in">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="mb-4 text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-accent"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-accent/20 dark:to-secondary/20 rounded-2xl flex items-center justify-center border border-primary/30 dark:border-accent/30">
                <Sparkles className="w-6 h-6 text-primary dark:text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground dark:text-foreground">Create New Assignment</h1>
                <p className="text-muted-foreground dark:text-muted-foreground">Design engaging assignments for your students</p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Assignment Details Card */}
              <Card className="glass-card hover-lift border-primary/20 dark:border-accent/20 slide-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground dark:text-foreground">
                    <BookOpen className="w-5 h-5 mr-3 text-primary dark:text-accent" />
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
                          <FormLabel className="text-foreground dark:text-foreground font-medium">Assignment Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Introduction to Quantum Physics" 
                              {...field}
                              className="glass-effect text-foreground dark:text-foreground"
                              data-testid="input-title"
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
                          <FormLabel className="text-foreground dark:text-foreground font-medium">Assignment Mode</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="glass-effect text-foreground dark:text-foreground" data-testid="select-mode">
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card">
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
              <Card className="glass-card hover-lift border-primary/20 dark:border-accent/20 slide-in-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground dark:text-foreground">
                    <User className="w-5 h-5 mr-3 text-secondary dark:text-secondary" />
                    Institution & Subject
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="facultyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground dark:text-foreground font-medium">Faculty Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Dr. John Smith" 
                              {...field}
                              className="glass-effect text-foreground dark:text-foreground"
                              data-testid="input-faculty"
                            />
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
                          <FormLabel className="text-foreground dark:text-foreground font-medium">College Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., MIT" 
                              {...field}
                              className="glass-effect text-foreground dark:text-foreground"
                              data-testid="input-college"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="subjectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground dark:text-foreground font-medium">Subject Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Physics" 
                              {...field}
                              className="glass-effect text-foreground dark:text-foreground"
                              data-testid="input-subject"
                            />
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
                          <FormLabel className="text-foreground dark:text-foreground font-medium">Subject Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., PHY101" 
                              {...field}
                              className="glass-effect text-foreground dark:text-foreground"
                              data-testid="input-subject-code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Scheduling Card */}
              <Card className="glass-card hover-lift border-primary/20 dark:border-accent/20 slide-in-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground dark:text-foreground">
                    <Calendar className="w-5 h-5 mr-3 text-accent dark:text-primary" />
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
                          <FormLabel className="text-foreground dark:text-foreground font-medium flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-primary dark:text-accent" />
                            Start Date & Time
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field}
                              className="glass-effect text-foreground dark:text-foreground"
                              data-testid="input-start-date"
                            />
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
                          <FormLabel className="text-foreground dark:text-foreground font-medium flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-primary dark:text-accent" />
                            End Date & Time
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field}
                              className="glass-effect text-foreground dark:text-foreground"
                              data-testid="input-end-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent> 
              </Card>

              {/* Token Requirements Preview */}
              <Card className="glass-card hover-lift border-info/30 dark:border-info/30 bg-gradient-to-br from-info/5 to-secondary/5 dark:from-info/10 dark:to-secondary/10 slide-in-up" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground dark:text-foreground">
                    <Calculator className="w-5 h-5 mr-3 text-info dark:text-info" />
                    Student Token Requirements
                    <Badge variant="outline" className="ml-3 glass-effect text-info dark:text-info border-info/30 dark:border-info/30">
                      Preview
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 glass-card rounded-xl">
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">Questions</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-accent dark:to-secondary" data-testid="text-question-count">
                        {tokenInfo.questionCount}
                      </div>
                    </div>
                    <div className="text-center p-4 glass-card rounded-xl">
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">Tokens Required</div>
                      <div className="text-2xl font-bold text-primary dark:text-accent flex items-center justify-center" data-testid="text-tokens-preview">
                        <Wallet className="w-5 h-5 mr-1" />
                        {tokenInfo.tokensRequired}
                      </div>
                    </div>
                    <div className="text-center p-4 glass-card rounded-xl">
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">Student Cost</div>
                      <div className="text-2xl font-bold text-secondary dark:text-secondary" data-testid="text-cost-preview">
                        {tokenInfo.formattedCost}
                      </div>
                    </div>
                    <div className="text-center p-4 glass-card rounded-xl">
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">Calculation</div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground mt-3">1 token = 4 questions</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 glass-effect rounded-lg">
                    <p className="text-sm text-info dark:text-info">
                      💡 Students will need {tokenInfo.tokensRequired} token{tokenInfo.tokensRequired !== 1 ? 's' : ''} to access this assignment ({tokenInfo.formattedCost})
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Questions Card */}
              <Card className="glass-card hover-lift border-primary/20 dark:border-accent/20 slide-in-up" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground dark:text-foreground">
                    <Users className="w-5 h-5 mr-3 text-primary dark:text-accent" />
                    Questions & Answer Keys
                    <Badge className="ml-3 glass-effect bg-gradient-to-r from-primary/20 to-secondary/20 dark:from-accent/20 dark:to-secondary/20 text-primary dark:text-accent border-0">
                      {questions.length} Question{questions.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <Card key={index} className="glass-card border-primary/10 dark:border-accent/10">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-accent/20 dark:to-secondary/20 rounded-full flex items-center justify-center border border-primary/30 dark:border-accent/30">
                                <span className="text-sm font-bold text-primary dark:text-accent">
                                  {index + 1}
                                </span>
                              </div>
                              <h5 className="font-semibold text-foreground dark:text-foreground">
                                Question {index + 1}
                              </h5>
                            </div>
                            {questions.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(index)}
                                className="text-destructive dark:text-destructive hover:text-destructive/80 dark:hover:text-destructive/80 hover-lift"
                                data-testid={`button-remove-question-${index}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                                Question Text
                              </label>
                              <Textarea
                                value={question.text}
                                onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                                placeholder="Enter your question here..."
                                rows={3}
                                className="glass-effect text-foreground dark:text-foreground"
                                data-testid={`textarea-question-${index}`}
                              />
                            </div>

                            <Separator className="bg-border/50 dark:bg-border/30" />

                            <div>
                              <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                                Answer Key / Expected Response
                              </label>
                              <Textarea
                                value={question.answerKey}
                                onChange={(e) => updateQuestion(index, 'answerKey', e.target.value)}
                                placeholder="Enter the expected answer/key points..."
                                rows={2}
                                className="glass-effect text-foreground dark:text-foreground"
                                data-testid={`textarea-answer-${index}`}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button
                      type="button"
                      onClick={addQuestion}
                      variant="outline"
                      className="w-full glass-button hover-lift text-foreground dark:text-foreground"
                      size="lg"
                      data-testid="button-add-question"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Question
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-4 slide-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                  <p className="font-medium">Ready to create your assignment?</p>
                  <p>Students will access it using the generated code.</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoBack}
                    className="glass-button text-foreground dark:text-foreground hover-lift"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 dark:from-accent dark:to-secondary shadow-lg hover-lift text-white dark:text-white px-8"
                    data-testid="button-submit"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createMutation.isPending ? "Creating..." : "Create Assignment"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </SaasLayout>
  );
}
