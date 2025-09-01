import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/ui/auth-provider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LoginPage from "@/pages/login";
import TeacherDashboard from "@/pages/teacher-dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import AssignmentInterface from "@/pages/assignment-interface";
import NotFound from "@/pages/not-found";
import CancellationRefunds from "@/pages/cancellation-refunds";
import ContactUs from "@/pages/contact-us";
import ShippingPolicy from "@/pages/shipping-policy";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsConditions from "@/pages/terms-conditions";
import ProfilePage from "@/pages/profile";
import CreateAssignmentPage from "@/pages/create-assignment";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/teacher-dashboard" component={TeacherDashboard} />
      <Route path="/student-dashboard" component={StudentDashboard} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/create-assignment" component={CreateAssignmentPage} />
      <Route path="/assignment/:code" component={AssignmentInterface} />
      <Route path="/cancellation-refunds" component={CancellationRefunds} />
      <Route path="/contact-us" component={ContactUs} />
      <Route path="/shipping-policy" component={ShippingPolicy} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
