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
import { ArrowLeft, Plus, Trash2, Save, Clock, Users, BookOpen, Calendar, User, GraduationCap } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/components/ui/auth-provider";

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

  const handleGoBack = () => {
    setLocation('/teacher-dashboard');
  };

  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="mr-4 hover:bg-white/50 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-10 w-10 gradient-bg rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Create New Assignment
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                Teacher
              </Badge>
              <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Assignment Overview Card */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
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
                        <FormLabel className="text-gray-700 font-medium">Assignment Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter assignment title" 
                            {...field} 
                            className="bg-white/80 border-gray-200 focus:border-blue-500 transition-colors"
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
                        <FormLabel className="text-gray-700 font-medium">Assignment Mode</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-white/80 border-gray-200 focus:border-blue-500">
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
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <User className="w-6 h-6 mr-3 text-green-600" />
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
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Calendar className="w-6 h-6 mr-3 text-purple-600" />
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

            {/* Questions Card */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-gray-900">
                    <Users className="w-6 h-6 mr-3 text-orange-600" />
                    Questions & Answer Keys
                    <Badge variant="secondary" className="ml-3 bg-orange-100 text-orange-800">
                      {questions.length} Question{questions.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <Card key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-semibold text-gray-900 flex items-center">
                            <span className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
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
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Question Text
                            </label>
                            <Textarea
                              value={question.text}
                              onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                              placeholder="Enter your question here..."
                              rows={3}
                              className="bg-white border-gray-200 focus:border-orange-500 transition-colors"
                            />
                          </div>

                          <Separator className="bg-gray-200" />

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Answer Key / Expected Response
                            </label>
                            <Textarea
                              value={question.answerKey}
                              onChange={(e) => updateQuestion(index, 'answerKey', e.target.value)}
                              placeholder="Enter the expected answer/key points..."
                              rows={2}
                              className="bg-white border-gray-200 focus:border-orange-500 transition-colors"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
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
  );
}