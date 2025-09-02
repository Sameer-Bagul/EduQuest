import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/ui/auth-provider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LandingPage from "@/pages/landing";
import AuthLoginPage from "@/pages/auth-login";
import AuthRegisterPage from "@/pages/auth-register";
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
import ViewAssignmentPage from "@/pages/view-assignment";
import EditAssignmentPage from "@/pages/edit-assignment";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={AuthLoginPage} />
      <Route path="/register" component={AuthRegisterPage} />
      <Route path="/teacher-dashboard" component={TeacherDashboard} />
      <Route path="/student-dashboard" component={StudentDashboard} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/create-assignment" component={CreateAssignmentPage} />
      <Route path="/assignments/view/:id" component={ViewAssignmentPage} />
      <Route path="/assignments/edit/:id" component={EditAssignmentPage} />
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
