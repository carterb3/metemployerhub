import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Register from "./pages/Register";
import Employers from "./pages/Employers";
import Programs from "./pages/Programs";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminIntakes from "./pages/admin/Intakes";
import IntakeDetail from "./pages/admin/IntakeDetail";
import AdminEmployerInquiries from "./pages/admin/EmployerInquiries";
import AdminJobs from "./pages/admin/AdminJobs";
import EmployerCRM from "./pages/admin/EmployerCRM";
import EmployerDetail from "./pages/admin/EmployerDetail";

// Employer Portal
import EmployerLogin from "./pages/employer/Login";
import EmployerPending from "./pages/employer/Pending";
import EmployerDashboard from "./pages/employer/Dashboard";
import EmployerJobs from "./pages/employer/Jobs";
import NewEmployerJob from "./pages/employer/NewJob";
import EmployerProfile from "./pages/employer/Profile";
import EmployerHelp from "./pages/employer/Help";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employers" element={<Employers />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          
          {/* Employer Portal routes */}
          <Route path="/employer/login" element={<EmployerLogin />} />
          <Route path="/employer/pending" element={<EmployerPending />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/jobs" element={<EmployerJobs />} />
          <Route path="/employer/jobs/new" element={<NewEmployerJob />} />
          <Route path="/employer/profile" element={<EmployerProfile />} />
          <Route path="/employer/help" element={<EmployerHelp />} />
          
          {/* Admin routes - protected by AdminLayout */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/intakes" element={<AdminIntakes />} />
          <Route path="/admin/intakes/:id" element={<IntakeDetail />} />
          <Route path="/admin/inquiries" element={<AdminEmployerInquiries />} />
          <Route path="/admin/employers" element={<EmployerCRM />} />
          <Route path="/admin/employers/:id" element={<EmployerDetail />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
