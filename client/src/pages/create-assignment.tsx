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
import { ArrowLeft, Plus, Trash2, Save, Clock, Users, BookOpen, Calendar, User, GraduationCap, Wallet, Calculator } from "lucide-react";
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

  // Redirect if not authenticated or not a teacher
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
        title: "🎉 Success!",
        description: `Assignment "${data.assignment.title}" created successfully with code: ${data.assignment.code}`,
      });
      setLocation('/teacher-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
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

  // Calculate token requirements preview
  const getTokenRequirements = () => {
    const questionCount = questions.filter(q => q.text.trim()).length;
    const tokensRequired = Math.ceil(questionCount / 4);
    const currency = user?.currency || 'USD';
    const pricePerToken = currency === 'INR' ? 2 : 0.023;
    const totalCost = tokensRequired * pricePerToken;
    
    return {
      questionCount,
      tokensRequired,
      totalCost,
      currency,
      formattedCost: currency === 'INR' ? `₹${totalCost.toFixed(2)}` : `$${totalCost.toFixed(2)}`
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
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        {/* <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="text-primary-foreground w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Create New Assignment
            </h1>
          </div>
        </div> */}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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
                        <FormLabel className="text-gray-700 font-medium">Faculty Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter faculty name" 
                            {...field} 
                            className="bg-white/80 border-gray-200 focus:border-green-500 transition-colors"
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
                        <FormLabel className="text-gray-700 font-medium">College Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter college name" 
                            {...field} 
                            className="bg-white/80 border-gray-200 focus:border-green-500 transition-colors"
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
                        <FormLabel className="text-gray-700 font-medium">Subject Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter subject name" 
                            {...field} 
                            className="bg-white/80 border-gray-200 focus:border-green-500 transition-colors"
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
                        <FormLabel className="text-gray-700 font-medium">Subject Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter subject code" 
                            {...field} 
                            className="bg-white/80 border-gray-200 focus:border-green-500 transition-colors"
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
                        <FormLabel className="text-gray-700 font-medium flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-purple-600" />
                          Start Date & Time
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field} 
                            className="bg-white/80 border-gray-200 focus:border-purple-500 transition-colors"
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
                        <FormLabel className="text-gray-700 font-medium flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-purple-600" />
                          End Date & Time
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field} 
                            className="bg-white/80 border-gray-200 focus:border-purple-500 transition-colors"
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
            <Card className="hover-subtle border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Calculator className="w-5 h-5 mr-3 text-blue-600" />
                  Student Token Requirements
                  <Badge variant="outline" className="ml-3 border-blue-300 text-blue-700">
                    Preview
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">Questions</div>
                    <div className="text-lg font-bold text-blue-700" data-testid="text-question-count">
                      {tokenInfo.questionCount}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">Tokens Required</div>
                    <div className="text-lg font-bold text-blue-700 flex items-center justify-center" data-testid="text-tokens-preview">
                      <Wallet className="w-4 h-4 mr-1" />
                      {tokenInfo.tokensRequired}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">Student Cost</div>
                    <div className="text-lg font-bold text-blue-700" data-testid="text-cost-preview">
                      {tokenInfo.formattedCost}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">Calculation</div>
                    <div className="text-xs text-gray-500">1 token = 4 questions</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-blue-600">
                  <p>💡 Students will need {tokenInfo.tokensRequired} token{tokenInfo.tokensRequired !== 1 ? 's' : ''} to access this assignment ({tokenInfo.formattedCost} in {tokenInfo.currency})</p>
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
                  
                  {/* Add Question Button - Now Below Questions */}
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
                    <p>Ready to create your assignment?</p>
                    <p>Students will be able to access it using the generated assignment code.</p>
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoBack}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg px-8"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {createMutation.isPending ? "Creating..." : "Create Assignment"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
        </div>
      </div>
    </SaasLayout>
  );
}