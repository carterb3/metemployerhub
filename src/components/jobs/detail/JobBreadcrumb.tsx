import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

interface JobBreadcrumbProps {
  jobTitle: string;
}

export function JobBreadcrumb({ jobTitle }: JobBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-primary-foreground/50" />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/jobs" className="text-primary-foreground/70 hover:text-primary-foreground">
              Jobs
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-primary-foreground/50" />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-primary-foreground font-medium truncate max-w-[200px] sm:max-w-none">
            {jobTitle}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
