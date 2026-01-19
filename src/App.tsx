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
import Regions from "./pages/Regions";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminIntakes from "./pages/admin/Intakes";
import IntakeDetail from "./pages/admin/IntakeDetail";
import AdminEmployerInquiries from "./pages/admin/EmployerInquiries";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminJobEdit from "./pages/admin/AdminJobEdit";

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
          <Route path="/regions" element={<Regions />} />
          <Route path="/login" element={<Login />} />

          {/* Admin routes - protected by AdminLayout */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/intakes" element={<AdminIntakes />} />
          <Route path="/admin/intakes/:id" element={<IntakeDetail />} />
          <Route path="/admin/employers" element={<AdminEmployerInquiries />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/jobs/new" element={<AdminJobEdit />} />
          <Route path="/admin/jobs/:id/edit" element={<AdminJobEdit />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
