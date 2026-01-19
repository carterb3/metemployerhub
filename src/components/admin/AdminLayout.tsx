import { ReactNode, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isLoading, isStaff, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    } else if (!isLoading && user && !isStaff) {
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        toast({
          title: "Access Denied",
          description: "Staff access only. Please contact an administrator.",
          variant: "destructive",
        });
      }
      navigate("/");
    }
  }, [isLoading, user, isStaff, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isStaff) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <AdminSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <header className="flex-shrink-0 sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
