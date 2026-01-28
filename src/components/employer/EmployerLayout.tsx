import { ReactNode, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  LogOut,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface EmployerLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/employer/dashboard" },
  { icon: PlusCircle, label: "Post New Job", path: "/employer/jobs/new" },
  { icon: FileText, label: "My Postings", path: "/employer/jobs" },
  { icon: Settings, label: "Profile", path: "/employer/profile" },
  { icon: HelpCircle, label: "Help & Support", path: "/employer/help" },
];

export function EmployerLayout({ children }: EmployerLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, employer, isLoading, isEmployer, isApproved, signOut } = useEmployerAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/employer/login");
      } else if (!isEmployer) {
        navigate("/employer/pending");
      } else if (!isApproved) {
        navigate("/employer/pending");
      }
    }
  }, [isLoading, user, isEmployer, isApproved, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/employers");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isApproved) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-secondary">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="MET" className="h-10 w-auto" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Employer Portal</span>
            </div>
          </Link>
        </div>

        {/* Company Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{employer?.company_name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {employer?.contact_email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
